import prisma from "../../../prisma/client";
import { getDatabaseManager } from "../database/manager";
import { User } from "../manage/user";
import { DatabaseColumn, DatabaseEntity, DatabaseTable, DatabaseEntityInterface, DatabaseTableInterface, ColumnType } from "../database/types";
import { Id } from "./types";

export interface FormDescription {
    id: Id<"Form">;
    title: string;
    name: string;
    dataSource: number;
    shareString: string;
    enabled: boolean;
    author: {
        id: Id<"User">;
        name: string;
    };
    fields: {
        databaseId: number;
        tableId: number;
        columnId: number;
        descriptionOrValue: string;
        visible: boolean;
        type: ColumnType;
    }[];
}

export interface FormViewState {
    id: Id<"Form">;
    title: string;
    fields: {
        id: Id<"FormField">;
        display: string;
        type: ColumnType;
        fkeys?: {
            id: number;
            display: string;
        }[];
    }[];
}

export interface FormStatistics {
    id: Id<"Form">;
    name: string;
    author: string;
    hits: number;
}

export interface FormGraphStatistics {
    hits: FormGraphHitsStatistics[];
}

export interface FormGraphHitsStatistics {
    id: number;
    Form_Id: number;
    Timestamp: Date;
}

export class Form {
    // Get a list of forms in the database, this method should be used to retrieve the forms to display in the UI
    public static async listForms(userId?: Id<"User">): Promise<FormDescription[]> {
        let formData = await prisma.form.findMany({
            select: {
                Id: true,
                Title: true,
                Name: true,
                ShareString: true,
                Enabled: true,
                User: {
                    select: {
                        id: true,
                        Username: true,
                    },
                },
                dataSourceId: true,
                FormField: {
                    select: {
                        Database_id: true,
                        Table_id: true,
                        Column_id: true,
                        Order: true,
                        DescriptionOrValue: true,
                        Visible: true,
                        DatabaseColumn: {
                            select: {
                                DataType: true,
                            },
                        },
                    },
                },
            },
            where: {
                UserId: userId,
            },
        });
        const db = await getDatabaseManager();
        return formData.map((x) => {
            let ds = db.databases.get(x.dataSourceId);

            return {
                id: x.Id as Id<"Form">,
                dataSource: x.dataSourceId,
                shareString: x.ShareString,
                enabled: x.Enabled,
                title: x.Title,
                name: x.Name,
                author: {
                    id: x.User.id as Id<"User">,
                    name: x.User.Username,
                },
                fields: x.FormField.map((y) => {
                    return {
                        databaseId: y.Database_id,
                        tableId: y.Table_id,
                        columnId: y.Column_id,
                        descriptionOrValue: y.DescriptionOrValue,
                        visible: y.Visible,
                        type: JSON.parse(y.DatabaseColumn.DataType),
                    };
                }),
            };
        });
    }

    // Get a single form, useful for getting the form data for editing, or displaying the form
    public static async getForm(id: Id<"Form">): Promise<FormDescription> {
        try {
            let formData = await prisma.form.findFirst({
                select: {
                    Id: true,
                    Title: true,
                    Name: true,
                    ShareString: true,
                    Enabled: true,
                    User: {
                        select: {
                            id: true,
                            Username: true,
                        },
                    },
                    dataSourceId: true,
                    FormField: {
                        select: {
                            Database_id: true,
                            Table_id: true,
                            Column_id: true,
                            Order: true,
                            DescriptionOrValue: true,
                            Visible: true,
                            DatabaseColumn: {
                                select: {
                                    DataType: true,
                                },
                            },
                        },
                    },
                },
                where: {
                    Id: id,
                },
            });
            const db = await getDatabaseManager();
            let ds = db.databases.get(formData.dataSourceId);
            return {
                id: formData.Id as Id<"Form">,
                title: formData.Title,
                dataSource: formData.dataSourceId,
                shareString: formData.ShareString,
                enabled: formData.Enabled,
                name: formData.Name,
                author: {
                    id: formData.User.id as Id<"User">,
                    name: formData.User.Username,
                },
                fields: formData.FormField.map((y) => {
                    return {
                        databaseId: y.Database_id,
                        tableId: y.Table_id,
                        columnId: y.Column_id,
                        descriptionOrValue: y.DescriptionOrValue,
                        visible: y.Visible,
                        type: JSON.parse(y.DatabaseColumn.DataType),
                    };
                }),
            };
        } catch (e) {
            return null;
        }
    }

