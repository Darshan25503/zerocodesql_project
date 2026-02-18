import knex, { Knex } from "knex";
import { createTunnel, SshOptions } from "tunnel-ssh";
import * as fs from "fs-extra";
import * as ssh from "ssh2";
import { AddressInfo } from "net";
import { DatabaseTable, DatabaseColumn, DatabaseEntity, ColumnType } from "./types";

export type ConnectionConfig =
    | {
          databaseType: "mysql2" | "pg" | "mssql";
          host: string;
          user: string;
          password: string;
          database: string;
          port: number;
          proxy?: {
              user: string;
              host: string;
              port: number;
              authentication:
                  | {
                        type: "password";
                        password: string;
                    }
                  | {
                        type: "privateKey";
                        privateKeyPath: string;
                    }
                  | {
                        type: "none";
                    };
          };
      }
    | {
          databaseType: "better-sqlite3";
          filename: string;
          flags?: string[];
      };

export class DatabaseConnection {
    k: knex.Knex;
    config: ConnectionConfig;
    tunnelClient: ssh.Client | null;
    tunnelServer: ssh.Server | null;

    constructor(config: ConnectionConfig, tunnel?: [ssh.Client, ssh.Server]) {
        this.config = config;

        switch (config.databaseType) {
            case "better-sqlite3":
                this.k = knex({
                    client: "better-sqlite3",
                    connection: {
                        filename: config.filename,
                        flags: config.flags,
                    },
                });
                break;

            default:
                this.k = knex({
                    client: config.databaseType,
                    connection: {
                        host: config.host,
                        port: config.port,
                        user: config.user,
                        password: config.password,
                        database: config.database,
                    },
                    pool: {
                        min: 1,
                        max: 2,
                    },
                });
                break;
        }

        if (tunnel !== undefined) {
            [this.tunnelClient, this.tunnelServer] = tunnel;
        } else {
            this.tunnelClient = null;
            this.tunnelServer = null;
        }
    }

    public async close() {
        await this.k.destroy();
        if (this.tunnelClient !== null && this.tunnelServer !== null) {
            this.tunnelClient.destroy();
            this.tunnelServer.close();
        }
    }

