import { DataSource } from "@prisma/client";
import prisma from "../../../prisma/client";
import { ConnectionConfig } from "./connection";
import { Database } from "./database";
import * as fs from "fs-extra";

export class DatabaseManager {
    databases: Map<number, Database> = new Map();

    private _inited: boolean = false;
    private _lock: boolean = false;

    constructor() {}

    public async init() {
        if (!this._inited) {
            if (this._lock) return;
            this._lock = true;
            let dataSources = await prisma.dataSource.findMany();

            for (const source of dataSources) {
                const config = DatabaseManager.parseDataSource(source);
                await this.addDataSource(source.id, source.Name, config, false);
            }
            // Initialize all the sources
            for (const source of dataSources) {
                await this.databases.get(source.id)?.init();
            }
            this._inited = true;
            this._lock = false;
        }
    }

    public async removeDataSource(id: number) {
        if (this.databases.has(id)) {
            await this.databases.get(id).deleteSelf();
            this.databases.delete(id);
        }
    }

    public static parseDataSource(ds: DataSource) {
        let ret: ConnectionConfig = {} as ConnectionConfig;
        ret.databaseType = ds.databaseType as ConnectionConfig["databaseType"];
        switch (ds.databaseType as ConnectionConfig["databaseType"]) {
            case "better-sqlite3": {
                ret = {
                    databaseType: "better-sqlite3",
                    filename: ds.Filename,
                    flags: ds.Flags?.split(" "),
                };
                break;
            }
            default: {
                ret = {
                    databaseType: ds.databaseType as "mysql2" | "pg" | "mssql",
                    database: ds.Database,
                    host: ds.Host,
                    password: ds.Password,
                    port: ds.Port,
                    user: ds.User,
                };
                if (ds.proxyUser != null) {
                    ret.proxy = {
                        user: ds.proxyUser,
                        host: ds.proxyHost,
                        port: ds.proxyPort,
                        authentication:
                            ds.proxyAuthenticationType === "privatekey"
                                ? {
                                      type: "privateKey",
                                      privateKeyPath: ds.proxyAuthenticationData,
                                  }
                                : ds.proxyAuthenticationType === "password"
                                ? {
                                      type: "password",
                                      password: ds.proxyAuthenticationData,
                                  }
                                : {
                                      type: "none",
                                  },
                    };
                }
            }
        }
        return ret;
    }

    async addDataSource(id: number, display: string, config: ConnectionConfig, init: boolean = true) {
        if (await this.verifyConfiguration(config)) {
            let d = new Database(id, display, config);
            this.databases.set(id, d);
            if (init) {
                await d.init();
            }
            return d;
        } else {
            return null;
        }
    }

    async verifyConfiguration(config: ConnectionConfig) {
        switch (config.databaseType) {
            case "better-sqlite3":
                if (!(await fs.exists(config.filename))) return false;
                else return true;
            default:
                return true;
        }
    }
}

const instantiateDatabaseManager = () => {
    return new DatabaseManager();
};

declare const globalThis: {
    databaseManager: ReturnType<typeof instantiateDatabaseManager>;
} & typeof global;

export async function getDatabaseManager() {
    if (!globalThis.databaseManager) {
        console.log("Starting new database manager");
        globalThis.databaseManager = instantiateDatabaseManager();
        await globalThis.databaseManager.init();
    }
    await globalThis.databaseManager.init();
    return globalThis.databaseManager;
}
