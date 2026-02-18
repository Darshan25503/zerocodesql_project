import prisma from "../../../prisma/client";
import { getDatabaseManager } from "../database/manager";
import { DatabaseColumn, DatabaseTable } from "../database/types";
import { Id } from "./types";
import { User } from "../manage/user";

export type APITargetSchema = {
    id: number;
    name: string;
    dataSource: number;
    table: DatabaseTable;
    columns: DatabaseColumn[];
};

export interface ApiStatistics {
    id: Id<"ApiEntity">;
    name: string;
    author: string;
    hits: number;
}

export interface ApiGraphStatistics {
    hits: ApiGraphHitsStatistics[];
}

export interface ApiGraphHitsStatistics {
    id: number;
    Api_Id: number;
    Timestamp: Date;
}

export class API {
    // Get an API schema definition by its name i.e the API path that is set in the URL
    // Returns the associated table and its columns
    public static async getAPISchema(name: string): Promise<APITargetSchema> {
        let apiEntity = await prisma.apiEntity.findFirst({
            select: {
                Id: true,
                ApiEntityColumn: {
                    select: {
                        Order: true,
                        DatabaseColumn: {
                            select: {
                                Name: true,
                            },
                        },
                    },
                },
                Datasource_id: true,
                DatabaseTable: {
                    select: {
                        Name: true,
                    },
                },
                Database_id: true,
            },

            where: {
                Name: name,
            },
        });
        if (apiEntity == null) return null;
        const db = await getDatabaseManager();
        let databaseTable = db.databases.get(apiEntity.Datasource_id).databases.get(apiEntity.Database_id).tables.get(apiEntity.DatabaseTable.Name);
        apiEntity.ApiEntityColumn.sort((x, y) => x.Order - y.Order);
        let columns = apiEntity.ApiEntityColumn.map((x) => databaseTable.columns.get(x.DatabaseColumn.Name));
        return {
            id: apiEntity.Id,
            name: name,
            dataSource: apiEntity.Datasource_id,
            table: databaseTable,
            columns: columns,
        };
    }

    // Verifies whether a given API by its name satisfies a given permission, as well as whether the API key is matching or not
    public static async verifyAPIPermissions(name: string, permission: "GET" | "POST" | "PATCH" | "DELETE", key: string) {
        let apiEntity = await prisma.apiEntity.findFirst({
            where: {
                Name: name,
            },
            select: {
                Permissions: true,
                Enabled: true,
                ApiKey: true,
            },
        });
        if (apiEntity == null) return false;
        if (!apiEntity.Enabled) return false;
        if (key === null) key = "";
        if (apiEntity.ApiKey != null && apiEntity.ApiKey != key) return false;
        switch (permission) {
            case "GET":
                return (apiEntity.Permissions & 1) == 1;

            case "POST":
                return (apiEntity.Permissions & 2) == 2;

            case "PATCH":
                return (apiEntity.Permissions & 4) == 4;

            case "DELETE":
                return (apiEntity.Permissions & 8) == 8;
        }
    }

    // Create an API, the database IDs are from the database
    public static async createAPI(
        userId: Id<"User">,
        name: string,
        display: string,
        datasourceId: number,
        databaseId: number,
        tableId: number,
        columns: number[],
        permissionFlags: number,
        key: string,
        enabled: boolean
    ) {
        let ent = await prisma.apiEntity.create({
            data: {
                Name: name,
                Display: display,
                ApiKey: key,
                Enabled: enabled,
                Permissions: permissionFlags,
                Datasource_id: datasourceId,
                Table_id: tableId,
                Database_id: databaseId,
                UserId: userId,
            },
        });
        // Create the apiEntityColumns
        for (let i = 0; i < columns.length; i++) {
            let col = columns[i];
            await prisma.apiEntityColumn.create({
                data: {
                    Order: i,
                    Api_id: ent.Id,
                    Column_id: col,
                },
            });
        }
    }