    public async fetchAllDatabases() {
        switch (this.config.databaseType) {
            case "better-sqlite3": {
                let res: string[] = (await this.k.queryBuilder().select("name").from("sqlite_master").where("type", "table")).map((x) => x.name);
                // Get each tables columns
                let tableRes: DatabaseTable[] = [];
                for (const tableName of res) {
                    if (tableName === "sqlite_master") continue;
                    let tableRaw: {
                        cid: number;
                        dflt_value: string;
                        name: string;
                        not_null: number;
                        pk: number;
                        type: string;
                    }[] = await this.k.raw("PRAGMA table_info(" + tableName + ")");
                    let cols: DatabaseColumn[] = [];
                    let pk: DatabaseColumn = null;
                    for (const colRaw of tableRaw) {
                        cols.push({
                            position: colRaw.cid,
                            defaultValue: colRaw.dflt_value,
                            extra: undefined,
                            isPrimaryKey: colRaw.pk > 0,
                            name: colRaw.name,
                            nullable: colRaw.not_null == 0,
                            type: this.normalizeType("better-sqlite3", colRaw.type),
                            foreignKey: undefined,
                        });
                        if (colRaw.pk === 1) {
                            // Take only the first entity for now
                            pk = cols[cols.length - 1];
                        }
                    }
                    let dbTbl = new DatabaseTable(tableName, cols);
                    dbTbl.primaryKey = pk;
                    // Grab the foreign keys for this table
                    let fkRaws: {
                        from: string;
                        id: number;
                        on_update: string;
                        on_delete: string;
                        to: string;
                        match: string;
                        seq: number;
                        table: string;
                    }[] = await this.k.raw("PRAGMA foreign_key_list(" + tableName + ")");
                    for (const fk of fkRaws) {
                        const concernedCol = dbTbl.columns.get(fk.from);
                        concernedCol.foreignKey = {
                            qualifiedTargetTable: fk.table,
                            targetColumn: fk.to,
                            displayColumn: fk.to,
                            displayQualifiedTargetTable: fk.table,
                        };
                    }
                    // Now the unique keys
                    let ukRaws = await this.k.raw("PRAGMA index_list(" + tableName + ")");
                    for (const uk of ukRaws) {
                        if (uk.unique == 1) {
                            let ukCols = await this.k.raw("PRAGMA index_info(" + uk.name + ")");
                            for (const ukCol of ukCols) {
                                let col = dbTbl.columns.get(ukCol.name);
                                if (col !== undefined) {
                                    if (dbTbl.uniqueKeys.has(uk.name)) {
                                        dbTbl.uniqueKeys.get(uk.name).push(col);
                                    } else {
                                        dbTbl.uniqueKeys.set(uk.name, [col]);
                                    }
                                }
                            }
                        }
                    }
                    tableRes.push(dbTbl);
                }
                let dbe = new DatabaseEntity("master", tableRes);
                dbe.isDummy = true;
                return [dbe];
            }

            case "mysql2": {
                // Fetch all the databases/tables/columns/etc
                let res = await this.k
                    .queryBuilder()
                    .select("table_schema", "table_name", "column_name", "ordinal_position", "column_default", "is_nullable", "column_type", "extra")
                    .from("INFORMATION_SCHEMA.COLUMNS")
                    .whereNotIn("table_schema", ["information_schema", "mysql", "performance_schema", "sys"]);
                let dbs = this.parseMysqlDatabaseFetchResults("mysql2", res);
                // Now fetch all the constraints
                let constraints_raw = await this.k
                    .queryBuilder()
                    .select(
                        "cons.constraint_name",
                        "cons.table_schema",
                        "cons.table_name",
                        "ks.column_name",
                        "cons.constraint_type",
                        "ks.referenced_table_schema",
                        "ks.referenced_table_name",
                        "ks.referenced_column_name"
                    )
                    .from("INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS ks")
                    .join("INFORMATION_SCHEMA.TABLE_CONSTRAINTS as cons", function () {
                        this.on("cons.constraint_name", "ks.constraint_name")
                            .andOn("cons.table_schema", "ks.table_schema")
                            .andOn("cons.table_name", "ks.table_name");
                    })
                    .whereNotIn("cons.table_schema", ["information_schema", "mysql", "performance_schema", "sys"]);
                this.updateMysqlDatabaseWithConstraints(dbs, constraints_raw);
                return dbs;
            }
            case "pg": {
                // Fetch all the databases/tables/columns/etc
                let res = await this.k
                    .queryBuilder()
                    .select(
                        "table_schema AS TABLE_SCHEMA",
                        "table_name AS TABLE_NAME",
                        "column_name AS COLUMN_NAME",
                        "ordinal_position AS ORDINAL_POSITION",
                        "column_default AS COLUMN_DEFAULT",
                        "is_nullable AS IS_NULLABLE",
                        "data_type AS COLUMN_TYPE",
                        "character_maximum_length AS CHAR_MAX_LENGTH"
                    )
                    .fromRaw("INFORMATION_SCHEMA.COLUMNS")
                    .whereNotIn("table_schema", ["information_schema", "pg_catalog"]);
                let dbs = this.parseMysqlDatabaseFetchResults("pg", res);
                // Now fetch all the constraints
                // Regular constraints
                let constraints_raw = await this.k
                    .queryBuilder()
                    .select("cons.constraint_name", "cons.table_schema", "cons.table_name", "ks.column_name", "cons.constraint_type")
                    .fromRaw("INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS ks")
                    .joinRaw(",INFORMATION_SCHEMA.TABLE_CONSTRAINTS as cons")
                    .whereNotIn("cons.table_schema", ["information_schema", "pg_catalog"])
                    .andWhereRaw("cons.constraint_name = ks.constraint_name")
                    .andWhereRaw("cons.table_schema = ks.table_schema")
                    .andWhereRaw("cons.table_name = ks.table_name");
                this.updatePostgresDatabaseWithConstraints(dbs, constraints_raw);
                // Foreign Key constraints
                let fk_raw = await this.k
                    .queryBuilder()
                    .select(
                        "cons.constraint_name AS CONSTRAINT_NAME",
                        "cons.table_schema AS TABLE_SCHEMA",
                        "cons.table_name AS TABLE_NAME",
                        "ks.column_name AS COLUMN_NAME",
                        "cons.constraint_type AS CONSTRAINT_TYPE",
                        "cu.table_schema as REFERENCED_TABLE_SCHEMA",
                        "cu.table_name as REFERENCED_TABLE_NAME",
                        "cu.column_name as REFERENCED_COLUMN_NAME"
                    )
                    .fromRaw("INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS ks")
                    .joinRaw(",INFORMATION_SCHEMA.TABLE_CONSTRAINTS as cons, INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE AS cu")
                    .whereNotIn("cons.table_schema", ["information_schema", "pg_catalog"])
                    .andWhere("cons.constraint_type", "FOREIGN KEY")
                    .andWhereRaw("cons.constraint_name = ks.constraint_name")
                    .andWhereRaw("cons.table_schema = ks.table_schema")
                    .andWhereRaw("cons.table_name = ks.table_name")
                    .andWhereRaw("cons.constraint_name = cu.constraint_name");
                this.updateMysqlDatabaseWithConstraints(dbs, fk_raw); // This is in mysql results format
                return dbs;
            }
            case "mssql":
                return [new DatabaseEntity("master", [])]; // TODO
        }
    }

