export interface DatabaseEntityInterface {
    name: string;
    tables: Map<string, DatabaseTableInterface>;
    isDummy: boolean;
}

export class DatabaseEntity {
    name: string;
    tables: Map<string, DatabaseTable>;
    isDummy: boolean;

    constructor(name: string, tables: DatabaseTable[]) {
        this.name = name;
        this.tables = new Map();
        for (const table of tables) {
            this.tables.set(table.name, table);
            table.database = this;
        }
    }

    asObject(): DatabaseEntityInterface {
        let podTables = new Map();
        for (const [k, v] of this.tables) {
            podTables.set(k, v.asJSObject());
        }
        return {
            name: this.name,
            tables: podTables,
            isDummy: this.isDummy,
        };
    }
}

export interface DatabaseTableInterface {
    name: string;
    columns: Map<string, DatabaseColumn>;
    primaryKey: DatabaseColumn;
    uniqueKeys: Map<string, DatabaseColumn[]>;
}

export class DatabaseTable {
    database: DatabaseEntity;
    name: string;
    columns: Map<string, DatabaseColumn>;
    primaryKey: DatabaseColumn;
    uniqueKeys: Map<string, DatabaseColumn[]>;

    constructor(name: string, columns: DatabaseColumn[]) {
        this.name = name;
        this.columns = new Map();
        this.uniqueKeys = new Map();
        for (const col of columns) {
            this.columns.set(col.name, col);
        }
    }

    public get qualifiedName() {
        if (this.database.isDummy) {
            return this.name;
        } else {
            return `${this.database.name}.${this.name}`;
        }
    }

    public asJSObject(): DatabaseTableInterface {
        return {
            name: this.name,
            columns: this.columns,
            primaryKey: this.primaryKey,
            uniqueKeys: this.uniqueKeys,
        };
    }
}

export interface DatabaseColumn {
    name: string;
    type: ColumnType;
    nullable: boolean;
    defaultValue: string;
    position: number;
    extra: string;
    isPrimaryKey: boolean;
    foreignKey?: {
        qualifiedTargetTable: string;
        targetColumn: string;
        displayQualifiedTargetTable: string;
        displayColumn: string;
    };
}

export interface TableFilter {
    column: DatabaseColumn;
    operator: "=" | "!=" | ">" | "<" | ">=" | "<=" | "like";
    value: string;
}

interface StringColumnType {
    type: "string";
    fixedLength: boolean;
    length: number;
}

interface IntegerColumnType {
    type: "int";
    min: number;
    max: number;
}

interface FloatColumnType {
    type: "float";
    min: number;
    max: number;
}

interface BoolColumnType {
    type: "bool";
}

interface TimestampColumnType {
    type: "timestamp";
}

interface DateColumnType {
    type: "date";
}

interface BlobColumnType {
    type: "blob";
    size: number;
}

interface EnumColumnType {
    type: "enum";
    values: string[];
}

export type ColumnType =
    | StringColumnType
    | IntegerColumnType
    | FloatColumnType
    | BoolColumnType
    | TimestampColumnType
    | DateColumnType
    | BlobColumnType
    | EnumColumnType;

export type AsyncReturnType<T extends (...args: any) => Promise<any>> = T extends (...args: any) => Promise<infer R> ? R : any;
