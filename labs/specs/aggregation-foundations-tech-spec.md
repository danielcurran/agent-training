# Technical Specification: Aggregation Foundations

**Lab Name:** aggregation-foundations  
**Version:** 1.0  
**Date:** 30 April 2026  
**Target Audience:** Intermediate MongoDB developers (familiar with basic queries, moving to data transformation)  
**Estimated Duration:** 90 minutes  
**Environment:** `lab-test-env/aggregation-foundations/` (Node.js 18+ + MongoDB 8.0.5)  

---

## 1. Terminal Learning Objectives

By completing this lab, learners will be able to:

1. **Construct multi-stage aggregation pipelines** using $match, $unwind, $group, and $project to filter, deconstruct, consolidate, and reshape data
2. **Apply sorting and limiting** operations ($sort, $limit) to refine pipeline results and implement pagination/ranking patterns
3. **Join collections** using $lookup with localField/foreignField matching and manipulate embedded data with $set and $filter operators
4. **Design aggregation pipelines** that solve cross-collection analytics problems by reasoning about stage sequencing and data flow

---

## 2. Prerequisites

**Learner Knowledge:**
- Basic MongoDB CRUD operations (find, insert, updateOne)
- JavaScript arrow functions and object syntax
- Familiarity with structured data (documents, arrays, nested objects)
- Understanding of SQL-style GROUP BY and JOIN concepts (helpful but not required)

**Environment:**
- MongoDB 8.0.5 Enterprise (provided)
- mongosh shell
- Node.js 18+
- Text editor (VS Code preferred)

---

## 3. Data Model

### Collections

#### `online_bookstore.sales`
```javascript
{
  _id: ObjectId,
  date: ISODate,           // e.g., 2024-06-15T10:30:00Z
  customer_id: ObjectId,   // references customers._id
  books: [
    {
      book_id: ObjectId,
      title: String,
      genre: String,       // e.g., "Children's literature", "Science Fiction"
      price: Number        // USD, e.g., 15.99
    }
  ],
  total: Number            // sum of all book prices
}
```

**Sample Document:**
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  date: ISODate("2024-03-15T14:22:00Z"),
  customer_id: ObjectId("507f1f77bcf86cd799439001"),
  books: [
    { book_id: ObjectId("507f1f77bcf86cd799439021"), title: "The Hobbit", genre: "Fantasy", price: 12.99 },
    { book_id: ObjectId("507f1f77bcf86cd799439022"), title: "Where the Wild Things Are", genre: "Children's literature", price: 9.99 }
  ],
  total: 22.98
}
```

**Indexes:**
- `{ date: 1 }` (ascending) — supports $match filtering on date ranges

---

#### `online_bookstore.reviews`
```javascript
{
  _id: ObjectId,
  book_id: ObjectId,       // references books (or implicit)
  rating: Number,          // 1–5
  timestamp: ISODate,      // e.g., 2023-06-15T10:30:00Z
  reviewer: String
}
```

**Sample Document:**
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439031"),
  book_id: ObjectId("507f1f77bcf86cd799439021"),
  rating: 5,
  timestamp: ISODate("2023-09-10T08:15:00Z"),
  reviewer: "jane_doe"
}
```

**Indexes:**
- `{ timestamp: 1 }` (ascending) — supports $match filtering on date ranges

---

#### `online_bookstore.customers`
```javascript
{
  _id: ObjectId,
  first_name: String,
  last_name: String,
  email: String
}
```

**Sample Document:**
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439001"),
  first_name: "Alice",
  last_name: "Johnson",
  email: "alice@example.com"
}
```

---

### Seeding Strategy

**Data Volume:**
- 500 sales documents (spanning 2024)
- 200 reviews (spanning 2018–2024, emphasizing post-2018)
- 50 customer documents
- 30 book titles (distributed across 6 genres: Fantasy, Science Fiction, Mystery, Children's literature, Romance, Non-fiction)

**Seed File:** `scripts/seed.js`  
**Execution:** `npm run seed` (idempotent — clears collections before inserting)

---

## 4. Stage Specifications

### Stage 1: $match + $unwind Fundamentals (20 min)

**Checkpoint:** Learner executes $match and $unwind on sales data

#### Learning Outcomes

- Understand why $match is a stage (not a method) in aggregation pipelines
- Recognize that $unwind deconstructs arrays, creating one document per array element
- Identify date filtering as a common use case for $match

#### Scaffolded Code

**File:** `queries/stage-1-query.js` (provided to learner)

```javascript
// filepath: queries/stage-1-query.js
use("online_bookstore");