    parseMysqlDatabaseFetchResults(
        dbType: "pg" | "mysql2",
        res: Array<{
            TABLE_SCHEMA: string;
            TABLE_NAME: string;
            COLUMN_NAME: string;
            ORDINAL_POSITION: number;
            COLUMN_DEFAULT: string;
            IS_NULLABLE: string;
            COLUMN_TYPE: string;
            EXTRA: string;
            CHAR_MAX_LENGTH: string;
        }>
    ) {
        let databases: Map<string, Map<string, DatabaseColumn[]>> = new Map();
        for (const record of res) {
            Object.keys(record).forEach((k) => ((record as any)[k.toUpperCase()] = (record as any)[k])); // Fix this bs

            if (!databases.has(record.TABLE_SCHEMA)) {
                // Gather unique databases
                databases.set(record.TABLE_SCHEMA, new Map());
            }
        }

        // Set tables for the databases
        for (const record of res) {
            let db = databases.get(record.TABLE_SCHEMA);
            if (!db.has(record.TABLE_NAME)) {
                db.set(record.TABLE_NAME, []);
            }
        }

        // Set the columns
        for (const record of res) {
            let db = databases.get(record.TABLE_SCHEMA);
            if (db !== undefined && db.has(record.TABLE_NAME)) {
                db.get(record.TABLE_NAME).push({
                    name: record.COLUMN_NAME,
                    type: this.normalizeType(dbType, record.COLUMN_TYPE, record.CHAR_MAX_LENGTH),
                    nullable: record.IS_NULLABLE === "1",
                    defaultValue: record.COLUMN_DEFAULT,
                    position: record.ORDINAL_POSITION,
                    extra: record.EXTRA,
                    isPrimaryKey: false,
                    foreignKey: undefined,
                });
            }
        }

        // Set the tables
        let dbFinals: DatabaseEntity[] = [];
        for (const [dbName, dbTables] of databases) {
            let tbs: DatabaseTable[] = [];
            for (const [table, columns] of dbTables) {
                columns.sort((a, b) => a.position - b.position); // Sort based on ordinal position
                let tbl = new DatabaseTable(table, columns);
                tbs.push(tbl);
            }
            let db = new DatabaseEntity(dbName, tbs);
            dbFinals.push(db);
        }

        return dbFinals;
    }

