# Transfer Task

This task is completed **after** lab stages are finished and **after** `KNOWLEDGE.json` has been created and validated.

**Domain:** Hospital appointment scheduling system (no overlap with the domain used in this lab)

**Problem:** A hospital app runs this query thousands of times per day:

```javascript
db.appointments.find({
  doctorId: "dr-smith",
  appointmentDate: { $gte: new Date("2026-05-01"), $lte: new Date("2026-05-31") }
}).sort({ urgency: -1 })
```

The `appointments` collection has 500,000 documents. The query currently takes 800ms.

Answer the following in order:

1. **SQL instinct:** What would a SQL developer likely do when indexing this query? Name the specific column order they would choose and why.

2. **MongoDB failure mode:** What does that SQL-instinct index produce in MongoDB's query execution plan? Name the specific execution stage it introduces and explain why.

3. **ESR solution:** Design the optimal ESR index. Classify each field as E, S, or R, state the field order, and explain why placing sort before range eliminates the execution stage you named above.

4. **Explain output:** State what the explain output looks like before and after your index is applied.

---

## Scoring Rubric

| Dimension | Evidence of mastery |
|---|---|
| **Fluency** | Correct index syntax: `db.appointments.createIndex({ doctorId: 1, urgency: -1, appointmentDate: 1 })` |
| **Induction** | Field order justified by E/S/R roles — `doctorId` as E, `urgency` as S, `appointmentDate` as R — not by analogy to lab queries |
| **Sense-Making** | Explicitly names SQL instinct (e.g., column appearance order or by cardinality), explains why it causes SORT stage in MongoDB, and states the ESR alternative |

**Passing bar:** Syntax correct, field order matches E→S→R, learner names the SQL instinct, explains the MongoDB failure mode by name (SORT stage), and explains *why* urgency must come before appointmentDate — not just that it should.
