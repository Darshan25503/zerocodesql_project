import prisma from "../../../prisma/client";
import { Id } from "./types";

export enum RolePermissions {
    Create = 1,
    Read = 2,
    Update = 4,
    Delete = 8,
    All = Create | Read | Update | Delete,
    None = 0,
}

interface Accessible<T extends string, Inner> {
    id: Id<T>;
    name: string;
    display: string;
    children: Map<number, Inner>;
}

interface AccessibleRecord<T extends string, Inner> {
    id: Id<T>;
    name: string;
    display: string;
    children: Record<number, Inner>;
}

interface RoleColumnPermission {
    datasourceId: Id<"Datasource">;
    columnId: Id<"DatabaseColumn">;
    databaseId: Id<"DatabaseEntity">;
    tableId: Id<"DatabaseTable">;
    permission: RolePermissions;
    columnName: string;
    columnDisplay: string;
}

type RoleColumnPermissionSimple = Omit<RoleColumnPermission, keyof { columnName: string; columnDisplay: string }>;

export class Role {
    /// Create a new role
    /// @param roleName The name of the role
    /// @param color The color of the role
    /// @param defaultPermissions The default permissions of the role
    public static async create(roleName: string, color: string, defaultPermissions: RolePermissions = RolePermissions.None): Promise<Id<"Role">> {
        // Create the role first
        let role = await prisma.role.create({
            data: {
                Name: roleName,
                Color: color,
            },
        });
        // Then the role permissions (blank for now)
        let columnIds = await prisma.databaseColumn.findMany({
            select: {
                Id: true,
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
        });
        await prisma.role_table_column_permissions.createMany({
            data: columnIds.map((col) => {
                return {
                    Column_id: col.Id,
                    Database_id: col.DatabaseTable.DatabaseEntity.Id,
                    Datasource_id: col.DatabaseTable.DatabaseEntity.Datasource_id,
                    Table_id: col.DatabaseTable.Id,
                    permissionFlags: defaultPermissions,
                    Role_id: role.Id,
                };
            }),
        });
        return role.Id as Id<"Role">;
    }

    /// Delete a role
    /// @param id The id of the role
    public static async delete(id: Id<"Role">) {
        // Delete the permissions first
        await prisma.role_table_column_permissions.deleteMany({
            where: {
                Role_id: id,
            },
        });
        // Then the role
        await prisma.role.delete({
            where: {
                Id: id,
            },
        });
    }

    public static async getAllPermissions(id: Id<"Role">) {
        let perms = await prisma.role_table_column_permissions.findMany({
            where: {
                Role_id: id,
            },
            select: {
                DataSource: {
                    select: {
                        id: true,
                        Name: true,
                    },
                },
                DatabaseEntity: {
                    select: {
                        Name: true,
                        Id: true,
                    },
                },
                DatabaseTable: {
                    select: {
                        Name: true,
                        Id: true,
                        Display: true,
                    },
                },
                DatabaseColumn: {
                    select: {
                        Id: true,
                        Name: true,
                        isPrimaryKey: true,
                        Display: true,
                        Order: true,
                    },
                },
                permissionFlags: true,
            },
        });

        let dsMap: Record<
            number,
            AccessibleRecord<"DataSource", AccessibleRecord<"DatabaseEntity", AccessibleRecord<"DatabaseTable", RoleColumnPermission>>>
        > = {};
        for (const perm of perms) {
            if (!dsMap[perm.DataSource.id]) {
                dsMap[perm.DataSource.id] =
                    (perm.DataSource.id,
                    {
                        id: perm.DataSource.id as Id<"DataSource">,
                        name: perm.DataSource.Name,
                        display: perm.DataSource.Name,
                        children: {},
                    });
            }
            if (!dsMap[perm.DataSource.id].children[perm.DatabaseEntity.Id]) {
                dsMap[perm.DataSource.id].children[perm.DatabaseEntity.Id] = {
                    id: perm.DatabaseEntity.Id as Id<"DatabaseEntity">,
                    name: perm.DatabaseEntity.Name,
                    display: perm.DatabaseEntity.Name,
                    children: {},
                };
            }
            if (!dsMap[perm.DataSource.id].children[perm.DatabaseEntity.Id].children[perm.DatabaseTable.Id]) {
                dsMap[perm.DataSource.id].children[perm.DatabaseEntity.Id].children[perm.DatabaseTable.Id] = {
                    id: perm.DatabaseTable.Id as Id<"DatabaseTable">,
                    name: perm.DatabaseTable.Name,
                    display: perm.DatabaseTable.Display,
                    children: {},
                };
            }
            if (!dsMap[perm.DataSource.id].children[perm.DatabaseEntity.Id].children[perm.DatabaseTable.Id].children[perm.DatabaseColumn.Id]) {
                dsMap[perm.DataSource.id].children[perm.DatabaseEntity.Id].children[perm.DatabaseTable.Id].children[perm.DatabaseColumn.Id] = {
                    datasourceId: perm.DataSource.id as Id<"Datasource">,
                    columnId: perm.DatabaseColumn.Id as Id<"DatabaseColumn">,
                    databaseId: perm.DatabaseEntity.Id as Id<"DatabaseEntity">,
                    tableId: perm.DatabaseTable.Id as Id<"DatabaseTable">,
                    permission: perm.permissionFlags,
                    columnName: perm.DatabaseColumn.Name,
                    columnDisplay: perm.DatabaseColumn.Display,
                };
            }
        }
        return dsMap;
    }

    public static async updateRolePermissions(id: Id<"Role">, permissions: RoleColumnPermissionSimple[]) {
        let promises = [];
        for (const perm of permissions) {
            promises.push(
                prisma.role_table_column_permissions.update({
                    data: {
                        permissionFlags: perm.permission,
                    },
                    where: {
                        Role_id_Datasource_id_Database_id_Table_id_Column_id: {
                            Column_id: perm.columnId,
                            Database_id: perm.databaseId,
                            Datasource_id: perm.datasourceId,
                            Role_id: id,
                            Table_id: perm.tableId,
                        },
                    },
                })
            );
        }
        await Promise.all(promises);
    }

    public static async updateUserPermissions(id: Id<"User">, permissions: RoleColumnPermissionSimple[]) {
        let promises = [];
        for (const perm of permissions) {
            promises.push(
                prisma.user_table_column_permissions.upsert({
                    update: {
                        permissionFlags: perm.permission,
                    },
                    create: {
                        Column_id: perm.columnId,
                        Database_id: perm.databaseId,
                        Datasource_id: perm.datasourceId,
                        User_id: id,
                        Table_id: perm.tableId,
                        permissionFlags: perm.permission,
                    },
                    where: {
                        User_id_Datasource_id_Database_id_Table_id_Column_id: {
                            Column_id: perm.columnId,
                            Database_id: perm.databaseId,
                            Datasource_id: perm.datasourceId,
                            User_id: id,
                            Table_id: perm.tableId,
                        },
                    },
                })
            );
        }
        await Promise.all(promises);
    }

    public static async deleteUserPermissions(id: Id<"User">, datasource: number, database: number, table: number) {
        await prisma.user_table_column_permissions.deleteMany({
            where: {
                AND: [
                    {
                        User_id: id,
                    },
                    {
                        Datasource_id: datasource,
                    },
                    {
                        Database_id: database,
                    },
                    {
                        Table_id: table,
                    },
                ],
            },
        });
    }

    public static async getUserPermissionsViewState() {
        let perms = await prisma.user_table_column_permissions.findMany({
            select: {
                User: {
                    select: {
                        id: true,
                        Username: true,
                    },
                },
                Datasource_id: true,
                Database_id: true,
                Table_id: true,
                permissionFlags: true,
            },
            distinct: ["User_id", "Table_id", "Datasource_id", "Database_id"],
        });
        return perms.map((x) => {
            return {
                userId: x.User.id,
                username: x.User.Username,
                datasourceId: x.Datasource_id,
                databaseId: x.Database_id,
                tableId: x.Table_id,
                permissionFlags: x.permissionFlags,
            };
        });
    }
}
