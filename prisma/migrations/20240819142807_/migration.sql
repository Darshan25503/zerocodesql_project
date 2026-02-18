-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ApiEntity" (
    "Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Name" TEXT NOT NULL,
    "Display" TEXT NOT NULL,
    "Permissions" INTEGER NOT NULL,
    "Enabled" BOOLEAN NOT NULL,
    "ApiKey" TEXT NOT NULL,
    "Datasource_id" INTEGER NOT NULL,
    "Database_id" INTEGER NOT NULL,
    "Table_id" INTEGER NOT NULL,
    CONSTRAINT "ApiEntity_Datasource_id_fkey" FOREIGN KEY ("Datasource_id") REFERENCES "DataSource" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ApiEntity_Database_id_fkey" FOREIGN KEY ("Database_id") REFERENCES "DatabaseEntity" ("Id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ApiEntity_Table_id_fkey" FOREIGN KEY ("Table_id") REFERENCES "DatabaseTable" ("Id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ApiEntity" ("ApiKey", "Database_id", "Datasource_id", "Display", "Enabled", "Id", "Name", "Permissions", "Table_id") SELECT "ApiKey", "Database_id", "Datasource_id", "Display", "Enabled", "Id", "Name", "Permissions", "Table_id" FROM "ApiEntity";
DROP TABLE "ApiEntity";
ALTER TABLE "new_ApiEntity" RENAME TO "ApiEntity";
CREATE TABLE "new_ApiEntityColumn" (
    "Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Api_id" INTEGER NOT NULL,
    "Column_id" INTEGER NOT NULL,
    "Order" INTEGER NOT NULL,
    CONSTRAINT "ApiEntityColumn_Api_id_fkey" FOREIGN KEY ("Api_id") REFERENCES "ApiEntity" ("Id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ApiEntityColumn_Column_id_fkey" FOREIGN KEY ("Column_id") REFERENCES "DatabaseColumn" ("Id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ApiEntityColumn" ("Api_id", "Column_id", "Id", "Order") SELECT "Api_id", "Column_id", "Id", "Order" FROM "ApiEntityColumn";
DROP TABLE "ApiEntityColumn";
ALTER TABLE "new_ApiEntityColumn" RENAME TO "ApiEntityColumn";
CREATE TABLE "new_ApiHits" (
    "Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Api_Id" INTEGER NOT NULL,
    "Timestamp" DATETIME NOT NULL,
    CONSTRAINT "ApiHits_Api_Id_fkey" FOREIGN KEY ("Api_Id") REFERENCES "ApiEntity" ("Id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ApiHits" ("Api_Id", "Id", "Timestamp") SELECT "Api_Id", "Id", "Timestamp" FROM "ApiHits";
DROP TABLE "ApiHits";
ALTER TABLE "new_ApiHits" RENAME TO "ApiHits";
CREATE TABLE "new_DashboardComponent" (
    "Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Title" TEXT NOT NULL,
    "Type" TEXT NOT NULL,
    "Order" INTEGER NOT NULL,
    "Datasource_id" INTEGER NOT NULL,
    "QuerySql" TEXT NOT NULL,
    CONSTRAINT "DashboardComponent_Datasource_id_fkey" FOREIGN KEY ("Datasource_id") REFERENCES "DataSource" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_DashboardComponent" ("Datasource_id", "Id", "Order", "QuerySql", "Title", "Type") SELECT "Datasource_id", "Id", "Order", "QuerySql", "Title", "Type" FROM "DashboardComponent";
DROP TABLE "DashboardComponent";
ALTER TABLE "new_DashboardComponent" RENAME TO "DashboardComponent";
CREATE TABLE "new_DatabaseColumn" (
    "Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Table_id" INTEGER NOT NULL,
    "Name" TEXT NOT NULL,
    "Display" TEXT NOT NULL,
    "DataType" TEXT NOT NULL,
    "Order" INTEGER NOT NULL,
    "isPrimaryKey" BOOLEAN NOT NULL,
    "ForeignKeyId" INTEGER,
    "ForeignKeyDisplayId" INTEGER,
    CONSTRAINT "DatabaseColumn_Table_id_fkey" FOREIGN KEY ("Table_id") REFERENCES "DatabaseTable" ("Id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DatabaseColumn_ForeignKeyId_fkey" FOREIGN KEY ("ForeignKeyId") REFERENCES "DatabaseColumn" ("Id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "DatabaseColumn_ForeignKeyDisplayId_fkey" FOREIGN KEY ("ForeignKeyDisplayId") REFERENCES "DatabaseColumn" ("Id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_DatabaseColumn" ("DataType", "Display", "ForeignKeyDisplayId", "ForeignKeyId", "Id", "Name", "Order", "Table_id", "isPrimaryKey") SELECT "DataType", "Display", "ForeignKeyDisplayId", "ForeignKeyId", "Id", "Name", "Order", "Table_id", "isPrimaryKey" FROM "DatabaseColumn";
DROP TABLE "DatabaseColumn";
ALTER TABLE "new_DatabaseColumn" RENAME TO "DatabaseColumn";
CREATE TABLE "new_DatabaseEntity" (
    "Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Datasource_id" INTEGER NOT NULL,
    "Name" TEXT NOT NULL,
    CONSTRAINT "DatabaseEntity_Datasource_id_fkey" FOREIGN KEY ("Datasource_id") REFERENCES "DataSource" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_DatabaseEntity" ("Datasource_id", "Id", "Name") SELECT "Datasource_id", "Id", "Name" FROM "DatabaseEntity";
DROP TABLE "DatabaseEntity";
ALTER TABLE "new_DatabaseEntity" RENAME TO "DatabaseEntity";
CREATE TABLE "new_DatabaseTable" (
    "Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Database_id" INTEGER NOT NULL,
    "Name" TEXT NOT NULL,
    "Display" TEXT NOT NULL,
    CONSTRAINT "DatabaseTable_Database_id_fkey" FOREIGN KEY ("Database_id") REFERENCES "DatabaseEntity" ("Id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_DatabaseTable" ("Database_id", "Display", "Id", "Name") SELECT "Database_id", "Display", "Id", "Name" FROM "DatabaseTable";
DROP TABLE "DatabaseTable";
ALTER TABLE "new_DatabaseTable" RENAME TO "DatabaseTable";
CREATE TABLE "new_Form" (
    "Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ShareString" TEXT NOT NULL,
    "UserId" INTEGER NOT NULL,
    "Name" TEXT NOT NULL,
    "Title" TEXT NOT NULL,
    "Enabled" BOOLEAN NOT NULL,
    "dataSourceId" INTEGER,
    CONSTRAINT "Form_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Form_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "DataSource" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Form" ("Enabled", "Id", "Name", "ShareString", "Title", "UserId", "dataSourceId") SELECT "Enabled", "Id", "Name", "ShareString", "Title", "UserId", "dataSourceId" FROM "Form";
DROP TABLE "Form";
ALTER TABLE "new_Form" RENAME TO "Form";
CREATE UNIQUE INDEX "Form_ShareString_key" ON "Form"("ShareString");
CREATE TABLE "new_FormField" (
    "Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Form_id" INTEGER NOT NULL,
    "Datasource_id" INTEGER NOT NULL,
    "Database_id" INTEGER NOT NULL,
    "Table_id" INTEGER NOT NULL,
    "Column_id" INTEGER NOT NULL,
    "Visible" BOOLEAN NOT NULL,
    "DescriptionOrValue" TEXT NOT NULL,
    "Order" INTEGER NOT NULL,
    CONSTRAINT "FormField_Form_id_fkey" FOREIGN KEY ("Form_id") REFERENCES "Form" ("Id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FormField_Datasource_id_fkey" FOREIGN KEY ("Datasource_id") REFERENCES "DataSource" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FormField_Database_id_fkey" FOREIGN KEY ("Database_id") REFERENCES "DatabaseEntity" ("Id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FormField_Table_id_fkey" FOREIGN KEY ("Table_id") REFERENCES "DatabaseTable" ("Id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FormField_Column_id_fkey" FOREIGN KEY ("Column_id") REFERENCES "DatabaseColumn" ("Id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FormField" ("Column_id", "Database_id", "Datasource_id", "DescriptionOrValue", "Form_id", "Id", "Order", "Table_id", "Visible") SELECT "Column_id", "Database_id", "Datasource_id", "DescriptionOrValue", "Form_id", "Id", "Order", "Table_id", "Visible" FROM "FormField";
DROP TABLE "FormField";
ALTER TABLE "new_FormField" RENAME TO "FormField";
CREATE TABLE "new_FormHits" (
    "Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Form_Id" INTEGER NOT NULL,
    "Timestamp" DATETIME NOT NULL,
    CONSTRAINT "FormHits_Form_Id_fkey" FOREIGN KEY ("Form_Id") REFERENCES "Form" ("Id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FormHits" ("Form_Id", "Id", "Timestamp") SELECT "Form_Id", "Id", "Timestamp" FROM "FormHits";
DROP TABLE "FormHits";
ALTER TABLE "new_FormHits" RENAME TO "FormHits";
CREATE TABLE "new_Role_table_column_permissions" (
    "Role_id" INTEGER NOT NULL,
    "Datasource_id" INTEGER NOT NULL,
    "Database_id" INTEGER NOT NULL,
    "Table_id" INTEGER NOT NULL,
    "Column_id" INTEGER NOT NULL,
    "permissionFlags" INTEGER NOT NULL,

    PRIMARY KEY ("Role_id", "Datasource_id", "Database_id", "Table_id", "Column_id"),
    CONSTRAINT "Role_table_column_permissions_Role_id_fkey" FOREIGN KEY ("Role_id") REFERENCES "Role" ("Id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Role_table_column_permissions_Datasource_id_fkey" FOREIGN KEY ("Datasource_id") REFERENCES "DataSource" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Role_table_column_permissions_Database_id_fkey" FOREIGN KEY ("Database_id") REFERENCES "DatabaseEntity" ("Id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Role_table_column_permissions_Table_id_fkey" FOREIGN KEY ("Table_id") REFERENCES "DatabaseTable" ("Id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Role_table_column_permissions_Column_id_fkey" FOREIGN KEY ("Column_id") REFERENCES "DatabaseColumn" ("Id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Role_table_column_permissions" ("Column_id", "Database_id", "Datasource_id", "Role_id", "Table_id", "permissionFlags") SELECT "Column_id", "Database_id", "Datasource_id", "Role_id", "Table_id", "permissionFlags" FROM "Role_table_column_permissions";
DROP TABLE "Role_table_column_permissions";
ALTER TABLE "new_Role_table_column_permissions" RENAME TO "Role_table_column_permissions";
CREATE TABLE "new_Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expires" TEXT NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Session" ("expires", "id", "sessionToken", "userId") SELECT "expires", "id", "sessionToken", "userId" FROM "Session";
DROP TABLE "Session";
ALTER TABLE "new_Session" RENAME TO "Session";
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
