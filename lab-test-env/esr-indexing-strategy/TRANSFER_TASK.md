# Transfer Task

**This task is completed AFTER:**
1. All lab stages are finished
2. `KNOWLEDGE.json` has been created and validated
3. You have formally recorded what you learned

Do not refer back to the lab stages, product catalog queries, or README. Reason only from what you recorded in `KNOWLEDGE.json`.

---

## Problem Statement

**Domain:** Hospital appointment scheduling system (completely different from the product catalog domain in this lab)

**Query:** A hospital app runs this query thousands of times per day:

```javascript
db.appointments.find({
  doctorId: "dr-smith",
  appointmentDate: { $gte: new Date("2026-05-01"), $lte: new Date("2026-05-31") }
}).sort({ urgency: -1 })
```

The `appointments` collection has 500,000 documents. The query currently takes 800ms.

---

## Your Task

Answer the following in order:

### 1. SQL Instinct
What would a SQL developer likely do when indexing this query? Name the specific column order they would choose and why.

### 2. MongoDB Failure Mode
What does that SQL-instinct index produce in MongoDB's query execution plan? Name the specific execution stage it introduces and explain why.

### 3. ESR Solution
Design the optimal ESR index. Classify each field as E (Equality), S (Sort), or R (Range), state the exact field order, and explain why placing sort before range eliminates the execution stage you named in question 2.

### 4. Explain Output
State what the explain output looks like before and after your index is applied. Specifically, what stage disappears?

---

## Scoring Rubric (For Reference)

| Dimension | Mastery Indicator |
|---|---|
| **Fluency** | Correct MongoDB index syntax: `db.appointments.createIndex({ doctorId: 1, urgency: -1, appointmentDate: 1 })` |
| **Induction** | Field order justified by E/S/R classification of each field — not by analogy to the product catalog queries from the lab |
| **Sense-Making** | Explicitly names what a SQL developer would do (e.g., "index by appearance order" or "index by cardinality"), explains what execution stage this creates in MongoDB (SORT stage), and states the ESR alternative and why it eliminates that stage |

**Passing bar:** Syntax is correct, field order matches E→S→R, you name the SQL approach, explain the MongoDB failure mode by stage name, and explain *why* urgency must come before appointmentDate.
