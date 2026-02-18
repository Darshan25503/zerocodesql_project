import { Knex } from "knex";
import prisma from "../../../prisma/client";
import { config } from "./config";
import { ConnectionConfig, connectToDatabase, DatabaseConnection } from "./connection";
import { DatabaseColumn, DatabaseEntity, DatabaseTable, TableFilter } from "./types";

export class Database {
    private config: ConnectionConfig;
    private conn: DatabaseConnection | null;
    private _databases: Map<number, DatabaseEntity>;
    id: number;
    display: string;

    public get databases() {
        return this._databases;
    }

    constructor(id: number, display: string, config: ConnectionConfig) {
        this.id = id;
        this.display = display;
        this.config = config;
        this.conn = null;
    }

    public async init() {
        // Connect to the database
        this.conn = await connectToDatabase(this.config);
        // Fetch the schema from remote
        let dbs = await this.conn.fetchAllDatabases();
        // Update our local schema
        await this.syncDb(dbs);
    }

    public async fetch(
        table: DatabaseTable,
        columns: DatabaseColumn[],
        filters: TableFilter[],
        limit?: number,
        offset?: number,
        ordering?: { col: DatabaseColumn; order: "asc" | "desc" }[]
    ): Promise<Record<string, number | string | { id: number; display: string }>[]> {
        let columnSelects = [];

        let foreignKeyTableRefs: {
            name: Knex.Ref<string, { [x: string]: string }>;
            ourSide: string;
            theirSide: string;
            displaySide: string;
        }[] = [];
        let fkeyColumnSelects: {
            name: string;
            ourSide: string;
            displaySide: string;
        }[] = [];

        for (const col of columns) {
            if (!col.foreignKey) {
                columnSelects.push(this.conn.k.ref(col.name).withSchema("_ftable_"));
            } else {
                let targetTableQualfied = col.foreignKey.qualifiedTargetTable;
                let spl = table.database.isDummy ? null : targetTableQualfied.split(".");
                let targetDatabase = table.database.isDummy ? table.database : [...this.databases.values()].find((x) => x.name === spl[0]);
                let targetTable = targetDatabase.tables.get(table.database.isDummy ? targetTableQualfied : spl[1]);

                foreignKeyTableRefs.push({
                    name: this.conn.k.ref(targetTable.qualifiedName).as(`_reftable_${targetTable.name}`),
                    ourSide: `_ftable_.${col.name}`,
                    theirSide: `_reftable_${targetTable.name}.${col.foreignKey.targetColumn}`,
                    displaySide: `_reftable_${targetTable.name}.${col.foreignKey.displayColumn}`, // Constraint the display to within the same table I guess
                });

                columnSelects.push(this.conn.k.ref(col.name).withSchema("_ftable_").as(`_fkeyselect_${col.name}`));
                columnSelects.push(this.conn.k.ref(col.foreignKey.displayColumn).withSchema(`_reftable_${targetTable.name}`).as(`_fkeydisplay_${col.name}`));

                fkeyColumnSelects.push({
                    name: col.name,
                    ourSide: `_fkeyselect_${col.name}`,
                    displaySide: `_fkeydisplay_${col.name}`,
                });
            }
        }
        let initialQuery = this.conn.k.queryBuilder().select(columnSelects).from(this.conn.k.ref(table.qualifiedName).as("_ftable_"));

        // Add the foreign key tables
        for (const ref of foreignKeyTableRefs) {
            initialQuery = initialQuery.leftJoin(ref.name, ref.ourSide, ref.theirSide);
        }

        if (filters != null) {
            let firstWhere = true;
            for (const filter of filters) {
                if (firstWhere) {
                    initialQuery = initialQuery.where(this.conn.k.ref(filter.column.name).withSchema("_ftable_"), filter.operator, filter.value);
                } else {
                    initialQuery = initialQuery.andWhere(this.conn.k.ref(filter.column.name).withSchema("_ftable_"), filter.operator, filter.value);
                }
            }
        }

        if (limit != null) initialQuery = initialQuery.limit(limit, { skipBinding: true });

        if (offset != null) initialQuery = initialQuery.offset(offset, { skipBinding: true });

        if (ordering != null) {
            initialQuery = initialQuery.orderBy(
                ordering.map((x) => {
                    return { column: `_ftable_.${x.col.name}`, order: x.order };
                })
            );
        }

        let results: Record<string, number | string | { id: number; display: string }>[] = await initialQuery;

        // Postprocessing for foreign keys
        for (const fkey of fkeyColumnSelects) {
            for (const result of results) {
                let displayValue = result[fkey.displaySide];
                let idValue = result[fkey.ourSide];
                // now remove the temp values
                result[fkey.displaySide] = undefined;
                result[fkey.ourSide] = undefined;
                result[fkey.name] = {
                    id: idValue,
                    display: displayValue,
                } as {
                    id: number;
                    display: string;
                };
            }
        }

        return results;
    }

