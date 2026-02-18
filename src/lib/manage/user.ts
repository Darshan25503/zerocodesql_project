import { DatabaseColumn } from "@prisma/client";
import prisma from "../../../prisma/client";
import { Id } from "./types";
import { RolePermissions } from "./role";

interface Accessible<T extends string, Inner> {
    id: Id<T>;
    name: string;
    display: string;
    children: Map<number, Inner>;
}

export class User {
    /// Create a new user
    /// @param name The name of the user
    /// @param email The email of the user
    /// @param passwordHash The password hash of the user
    /// @param isSuperAdmin Whether the user is a super admin
    /// @param roleId The role id of the user
    public static async register(name: string, email: string, passwordHash: string, isSuperAdmin: boolean, roleId: number): Promise<Id<"User">> {
        // Create the user
        let usr = await prisma.user.create({
            data: {
                Username: name,
                Email: email,
                passwordHash: passwordHash,
                isSuperAdmin: isSuperAdmin,
                Role_id: roleId,
            },
        });
        return usr.id as Id<"User">;
    }

    /// Remove a user
    /// @param id The id of the user
    public static async remove(id: number) {
        // Delete their sessions
        await prisma.session.deleteMany({
            where: {
                userId: id,
            },
        });
        await prisma.user.deleteMany({
            where: {
                id: id,
            },
        });
    }

    /// Update a user
    /// @param id The id of the user
    /// @param name The name of the user
    /// @param email The email of the user
    /// @param passwordHash The password hash of the user
    /// @param isSuperAdmin Whether the user is a super admin
    /// @param roleId The role id of the user
    public static async update(id: Id<"User">, name: string, email: string, passwordHash: string | undefined, isSuperAdmin: boolean, roleId: Id<"Role">) {
        await prisma.user.update({
            where: {
                id: id,
            },
            data: {
                Username: name,
                Email: email,
                passwordHash: passwordHash,
                isSuperAdmin: isSuperAdmin,
                Role_id: roleId,
            },
        });
    }

    public static async getPermissions(userId: Id<"User">, tbl: Id<"DatabaseTable">) {
        let isAdmin = (
            await prisma.user.findFirst({
                select: {
                    isSuperAdmin: true,
                },
                where: {
                    id: userId,
                },
            })
        ).isSuperAdmin;
        if (isAdmin) {
            // All access pls
            let perms = await prisma.databaseColumn.findMany({
                where: {
                    Table_id: tbl,
                },
                select: {
                    Name: true,
                },
            });
            let permissionObj = {} as Record<string, number>;
            for (const col of perms) {
                permissionObj[col.Name] = RolePermissions.All;
            }
            return permissionObj;
        }

        let rolePerms = await prisma.role_table_column_permissions.findMany({
            where: {
                Role: {
                    User: {
                        some: {
                            id: userId,
                        },
                    },
                },
                DatabaseTable: {
                    Id: tbl,
                },
            },
            select: {
                DatabaseColumn: {
                    select: {
                        Name: true,
                    },
                },
                permissionFlags: true,
            },
        });
        let userPerms = await prisma.user_table_column_permissions.findMany({
            where: {
                User_id: userId,
                DatabaseTable: {
                    Id: tbl,
                },
            },
            select: {
                DatabaseColumn: {
                    select: {
                        Name: true,
                    },
                },
                permissionFlags: true,
            },
        });
        let permissionObj = {} as Record<string, number>;
        for (const perm of rolePerms) {
            permissionObj[perm.DatabaseColumn.Name] = perm.permissionFlags;
        }
        for (const perm of userPerms) {
            if (!permissionObj[perm.DatabaseColumn.Name]) {
                permissionObj[perm.DatabaseColumn.Name] = perm.permissionFlags;
            } else permissionObj[perm.DatabaseColumn.Name] |= perm.permissionFlags;
        }

        return permissionObj;
    }