const matchStage = {
  $match: {
    // TODO: Filter documents where date is between 2024-01-01 and 2024-12-31
    // Hint: Use $gte and $lt operators
    // date: { ... }
  }
};

const unwindStage = {
  $unwind: "$books"
};

const result = db.sales.aggregate([
  matchStage,
  unwindStage
]);

printjson(result.toArray());
```

#### Learner Task

1. **Complete the `$match` stage:**
   - Filter for documents where `date >= ISODate("2024-01-01")` AND `date < ISODate("2025-01-01")`
   - Use MongoDB's comparison operators: `$gte` (>=) and `$lt` (<)

2. **Understand the `$unwind` stage:**
   - Learner reads provided explanation: "$unwind takes each document and creates one document per array element"
   - Learner runs the pipeline and counts the output documents

3. **Execute and reflect:**
   - Run: `load("queries/stage-1-query.js")`
   - Count output: How many book records appear after $unwind?
   - Explanation: Why is this count different from the number of sales documents?

#### Success Criteria

- [ ] $match stage correctly filters by date range
- [ ] Query executes without syntax errors
- [ ] Output shows one document per book (array deconstructed)
- [ ] Learner can explain: "If a sales doc has 3 books, $unwind creates 3 output docs"

#### Validation Check

**File:** `checks/check-stage-1.js`

```javascript
// filepath: checks/check-stage-1.js
const fs = require("fs");
const path = require("path");

async function checkStage1(db) {
  const queryPath = path.join(__dirname, "../queries/stage-1-query.js");
  
  if (!fs.existsSync(queryPath)) {
    return { pass: false, error: "stage-1-query.js not found" };
  }

  const queryContent = fs.readFileSync(queryPath, "utf-8");

  // Check 1: $match stage exists and has date filters
  if (!queryContent.includes("$gte") && !queryContent.includes("$lte")) {
    return { pass: false, error: "$match stage missing date comparison operators" };
  }

  // Check 2: $unwind stage is present
  if (!queryContent.includes('$unwind: "$books"')) {
    return { pass: false, error: '$unwind stage not found or incorrect field' };
  }

  // Check 3: Run the pipeline and verify output structure
  try {
    const matchStage = {
      $match: {
        date: { $gte: new Date("2024-01-01"), $lt: new Date("2025-01-01") }
      }
    };
    const unwindStage = { $unwind: "$books" };

    const result = await db.collection("sales").aggregate([matchStage, unwindStage]).toArray();

    if (result.length === 0) {
      return { pass: false, error: "Pipeline returned no documents" };
    }

    // Check 4: Verify output has books field (unwound)
    const hasUnwoundBooks = result.every(doc => doc.books && !Array.isArray(doc.books));
    if (!hasUnwoundBooks) {
      return { pass: false, error: "Books field not properly unwound" };
    }

    return {
      pass: true,
      message: `✓ Stage 1 passed. ${result.length} book records returned.`
    };
  } catch (err) {
    return { pass: false, error: `Pipeline execution failed: ${err.message}` };
  }
}

module.exports = { checkStage1 };
```

**Command:** `npm run check:stage-1`

---

### Stage 2: $group + $project — Aggregation & Reporting (25 min)

**Checkpoint:** Learner generates genre revenue report for 2024

#### Learning Outcomes

- Understand the $group stage: consolidates documents by _id, accumulates values using operators ($sum, $avg, $count)
- Recognize the $project stage: reshapes output (renames fields, hides fields, computes derived fields)
- Apply grouping and accumulation to real business reporting scenarios

#### Scaffolded Code

**File:** `queries/stage-2-query.js` (learner modifies stage 1)

```javascript
// filepath: queries/stage-2-query.js
use("online_bookstore");

const matchStage = {
  $match: {
    date: { $gte: ISODate("2024-01-01"), $lt: ISODate("2025-01-01") }
  }
};

const unwindStage = {
  $unwind: "$books"
};

const groupStage = {
  $group: {
    // TODO: Group by genre and sum revenue
    // _id: ...,
    // totalRevenue: { ... }
  }
};

const projectStage = {
  $project: {
    // TODO: Rename _id to genre and keep totalRevenue
  }
};

const result = db.sales.aggregate([
  matchStage,
  unwindStage,
  groupStage,
  projectStage
]);

