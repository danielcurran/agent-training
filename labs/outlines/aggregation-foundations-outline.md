# Lab Outline: Aggregation Foundations

**Lab Name:** aggregation-foundations  
**Environment:** `lab-test-env/aggregation-foundations/` (Node.js + MongoDB)  
**Target Audience:** Intermediate MongoDB developers (familiar with basic queries, moving to data transformation)  
**Estimated Duration:** 90 minutes (4 stages + reflection)  
**MongoDB Version:** 8.0.5 Enterprise  

---

## Learning Objectives (Terminal)

By completing this lab, learners will be able to:

1. **Construct multi-stage aggregation pipelines** using $match, $unwind, $group, and $project to transform and report on data
2. **Apply sorting and limiting** operations to refine pipeline results for ranked output
3. **Join collections** using $lookup and manipulate embedded data with $set and $filter operators
4. **Persist aggregation results** and validate output against expected schemas

---

## Stage 1: Introduction & $match + $unwind Fundamentals

**Duration:** 20 minutes  
**Checkpoint:** Execute $match and $unwind stages on sales data

### Learning Content

- **Concept:** Why aggregation pipelines vs. single queries
- **Core Stages:** $match (filter), $unwind (deconstruct arrays)
- **Data Context:** `online_bookstore.sales` collection with embedded `books` array

### Learner Task

**Context:** You're building a revenue report system. Your first job: filter 2024 sales and expand each book into a separate document.

1. Open `query.js` in the editor
2. Complete the `$match` stage to filter documents where `date` falls within 2024 (provided date range: `2024-01-01` to `2025-01-01`)
3. Verify the `$unwind` stage is present to deconstruct the `books` array
4. Execute the pipeline using `mongosh load("query.js")` and examine output
5. Answer: *How many individual book records do you see after $unwind?*

### Success Criteria

- [ ] $match stage correctly filters by date range
- [ ] Pipeline executes without errors
- [ ] Output shows one document per book sold (array deconstructed)
- [ ] Learner can explain why $unwind is necessary

### Validation Check

```bash
npm run check:stage-1
```

Validates:
- Query file exists and parses as valid JavaScript
- Pipeline contains $match with date filters
- Pipeline contains $unwind on `books` field
- Query executes and returns array-deconstructed documents

---

## Stage 2: $group + $project — Aggregation & Reporting

**Duration:** 25 minutes  
**Checkpoint:** Generate genre revenue report for 2024

### Learning Content

- **Concept:** Grouping and accumulation ($group, $sum)
- **Concept:** Output reshaping ($project, field renaming)
- **Real-world context:** Building summary reports from detailed transaction data

### Learner Task

**Context:** Marketing needs a revenue breakdown by book genre for 2024. Complete the pipeline to generate this report.

1. Starting from Stage 1's `query.js`, add a `$group` stage that:
   - Groups by `books.genre` (accessed via `$_id`)
   - Accumulates total revenue using `$sum` on `books.price`
2. Add a `$project` stage that:
   - Renames `_id` to `genre`
   - Keeps `totalRevenue` visible
3. Execute the full pipeline (4 stages: match → unwind → group → project)
4. Verify output shows genre names with corresponding revenue totals

### Success Criteria

- [ ] $group stage correctly consolidates by genre
- [ ] $sum operator correctly totals revenue
- [ ] $project stage renames _id and reshapes output
- [ ] Pipeline executes with all 4 stages
- [ ] Output is human-readable (genre, totalRevenue fields)

### Validation Check

```bash
npm run check:stage-2
```

Validates:
- Pipeline includes all 4 stages (match, unwind, group, project)
- $group consolidates by genre
- Output field names match expected schema (genre, totalRevenue)
- Revenue values are numeric and > 0

---

## Stage 3: $sort + $limit — Ranking & Pagination

**Duration:** 20 minutes  
**Checkpoint:** Top 10 highest-rated books from post-2017 reviews

### Learning Content

- **Concept:** Sorting aggregation results ($sort with -1 / 1 direction)
- **Concept:** Limiting result sets ($limit for pagination/top-N queries)
- **Real-world context:** Building "Top Books" leaderboards

### Learner Task

**Context:** Product team wants a "Top 10 Best Rated Books" list from reviews posted after 2017. Complete the pipeline.

1. Open `reviews-query.js` — a partially completed pipeline
2. **Given:** $match stage (filters `timestamp > 2018-01-01`)
3. **Given:** $group stage structure with `averageRating` field
4. Complete the `$group` stage:
   - Group by `book_id`
   - Calculate average rating using `$avg: "$rating"`
5. Add a `$sort` stage:
   - Sort by `averageRating: -1` (descending — highest first)
6. Add a `$limit` stage:
   - Limit results to 10 documents
7. Execute pipeline and verify you see exactly 10 books sorted by rating

### Success Criteria

