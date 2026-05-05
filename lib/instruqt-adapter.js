/**
 * Instruqt API Adapter
 * 
 * Provides utilities for the learner agent to interact with Instruqt labs
 * via the Instruqt API instead of local Docker/npm.
 * 
 * Usage:
 *   const adapter = new InstruqtAdapter(apiToken, trackSlug);
 *   const env = await adapter.getEnvironment(challengeId);
 *   const result = await adapter.executeCommand(env.id, 'npm run seed');
 */

const https = require('https');

class InstruqtAdapter {
  constructor(apiToken, trackSlug) {
    this.apiToken = apiToken;
    this.trackSlug = trackSlug;
    this.baseUrl = 'https://api.instruqt.com/v1';
    this.headers = {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
      'User-Agent': 'LearnerAgent/1.0'
    };
  }

  /**
   * Make an HTTPS request to Instruqt API
   */
  async request(method, path, body = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(this.baseUrl + path);
      const options = {
        method,
        headers: this.headers,
        hostname: url.hostname,
        path: url.pathname + url.search
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode >= 400) {
              reject(new Error(`Instruqt API error (${res.statusCode}): ${parsed.message || data}`));
            } else {
              resolve(parsed);
            }
          } catch (e) {
            reject(new Error(`Failed to parse response: ${data}`));
          }
        });
      });

      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  /**
   * Get a challenge environment (sandbox session)
   * Returns lab environment ID for executing commands
   */
  async getEnvironment(challengeId) {
    try {
      const response = await this.request('GET', `/tracks/${this.trackSlug}/challenges/${challengeId}`);
      return {
        id: response.challenge.id,
        name: response.challenge.title,
        slug: response.challenge.slug
      };
    } catch (error) {
      throw new Error(`Failed to get challenge environment: ${error.message}`);
    }
  }

  /**
   * Execute a command in the Instruqt sandbox
   * Returns stdout/stderr output
   */
  async executeCommand(challengeId, command, options = {}) {
    const timeout = options.timeout || 30000; // 30s default
    const shell = options.shell || '/bin/bash';

    try {
      const payload = {
        command,
        shell,
        timeout_seconds: Math.ceil(timeout / 1000)
      };

      const response = await this.request(
        'POST',
        `/challenges/${challengeId}/execute`,
        payload
      );

      return {
        exitCode: response.exit_code || 0,
        stdout: response.stdout || '',
        stderr: response.stderr || '',
        success: (response.exit_code || 0) === 0
      };
    } catch (error) {
      throw new Error(`Command execution failed: ${error.message}`);
    }
  }

  /**
   * List all challenges in the track
   * Helps map stages to challenges
   */
  async listChallenges() {
    try {
      const response = await this.request('GET', `/tracks/${this.trackSlug}/challenges`);
      return response.challenges || [];
    } catch (error) {
      throw new Error(`Failed to list challenges: ${error.message}`);
    }
  }

  /**
   * Get challenge details (check for instructions, validation scripts)
   */
  async getChallengeDetails(challengeId) {
    try {
      const response = await this.request('GET', `/challenges/${challengeId}`);
      return {
        id: response.challenge.id,
        title: response.challenge.title,
        slug: response.challenge.slug,
        description: response.challenge.description,
        notes: response.challenge.notes
      };
    } catch (error) {
      throw new Error(`Failed to get challenge details: ${error.message}`);
    }
  }

  /**
   * Check if a challenge is complete (validation passed)
   */
  async checkChallengeStatus(challengeId) {
    try {
      const response = await this.request('GET', `/challenges/${challengeId}/status`);
      return {
        solved: response.challenge_status.solved || false,
        passed: response.challenge_status.passed_checks || 0,
        totalChecks: response.challenge_status.total_checks || 0
      };
    } catch (error) {
      throw new Error(`Failed to check challenge status: ${error.message}`);
    }
  }

  /**
   * Get file from sandbox
   */
  async readFile(challengeId, filePath) {
    try {
      const response = await this.request(
        'GET',
        `/challenges/${challengeId}/files?path=${encodeURIComponent(filePath)}`
      );
      return response.content || '';
    } catch (error) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }

  /**
   * Write file to sandbox
   */
  async writeFile(challengeId, filePath, content) {
    try {
      await this.request(
        'POST',
        `/challenges/${challengeId}/files`,
        { path: filePath, content }
      );
      return true;
    } catch (error) {
      throw new Error(`Failed to write file: ${error.message}`);
    }
  }

  /**
   * Map Instruqt challenges to learner stages
   * Returns array of {stage, challengeId, title}
   */
  async mapStagesToChallenges() {
    try {
      const challenges = await this.listChallenges();
      
      // Standard stage order (customize per track if needed)
      const stageOrder = ['schema', 'dal', 'vector', 'final', 'reflection'];
      
      const mapped = challenges
        .map(ch => {
          const slug = ch.slug.toLowerCase();
          const stage = stageOrder.find(s => slug.includes(s)) || slug;
          return {
            stage,
            challengeId: ch.id,
            title: ch.title,
            slug: ch.slug,
            order: stageOrder.indexOf(stage)
          };
        })
        .sort((a, b) => {
          // Put unknown stages at end
          if (a.order === -1) return 1;
          if (b.order === -1) return -1;
          return a.order - b.order;
        });

      return mapped;
    } catch (error) {
      throw new Error(`Failed to map stages: ${error.message}`);
    }
  }
}

module.exports = InstruqtAdapter;
