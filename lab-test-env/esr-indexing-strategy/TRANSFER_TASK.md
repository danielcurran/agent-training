# Transfer Task

**This task is completed AFTER:**
1. All lab stages are finished
2. `KNOWLEDGE.json` has been created and validated
3. You have formally recorded what you learned

Do not refer back to the lab stages, product catalog queries, or README. Reason only from what you recorded in `KNOWLEDGE.json` and from inference applied to this new context.

---

## Problem Statement

**Domain:** Surgical scheduling system for a hospital network (completely different from the product catalog domain in the lab)

**Context:** A surgical scheduling app manages bookings across multiple operating rooms. The system experiences high write volume (300+ surgeries booked per hour) and must answer the following query thousands of times per day:

```javascript
db.surgeries.find({
  operatingRoomId: "room-301",
  surgicalSpecialty: ["cardiology"],  // array field — doctors have multiple specialties
  scheduledDate: { $gte: new Date("2026-05-01"), $lte: new Date("2026-05-31") },
  priority: { $gte: 2 }  // 0=routine, 1=urgent, 2=emergency
}).sort({ estimatedDuration: -1 })
.limit(25)
```

The query currently takes 1.2 seconds on 2 million documents. Users report that the system is slow for both reads and writes.

---

## Your Task

Answer the following in order. **For each decision, explain not just what to do, but why you chose that approach — what trade-offs matter here?**

### 1. ESR Classification
Identify which fields are Equality (E), Sort (S), and Range (R). 

If you have multiple fields in a role, prioritize them: which equality field matters most for selectivity? Which range field is most restrictive? Explain your reasoning.

### 2. Index Strategy Decision
Design your index strategy. Consider:
- Should you include all fields, or omit one of the range fields to reduce index size and write overhead?
- The surgicalSpecialty field is an array. What does indexing an array field do to index size and write performance? Is it worth it for this query pattern?
- Given the high write volume, is there a trade-off between query speed and insert performance?

State your final index design and explain the trade-offs you accepted and rejected.

### 3. Failure Modes (Without Your Index)
What does MongoDB's default behavior produce for this query without your index? Name the execution stage(s) that appear. Could the query use a partial index or a different strategy to reduce write overhead?

### 4. Your Index and Why It Solves the Problem
State your index syntax and explain why it eliminates the failure modes you identified above. If you omitted any fields, explain why the selectivity benefit of what you *did* include outweighs the cost of not including them.

---

## Scoring Rubric (For Reference)

| Dimension | Mastery Indicator |
|---|---|
| **Fluency** | Correct MongoDB index syntax for your chosen fields |
| **Induction** | E/S/R roles identified correctly; reasoning about field priority and trade-offs — not mechanical application of ESR |
| **Sense-Making** | Explains the failure modes MongoDB would encounter; articulates the trade-off between read speed and write volume; justifies whether to include all fields or optimize for write performance |

**Passing bar:** 
- E/S/R classification is sound
- Index syntax is correct
- You explain WHY you prioritized certain fields (selectivity reasoning)
- You explicitly consider write volume and index size trade-offs
- You explain what execution stage(s) would appear without the index