    public async delete(table: DatabaseTable, id: number | string) {
        await this.conn.k.queryBuilder().from(table.qualifiedName).where(table.primaryKey.name, "=", id).delete();
    }

    public async update(table: DatabaseTable, id: number | string, values: { column: DatabaseColumn; value: string | number }[]) {
        let obj = new Object() as Record<string, string | number>;
        for (const val of values) {
            obj[val.column.name] = val.value;
        }

        await this.conn.k.queryBuilder().from(table.qualifiedName).where(table.primaryKey.name, "=", id).update(obj);
    }

    public async insert(table: DatabaseTable, values: { column: DatabaseColumn; value: string | number }[]) {
        // Verify if all fields are present
        for (const [colId, col] of table.columns) {
            if (!col.isPrimaryKey && values.findIndex((x) => x.column === col) === -1) {
                return false;
            }
        }
        // Actually insert the data
        let obj = new Object() as Record<string, string | number>;
        for (const val of values) {
            obj[val.column.name] = val.value;
        }
        await this.conn.k.insert(obj).into(table.qualifiedName);
        return true;
    }

    public async count(table: DatabaseTable): Promise<number> {
        let res = await this.conn.k(table.qualifiedName).count({ count: "*" });
        if (res instanceof Array) {
            return res[0].count ?? res[0];
        }
        if (typeof res === "number") return res;
        if (typeof res === "string") return parseInt(res);
        return res;
    }

    public async fetchForeignKeyDisplays(table: DatabaseTable, columns: DatabaseColumn[]) {
        let foreignKeyTableRefs: {
            name: Knex.Ref<string, { [x: string]: string }>;
            ourSide: string;
            theirSide: string;
            displaySide: string;
        }[] = [];
        let fkeyColumnSelects: {
            name: string;
            ourSide: string;
            displaySide: string;
        }[] = [];
        let columnSelects = [];

        if (columns.length === 0) return [];

        for (const col of columns) {
            if (!col.foreignKey) {
                throw new Error("Columns passed must be foreign keys");
            } else {
                let targetTableQualfied = col.foreignKey.qualifiedTargetTable;
                let spl = table.database.isDummy ? null : targetTableQualfied.split(".");
                let targetDatabase = table.database.isDummy ? table.database : [...this.databases.values()].find((x) => x.name === spl[0]);
                let targetTable = targetDatabase.tables.get(table.database.isDummy ? targetTableQualfied : spl[1]);

                foreignKeyTableRefs.push({
                    name: this.conn.k.ref(targetTable.qualifiedName).as(`_reftable_${targetTable.name}`),
                    ourSide: `_ftable_.${col.name}`,
                    theirSide: `_reftable_${targetTable.name}.${col.foreignKey.targetColumn}`,
                    displaySide: `_reftable_${targetTable.name}.${col.foreignKey.displayColumn}`, // Constraint the display to within the same table I guess
                });

                columnSelects.push(this.conn.k.ref(col.name).withSchema("_ftable_").as(`_fkeyselect_${col.name}`));
                columnSelects.push(this.conn.k.ref(col.foreignKey.displayColumn).withSchema(`_reftable_${targetTable.name}`).as(`_fkeydisplay_${col.name}`));

                fkeyColumnSelects.push({
                    name: col.name,
                    ourSide: `_fkeyselect_${col.name}`,
                    displaySide: `_fkeydisplay_${col.name}`,
                });
            }
        }
        let initialQuery = this.conn.k.queryBuilder();
        for (const col of columnSelects) {
            initialQuery = initialQuery.distinct(col);
        }
        initialQuery = initialQuery.from(this.conn.k.ref(table.qualifiedName).as("_ftable_"));

        // Add the foreign key tables
        for (const ref of foreignKeyTableRefs) {
            initialQuery = initialQuery.leftJoin(ref.name, ref.ourSide, ref.theirSide);
        }

        let results: Record<string, number | string | { id: number; display: string }>[] = await initialQuery;

        // Postprocessing for foreign keys
        for (const fkey of fkeyColumnSelects) {
            for (const result of results) {
                let displayValue = result[fkey.displaySide];
                let idValue = result[fkey.ourSide];
                // now remove the temp values
                result[fkey.displaySide] = undefined;
                result[fkey.ourSide] = undefined;
                result[fkey.name] = {
                    id: idValue,
                    display: displayValue,
                } as {
                    id: number;
                    display: string;
                };
            }
        }
        return results as Record<string, { id: number; display: string }>[];
    }