    // Update an existing API
    public static async updateAPI(
        id: number,
        name: string,
        display: string,
        datasourceId: number,
        databaseId: number,
        tableId: number,
        columns: number[],
        permissionFlags: number,
        enabled: boolean
    ) {
        await prisma.apiEntity.update({
            where: {
                Id: id,
            },
            data: {
                Name: name,
                Display: display,
                Enabled: enabled,
                Permissions: permissionFlags,
                Datasource_id: datasourceId,
                Table_id: tableId,
                Database_id: databaseId,
            },
        });
        // Drop the existing columns
        await prisma.apiEntityColumn.deleteMany({
            where: {
                Api_id: id,
            },
        });
        // Create the apiEntityColumns
        for (let i = 0; i < columns.length; i++) {
            let col = columns[i];
            await prisma.apiEntityColumn.create({
                data: {
                    Order: i,
                    Api_id: id,
                    Column_id: col,
                },
            });
        }
    }

    // Delete an API
    public static async deleteAPI(id: number) {
        // Delete the columns first
        await prisma.apiEntityColumn.deleteMany({
            where: {
                Api_id: id,
            },
        });
        await prisma.apiEntity.delete({
            where: {
                Id: id,
            },
        });
    }

    // Get a list of APIs
    public static async listAPIs() {
        return await prisma.apiEntity.findMany({
            select: {
                Id: true,
                Name: true,
                Display: true,
                Permissions: true,
                Datasource_id: true,
                Database_id: true,
                Table_id: true,
                ApiKey: true,
                Enabled: true,
                ApiEntityColumn: {
                    select: {
                        Column_id: true,
                        Order: true,
                    },
                },
                _count: {
                    select: {
                        ApiHits: true,
                    },
                },
            },
        });
    }

    // Get a single API from its ID
    public static async getAPIFromID(id: number) {
        return await prisma.apiEntity.findFirst({
            where: {
                Id: id,
            },
            include: {
                ApiEntityColumn: {
                    select: {
                        Column_id: true,
                        Order: true,
                    },
                },
            },
        });
    }

    // Applies the GET /list operation for an API, i.e grabs the list of records from its associated database/table/etc
    public static async applyGETList(ent: APITargetSchema, offset: number, count: number) {
        const db = await getDatabaseManager();
        let data = await db.databases.get(ent.dataSource).fetch(ent.table, ent.columns, null, count, offset);
        return data;
    }

    // Applies the GET /<id> operation for an API, i.e grabs a single record from its associated database/table/etc by its row primary key
    public static async applyGETSingle(ent: APITargetSchema, rowId: number) {
        const db = await getDatabaseManager();
        let data = await db.databases.get(ent.dataSource).fetch(
            ent.table,
            ent.columns,
            [
                {
                    column: ent.table.primaryKey,
                    operator: "=",
                    value: rowId.toString(),
                },
            ],
            1
        );
        return data;
    }

    // Applies the POST / operation for an API, i.e inserts a new record into its associated database/table/etc
    public static async applyPOST(ent: APITargetSchema, data: Record<string, string>) {
        const db = await getDatabaseManager();
        // What if we didn't select all the columns in the API, need to use the defaults!
        const tbl = ent.table;
        let colValues: { column: DatabaseColumn; value: string }[] = [];
        for (const [colId, col] of tbl.columns) {
            if (col.isPrimaryKey) continue;
            if (data[col.name] !== undefined) {
                colValues.push({ column: col, value: data[col.name] });
            } else {
                colValues.push({ column: col, value: col.defaultValue ?? "" });
            }
        }

        return await db.databases.get(ent.dataSource).insert(tbl, colValues);
    }

    // Applies the PATCH /<id> operation for an API, i.e updates a single record from its associated database/table/etc by its row primary key
    public static async applyPATCH(ent: APITargetSchema, id: number, data: Record<string, string>) {
        const db = await getDatabaseManager();
        // What if we didn't select all the columns in the API, need to use the defaults!
        const tbl = ent.table;
        let colValues: { column: DatabaseColumn; value: string }[] = [];
        for (const [colId, col] of tbl.columns) {
            if (col.isPrimaryKey) continue;
            if (data[col.name] !== undefined) {
                colValues.push({ column: col, value: data[col.name] });
            }
        }

        await db.databases.get(ent.dataSource).update(tbl, id, colValues);
    }