    updateMysqlDatabaseWithConstraints(
        databases: DatabaseEntity[],
        res: {
            CONSTRAINT_NAME: string;
            TABLE_SCHEMA: string;
            TABLE_NAME: string;
            COLUMN_NAME: string;
            CONSTRAINT_TYPE: string;
            REFERENCED_TABLE_SCHEMA: string;
            REFERENCED_TABLE_NAME: string;
            REFERENCED_COLUMN_NAME: string;
        }[]
    ) {
        let dbMap: Map<string, DatabaseEntity> = new Map();
        for (let db of databases) {
            dbMap.set(db.name, db);
        }
        for (const constraint of res) {
            Object.keys(constraint).forEach((k) => ((constraint as any)[k.toUpperCase()] = (constraint as any)[k])); // Fix this bs
            const concernedTable = dbMap.get(constraint.TABLE_SCHEMA).tables.get(constraint.TABLE_NAME);
            const concernedColumn = concernedTable.columns.get(constraint.COLUMN_NAME);
            if (concernedTable !== undefined && concernedColumn !== undefined) {
                switch (constraint.CONSTRAINT_TYPE) {
                    case "PRIMARY KEY":
                        concernedColumn.isPrimaryKey = true;
                        concernedTable.primaryKey = concernedColumn;
                        break;
                    case "UNIQUE":
                        if (concernedTable.uniqueKeys.has(constraint.CONSTRAINT_NAME)) {
                            concernedTable.uniqueKeys.get(constraint.CONSTRAINT_NAME).push(concernedColumn);
                        } else {
                            concernedTable.uniqueKeys.set(constraint.CONSTRAINT_NAME, [concernedColumn]);
                        }
                        break;
                    case "FOREIGN KEY":
                        concernedColumn.foreignKey = {
                            qualifiedTargetTable: `${constraint.REFERENCED_TABLE_SCHEMA}.${constraint.REFERENCED_TABLE_NAME}`,
                            targetColumn: constraint.REFERENCED_COLUMN_NAME,
                            displayColumn: constraint.REFERENCED_COLUMN_NAME,
                            displayQualifiedTargetTable: `${constraint.REFERENCED_TABLE_SCHEMA}.${constraint.REFERENCED_TABLE_NAME}`,
                        };
                        break;
                }
            }
        }
    }

    updatePostgresDatabaseWithConstraints(
        databases: DatabaseEntity[],
        res: {
            constraint_name: string;
            table_schema: string;
            table_name: string;
            column_name: string;
            constraint_type: string;
        }[]
    ) {
        let dbMap: Map<string, DatabaseEntity> = new Map();
        for (let db of databases) {
            dbMap.set(db.name, db);
        }
        for (const constraint of res) {
            const concernedTable = dbMap.get(constraint.table_schema).tables.get(constraint.table_name);
            const concernedColumn = concernedTable.columns.get(constraint.column_name);
            if (concernedTable !== undefined && concernedColumn !== undefined) {
                switch (constraint.constraint_type) {
                    case "PRIMARY KEY":
                        concernedColumn.isPrimaryKey = true;
                        concernedTable.primaryKey = concernedColumn;
                        break;
                    case "UNIQUE":
                        if (concernedTable.uniqueKeys.has(constraint.constraint_name)) {
                            concernedTable.uniqueKeys.get(constraint.constraint_name).push(concernedColumn);
                        } else {
                            concernedTable.uniqueKeys.set(constraint.constraint_name, [concernedColumn]);
                        }
                        break;
                }
            }
        }
    }