    public async deleteSelf() {
        // Need to delete *all* the data that references this datasource
        // Fortunately prisma handles this so we don't need to
        await prisma.dataSource.delete({
            where: {
                id: this.id,
            },
        });
    }

    public async syncDb(dbs: DatabaseEntity[]) {
        const start = new Date();
        console.log("Beginning sync");
        await this.trySyncDb(dbs);
        // Do it all over again just to make sure
        await this.trySyncDb(dbs);

        // Now retrieve the ids of the databases
        this._databases = new Map();
        const dbDatabases = await prisma.databaseEntity.findMany({ where: { Datasource_id: this.id } });
        for (const db of dbDatabases) {
            let correspondingDb = dbs.find((x) => x.name === db.Name);
            if (correspondingDb) {
                this._databases.set(db.Id, correspondingDb);
            }
        }
        // Now assign the foreign key displays
        const fCols = await prisma.databaseColumn.findMany({
            where: {
                ForeignKeyId: {
                    not: null,
                },
                DatabaseTable: {
                    DatabaseEntity: {
                        Datasource_id: this.id,
                    },
                },
            },
            select: {
                DatabaseTable: {
                    select: {
                        Name: true,
                        Database_id: true,
                    },
                },
                ForeignKeyDisplayColumn: {
                    select: {
                        Name: true,
                        DatabaseTable: {
                            select: {
                                Name: true,
                                Database_id: true,
                            },
                        },
                    },
                },
                Name: true,
            },
        });
        for (const col of fCols) {
            let c = this.databases.get(col.DatabaseTable.Database_id).tables.get(col.DatabaseTable.Name).columns.get(col.Name);
            let targetC = this.databases.get(col.ForeignKeyDisplayColumn.DatabaseTable.Database_id).tables.get(col.ForeignKeyDisplayColumn.DatabaseTable.Name);
            c.foreignKey.displayColumn = col.ForeignKeyDisplayColumn.Name;
            c.foreignKey.displayQualifiedTargetTable = targetC.qualifiedName;
        }

        const end = new Date();
        console.log(`Sync took ${end.getTime() - start.getTime()}ms`);
    }