    // Get a single form, useful for displaying the form from the shared link
    public static async getFormFromLink(shareString: string): Promise<FormDescription> {
        try {
            let formData = await prisma.form.findFirst({
                select: {
                    Id: true,
                    Title: true,
                    Name: true,
                    ShareString: true,
                    Enabled: true,
                    User: {
                        select: {
                            id: true,
                            Username: true,
                        },
                    },
                    dataSourceId: true,
                    FormField: {
                        select: {
                            Database_id: true,
                            Table_id: true,
                            Column_id: true,
                            Order: true,
                            DescriptionOrValue: true,
                            Visible: true,
                            DatabaseColumn: {
                                select: {
                                    DataType: true,
                                },
                            },
                        },
                    },
                },
                where: {
                    ShareString: shareString,
                },
            });
            const db = await getDatabaseManager();
            let ds = db.databases.get(formData.dataSourceId);
            return {
                id: formData.Id as Id<"Form">,
                dataSource: formData.dataSourceId,
                shareString: formData.ShareString,
                title: formData.Title,
                name: formData.Name,
                enabled: formData.Enabled,
                author: {
                    id: formData.User.id as Id<"User">,
                    name: formData.User.Username,
                },
                fields: formData.FormField.map((y) => {
                    return {
                        databaseId: y.Database_id,
                        tableId: y.Table_id,
                        columnId: y.Column_id,
                        descriptionOrValue: y.DescriptionOrValue,
                        visible: y.Visible,
                        type: JSON.parse(y.DatabaseColumn.DataType),
                    };
                }),
            };
        } catch (e) {
            return null;
        }
    }

    // Delete a form
    public static async deleteForm(id: number) {
        await prisma.formField.deleteMany({ where: { Form_id: id } });
        await prisma.formHits.deleteMany({ where: { Form_Id: id } });
        await prisma.form.delete({ where: { Id: id } });
    }

    // Create a form, the fields are ordered and ids are from the database
    public static async createForm(
        title: string,
        name: string,
        userId: Id<"User">,
        dataSource: number,
        fields: { database: number; table: number; column: number; valueOrDescription: string; visible: boolean }[] // Assume fields are ordered
    ) {
        let randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Date.now().toString(); // shared form link

        let form = await prisma.form.create({
            data: {
                Name: name,
                ShareString: randomString,
                dataSourceId: dataSource,
                Enabled: true,
                Title: title,
                UserId: userId,
            },
        });
        // Create the columns now
        for (let i = 0; i < fields.length; i++) {
            await prisma.formField.create({
                data: {
                    Order: i,
                    Visible: fields[i].visible,
                    DescriptionOrValue: fields[i].valueOrDescription,
                    Database_id: fields[i].database,
                    Column_id: fields[i].column,
                    Table_id: fields[i].table,
                    Form_id: form.Id,
                    Datasource_id: dataSource,
                },
            });
        }
        return {
            id: form.Id as Id<"Form">,
            shareString: randomString,
        };
    }

    // Modify a form the fields are ordered and ids are from the database
    public static async modifyForm(
        id: Id<"Form">,
        title: string,
        fields: { database: number; table: number; column: number; valueOrDescription: string; visible: boolean }[]
    ) {
        // Get datasource
        let ds = await prisma.form.findFirst({
            where: {
                Id: id,
            },
            select: {
                dataSourceId: true,
            },
        });
        // Drop the fields
        await prisma.formField.deleteMany({ where: { Form_id: id } });
        // Create the columns now
        for (let i = 0; i < fields.length; i++) {
            await prisma.formField.create({
                data: {
                    Order: i,
                    Visible: fields[i].visible,
                    DescriptionOrValue: fields[i].valueOrDescription,
                    Database_id: fields[i].database,
                    Column_id: fields[i].column,
                    Table_id: fields[i].table,
                    Datasource_id: ds.dataSourceId,
                    Form_id: id,
                },
            });
        }
        // Now update the main entity
        await prisma.form.update({
            where: {
                Id: id,
            },
            data: {
                Title: title,
            },
        });
    }

