# Aggregation Foundations — Your Pipeline Design

Replace this placeholder with your aggregation pipeline design for the transfer task.

## Task

Design a pipeline for a dashboard showing per-genre revenue analytics. Requirements:
- Total revenue per genre
- Average book price per genre
- Number of **unique customers** who purchased in that genre (Hint: consider how you'd track unique customers — look up `$addToSet`)
- Filter: only genres with >$5,000 in revenue
- Sort: by revenue descending
- Limit: top 5 genres

## Your Pipeline Design

For each stage, fill in:

```
Stage 1: [Stage Name]
- Transformation: [what it does]
- Fields: [which fields involved]
- Connection: [how it connects to the previous/next stage]

Stage 2: [Stage Name]
- Transformation: ...
- Fields: ...
- Connection: ...
```

*(Continue for each stage you need)*

## Notes

*(Optional — add any observations about stage sequencing, data flow, or design decisions here)*