printjson(result.toArray());
```

#### Learner Task

1. **Complete the `$group` stage:**
   - Group by `$books.genre` (after $unwind, the books field is no longer an array)
   - Accumulate total revenue: `$sum: "$books.price"`

2. **Complete the `$project` stage:**
   - Rename `_id` to `genre`: `genre: "$_id"`
   - Keep `totalRevenue`: `totalRevenue: 1`
   - Hide `_id`: `_id: 0`

3. **Execute the full 4-stage pipeline:**
   - Run: `load("queries/stage-2-query.js")`
   - Inspect output: Each genre should appear once with its total revenue

4. **Verify correctness:**
   - Total revenue across all genres should match sum of Stage 1 output prices
   - No genre should appear twice

#### Success Criteria

- [ ] $group stage correctly groups by genre
- [ ] $sum operator correctly totals revenue per genre
- [ ] $project stage renames _id and hides it correctly
- [ ] Pipeline executes with all 4 stages (match → unwind → group → project)
- [ ] Output shows genre names with numeric totalRevenue values (no _id field visible)
- [ ] All genres appear exactly once

#### Validation Check

**File:** `checks/check-stage-2.js`

```javascript
// filepath: checks/check-stage-2.js
async function checkStage2(db) {
  const queryPath = path.join(__dirname, "../queries/stage-2-query.js");
  
  if (!fs.existsSync(queryPath)) {
    return { pass: false, error: "stage-2-query.js not found" };
  }

  const queryContent = fs.readFileSync(queryPath, "utf-8");

  // Check 1: All 4 stages present
  const stagesPresent = [
    "$match",
    "$unwind",
    "$group",
    "$project"
  ].every(stage => queryContent.includes(stage));

  if (!stagesPresent) {
    return { pass: false, error: "Not all 4 stages present (match, unwind, group, project)" };
  }

  // Check 2: $group has _id and totalRevenue
  if (!queryContent.includes("$sum")) {
    return { pass: false, error: "$group stage missing $sum operator" };
  }

  // Check 3: Execute pipeline
  try {
    const pipeline = [
      { $match: { date: { $gte: new Date("2024-01-01"), $lt: new Date("2025-01-01") } } },
      { $unwind: "$books" },
      { $group: { _id: "$books.genre", totalRevenue: { $sum: "$books.price" } } },
      { $project: { genre: "$_id", totalRevenue: 1, _id: 0 } }
    ];

    const result = await db.collection("sales").aggregate(pipeline).toArray();

    if (result.length === 0) {
      return { pass: false, error: "Pipeline returned no genres" };
    }

    // Check 4: Output schema validation
    const schemaValid = result.every(doc => 
      doc.genre && typeof doc.totalRevenue === "number" && !doc._id
    );

    if (!schemaValid) {
      return { pass: false, error: "Output schema incorrect: missing genre or totalRevenue fields" };
    }

    // Check 5: No duplicate genres
    const genres = result.map(r => r.genre);
    const uniqueGenres = new Set(genres);
    if (genres.length !== uniqueGenres.size) {
      return { pass: false, error: "Duplicate genres in output" };
    }

    const totalAcrossGenres = result.reduce((sum, doc) => sum + doc.totalRevenue, 0);

    return {
      pass: true,
      message: `✓ Stage 2 passed. ${result.length} genres, total revenue: $${totalAcrossGenres.toFixed(2)}`
    };
  } catch (err) {
    return { pass: false, error: `Pipeline execution failed: ${err.message}` };
  }
}

module.exports = { checkStage2 };
```

**Command:** `npm run check:stage-2`

---

### Stage 3: $sort + $limit — Ranking & Pagination (20 min)

**Checkpoint:** Learner generates top 10 highest-rated books list

#### Learning Outcomes

- Understand $sort: orders documents by field(s) with direction (1 = ascending, -1 = descending)
- Recognize $limit: truncates result set to N documents (common pattern: sort → limit = top-N query)
- Apply pagination/ranking patterns to build leaderboards or "best-of" lists

#### Scaffolded Code

**File:** `queries/stage-3-query.js` (new file, reviews collection)

```javascript
// filepath: queries/stage-3-query.js
use("online_bookstore");

const matchStage = {
  $match: {
    // Filter reviews posted after 2017-12-31
    timestamp: { $gte: ISODate("2018-01-01") }
  }
};

const groupStage = {
  $group: {
    // TODO: Group by book_id and calculate average rating
    // _id: ...,
    // averageRating: { ... }
  }
};

const sortStage = {
  $sort: {
    // TODO: Sort by averageRating in descending order
  }
};