    // Migration logic starts from here
    async trySyncDb(dbs: DatabaseEntity[]) {
        // Get all databases for our configuration
        const dbDatabases = await prisma.databaseEntity.findMany({ where: { Datasource_id: this.id } });

        let databasesToAdd: DatabaseEntity[] = [];
        let databasesToUpdate: { db: DatabaseEntity; remoteId: number }[] = [];
        let databasesToDelete: number[] = [];

        // Get the ones for insert and update
        for (const db of dbs) {
            if (!dbDatabases.find((x) => x.Name === db.name)) {
                databasesToAdd.push(db);
            } else {
                databasesToUpdate.push({ db: db, remoteId: dbDatabases.find((x) => x.Name === db.name)!.Id });
            }
        }

        // Get the ones to delete from the schema
        for (const db of dbDatabases) {
            if (!dbs.find((x) => x.name === db.Name)) {
                databasesToDelete.push(db.Id);
            }
        }

        let foreignKeysToUpdate: { col: DatabaseColumn; remoteId: number }[] = [];

        // Now insert the databases
        foreignKeysToUpdate = foreignKeysToUpdate.concat(await this.insertDatabases(databasesToAdd));

        // Update the existing databases
        for (const db of databasesToUpdate) {
            foreignKeysToUpdate = foreignKeysToUpdate.concat(await this.updateDatabase(db.db, db.remoteId));
        }
        // Delete the deleted databases
        await this.deleteDatabases(databasesToDelete);

        // Now finally do the foreign keys
        for (const fkCol of foreignKeysToUpdate) {
            if (fkCol.col.foreignKey) {
                // console.log(`[DB] Updating foreign key ${fkCol.col.foreignKey.qualifiedTargetTable} -> ${fkCol.col.name}`);
                let targetDb, targetTable;
                if (fkCol.col.foreignKey.qualifiedTargetTable.includes(".")) {
                    // Is not dummy
                    targetDb = fkCol.col.foreignKey.qualifiedTargetTable.split(".")[0];
                    targetTable = fkCol.col.foreignKey.qualifiedTargetTable.split(".")[1];
                } else {
                    targetDb = dbs[0].name; // for dummies, the firt one is always a database and theres only one of it
                    targetTable = fkCol.col.foreignKey.qualifiedTargetTable;
                }
                let targetCol = await prisma.databaseColumn.findFirst({
                    where: {
                        DatabaseTable: {
                            Name: targetTable,
                            DatabaseEntity: {
                                Name: targetDb,
                                Datasource_id: this.id,
                            },
                        },
                    },
                });

                await prisma.databaseColumn.updateMany({
                    data: {
                        ForeignKeyId: targetCol.Id,
                        ForeignKeyDisplayId: targetCol.Id,
                    },
                    where: {
                        Id: fkCol.remoteId,
                    },
                });
            }
        }
    }

    async insertDatabases(dbs: DatabaseEntity[]) {
        let tempMap: Map<string, Map<string, Map<string, number>>> = new Map();
        let columnToId: Map<DatabaseColumn, number> = new Map();

        // Add the entities themselves
        let createdCols: number[] = [];
        for (const db of dbs) {
            console.log(`[DB] Adding Database ${db.name}`);
            let dbe = await prisma.databaseEntity.create({
                data: {
                    Name: db.name,
                    Datasource_id: this.id,
                },
            });
            tempMap.set(dbe.Name, new Map());
            for (const [tableName, table] of db.tables) {
                let tbl = await prisma.databaseTable.create({
                    data: {
                        Display: tableName,
                        Name: table.name,
                        Database_id: dbe.Id,
                    },
                });
                if (!tempMap.get(dbe.Name).has(tableName)) {
                    tempMap.get(dbe.Name).set(tableName, new Map());
                }
                tempMap.get(dbe.Name).get(tableName).set(table.name, tbl.Id);

                for (const [columnName, column] of table.columns) {
                    let col = await prisma.databaseColumn.create({
                        data: {
                            DataType: JSON.stringify(column.type),
                            Display: column.name,
                            Name: column.name,
                            isPrimaryKey: column.isPrimaryKey,
                            Order: column.position,
                            Table_id: tbl.Id,
                        },
                    });
                    if (!tempMap.get(dbe.Name).get(tableName).has(column.name)) {
                        tempMap.get(dbe.Name).get(tableName).set(column.name, col.Id);
                    }
                    columnToId.set(column, col.Id);
                    createdCols.push(col.Id);
                }
            }
        }
        await this.addPermissionRecords(createdCols);

        let foreignKeysToUpdate: { col: DatabaseColumn; remoteId: number }[] = [];

        // Then the foreign keys
        // [BUG!]: What if new columns foreign key into existing columns?
        for (const db of dbs) {
            for (const [tableName, table] of db.tables) {
                for (const [columnName, column] of table.columns) {
                    if (column.foreignKey) {
                        foreignKeysToUpdate.push({
                            col: column,
                            remoteId: columnToId.get(column),
                        });
                        // let targetDb = db.isDummy ? tempMap.get(db.name) : tempMap.get(column.foreignKey.qualifiedTargetTable.split('.')[0]);
                        // let targetTable = db.isDummy ? targetDb.get(column.foreignKey.qualifiedTargetTable) : targetDb.get(column.foreignKey.qualifiedTargetTable.split('.')[0]);
                        // let targetColumnId = targetTable.get(column.foreignKey.targetColumn);

                        // let srcId = columnToId.get(column);

                        // console.log(`[DB] Adding ForeignKey ${column.name} -> ${column.foreignKey.qualifiedTargetTable}(${column.foreignKey.targetColumn})`);
                        // await prisma.databaseColumn.update({
                        //     data: {
                        //         ForeignKeyId: targetColumnId,
                        //         ForeignKeyDisplayId: targetColumnId
                        //     },
                        //     where: {
                        //         Id: srcId
                        //     }
                        // });
                    }
                }
            }
        }

        return foreignKeysToUpdate;
    }

