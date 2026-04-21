# Insert and Find — Lab Environment

Working environment for the **Insert and Find — MongoDB Basics** lab.

## Setup

```bash
cp .env.example .env
npm install
```

## Run

```bash
node src/run.js
```

## Validate

```bash
npm run check:env         # verify MongoDB is running and collection is empty
npm run check:insert      # Stage 1: document inserted correctly
npm run check:find        # Stage 2: findOne() output is correct
npm run check:reflection  # Stage 3: NOTES.md written correctly
npm run check:all         # run all checks in order
```

## Reset

```bash
mongosh "mongodb://localhost:27017/insert_find_lab" --eval "db.test_items.drop()"
```

Then restore `src/run.js` to the skeleton and delete `NOTES.md`.