const limitStage = {
  $limit: 10
};

const result = db.reviews.aggregate([
  matchStage,
  groupStage,
  sortStage,
  limitStage
]);

printjson(result.toArray());
```

#### Learner Task

1. **Complete the `$group` stage:**
   - Group by `book_id`
   - Calculate average rating: `$avg: "$rating"`

2. **Complete the `$sort` stage:**
   - Sort by `averageRating: -1` (descending, so highest ratings first)

3. **Execute the full pipeline:**
   - Run: `load("queries/stage-3-query.js")`
   - Inspect output: Should show exactly 10 books sorted by rating (highest first)

4. **Verify correctness:**
   - First book should have highest average rating
   - Last (10th) book should have lowest average rating of the top 10
   - No more than 10 results

#### Success Criteria

- [ ] $group stage groups by book_id
- [ ] $avg operator correctly calculates average rating
- [ ] $sort stage sorts by averageRating in descending order (-1)
- [ ] $limit restricts output to exactly 10 documents
- [ ] Pipeline executes without errors
- [ ] Output is sorted high-to-low (first rating ≥ last rating)

#### Validation Check

**File:** `checks/check-stage-3.js`

```javascript
// filepath: checks/check-stage-3.js
async function checkStage3(db) {
  const queryPath = path.join(__dirname, "../queries/stage-3-query.js");
  
  if (!fs.existsSync(queryPath)) {
    return { pass: false, error: "stage-3-query.js not found" };
  }

  const queryContent = fs.readFileSync(queryPath, "utf-8");

  // Check 1: All stages present
  const stagesPresent = [
    "$match",
    "$group",
    "$sort",
    "$limit"
  ].every(stage => queryContent.includes(stage));

  if (!stagesPresent) {
    return { pass: false, error: "Not all stages present (match, group, sort, limit)" };
  }

  // Check 2: $sort has descending order (-1)
  if (!queryContent.includes("-1")) {
    return { pass: false, error: "$sort stage missing descending order (-1)" };
  }

  // Check 3: $limit is 10
  if (!queryContent.includes("$limit: 10")) {
    return { pass: false, error: "$limit not set to 10" };
  }

  // Check 4: Execute pipeline
  try {
    const pipeline = [
      { $match: { timestamp: { $gte: new Date("2018-01-01") } } },
      { $group: { _id: "$book_id", averageRating: { $avg: "$rating" } } },
      { $sort: { averageRating: -1 } },
      { $limit: 10 }
    ];

    const result = await db.collection("reviews").aggregate(pipeline).toArray();

    if (result.length === 0) {
      return { pass: false, error: "Pipeline returned no results" };
    }

    if (result.length > 10) {
      return { pass: false, error: `$limit not applied: ${result.length} > 10 documents returned` };
    }

    // Check 5: Verify descending order
    const ratings = result.map(r => r.averageRating);
    const isSorted = ratings.every((rating, i) => i === 0 || rating <= ratings[i - 1]);

    if (!isSorted) {
      return { pass: false, error: "Results not sorted in descending order" };
    }

    return {
      pass: true,
      message: `✓ Stage 3 passed. Top 10 books returned, highest rating: ${ratings[0]}`
    };
  } catch (err) {
    return { pass: false, error: `Pipeline execution failed: ${err.message}` };
  }
}

module.exports = { checkStage3 };
```

**Command:** `npm run check:stage-3`

---

### Stage 4: $lookup + $set + $filter — Joins & Conditional Logic (25 min)

**Checkpoint:** Learner generates marketing list of customers who bought children's books

#### Learning Outcomes

- Understand $lookup: joins documents from another collection using localField → foreignField matching
- Recognize $set: adds or overwrites fields (commonly used with $filter for conditional inclusion)
- Apply $filter: creates conditional arrays (e.g., keep only books matching criteria)
- Understand stage sequencing: $lookup before $set, $match after $set to filter results

#### Scaffolded Code

**File:** `queries/stage-4-query.js` (new file, complex pipeline)

```javascript
// filepath: queries/stage-4-query.js
use("online_bookstore");

const matchStage = {
  $match: {
    // Pre-filter: only sales from 2024
    date: { $gte: ISODate("2024-01-01"), $lt: ISODate("2025-01-01") }
  }
};

const lookupStage = {
  $lookup: {
    // TODO: Join with customers collection
    // from: ...,
    // localField: ...,
    // foreignField: ...,
    // as: ...
  }
};

const unwindStage = {
  $unwind: "$customer_details"
};