    async deleteDatabases(dbIds: number[]) {
        for (const dbId of dbIds) {
            console.log(`[DB] Deleting Database of id ${dbId}`);
            // Delete the permissions
            await prisma.role_table_column_permissions.deleteMany({
                where: {
                    Database_id: dbId,
                },
            });
            // The form fields
            await prisma.formField.deleteMany({
                where: {
                    Database_id: dbId,
                },
            });
            // Api entity columns
            await prisma.apiEntityColumn.deleteMany({
                where: {
                    ApiEntity: {
                        Database_id: dbId,
                    },
                },
            });
            // The api entity
            await prisma.apiEntity.deleteMany({
                where: {
                    Database_id: dbId,
                },
            });
            // Table column foreign keys
            await prisma.databaseColumn.updateMany({
                data: {
                    ForeignKeyDisplayId: null,
                    ForeignKeyId: null,
                },
                where: {
                    OR: [
                        {
                            ForeignKeyTargetColumn: {
                                DatabaseTable: {
                                    Database_id: dbId,
                                },
                            },
                        },
                        {
                            ForeignKeyDisplayColumn: {
                                DatabaseTable: {
                                    Database_id: dbId,
                                },
                            },
                        },
                    ],
                },
            });
            // Table columns
            await prisma.databaseColumn.deleteMany({
                where: {
                    DatabaseTable: {
                        Database_id: dbId,
                    },
                },
            });
            // Tables
            await prisma.databaseTable.deleteMany({
                where: {
                    Database_id: dbId,
                },
            });
            // The entity itself
            await prisma.databaseEntity.deleteMany({
                where: {
                    Id: dbId,
                },
            });
        }
    }

    async updateDatabase(db: DatabaseEntity, remoteDbId: number) {
        let dbTables = await prisma.databaseTable.findMany({
            where: {
                Database_id: remoteDbId,
            },
        });

        let tablesToAdd: DatabaseTable[] = [];
        let tablesToUpdate: { table: DatabaseTable; remoteId: number }[] = [];
        let tablesToDelete: number[] = [];

        for (const [tableName, table] of db.tables) {
            let dbTable = dbTables.find((tbl) => tbl.Name === tableName);
            if (dbTable == null) {
                tablesToAdd.push(table);
            } else {
                tablesToUpdate.push({ table: table, remoteId: dbTable.Id });
            }
        }

        for (const dbTable of dbTables) {
            if (!db.tables.has(dbTable.Name)) {
                tablesToDelete.push(dbTable.Id);
            }
        }

        let foreignKeysToUpdate: { col: DatabaseColumn; remoteId: number }[] = [];
        // Insert the tables
        foreignKeysToUpdate = foreignKeysToUpdate.concat(await this.insertTables(remoteDbId, tablesToAdd));
        // Update the tables
        for (const tbl of tablesToUpdate) {
            foreignKeysToUpdate = foreignKeysToUpdate.concat(await this.updateTable(tbl.table, tbl.remoteId));
        }
        // Delete the tables
        await this.deleteTables(tablesToDelete);

        return foreignKeysToUpdate;
    }

