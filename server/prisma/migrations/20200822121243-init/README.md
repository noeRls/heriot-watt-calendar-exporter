# Migration `20200822121243-init`

This migration has been generated at 8/22/2020, 12:12:43 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE TABLE "public"."Course" (
"name" text   NOT NULL ,
"updatedAt" timestamp(3)   NOT NULL ,
PRIMARY KEY ("name")
)

DROP TABLE "public"."Courses"
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200822101428-init..20200822121243-init
--- datamodel.dml
+++ datamodel.dml
@@ -1,10 +1,7 @@
-// This is your Prisma schema file,
-// learn more about it in the docs: https://pris.ly/d/prisma-schema
-
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
 generator client {
   provider = "prisma-client-js"
@@ -15,9 +12,8 @@
   accessToken String
   refreshToken String?
 }
-model Courses {
-  id Int @id
-  names String[]
+model Course {
+  name String @id
   updatedAt DateTime @updatedAt
-}
+}
```


