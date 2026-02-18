import { ConnectionConfig } from "./connection";

export const config: ConnectionConfig = {
    databaseType: "mysql2",
    host: "127.0.0.1",
    port: 3306,
    database: "prod_joomla",
    user: "marble",
    password: "9PXC3dnYjNqNSsrF#qLLus%z",
    proxy: {
      user: "root",
      host: "168.235.82.15",
      port: 22,
      authentication: {
        type: "privateKey",
        privateKeyPath: "C:\\Users\\Krishiv Mandviya\\.ssh\\id_rsa"
      }
    }
};