const setStage = {
  $set: {
    // TODO: Filter books array to keep only "Children's literature" genre
    // Use $filter operator
    // childrensBooks: { $filter: { input: "$books", as: "book", cond: { ... } } }
  }
};

const matchChildrensStage = {
  $match: {
    // Filter out customers with no children's books
    "childrensBooks.0": { $exists: true }
  }
};

const projectStage = {
  $project: {
    // TODO: Reshape output
    // customerName: { $concat: ["$customer_details.first_name", " ", "$customer_details.last_name"] },
    // email: "$customer_details.email",
    // childrensBooks: 1
  }
};

const result = db.sales.aggregate([
  matchStage,
  lookupStage,
  unwindStage,
  setStage,
  matchChildrensStage,
  projectStage
]);

printjson(result.toArray());
```

#### Learner Task

1. **Complete the `$lookup` stage:**
   - Join with `customers` collection
   - Match `customer_id` (in sales) to `_id` (in customers)
   - Store result as `customer_details`

2. **Complete the `$set` stage:**
   - Add `childrensBooks` field using `$filter`:
     - Input: `$books` array
     - Condition: `"$$book.genre" === "Children's literature"`

3. **Complete the `$project` stage:**
   - `customerName`: concatenate first_name + " " + last_name from customer_details
   - `email`: from customer_details
   - Keep `childrensBooks`

4. **Execute the full pipeline:**
   - Run: `load("queries/stage-4-query.js")`
   - Inspect output: Should show customers and the children's books they purchased

5. **Verify correctness:**
   - Each result should have customerName, email, and a non-empty childrensBooks array
   - No children's books from other genres should appear

#### Success Criteria

- [ ] $lookup correctly joins customers collection
- [ ] localField and foreignField correctly reference customer_id / _id
- [ ] $set stage uses $filter with correct genre condition
- [ ] $filter keeps only "Children's literature" books
- [ ] $match removes customers with empty childrensBooks
- [ ] $project concatenates first_name and last_name into customerName
- [ ] Pipeline executes end-to-end without errors
- [ ] Output schema is correct (customerName, email, childrensBooks)

#### Validation Check

**File:** `checks/check-stage-4.js`

```javascript
// filepath: checks/check-stage-4.js
async function checkStage4(db) {
  const queryPath = path.join(__dirname, "../queries/stage-4-query.js");
  
  if (!fs.existsSync(queryPath)) {
    return { pass: false, error: "stage-4-query.js not found" };
  }

  const queryContent = fs.readFileSync(queryPath, "utf-8");

  // Check 1: All stages present
  const stagesPresent = [
    "$lookup",
    "$set",
    "$filter",
    "$project"
  ].every(stage => queryContent.includes(stage));

  if (!stagesPresent) {
    return { pass: false, error: "Not all stages present (lookup, set, filter, project)" };
  }

  // Check 2: $lookup references customers collection
  if (!queryContent.includes("customers")) {
    return { pass: false, error: "$lookup not joining customers collection" };
  }

  // Check 3: Execute pipeline
  try {
    const pipeline = [
      { $match: { date: { $gte: new Date("2024-01-01"), $lt: new Date("2025-01-01") } } },
      {
        $lookup: {
          from: "customers",
          localField: "customer_id",
          foreignField: "_id",
          as: "customer_details"
        }
      },
      { $unwind: "$customer_details" },
      {
        $set: {
          childrensBooks: {
            $filter: {
              input: "$books",
              as: "book",
              cond: { $eq: ["$$book.genre", "Children's literature"] }
            }
          }
        }
      },
      { $match: { "childrensBooks.0": { $exists: true } } },
      {
        $project: {
          customerName: {
            $concat: ["$customer_details.first_name", " ", "$customer_details.last_name"]
          },
          email: "$customer_details.email",
          childrensBooks: 1,
          _id: 0
        }
      }
    ];

    const result = await db.collection("sales").aggregate(pipeline).toArray();

    if (result.length === 0) {
      return { pass: false, error: "Pipeline returned no customers with children's books" };
    }

    // Check 4: Validate output schema
    const schemaValid = result.every(doc => 
      doc.customerName &&
      doc.email &&
      Array.isArray(doc.childrensBooks) &&
      doc.childrensBooks.length > 0 &&
      doc.childrensBooks.every(book => book.genre === "Children's literature")
    );

    if (!schemaValid) {
      return { pass: false, error: "Output schema invalid or children's books not filtered correctly" };
    }

    return {
      pass: true,
      message: `✓ Stage 4 passed. ${result.length} customers with children's books found.`
    };
  } catch (err) {
    return { pass: false, error: `Pipeline execution failed: ${err.message}` };
  }
}