    normalizeType(dialect: "pg" | "mysql2" | "better-sqlite3", typeName: string, lenStr?: string): ColumnType {
        switch (dialect) {
            case "better-sqlite3": {
                // https://www.sqlite.org/datatype3.html
                let lc = typeName.toLowerCase();
                if (["integer", "int", "tinyint", "smallint", "mediumint", "bigint", "int2", "int8", "numeric", "decimal"].includes(lc)) {
                    return {
                        type: "int",
                        min: -2147483648,
                        max: 2147483647,
                    };
                }
                if (["text", "character", "varchar", "nchar", "clob", "nvarchar"].includes(lc)) {
                    return {
                        type: "string",
                        fixedLength: false,
                        length: 2147483647,
                    };
                }
                if (["real", "double", "double precision", "float"].includes(lc)) {
                    return {
                        type: "float",
                        min: -1.7976931348623157e308,
                        max: 1.7976931348623157e308,
                    };
                }
                if (["bool", "boolean"].includes(lc)) {
                    return {
                        type: "bool",
                    };
                }
                if (lc === "date") {
                    return {
                        type: "date",
                    };
                }
                if (lc === "datetime") {
                    return {
                        type: "timestamp",
                    };
                }
                // SQLite doesn't have enums anyway
                return {
                    type: "blob",
                    size: 2147483647,
                };
            }

            case "mysql2":
                {
                    if (typeName === undefined) {
                        console.log("wtf");
                    }
                    typeName = typeName.toLowerCase();
                    if (typeName.startsWith("varchar")) {
                        let len = typeName.substring(typeName.indexOf("(") + 1, typeName.indexOf(")"));
                        return {
                            type: "string",
                            fixedLength: false,
                            length: parseInt(len),
                        };
                    }
                    if (typeName === "json" || typeName === "") {
                        return {
                            type: "string",
                            fixedLength: false,
                            length: 2147483647,
                        };
                    }
                    if (typeName.startsWith("varbinary")) {
                        let len = typeName.substring(typeName.indexOf("(") + 1, typeName.indexOf(")"));
                        return {
                            type: "blob",
                            size: parseInt(len),
                        };
                    }
                    if (typeName.startsWith("char")) {
                        let len = typeName.substring(typeName.indexOf("(") + 1, typeName.indexOf(")"));
                        return {
                            type: "string",
                            fixedLength: true,
                            length: parseInt(len),
                        };
                    }
                    let first = typeName.split(" ")[0];
                    if (first.startsWith("enum")) {
                        let values = typeName.substring(typeName.indexOf("(") + 1, typeName.indexOf(")")).split(",");
                        return {
                            type: "enum",
                            values: values,
                        };
                    }
                    // Now strip the sizes cause we don't parse that beyond this point
                    if (typeName.indexOf("(") !== -1) {
                        typeName = typeName.substring(0, typeName.indexOf("("));
                        first = typeName.split(" ")[0];
                    }
                    if (["timestamp", "datetime"].includes(typeName))
                        return {
                            type: "timestamp",
                        };
                    if (typeName == "date") {
                        return {
                            type: "date",
                        };
                    }
                    if (typeName == "tinyint(1)") {
                        // Most likely a bool
                        return {
                            type: "bool",
                        };
                    }
                    if (["tinyint", "smallint", "mediumint", "int", "bigint"].includes(first)) {
                        let isUnsigned = typeName.includes("unsigned");
                        switch (first) {
                            case "tinyint":
                                return {
                                    type: "int",
                                    min: isUnsigned ? 0 : -128,
                                    max: isUnsigned ? 255 : 127,
                                };
                            case "smallint":
                                return {
                                    type: "int",
                                    min: isUnsigned ? 0 : -32768,
                                    max: isUnsigned ? 65535 : 32767,
                                };
                            case "mediumint":
                                return {
                                    type: "int",
                                    min: isUnsigned ? 0 : -8388608,
                                    max: isUnsigned ? 16777215 : 8388607,
                                };

                            case "int":
                                return {
                                    type: "int",
                                    min: isUnsigned ? 0 : -2147483648,
                                    max: isUnsigned ? 4294967295 : 2147483647,
                                };
                            case "bigint":
                                return {
                                    type: "int",
                                    min: isUnsigned ? 0 : -9223372036854775808,
                                    max: isUnsigned ? 18446744073709551615 : 9223372036854775807,
                                };
                        }
                    }
                    if (["decimal", "numeric", "float", "double"].includes(first)) {
                        switch (
                            first // Signed floats not supported yet
                        ) {
                            case "float":
                            case "numeric":
                                return {
                                    type: "float",
                                    min: -3.4028234663852886e38,
                                    max: 3.4028234663852886e38,
                                };

                            case "double":
                            case "decimal":
                                return {
                                    type: "float",
                                    min: -1.7976931348623157e308,
                                    max: 1.7976931348623157e308,
                                };
                            // Decimal + Numeric Not supported Yet
                        }
                    }
                    if (["tinyblob", "blob", "mediumblob", "longblob"].includes(first)) {
                        switch (first) {
                            case "tinyblob":
                                return {
                                    type: "blob",
                                    size: 255,
                                };
                            case "blob":
                                return {
                                    type: "blob",
                                    size: 65535,
                                };
                            case "mediumblob":
                                return {
                                    type: "blob",
                                    size: 16777215,
                                };
                            case "longblob":
                                return {
                                    type: "blob",
                                    size: 4294967295,
                                };
                        }
                    }
                    // Now the same for tinytext, text, etc
                    if (["tinytext", "text", "mediumtext", "longtext"].includes(first)) {
                        switch (first) {
                            case "tinytext":
                                return {
                                    type: "string",
                                    fixedLength: false,
                                    length: 255,
                                };
                            case "text":
                                return {
                                    type: "string",
                                    fixedLength: false,
                                    length: 65535,
                                };
                            case "mediumtext":
                                return {
                                    type: "string",
                                    fixedLength: false,
                                    length: 16777215,
                                };
                            case "longtext":
                                return {
                                    type: "string",
                                    fixedLength: false,
                                    length: 4294967295,
                                };
                        }
                    }
                }
                throw new Error("Unable to parse type: " + typeName); // throw

            case "pg": {
                // Character types
                typeName = typeName.toLowerCase();
                if (typeName.startsWith("character varying")) {
                    let len = lenStr != null ? parseInt(lenStr) : Number.MAX_SAFE_INTEGER;
                    if (isNaN(len)) len = Number.MAX_SAFE_INTEGER;
                    return {
                        type: "string",
                        fixedLength: false,
                        length: len,
                    };
                }
                if (typeName.startsWith("character")) {
                    let len = lenStr != null ? parseInt(lenStr) : Number.MAX_SAFE_INTEGER;
                    if (isNaN(len)) len = Number.MAX_SAFE_INTEGER;
                    return {
                        type: "string",
                        fixedLength: true,
                        length: len,
                    };
                }
                if (typeName === "text") {
                    return {
                        type: "string",
                        fixedLength: true,
                        length: Number.MAX_SAFE_INTEGER,
                    };
                }
                // Now strip the sizes cause we don't parse that beyond this point
                if (typeName.indexOf("(") !== -1) {
                    typeName = typeName.substring(0, typeName.indexOf("("));
                }
                // Numeric types
                if (["smallint", "integer", "bigint", "smallserial", "serial", "bigserial"].includes(typeName)) {
                    switch (typeName) {
                        case "smallint":
                        case "smallserial":
                            return {
                                type: "int",
                                min: -32768,
                                max: 32767,
                            };

                        case "integer":
                        case "serial":
                            return {
                                type: "int",
                                min: -2147483648,
                                max: 2147483647,
                            };

                        case "bigint":
                        case "bigserial":
                            return {
                                type: "int",
                                min: -9223372036854775808,
                                max: 9223372036854775807,
                            };
                    }
                }
                // Float/Double precision
                if (["decimal", "numeric", "real", "double precision"].includes(typeName)) {
                    switch (
                        typeName // Signed floats not supported yet
                    ) {
                        case "real":
                        case "numeric":
                            return {
                                type: "float",
                                min: -3.4028234663852886e38,
                                max: 3.4028234663852886e38,
                            };

                        case "double precision":
                        case "decimal":
                            return {
                                type: "float",
                                min: -1.7976931348623157e308,
                                max: 1.7976931348623157e308,
                            };
                        // Decimal + Numeric Not supported Yet
                    }
                }
                if (typeName.startsWith("timestamp"))
                    return {
                        type: "timestamp",
                    };
                if (typeName.startsWith("date"))
                    return {
                        type: "date",
                    };
                if (typeName === "boolean")
                    return {
                        type: "bool",
                    };
                if (typeName === "uuid")
                    return {
                        // Just treat this as a string
                        type: "string",
                        fixedLength: true,
                        length: 38, // 36 + 2 optional brackets
                    };
                // Enum not supported
                throw new Error("Unable to parse type: " + typeName); // throw
            }
        }
    }
}

export const connectToDatabase = async (config: ConnectionConfig) => {
    switch (config.databaseType) {
        case "better-sqlite3":
            return new DatabaseConnection(config);
        default:
            if (config.proxy !== undefined) {
                let sshConfig: SshOptions = {
                    host: config.proxy.host,
                    port: config.proxy.port,
                    keepaliveInterval: 30000,
                    username: config.proxy.user,
                };
                switch (config.proxy.authentication.type) {
                    case "none":
                        break;
                    case "password":
                        sshConfig.password = config.proxy.authentication.password;
                        break;
                    case "privateKey":
                        sshConfig.privateKey = await fs.readFile(config.proxy.authentication.privateKeyPath);
                        break;
                }
                let [tunnelServer, tunnelClient] = await createTunnel({ autoClose: false }, {}, sshConfig, {
                    dstAddr: config.host,
                    dstPort: config.port,
                });

                let serverAddr = tunnelServer.address() as AddressInfo;
                config.host = serverAddr.address;
                config.port = serverAddr.port;

                return new DatabaseConnection(config);
            } else {
                return new DatabaseConnection(config);
            }
    }
};