- [ ] $group stage calculates average rating per book_id
- [ ] $sort stage sorts by averageRating descending
- [ ] $limit stage restricts results to 10
- [ ] Pipeline executes without errors
- [ ] Output shows 10 books with highest ratings first

### Validation Check

```bash
npm run check:stage-3
```

Validates:
- Pipeline includes match → group → sort → limit stages
- $group calculates averageRating correctly
- $sort uses descending order (-1)
- $limit equals 10
- Output contains exactly 10 documents

---

## Stage 4: $lookup + $set + $filter — Joins & Conditional Logic

**Duration:** 25 minutes  
**Checkpoint:** Marketing list of customers who purchased children's books

### Learning Content

- **Concept:** Joining collections across databases ($lookup with localField/foreignField)
- **Concept:** Array manipulation ($set with $filter for conditional inclusion)
- **Concept:** Complex projections ($concat for derived fields)
- **Real-world context:** Cross-collection analytics (customers + their purchases)

### Learner Task

**Context:** Marketing wants a contact list of customers who bought children's books. Join `sales` with `customers`, filter by genre, and reshape output.

1. Open `marketing-pipeline.js`
2. **Given:** $unwind, $match, and $project stages (provided)
3. Complete the `$lookup` stage:
   - Join `sales` collection with `customers` collection
   - Match `sales.customer` (localField) to `customers._id` (foreignField)
   - Store result in field `customer_details`
4. Complete the `$set` stage:
   - Add field `childrensBooks` using `$filter`:
     - Filter the `books` array
     - Keep only books where `genre === "Children's literature"`
5. Execute pipeline and examine results
6. Verify output shows customer names, emails, and children's book titles

### Success Criteria

- [ ] $lookup correctly joins customers collection
- [ ] localField and foreignField are correctly mapped
- [ ] $set stage adds filtered `childrensBooks` array
- [ ] $filter operator correctly filters by genre
- [ ] $match removes customers with no children's books
- [ ] $project reshapes output (customerName via $concat, email, book titles)
- [ ] Pipeline executes end-to-end

### Validation Check

```bash
npm run check:stage-4
```

Validates:
- Pipeline includes lookup → unwind → set → match → project stages
- $lookup references correct collections and fields
- $filter operates on books array with genre condition
- Output contains customer_name (concatenated), email, and book titles
- No documents in output have empty childrensBooks arrays

---

## Reflection: Transfer Task

**Duration:** 10 minutes  
**Deliverable:** `REFLECTION.md`

### Prompt

You're designing a dashboard for an e-commerce platform. The analytics team needs a report showing:

- **Per genre:** total revenue, average book price, number of unique customers who purchased in that genre
- **Filter:** only include genres with >$5000 in revenue
- **Sort:** by revenue descending
- **Limit:** top 5 genres

**Your task:** Outline the aggregation pipeline stages you would use (in order) to generate this report. For each stage, explain:

1. What data transformation it performs
2. Which field(s) it operates on
3. How it connects to the previous/next stage

You do **not** need to write complete MongoDB syntax — pseudocode or stage names with explanations are fine. Focus on the *logic flow*.

### Evaluation Criteria

- [ ] Learner identifies all necessary stages (match, group, project, sort, limit, etc.)
- [ ] Grouping strategy correctly accumulates revenue and counts distinct customers
- [ ] Learner explains the purpose of each stage
- [ ] Output schema is logical (genre, totalRevenue, avgPrice, customerCount)
- [ ] Learner demonstrates understanding of stage sequencing (e.g., why $match filtering must come early)

---

## Lab Metadata

**Collections Used:**
- `online_bookstore.sales` (documents with embedded `books` array)
- `online_bookstore.reviews`
- `online_bookstore.customers`

**Data Setup:** All collections seeded during environment initialization (`npm run seed`)

**Indexes Created:**
- `sales`: index on `date` field
- `reviews`: index on `timestamp` field
- `customers`: index on `_id` (primary)

**Files Generated:**
- Stage 1: `query.js` (match + unwind)
- Stage 2: `query.js` (complete 4-stage pipeline)
- Stage 3: `reviews-query.js` (match + group + sort + limit)
- Stage 4: `marketing-pipeline.js` (lookup + set + filter)
- Reflection: `REFLECTION.md`

**Estimated Total Duration:** 90 minutes (excluding breaks)

---

## Alignment with Instructional Design Rulebook

✓ **Progressive complexity:** Stages 1–2 introduce foundational operators; Stages 3–4 add sorting, limiting, and cross-collection operations  
✓ **Scaffolded tasks:** Each stage provides partial code; learners complete missing logic  
✓ **Real-world context:** All tasks tie to business analytics use cases (revenue reports, rankings, marketing lists)  
✓ **Immediate validation:** Each stage has automated checks to verify learner output  
✓ **Transfer task:** Reflection requires learners to *design* a pipeline (not just complete one), testing deeper understanding