module.exports = { checkStage4 };
```

**Command:** `npm run check:stage-4`

---

### Stage 5: Transfer Task — Reflection (10 min)

**Checkpoint:** Learner designs an aggregation pipeline from business requirements

#### Learning Outcome

- **Design aggregation pipelines** by reasoning about data transformations and stage sequencing (transfer of knowledge from Stages 1–4)

#### Task

**Context:** You're designing a dashboard for an e-commerce platform. The analytics team needs a report showing:

- **Per genre:** total revenue, average book price, number of unique customers who purchased in that genre
- **Filter:** only include genres with >$5000 in revenue
- **Sort:** by revenue descending
- **Limit:** top 5 genres

**Your task:** Outline the aggregation pipeline stages you would use (in order) to generate this report. For each stage, explain:

1. **What data transformation it performs** (e.g., "filters to 2024 sales only")
2. **Which field(s) it operates on** (e.g., "date, customer_id")
3. **How it connects to the previous/next stage** (e.g., "output from $match feeds into $unwind")

You do **not** need to write complete MongoDB syntax — pseudocode or stage names with explanations are fine. Focus on the *logic flow*.

**Format your answer as:**

```
Stage 1: [Stage Name]
- Transformation: [what it does]
- Fields: [which fields involved]
- Connection: [relationship to previous stage]

Stage 2: [Stage Name]
- Transformation: ...
- Fields: ...
- Connection: ...

... (repeat for each stage)
```

**File:** `REFLECTION.md`

#### Evaluation Rubric

| Criterion | Points | Evidence |
|-----------|--------|----------|
| **Identifies all necessary stages** | 2 | Learner lists 6–8 stages: $match, $unwind, $group, $sum, $avg, $addToSet (or similar), $match (second), $sort, $limit |
| **Correct grouping strategy** | 2 | Learner groups by `genre` and correctly accumulates: totalRevenue ($sum), avgPrice ($avg), and customer count ($addToSet or $setUnion to track unique customers) |
| **Explains stage purpose** | 2 | Each stage includes a clear explanation of what it does (not just "use $match") |
| **Correct stage sequencing** | 2 | $match-before-$group, second $match (filtering by revenue) after $group, $sort-before-$limit |
| **Output schema is logical** | 1 | Final output schema includes genre, totalRevenue, avgPrice, uniqueCustomerCount (or similar naming) |
| **Demonstrates understanding of data flow** | 1 | Learner references the transformation of data through stages (e.g., "after $unwind, books array is deconstructed, so $group can aggregate by genre") |
| **Total** | **10** | — |

**Passing threshold:** ≥ 7/10

---

## 5. Environment Architecture

### Directory Structure

```
lab-test-env/aggregation-foundations/
├── .env.example                 # Copy to .env before running
├── .gitignore
├── docker-compose.yml           # MongoDB 8.0.5 Enterprise
├── package.json
├── package-lock.json
├── scripts/
│   ├── seed.js                  # Populate collections with sample data
│   └── cleanup.js               # Drop collections (idempotent)
├── queries/
│   ├── stage-1-query.js         # Scaffolded: learner completes $match
│   ├── stage-2-query.js         # Scaffolded: learner adds $group + $project
│   ├── stage-3-query.js         # Scaffolded: learner adds $sort + $limit
│   ├── stage-4-query.js         # Scaffolded: learner completes $lookup + $set + $filter
│   └── REFLECTION.md            # Learner reflection (transfer task)
├── checks/
│   ├── check-stage-1.js         # Validates Stage 1 completion
│   ├── check-stage-2.js         # Validates Stage 2 completion
│   ├── check-stage-3.js         # Validates Stage 3 completion
│   ├── check-stage-4.js         # Validates Stage 4 completion
│   ├── check-reflection.js      # Scores reflection against rubric
│   └── index.js                 # Runs all checks in order
├── docs/
│   ├── getting-started.md       # How to set up and run the lab
│   ├── aggregation-patterns.md  # Reference: common aggregation patterns
│   └── hints.md                 # Optional: hints for each stage
└── README.md