    public static async getAllFormStats(usr?: Id<"User">): Promise<FormStatistics[]> {
        let fd = await prisma.form.findMany({
            select: {
                Id: true,
                Name: true,
                _count: {
                    select: {
                        FormHits: true,
                    },
                },
                dataSourceId: true,
                FormField: {
                    select: {
                        Database_id: true,
                        Table_id: true,
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
                let access = accessible.has(x.dataSourceId);
                if (access) {
                    let formDs = accessible.get(x.dataSourceId);
                    for (const field of x.FormField) {
                        if (!formDs.children.has(field.Database_id)) {
                            access = false;
                            break;
                        }
                        if (!formDs.children.get(field.Database_id).children.get(field.Table_id)) {
                            access = false;
                            break;
                        }
                        if (!formDs.children.get(field.Database_id).children.get(field.Table_id).children.get(field.Column_id)) {
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
                hits: x._count.FormHits,
                id: x.Id as Id<"Form">,
                name: x.Name,
                author: x.User.Username,
            };
        });
    }

    public static async submitForm(id: Id<"Form">, values: { column: Id<"FormField">; value: string }[]) {
        // Get form schema first
        let sch = await prisma.form.findFirst({
            select: {
                Id: true,
                Title: true,
                Name: true,
                ShareString: true,
                Enabled: true,
                User: {
                    select: {
                        id: true,
                        Username: true,
                    },
                },
                dataSourceId: true,
                FormField: {
                    select: {
                        Id: true,
                        Database_id: true,
                        DatabaseTable: {
                            select: {
                                Name: true,
                            },
                        },
                        Order: true,
                        DescriptionOrValue: true,
                        Visible: true,
                        DatabaseColumn: {
                            select: {
                                Id: true,
                                DataType: true,
                                Name: true,
                            },
                        },
                    },
                },
            },
            where: {
                Id: id,
            },
        });
        const db = await getDatabaseManager();
        let ds = db.databases.get(sch.dataSourceId);
        let dbCols = sch.FormField.map((x) => {
            return {
                id: x.DatabaseColumn.Id,
                default: x.DescriptionOrValue,
                vis: x.Visible,
                tbl: ds.databases.get(x.Database_id).tables.get(x.DatabaseTable.Name),
                col: ds.databases.get(x.Database_id).tables.get(x.DatabaseTable.Name).columns.get(x.DatabaseColumn.Name),
                formCol: x.Id,
            };
        });
        let valuesToInsert = new Map<DatabaseTable, { column: DatabaseColumn; value: string }[]>();
        for (const col of dbCols) {
            let valStr = values.find((y) => y.column === col.formCol);
            let val = valStr ? valStr.value : !col.vis ? col.default : null;
            if (val != null) {
                if (!valuesToInsert.has(col.tbl)) {
                    valuesToInsert.set(col.tbl, []);
                }
                valuesToInsert.get(col.tbl).push({
                    column: col.col,
                    value: val,
                });
            }
        }
        // Increment the hits
        await prisma.formHits.create({
            data: {
                Form_Id: id,
                Timestamp: new Date(),
            },
        });
        // Run the queries
        for (const [tbl, vals] of valuesToInsert) {
            await ds.insert(tbl, vals);
        }
    }

    public static async getFormViewState(id: Id<"Form">): Promise<FormViewState> {
        let data = await prisma.form.findFirst({
            where: {
                Id: id,
            },
            select: {
                Title: true,
                dataSourceId: true,
                FormField: {
                    select: {
                        DescriptionOrValue: true,
                        DatabaseColumn: {
                            select: {
                                DataType: true,
                                Name: true,
                                DatabaseTable: {
                                    select: {
                                        Name: true,
                                        DatabaseEntity: {
                                            select: {
                                                Id: true,
                                                Name: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        Id: true,
                    },
                    where: {
                        Visible: true,
                    },
                    orderBy: {
                        Order: "asc",
                    },
                },
            },
        });
        // Fix up the foreign key columns
        const db = await getDatabaseManager();
        let tblToCols = new Map<DatabaseTable, DatabaseColumn[]>();
        let dataSource = db.databases.get(data.dataSourceId);
        for (const field of data.FormField) {
            let ds = dataSource;
            let colDb = ds.databases.get(field.DatabaseColumn.DatabaseTable.DatabaseEntity.Id);
            let tblCol = colDb.tables.get(field.DatabaseColumn.DatabaseTable.Name);
            let dbCol = tblCol.columns.get(field.DatabaseColumn.Name);
            if (dbCol.foreignKey) {
                if (!tblToCols.has(tblCol)) {
                    tblToCols.set(tblCol, []);
                }
                tblToCols.get(tblCol).push(dbCol);
            }
        }
        // Retrieve the cols - slow!
        let fkeyValues = {} as Record<string, { id: number; display: string }[]>;
        for (const [tbl, cols] of tblToCols) {
            let records = await dataSource.fetchForeignKeyDisplays(tbl, cols);
            const uniqIds = new Map<string, Set<number>>();
            for (const record of records) {
                for (const col of Object.keys(record)) {
                    if (fkeyValues[col] === undefined) {
                        fkeyValues[col] = [];
                    }
                    if (record[col] === undefined) continue;
                    if (!uniqIds.has(col)) uniqIds.set(col, new Set());
                    if (!uniqIds.get(col).has(record[col].id)) {
                        fkeyValues[col].push(record[col]);
                        uniqIds.get(col).add(record[col].id);
                    }
                }
            }
        }
        return {
            id: id,
            title: data.Title,
            fields: data.FormField.map((x) => {
                if (fkeyValues[x.DatabaseColumn.Name]) fkeyValues[x.DatabaseColumn.Name].sort((x, y) => x.id - y.id); // Sort pls
                return {
                    id: x.Id as Id<"FormField">,
                    display: x.DescriptionOrValue,
                    type: JSON.parse(x.DatabaseColumn.DataType),
                    fkeys: fkeyValues[x.DatabaseColumn.Name] ? fkeyValues[x.DatabaseColumn.Name] : undefined,
                };
            }),
        };
    }

    public static async getGraphApiStats(usr?: Id<"User">, range?: string): Promise<FormGraphStatistics[]> {
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

        let fd = await prisma.form.findMany({
            select: {
                Id: true,
                Name: true,
                _count: {
                    select: {
                        FormHits: true,
                    },
                },
                FormHits: {
                    select: {
                        Id: true,
                        Form_Id: true,
                        Timestamp: true,
                    },
                    where: {
                        Timestamp: {
                            gte: startDate,
                        },
                    },
                },
                dataSourceId: true,
                FormField: {
                    select: {
                        Database_id: true,
                        Table_id: true,
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
                let access = accessible.has(x.dataSourceId);
                if (access) {
                    let formDs = accessible.get(x.dataSourceId);
                    for (const field of x.FormField) {
                        if (!formDs.children.has(field.Database_id)) {
                            access = false;
                            break;
                        }
                        if (!formDs.children.get(field.Database_id).children.get(field.Table_id)) {
                            access = false;
                            break;
                        }
                        if (!formDs.children.get(field.Database_id).children.get(field.Table_id).children.get(field.Column_id)) {
                            access = false;
                            break;
                        }
                    }
                }
                return access;
            });
        }

        const formGraphStats: FormGraphStatistics[] = fd.map((apiEntity) => ({
            hits: apiEntity.FormHits.map((hit) => ({
                id: hit.Id,
                Form_Id: hit.Form_Id,
                Timestamp: hit.Timestamp,
            })),
        }));

        return formGraphStats;
    }
}
