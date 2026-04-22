// Vector Search and Semantic Similarity — Embeddings-based search
// Stage 3: Implement semantic search methods

const http = require('http');

class SemanticSearch {
  constructor(db, embedServicePort = 3001) {
    this.db = db;
    this.projects = db.collection('projects');
    this.embedServicePort = embedServicePort;
  }

  /**
   * Call the embedding service to generate vector embeddings
   * Mock service returns deterministic 1536-dim vectors
   */
  async generateEmbedding(text) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify({ text });

      const options = {
        hostname: 'localhost',
        port: this.embedServicePort,
        path: '/embed',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            resolve(result.embedding);
          } catch (err) {
            reject(new Error('Failed to parse embedding response'));
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  /**
   * Calculate cosine similarity between two vectors
   * Returns value between -1 and 1 (1 = identical, 0 = orthogonal, -1 = opposite)
   */
  cosineSimilarity(vec1, vec2) {
    if (vec1.length !== vec2.length) throw new Error('Vector dimensions must match');

    let dotProduct = 0;
    let mag1 = 0;
    let mag2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      mag1 += vec1[i] * vec1[i];
      mag2 += vec2[i] * vec2[i];
    }

    mag1 = Math.sqrt(mag1);
    mag2 = Math.sqrt(mag2);

    if (mag1 === 0 || mag2 === 0) return 0; // handle zero vectors

    return dotProduct / (mag1 * mag2);
  }

  /**
   * Search projects by semantic similarity to description
   * Generates embedding for query text and compares to all projects
   */
  async searchProjectsByDescription(queryText, topK = 5) {
    try {
      // Generate embedding for search query
      const queryEmbedding = await this.generateEmbedding(queryText);

      // Fetch all projects
      const projects = await this.projects.find({}).toArray();

      // For each project, generate embedding and calculate similarity
      const projectsWithScores = await Promise.all(
        projects.map(async (project) => {
          try {
            const projectEmbedding = await this.generateEmbedding(project.description);
            const score = this.cosineSimilarity(queryEmbedding, projectEmbedding);
            return {
              ...project,
              similarity_score: score
            };
          } catch (err) {
            console.error(`Error embedding project ${project._id}:`, err.message);
            return { ...project, similarity_score: 0 };
          }
        })
      );

      // Sort by similarity and return top K
      return projectsWithScores
        .sort((a, b) => b.similarity_score - a.similarity_score)
        .slice(0, topK);
    } catch (err) {
      throw new Error(`Search failed: ${err.message}`);
    }
  }

  /**
   * Find similar projects to a given project
   * Uses the given project's description as the query
   */
  async findSimilarProjects(projectId, topK = 3) {
    try {
      const project = await this.projects.findOne({ _id: projectId });
      if (!project) throw new Error(`Project ${projectId} not found`);

      // Search excluding the original project
      const results = await this.searchProjectsByDescription(project.description, topK + 1);
      return results.filter(p => p._id !== projectId).slice(0, topK);
    } catch (err) {
      throw new Error(`Similarity search failed: ${err.message}`);
    }
  }

  /**
   * Search tasks by semantic similarity to query
   * Flattens all tasks and scores by title + description semantic match
   */
  async searchTasksByDescription(queryText, topK = 10) {
    try {
      const queryEmbedding = await this.generateEmbedding(queryText);

      // Aggregate all tasks with their parent project
      const tasksWithProjects = await this.projects
        .aggregate([
          { $unwind: '$tasks' },
          { $project: {
            project_id: '$_id',
            project_name: '$name',
            task_id: '$tasks._id',
            task_title: '$tasks.title',
            task_status: '$tasks.status',
            task_priority: '$tasks.priority',
            assigned_to: '$tasks.assigned_to'
          }}
        ])
        .toArray();

      // Score each task
      const tasksWithScores = await Promise.all(
        tasksWithProjects.map(async (task) => {
          try {
            // Embed task title (simpler than description for tasks)
            const taskEmbedding = await this.generateEmbedding(task.task_title);
            const score = this.cosineSimilarity(queryEmbedding, taskEmbedding);
            return { ...task, similarity_score: score };
          } catch (err) {
            return { ...task, similarity_score: 0 };
          }
        })
      );

      // Sort and return top K
      return tasksWithScores
        .sort((a, b) => b.similarity_score - a.similarity_score)
        .slice(0, topK);
    } catch (err) {
      throw new Error(`Task search failed: ${err.message}`);
    }
  }

  /**
   * Batch embed project descriptions for indexing
   * (In production, would store embeddings in vector index)
   */
  async indexProjectDescriptions() {
    try {
      const projects = await this.projects.find({}).toArray();
      const indexed = await Promise.all(
        projects.map(async (project) => {
          try {
            const embedding = await this.generateEmbedding(project.description);
            return {
              project_id: project._id,
              description: project.description,
              embedding_vector: embedding
            };
          } catch (err) {
            console.error(`Failed to embed project ${project._id}:`, err.message);
            return null;
          }
        })
      );

      return indexed.filter(x => x !== null);
    } catch (err) {
      throw new Error(`Indexing failed: ${err.message}`);
    }
  }

  /**
   * Find projects related by semantic content
   * Groups projects by embedding similarity to uncover patterns
   */
  async clusterProjectsByDescription(threshold = 0.5) {
    try {
      const projects = await this.projects.find({}).toArray();
      const embeddings = await Promise.all(
        projects.map(p => this.generateEmbedding(p.description))
      );

      const clusters = [];
      const visited = new Set();

      for (let i = 0; i < projects.length; i++) {
        if (visited.has(i)) continue;

        const cluster = [projects[i]];
        visited.add(i);

        for (let j = i + 1; j < projects.length; j++) {
          if (visited.has(j)) continue;
          const similarity = this.cosineSimilarity(embeddings[i], embeddings[j]);

          if (similarity >= threshold) {
            cluster.push(projects[j]);
            visited.add(j);
          }
        }

        clusters.push({
          cluster_size: cluster.length,
          projects: cluster,
          representative: cluster[0].description.substring(0, 50)
        });
      }

      return clusters;
    } catch (err) {
      throw new Error(`Clustering failed: ${err.message}`);
    }
  }
}

// Export for use in index.js
module.exports = SemanticSearch;
