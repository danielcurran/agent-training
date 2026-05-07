## What a MongoDB Document Is

A MongoDB document is a JSON-like object with flexible fields, unlike a SQL row which requires all columns to be predefined in a schema. Each document in a collection can have different fields from other documents in the same collection, allowing for schema evolution without migrations.

## What insertOne() Does Differently Than SQL INSERT

insertOne() in MongoDB is simpler than SQL INSERT because you don't need to CREATE TABLE or declare columns first — you just pass a JavaScript object and MongoDB automatically assigns a unique `_id` field and stores it as-is. This means you can start inserting data without any schema definition, whereas SQL requires you to define the table structure before inserting any rows.