```

### npm Scripts

```json
{
  "scripts": {
    "seed": "node scripts/seed.js",
    "cleanup": "node scripts/cleanup.js",
    "check:env": "node checks/index.js --env",
    "check:stage-1": "node checks/index.js --stage=1",
    "check:stage-2": "node checks/index.js --stage=2",
    "check:stage-3": "node checks/index.js --stage=3",
    "check:stage-4": "node checks/index.js --stage=4",
    "check:reflection": "node checks/index.js --reflection",
    "check:all": "node checks/index.js --all"
  }
}
```

### Dependencies

```json
{
  "mongodb": "^6.3.0",
  "dotenv": "^16.3.1"
}
```

### Environment Variables (.env)

```
MONGODB_URI=mongodb://localhost:27017
MONGODB_ADMIN_USER=admin
MONGODB_ADMIN_PASSWORD=password
NODE_ENV=development
```

---

## 6. Check Script Architecture

All checks export an async function that:
1. Connects to MongoDB
2. Validates file existence and syntax
3. Executes the learner's code
4. Compares output against expected schema
5. Returns `{ pass: boolean, message: string, error?: string }`

**Master Check File:** `checks/index.js`

```javascript
// filepath: checks/index.js
const { MongoClient } = require("mongodb");
const { checkStage1 } = require("./check-stage-1");
const { checkStage2 } = require("./check-stage-2");
const { checkStage3 } = require("./check-stage-3");
const { checkStage4 } = require("./check-stage-4");
const { checkReflection } = require("./check-reflection");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";

async function runChecks(stage) {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db("online_bookstore");

    console.log(`Running checks for stage: ${stage || "all"}\n`);

    const checks = {
      1: checkStage1,
      2: checkStage2,
      3: checkStage3,
      4: checkStage4,
      reflection: checkReflection
    };

    const stagesToRun = stage === "all" ? [1, 2, 3, 4, "reflection"] : [stage];

    for (const s of stagesToRun) {
      const result = await checks[s](db);
      console.log(`Stage ${s}: ${result.pass ? "✓ PASS" : "✗ FAIL"}`);
      console.log(`${result.message || result.error}\n`);
    }
  } finally {
    await client.close();
  }
}

const args = process.argv.slice(2);
const stageArg = args.find(a => a.includes("stage="))?.split("=")[1] || 
                 (args.includes("--all") ? "all" : null);