    // Applies the DELETE /<id> operation for an API, i.e deletes a single record from its associated database/table/etc by its row primary key
    public static async applyDELETE(ent: APITargetSchema, rowId: number) {
        const db = await getDatabaseManager();
        await db.databases.get(ent.dataSource).delete(ent.table, rowId);
    }

    //Api data for dashboard
    public static async getAllApiStats(usr?: Id<"User">): Promise<ApiStatistics[]> {
        let fd = await prisma.apiEntity.findMany({
            select: {
                Id: true,
                Name: true,
                _count: {
                    select: {
                        ApiHits: true,
                    },
                },
                DataSource: true,
                Database_id: true,
                Table_id: true,
                ApiEntityColumn: {
                    select: {
                        Column_id: true,
                    },
                },
                User: {
                    select: {
                        Username: true,
                    },
                },
            },
        });
        if (usr !== undefined) {
            // Get their accessible entities
            let accessible = await User.getAccessibleEntities(usr);
            fd = fd.filter((x) => {
                let access = accessible.has(x.DataSource.id);
                if (access) {
                    let formDs = accessible.get(x.DataSource.id);
                    for (const field of x.ApiEntityColumn) {
                        if (!formDs.children.get(x.Database_id)?.children.get(x.Table_id)?.children.get(field.Column_id)) {
                            access = false;
                            break;
                        }
                    }
                }
                return access;
            });
        }
        return fd.map((x) => {
            return {
                hits: x._count.ApiHits,
                id: x.Id as Id<"ApiEntity">,
                name: x.Name,
                author: x.User.Username,
            };
        });
    }

    // Graph Api
    public static async getGraphApiStats(usr?: Id<"User">, range?: string): Promise<ApiGraphStatistics[]> {
        const now = new Date();
        let startDate: Date | null = null;

        switch (range) {
            case "24-hours":
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case "7-days":
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case "1-month":
                startDate = new Date(now.setMonth(now.getMonth() - 1));
                break;
            case "3-months":
                startDate = new Date(now.setMonth(now.getMonth() - 3));
                break;
            case "6-months":
                startDate = new Date(now.setMonth(now.getMonth() - 6));
                break;
            case "1-year":
                startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                break;
            case "lifetime":
                startDate = null;
                break;
            default:
                throw new Error("Invalid time range");
        }

        let fd = await prisma.apiEntity.findMany({
            select: {
                ApiHits: {
                    select: {
                        Id: true,
                        Api_Id: true,
                        Timestamp: true,
                    },
                    where: {
                        Timestamp: {
                            gte: startDate,
                        },
                    },
                },
                DataSource: true,
                Database_id: true,
                Table_id: true,
                ApiEntityColumn: {
                    select: {
                        Column_id: true,
                    },
                },
            },
        });
        if (usr !== undefined) {
            // Get their accessible entities
            let accessible = await User.getAccessibleEntities(usr);
            fd = fd.filter((x) => {
                let access = accessible.has(x.DataSource.id);
                if (access) {
                    let formDs = accessible.get(x.DataSource.id);
                    for (const field of x.ApiEntityColumn) {
                        if (!formDs.children.get(x.Database_id)?.children.get(x.Table_id)?.children.get(field.Column_id)) {
                            access = false;
                            break;
                        }
                    }
                }
                return access;
            });
        }

        const apiGraphStats: ApiGraphStatistics[] = fd.map((apiEntity) => ({
            hits: apiEntity.ApiHits.map((hit) => ({
                id: hit.Id,
                Api_Id: hit.Api_Id,
                Timestamp: hit.Timestamp,
            })),
        }));

        return apiGraphStats;
    }
}