    async insertTables(databaseId: number, tables: DatabaseTable[]) {
        let foreignKeysToUpdate: { col: DatabaseColumn; remoteId: number }[] = [];
        for (const table of tables) {
            // console.log(`[DB] Inserting Table ${table.name}`);
            let tbl = await prisma.databaseTable.create({
                data: {
                    Display: table.name,
                    Name: table.name,
                    Database_id: databaseId,
                },
            });

            let insertedCols: number[] = [];
            for (const [columnName, column] of table.columns) {
                let col = await prisma.databaseColumn.create({
                    data: {
                        DataType: JSON.stringify(column.type),
                        Display: column.name,
                        Name: column.name,
                        isPrimaryKey: column.isPrimaryKey,
                        Order: column.position,
                        Table_id: tbl.Id,
                    },
                });
                insertedCols.push(col.Id);
                if (column.foreignKey) {
                    foreignKeysToUpdate.push({ col: column, remoteId: col.Id });
                }
            }
            await this.addPermissionRecords(insertedCols);
        }
        return foreignKeysToUpdate;
    }

    async deleteTables(dbIds: number[]) {
        for (const dbId of dbIds) {
            // console.log(`[DB] Deleting Table of id ${dbId}`);
            // Delete the permissions
            await prisma.role_table_column_permissions.deleteMany({
                where: {
                    Table_id: dbId,
                },
            });
            // The form fields
            await prisma.formField.deleteMany({
                where: {
                    Table_id: dbId,
                },
            });
            // Api entity columns
            await prisma.apiEntityColumn.deleteMany({
                where: {
                    DatabaseColumn: {
                        Table_id: dbId,
                    },
                },
            });
            // The api entity
            await prisma.apiEntity.deleteMany({
                where: {
                    Table_id: dbId,
                },
            });
            // Table column foreign keys
            await prisma.databaseColumn.updateMany({
                data: {
                    ForeignKeyDisplayId: null,
                    ForeignKeyId: null,
                },
                where: {
                    OR: [
                        {
                            ForeignKeyTargetColumn: {
                                Table_id: dbId,
                            },
                        },
                        {
                            ForeignKeyDisplayColumn: {
                                Table_id: dbId,
                            },
                        },
                    ],
                },
            });
            // Table columns
            await prisma.databaseColumn.deleteMany({
                where: {
                    Table_id: dbId,
                },
            });
            // Tables
            await prisma.databaseTable.deleteMany({
                where: {
                    Id: dbId,
                },
            });
        }
    }