if (stageArg) {
  runChecks(stageArg).catch(console.error);
}
```

---

## 7. Success Criteria (Lab-Level)

**Learner passes the lab if all of the following are true:**

1. ✓ Stage 1 check passes: $match and $unwind execute correctly
2. ✓ Stage 2 check passes: 4-stage pipeline (match → unwind → group → project) produces correct output
3. ✓ Stage 3 check passes: sort and limit correctly generate top-10 results
4. ✓ Stage 4 check passes: $lookup and $filter correctly join and filter data
5. ✓ Reflection check passes: learner scores ≥7/10 on pipeline design task

---

## 8. Data Expectations & Sample Output

### Stage 1 Output (excerpt)

```javascript
[
  {
    _id: ObjectId("507f1f77bcf86cd799439011"),
    date: ISODate("2024-03-15T14:22:00Z"),
    customer_id: ObjectId("507f1f77bcf86cd799439001"),
    books: {
      book_id: ObjectId("507f1f77bcf86cd799439021"),
      title: "The Hobbit",
      genre: "Fantasy",
      price: 12.99
    },
    total: 22.98
  },
  {
    _id: ObjectId("507f1f77bcf86cd799439011"),
    date: ISODate("2024-03-15T14:22:00Z"),
    customer_id: ObjectId("507f1f77bcf86cd799439001"),
    books: {
      book_id: ObjectId("507f1f77bcf86cd799439022"),
      title: "Where the Wild Things Are",
      genre: "Children's literature",
      price: 9.99
    },
    total: 22.98
  }
  // ... (more book records)
]
```

### Stage 2 Output (excerpt)

```javascript
[
  { genre: "Fantasy", totalRevenue: 1250.50 },
  { genre: "Children's literature", totalRevenue: 890.25 },
  { genre: "Science Fiction", totalRevenue: 1560.75 },
  { genre: "Mystery", totalRevenue: 745.00 },
  { genre: "Romance", totalRevenue: 612.30 },
  { genre: "Non-fiction", totalRevenue: 820.00 }
]
```

### Stage 3 Output (excerpt)

```javascript
[
  { _id: ObjectId("507f1f77bcf86cd799439021"), averageRating: 4.8 },
  { _id: ObjectId("507f1f77bcf86cd799439022"), averageRating: 4.7 },
  { _id: ObjectId("507f1f77bcf86cd799439023"), averageRating: 4.6 },
  // ... (exactly 10 books)
  { _id: ObjectId("507f1f77bcf86cd799439030"), averageRating: 3.9 }
]
```

### Stage 4 Output (excerpt)

```javascript
[
  {
    customerName: "Alice Johnson",
    email: "alice@example.com",
    childrensBooks: [
      { book_id: ObjectId("507f1f77bcf86cd799439022"), title: "Where the Wild Things Are", genre: "Children's literature", price: 9.99 }
    ]
  },
  {
    customerName: "Bob Smith",
    email: "bob@example.com",
    childrensBooks: [
      { book_id: ObjectId("507f1f77bcf86cd799439031"), title: "Charlotte's Web", genre: "Children's literature", price: 12.50 },
      { book_id: ObjectId("507f1f77bcf86cd799439032"), title: "The Very Hungry Caterpillar", genre: "Children's literature", price: 8.99 }
    ]
  }
  // ... (only customers with children's books)
]
```

---

## 9. Hints & Common Mistakes

### Stage 1

**Common Mistake:** Using `$and` operator unnecessarily  
**Hint:** In MongoDB, adjacent conditions in a single $match stage are implicitly AND-ed. You only need:
```javascript
{ $match: { date: { $gte: ..., $lt: ... } } }
```

**Common Mistake:** Forgetting that $unwind needs the `$` prefix  
**Hint:** `$unwind: "$books"` (not `books` or `"books"`)

---

### Stage 2

**Common Mistake:** Grouping by `$genre` instead of `$books.genre`  
**Hint:** After $unwind, the books field is no longer an array. Use `$books.genre` to access the genre of each (deconstructed) book.

**Common Mistake:** Trying to use $project before $group  
**Hint:** $group consolidates data; $project reshapes the output. Always group first, then project.

---

### Stage 3

**Common Mistake:** Using `$sort: { averageRating: 1 }` (ascending)  
**Hint:** For a "top 10" list, you want highest ratings first, so use `-1` (descending).

---

### Stage 4

**Common Mistake:** Forgetting to include `as` in $lookup  
**Hint:** The `as` field names the joined data. Example: `as: "customer_details"`

**Common Mistake:** Nested $filter syntax errors  
**Hint:** Remember variable syntax: `$$book.genre` (double $$ inside $filter), not `$book.genre`

---

## 10. Accessibility & Accommodations

- **Syntax highlighting:** Queries use `.js` extension; learners should use VS Code with MongoDB plugin for syntax highlighting
- **Keyboard navigation:** All checks are CLI-based; no GUI required
- **Screen reader:** Check output is plain text (no emojis or special symbols that may not render)
- **Color blindness:** Check scripts use ✓ and ✗ symbols, not color alone

---

## 11. Alignment with Instructional Design Rulebook

✓ **Terminal learning objectives are specific and measurable:** Learner can construct, apply, join, and design aggregation pipelines (verifiable via checks and reflection)  
✓ **Progressive complexity:** Stages introduce single concepts (match/unwind → group/project → sort/limit → lookup/set/filter), then combine them  
✓ **Scaffolding:** Each query file provides partial code; learner completes missing logic  
✓ **Immediate feedback:** Checks run synchronously and report pass/fail with specific errors  
✓ **Real-world context:** All tasks map to business analytics (revenue reports, rankings, customer lists)  
✓ **Transfer task:** Reflection requires learners to design (not execute) a pipeline, testing deeper knowledge  
✓ **Validation:** Checks verify both syntax and semantic correctness (output schema, field names, value ranges)

---

## 12. Dependencies & Versions

| Dependency | Version | Purpose |
|---|---|---|
| Node.js | 18+ | Runtime |
| MongoDB | 8.0.5 Enterprise | Database |
| mongodb (driver) | ^6.3.0 | Node.js MongoDB client |
| dotenv | ^16.3.1 | Environment variable loading |

---

## 13. Known Limitations & Future Enhancements

### Limitations

1. **No web UI:** Lab runs entirely via CLI (by design for simplicity)
2. **No visual pipeline editor:** Learners write/edit queries in text editor or mongosh
3. **No collaborative features:** Single-learner environment (not designed for group work)

### Future Enhancements

1. **Stage 5 extension:** Add $facet for multi-pipeline reporting
2. **Stage 6 extension:** Add $out to persist results to new collection
3. **Performance focus:** Add explain() output to teach index usage and query optimization
4. **Time-series data:** Extend to $bucketAuto for histogram generation
