## What a MongoDB Document Is

A MongoDB document is a JSON-like object that acts like a row in SQL, but unlike SQL rows, it has no fixed schema—each document can have different fields. Documents are the fundamental unit of data storage in MongoDB.

## What insertOne() Does Differently Than SQL INSERT

insertOne() is simpler than SQL INSERT because you don't need to CREATE TABLE or declare columns first. You just pass a JavaScript object directly and MongoDB automatically assigns a unique `_id` field; the database figures out the structure from the data you provide.
