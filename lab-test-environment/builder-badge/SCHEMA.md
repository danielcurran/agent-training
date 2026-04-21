# Schema Design: Builder Badge Application

## Current Schema

The application currently uses a **flat, SQL-normalized schema** with three collections:

### Collections

**projects**
- `_id`: string (proj-1, proj-2, proj-3)
- `name`: string
- `status`: string (active, paused)
- `priority`: number (1, 2, 3)
- `description`: string

**tasks**
- `_id`: string (task-1, task-2, task-3)
- `title`: string
- `project_id`: string (foreign key reference to projects)
- `status`: string (in_progress, completed, pending)
- `priority`: number (1, 2)
- `assigned_to`: string (user ID: alice, bob)

**users**
- `_id`: string (alice, bob)
- `name`: string
- `email`: string
- `role`: string (engineer, designer)

### Issues with Current Design

1. **Normalized foreign keys**: Tasks reference projects and users by `project_id` and `assigned_to` string IDs, requiring separate queries
2. **No denormalization**: User info (name, email, role) must be looked up separately
3. **No embedding**: One-to-many relationships (project → tasks) require joins
4. **Query inefficiency**: Finding all tasks for a project requires filtering on `project_id` field, which lacks an index
5. **Schema is SQL-first**: Data model optimized for relational normalization, not MongoDB document patterns

## Design Decision

**Embed tasks within projects, maintain user references (shallow embedding)**

Rationale:
- Projects always need their tasks (high affinity)
- Users are referenced from multiple collections (tasks, potentially other entities), so full embedding creates duplication
- Hybrid approach: deeply embed what belongs to a single parent, shallow-reference what's shared

### Proposed Schema

**projects** (denormalized with embedded tasks)
```javascript
{
  _id: ObjectId,
  name: string,
  status: string,
  priority: number,
  description: string,
  tasks: [
    {
      _id: ObjectId,
      title: string,
      status: string,
      priority: number,
      assigned_to: string,  // user reference
      created_at: date
    }
  ],
  created_at: date,
  updated_at: date
}
```

**users** (unchanged, referenced from embedded tasks)
```javascript
{
  _id: string,
  name: string,
  email: string,
  role: string
}
```

**Indexes**
- `projects._id` (primary, auto-created)
- `projects.status` (for filtering active/paused)
- `projects.tasks.assigned_to` (for finding tasks assigned to user)
- `projects.tasks.status` (for filtering task statuses)
- `users._id` (primary, auto-created)

## Rationale

1. **Better query performance**: Fetch project with all tasks in a single query instead of separate project + filter tasks queries
2. **MongoDB-native**: Uses document embedding for parent-child relationships (project → tasks)
3. **Maintains flexibility**: Can still reference users without embedding (user data evolves independently)
4. **Supports updates**: Can use `$push` to add tasks, `$pull` to remove, `$set` to update nested fields atomically
5. **Scales for read-heavy**: Projects and tasks are read together frequently (UI needs both)
6. **Denormalization trade-off accepted**: If a task detail changes (title, priority), it updates atomically within project
7. **Avoids the "costly join" problem**: No need to query multiple collections to show project + tasks

## Migration Path

From current flat schema:
1. Fetch all projects
2. For each project, fetch all tasks where `project_id` matches
3. Create nested `tasks` array in project document
4. Re-insert projects with embedded tasks
5. Drop old `tasks` collection (or keep for archival)

This design aligns with MongoDB's document-oriented paradigm while maintaining the flexibility to reference shared entities like users.
