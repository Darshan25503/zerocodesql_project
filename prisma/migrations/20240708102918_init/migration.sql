-- CreateTable
CREATE TABLE "DataSource" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "databaseType" TEXT NOT NULL,
    "Host" TEXT,
    "User" TEXT,
    "Password" TEXT,
    "Database" TEXT,
    "Port" INTEGER,
    "proxyUser" TEXT,
    "proxyHost" TEXT,
    "proxyAuthenticationType" TEXT,
    "proxyAuthenticationData" TEXT,
    "Filename" TEXT,
    "Flags" TEXT
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Username" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isSuperAdmin" BOOLEAN NOT NULL,
    "Role_id" INTEGER NOT NULL,
    CONSTRAINT "User_Role_id_fkey" FOREIGN KEY ("Role_id") REFERENCES "Role" ("Id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Role" (
    "Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Name" TEXT NOT NULL,
    "Color" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Role_table_column_permissions" (
    "Role_id" INTEGER NOT NULL,
    "Datasource_id" INTEGER NOT NULL,
    "Database_id" INTEGER NOT NULL,
    "Table_id" INTEGER NOT NULL,
    "Column_id" INTEGER NOT NULL,
    "permissionFlags" INTEGER NOT NULL,

    PRIMARY KEY ("Role_id", "Datasource_id", "Database_id", "Table_id", "Column_id"),
    CONSTRAINT "Role_table_column_permissions_Role_id_fkey" FOREIGN KEY ("Role_id") REFERENCES "Role" ("Id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Role_table_column_permissions_Datasource_id_fkey" FOREIGN KEY ("Datasource_id") REFERENCES "DataSource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Role_table_column_permissions_Database_id_fkey" FOREIGN KEY ("Database_id") REFERENCES "DatabaseEntity" ("Id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Role_table_column_permissions_Table_id_fkey" FOREIGN KEY ("Table_id") REFERENCES "DatabaseTable" ("Id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Role_table_column_permissions_Column_id_fkey" FOREIGN KEY ("Column_id") REFERENCES "DatabaseColumn" ("Id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DatabaseEntity" (
    "Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Datasource_id" INTEGER NOT NULL,
    "Name" TEXT NOT NULL,
    CONSTRAINT "DatabaseEntity_Datasource_id_fkey" FOREIGN KEY ("Datasource_id") REFERENCES "DataSource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DatabaseTable" (
    "Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Database_id" INTEGER NOT NULL,
    "Name" TEXT NOT NULL,
    "Display" TEXT NOT NULL,
    CONSTRAINT "DatabaseTable_Database_id_fkey" FOREIGN KEY ("Database_id") REFERENCES "DatabaseEntity" ("Id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DatabaseColumn" (
    "Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Table_id" INTEGER NOT NULL,
    "Name" TEXT NOT NULL,
    "Display" TEXT NOT NULL,
    "DataType" TEXT NOT NULL,
    "Order" INTEGER NOT NULL,
    "isPrimaryKey" BOOLEAN NOT NULL,
    "ForeignKeyId" INTEGER,
    CONSTRAINT "DatabaseColumn_Table_id_fkey" FOREIGN KEY ("Table_id") REFERENCES "DatabaseTable" ("Id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DatabaseColumn_ForeignKeyId_fkey" FOREIGN KEY ("ForeignKeyId") REFERENCES "DatabaseColumn" ("Id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "DatabaseColumn_ForeignKeyId_fkey" FOREIGN KEY ("ForeignKeyId") REFERENCES "DatabaseColumn" ("Id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Form" (
    "Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Name" TEXT NOT NULL,
    "Title" TEXT NOT NULL,
    "Enabled" BOOLEAN NOT NULL,
    "dataSourceId" INTEGER,
    CONSTRAINT "Form_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "DataSource" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FormField" (
    "Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Form_id" INTEGER NOT NULL,
    "Datasource_id" INTEGER NOT NULL,
    "Database_id" INTEGER NOT NULL,
    "Table_id" INTEGER NOT NULL,
    "Column_id" INTEGER NOT NULL,
    "Description" TEXT NOT NULL,
    "Order" INTEGER NOT NULL,
    CONSTRAINT "FormField_Form_id_fkey" FOREIGN KEY ("Form_id") REFERENCES "Form" ("Id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FormField_Datasource_id_fkey" FOREIGN KEY ("Datasource_id") REFERENCES "DataSource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FormField_Database_id_fkey" FOREIGN KEY ("Database_id") REFERENCES "DatabaseEntity" ("Id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FormField_Table_id_fkey" FOREIGN KEY ("Table_id") REFERENCES "DatabaseTable" ("Id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FormField_Column_id_fkey" FOREIGN KEY ("Column_id") REFERENCES "DatabaseColumn" ("Id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DashboardComponent" (
    "Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Title" TEXT NOT NULL,
    "Type" TEXT NOT NULL,
    "Order" INTEGER NOT NULL,
    "Datasource_id" INTEGER NOT NULL,
    "QuerySql" TEXT NOT NULL,
    CONSTRAINT "DashboardComponent_Datasource_id_fkey" FOREIGN KEY ("Datasource_id") REFERENCES "DataSource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApiEntity" (
    "Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Name" TEXT NOT NULL,
    "Display" TEXT NOT NULL,
    "Datasource_id" INTEGER NOT NULL,
    "Database_id" INTEGER NOT NULL,
    "Table_id" INTEGER NOT NULL,
    CONSTRAINT "ApiEntity_Datasource_id_fkey" FOREIGN KEY ("Datasource_id") REFERENCES "DataSource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ApiEntity_Database_id_fkey" FOREIGN KEY ("Database_id") REFERENCES "DatabaseEntity" ("Id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ApiEntity_Table_id_fkey" FOREIGN KEY ("Table_id") REFERENCES "DatabaseTable" ("Id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApiEntityColumn" (
    "Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Api_id" INTEGER NOT NULL,
    "Column_id" INTEGER NOT NULL,
    "Order" INTEGER NOT NULL,
    CONSTRAINT "ApiEntityColumn_Api_id_fkey" FOREIGN KEY ("Api_id") REFERENCES "ApiEntity" ("Id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ApiEntityColumn_Column_id_fkey" FOREIGN KEY ("Column_id") REFERENCES "DatabaseColumn" ("Id") ON DELETE RESTRICT ON UPDATE CASCADE
);
