import { ConnectionConfig } from "./connection";

export const config: ConnectionConfig = {
    databaseType: "pg",
    host: "127.0.0.1",
    port: 5432,
    database: "umamidb",
    user: "umami",
    password: "umamidb",
    proxy: {
      user: "randomityguy",
      host: "89.58.58.191",
      port: 22,
      authentication: {
        type: "privateKey",
        privateKeyPath: "C:\\Users\\Krishiv Mandviya\\.ssh\\id_rsa"
      }
    }
};