    /// Gets all the accessible database entities for a user
    /// Usage: Returns a hierarchy of accessible database entities, accessible through the ids
    /// @param userId The id of the user
    public static async getAccessibleEntities(userId: Id<"User">) {
        let isAdmin = (
            await prisma.user.findFirst({
                select: {
                    isSuperAdmin: true,
                },
                where: {
                    id: userId,
                },
            })
        ).isSuperAdmin;
        if (isAdmin) {
            // Super admin has access to everything
            let cols = await prisma.dataSource.findMany({
                select: {
                    id: true,
                    Name: true,
                    DatabaseEntity: {
                        include: {
                            DatabaseTable: {
                                include: {
                                    DatabaseColumn: true,
                                },
                            },
                        },
                    },
                },
            });

            let dsMap: Map<number, Accessible<"DataSource", Accessible<"DatabaseEntity", Accessible<"DatabaseTable", DatabaseColumn>>>> = new Map();
            for (const src of cols) {
                if (!dsMap.has(src.id)) {
                    dsMap.set(src.id, {
                        id: src.id as Id<"DataSource">,
                        children: new Map(),
                        name: src.Name,
                        display: src.Name,
                    });
                }
                for (const db of src.DatabaseEntity) {
                    if (!dsMap.get(src.id).children.has(db.Id)) {
                        dsMap.get(src.id).children.set(db.Id, {
                            id: db.Id as Id<"DatabaseEntity">,
                            children: new Map(),
                            name: db.Name,
                            display: db.Name,
                        });
                    }
                    for (const tbl of db.DatabaseTable) {
                        if (!dsMap.get(src.id).children.get(db.Id).children.has(tbl.Id)) {
                            dsMap
                                .get(src.id)
                                .children.get(db.Id)
                                .children.set(tbl.Id, {
                                    id: tbl.Id as Id<"DatabaseTable">,
                                    children: new Map(),
                                    name: tbl.Name,
                                    display: tbl.Display,
                                });
                        }
                        for (const col of tbl.DatabaseColumn) {
                            dsMap.get(src.id).children.get(db.Id).children.get(tbl.Id).children.set(col.Id, col);
                        }
                    }
                }
            }
            return dsMap;
        } else {
            let userRole = await prisma.user.findFirst({
                select: {
                    Role: {
                        select: {
                            Role_table_column_permissions: {
                                select: {
                                    DatabaseColumn: true,
                                    DatabaseTable: true,
                                    DatabaseEntity: true,
                                    DataSource: true,
                                    permissionFlags: true,
                                },
                                where: {
                                    permissionFlags: {
                                        gte: 1,
                                    },
                                },
                            },
                        },
                    },
                },
                where: {
                    id: userId,
                },
            });
            let userPerms = await prisma.user_table_column_permissions.findMany({
                where: {
                    User_id: userId,
                    permissionFlags: {
                        gte: 1,
                    },
                },
                select: {
                    DatabaseColumn: true,
                    DatabaseTable: true,
                    DatabaseEntity: true,
                    DataSource: true,
                    permissionFlags: true,
                },
            });

            let dsMap: Map<number, Accessible<"DataSource", Accessible<"DatabaseEntity", Accessible<"DatabaseTable", DatabaseColumn>>>> = new Map();
            for (const perm of userRole.Role.Role_table_column_permissions.concat(userPerms)) {
                if ((perm.permissionFlags & RolePermissions.Read) === 0) continue; // Don't have READ permissions
                if (!dsMap.has(perm.DataSource.id)) {
                    dsMap.set(perm.DataSource.id, {
                        id: perm.DataSource.id as Id<"DataSource">,
                        children: new Map(),
                        name: perm.DataSource.Name,
                        display: perm.DataSource.Name,
                    });
                }
                if (!dsMap.get(perm.DataSource.id).children.has(perm.DatabaseEntity.Id)) {
                    dsMap.get(perm.DataSource.id).children.set(perm.DatabaseEntity.Id, {
                        id: perm.DatabaseEntity.Id as Id<"DatabaseEntity">,
                        children: new Map(),
                        name: perm.DatabaseEntity.Name,
                        display: perm.DatabaseEntity.Name,
                    });
                }
                if (!dsMap.get(perm.DataSource.id).children.get(perm.DatabaseEntity.Id).children.has(perm.DatabaseTable.Id)) {
                    dsMap
                        .get(perm.DataSource.id)
                        .children.get(perm.DatabaseEntity.Id)
                        .children.set(perm.DatabaseTable.Id, {
                            id: perm.DatabaseTable.Id as Id<"DatabaseTable">,
                            children: new Map(),
                            name: perm.DatabaseTable.Name,
                            display: perm.DatabaseTable.Display,
                        });
                }
                if (
                    !dsMap.get(perm.DataSource.id).children.get(perm.DatabaseEntity.Id).children.get(perm.DatabaseTable.Id).children.has(perm.DatabaseColumn.Id)
                ) {
                    dsMap
                        .get(perm.DataSource.id)
                        .children.get(perm.DatabaseEntity.Id)
                        .children.get(perm.DatabaseTable.Id)
                        .children.set(perm.DatabaseColumn.Id, perm.DatabaseColumn);
                }
            }
            // User overrides
            return dsMap;
        }
    }
}
