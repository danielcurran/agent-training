// Data Access Layer (DAL) — MongoDB Query Optimization
// Implements query patterns for the embedded task schema

const { MongoClient } = require('mongodb');
require('dotenv').config();

class ProjectDAL {
  constructor(db) {
    this.db = db;
    this.projects = db.collection('projects');
    this.users = db.collection('users');
  }

  // Stage 2: Query Methods

  /**
   * Get all active projects with their embedded tasks
   * Uses: find() with status filter, sort by priority
   */
  async getActiveProjects() {
    return await this.projects
      .find({ status: 'active' })
      .sort({ priority: 1 })
      .toArray();
  }

  /**
   * Get a single project with all its embedded tasks
   * Uses: findOne() by _id, returns full document including tasks array
   */
  async getProjectWithTasks(projectId) {
    return await this.projects.findOne({ _id: projectId });
  }

  /**
   * Find all tasks across all projects for a given user
   * Uses: find() with $eq filter on embedded array field (assigned_to)
   * This requires index on projects.tasks.assigned_to
   */
  async getTasksAssignedToUser(userId) {
    return await this.projects
      .find({ 'tasks.assigned_to': userId })
      .project({ tasks: { $filter: { input: '$tasks', as: 'task', cond: { $eq: ['$$task.assigned_to', userId] } } } })
      .toArray();
  }

  /**
   * Find high-priority tasks (priority=1) across active projects
   * Uses: find() with $and compound query on multiple fields
   * Demonstrates MongoDB query operators and filtering nested arrays
   */
  async getHighPriorityTasks() {
    return await this.projects
      .aggregate([
        { $match: { status: 'active' } },
        { $unwind: '$tasks' },
        { $match: { 'tasks.priority': 1 } },
        { $sort: { 'tasks.priority': 1, 'tasks._id': 1 } },
        { $group: { _id: '$_id', project_name: { $first: '$name' }, tasks: { $push: '$tasks' } } }
      ])
      .toArray();
  }

  /**
   * Get tasks by status across all projects
   * Uses: aggregate() pipeline with $match, $unwind, $group for data transformation
   */
  async getTasksByStatus(status) {
    return await this.projects
      .aggregate([
        { $unwind: '$tasks' },
        { $match: { 'tasks.status': status } },
        { $sort: { 'tasks.created_at': -1 } },
        { $limit: 10 }
      ])
      .toArray();
  }

  /**
   * Add a new task to a project
   * Uses: updateOne() with $push atomic operator to append to tasks array
   * Atomic ensures no race condition when multiple agents write tasks
   */
  async addTaskToProject(projectId, taskData) {
    const task = {
      _id: `task-${Date.now()}`,
      title: taskData.title,
      status: 'pending',
      priority: taskData.priority || 2,
      assigned_to: taskData.assigned_to,
      created_at: new Date()
    };

    return await this.projects.updateOne(
      { _id: projectId },
      { $push: { tasks: task } }
    );
  }

  /**
   * Update task status
   * Uses: updateOne() with $set on nested array element
   * Uses positional $ operator to target specific array element
   */
  async updateTaskStatus(projectId, taskId, newStatus) {
    return await this.projects.updateOne(
      { _id: projectId, 'tasks._id': taskId },
      { $set: { 'tasks.$.status': newStatus, 'tasks.$.updated_at': new Date() } }
    );
  }

  /**
   * Remove a task from a project
   * Uses: updateOne() with $pull atomic operator to remove from array
   */
  async removeTask(projectId, taskId) {
    return await this.projects.updateOne(
      { _id: projectId },
      { $pull: { tasks: { _id: taskId } } }
    );
  }

  /**
   * Count tasks by status for a project
   * Uses: aggregate() with $unwind, $group, $count for analytics
   */
  async countTasksByStatus(projectId) {
    return await this.projects
      .aggregate([
        { $match: { _id: projectId } },
        { $unwind: '$tasks' },
        { $group: { _id: '$tasks.status', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ])
      .toArray();
  }

  /**
   * Get user details for a task (join with users collection)
   * Uses: aggregation $lookup to join users collection
   */
  async getTaskWithUserDetails(projectId, taskId) {
    const result = await this.projects
      .aggregate([
        { $match: { _id: projectId } },
        { $unwind: '$tasks' },
        { $match: { 'tasks._id': taskId } },
        {
          $lookup: {
            from: 'users',
            localField: 'tasks.assigned_to',
            foreignField: '_id',
            as: 'assignee'
          }
        },
        { $unwind: { path: '$assignee', preserveNullAndEmptyArrays: true } }
      ])
      .toArray();

    return result[0] || null;
  }

  /**
   * Bulk update: reassign tasks from one user to another
   * Uses: updateMany() with compound filter and $set for multiple documents
   */
  async reassignTasksFromUser(oldUserId, newUserId) {
    return await this.projects.updateMany(
      { 'tasks.assigned_to': oldUserId },
      { $set: { 'tasks.$[elem].assigned_to': newUserId } },
      { arrayFilters: [{ 'elem.assigned_to': oldUserId }] }
    );
  }
}

// Export for use in index.js
module.exports = ProjectDAL;
