# Migration `20200822101428-init`

This migration has been generated at 8/22/2020, 10:14:28 AM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE TABLE "public"."Courses" (
"id" integer   NOT NULL ,
"names" text []  ,
"updatedAt" timestamp(3)   NOT NULL ,
PRIMARY KEY ("id")
)
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200820185537-init..20200822101428-init
--- datamodel.dml
+++ datamodel.dml
@@ -2,9 +2,9 @@
 // learn more about it in the docs: https://pris.ly/d/prisma-schema
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
 generator client {
   provider = "prisma-client-js"
@@ -13,5 +13,11 @@
 model User {
   id String @id
   accessToken String
   refreshToken String?
-}
+}
+
+model Courses {
+  id Int @id
+  names String[]
+  updatedAt DateTime @updatedAt
+}
```


