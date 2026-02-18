-- CreateTable
CREATE TABLE "User_table_column_permissions" (
    "Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "User_id" INTEGER NOT NULL,
    "Datasource_id" INTEGER NOT NULL,
    "Database_id" INTEGER NOT NULL,
    "Table_id" INTEGER NOT NULL,
    "Column_id" INTEGER NOT NULL,
    "permissionFlags" INTEGER NOT NULL,
    CONSTRAINT "User_table_column_permissions_User_id_fkey" FOREIGN KEY ("User_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "User_table_column_permissions_Datasource_id_fkey" FOREIGN KEY ("Datasource_id") REFERENCES "DataSource" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "User_table_column_permissions_Database_id_fkey" FOREIGN KEY ("Database_id") REFERENCES "DatabaseEntity" ("Id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "User_table_column_permissions_Table_id_fkey" FOREIGN KEY ("Table_id") REFERENCES "DatabaseTable" ("Id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "User_table_column_permissions_Column_id_fkey" FOREIGN KEY ("Column_id") REFERENCES "DatabaseColumn" ("Id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Audit" (
    "Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kind" TEXT NOT NULL,
    "Timestamp" DATETIME NOT NULL,
    "User_id" INTEGER NOT NULL,
    "Message" TEXT NOT NULL,
    CONSTRAINT "Audit_User_id_fkey" FOREIGN KEY ("User_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