    async updateTable(table: DatabaseTable, remoteTblId: number) {
        // Same situation for the columns
        let dbColumns = await prisma.databaseColumn.findMany({
            where: {
                Table_id: remoteTblId,
            },
        });

        let columnsToAdd: DatabaseColumn[] = [];
        let columnsToUpdate: { col: DatabaseColumn; remoteId: number }[] = [];
        let columnsToDelete: number[] = [];

        let columnForeignKeysToUpdate: { col: DatabaseColumn; remoteId: number }[] = [];

        for (const [colName, col] of table.columns) {
            let dbColumn = dbColumns.find((col) => col.Name === colName);
            if (dbColumn == null) {
                columnsToAdd.push(col);
            } else {
                if (
                    dbColumn.isPrimaryKey !== col.isPrimaryKey ||
                    dbColumn.Order !== col.position ||
                    dbColumn.DataType !== JSON.stringify(col.type) ||
                    col.foreignKey != null
                ) {
                    columnsToUpdate.push({ col: col, remoteId: dbColumn.Id });
                }
            }
        }

        for (const dbColumn of dbColumns) {
            if (!table.columns.has(dbColumn.Name)) {
                columnsToDelete.push(dbColumn.Id);
            }
        }
        // Finally we are done

        // Insert the columns
        let insertedIds: number[] = [];
        for (const column of columnsToAdd) {
            // console.log(`[DB] Inserting Column ${column.name}`);
            let col = await prisma.databaseColumn.create({
                data: {
                    DataType: JSON.stringify(column.type),
                    Display: column.name,
                    Name: column.name,
                    isPrimaryKey: column.isPrimaryKey,
                    Order: column.position,
                    Table_id: remoteTblId,
                },
            });
            insertedIds.push(col.Id);
        }
        await this.addPermissionRecords(insertedIds);
        // Update the columns

        // Update the foreign keys of those who don't have any
        const nonFkIds = [];
        const fkIds = [];
        const remoteIdToColumn: Map<number, (typeof columnsToUpdate)[number]> = new Map();
        for (const column of columnsToUpdate) {
            if (column.col.foreignKey) {
                fkIds.push(column.remoteId);
            } else {
                nonFkIds.push(column.remoteId);
            }
            remoteIdToColumn.set(column.remoteId, column);
        }

        // Run this megaquery
        await prisma.databaseColumn.updateMany({
            data: {
                ForeignKeyDisplayId: null,
                ForeignKeyId: null,
            },
            where: {
                Id: { in: nonFkIds },
                ForeignKeyDisplayId: { not: null },
                ForeignKeyId: { not: null },
            },
        });

        // For the ones with foreign keys
        let rec = await prisma.databaseColumn.findMany({
            where: {
                Id: { in: fkIds },
            },
            select: {
                Id: true,
                ForeignKeyTargetColumn: {
                    select: {
                        Name: true,
                        DatabaseTable: {
                            select: {
                                Name: true,
                                DatabaseEntity: {
                                    select: {
                                        Name: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        for (const res of rec) {
            let ourCol = remoteIdToColumn.get(res.Id);
            if (res.ForeignKeyTargetColumn == null) {
                columnForeignKeysToUpdate.push(ourCol);
            } else {
                let qualifiedName = table.database.isDummy
                    ? res.ForeignKeyTargetColumn.DatabaseTable.Name
                    : `${res.ForeignKeyTargetColumn.DatabaseTable.DatabaseEntity.Name}.${res.ForeignKeyTargetColumn.DatabaseTable.Name}`;
                if (ourCol.col.foreignKey.qualifiedTargetTable !== qualifiedName || ourCol.col.foreignKey.targetColumn !== res.ForeignKeyTargetColumn.Name) {
                    // Submit it to list of needing updates
                    columnForeignKeysToUpdate.push(ourCol);
                }
            }
        }

        for (const column of columnsToUpdate) {
            // console.log(`[DB] Updating Column ${column.col.name} with id ${column.remoteId}`);
            await prisma.databaseColumn.updateMany({
                data: {
                    DataType: JSON.stringify(column.col.type),
                    Order: column.col.position,
                    isPrimaryKey: column.col.isPrimaryKey,
                },
                where: {
                    Id: column.remoteId,
                },
            });
        }

        // Delete the columns
        for (const colId of columnsToDelete) {
            // console.log(`[DB] Deleting Column ${colId}`);
            // Delete the permissions
            await prisma.role_table_column_permissions.deleteMany({
                where: {
                    Column_id: colId,
                },
            });
            // The form fields
            await prisma.formField.deleteMany({
                where: {
                    Column_id: colId,
                },
            });
            // Api entity columns
            await prisma.apiEntityColumn.deleteMany({
                where: {
                    Column_id: colId,
                },
            });
            // Table column foreign keys
            await prisma.databaseColumn.updateMany({
                data: {
                    ForeignKeyDisplayId: null,
                    ForeignKeyId: null,
                },
                where: {
                    OR: [
                        {
                            ForeignKeyId: colId,
                        },
                        {
                            ForeignKeyDisplayId: colId,
                        },
                    ],
                },
            });
            // Table columns
            await prisma.databaseColumn.deleteMany({
                where: {
                    Id: colId,
                },
            });
        }

        return columnForeignKeysToUpdate;
    }

    async addPermissionRecords(colIds: number[]) {
        let colDetails: Map<number, { source: number; database: number; table: number }> = new Map();
        for (const col of colIds) {
            let detail = await prisma.databaseColumn.findFirst({
                select: {
                    DatabaseTable: {
                        select: {
                            Id: true,
                            DatabaseEntity: {
                                select: {
                                    Id: true,
                                    Datasource_id: true,
                                },
                            },
                        },
                    },
                },
                where: {
                    Id: col,
                },
            });
            colDetails.set(col, {
                source: detail.DatabaseTable.DatabaseEntity.Datasource_id,
                database: detail.DatabaseTable.DatabaseEntity.Id,
                table: detail.DatabaseTable.Id,
            });
        }

        const roles = await prisma.role.findMany();
        for (const role of roles) {
            for (const col of colIds) {
                let details = colDetails.get(col);
                await prisma.role_table_column_permissions.create({
                    data: {
                        Role_id: role.Id,
                        Column_id: col,
                        Database_id: details.database,
                        Datasource_id: details.source,
                        Table_id: details.table,
                        permissionFlags: 0,
                    },
                });
            }
        }
    }
}
