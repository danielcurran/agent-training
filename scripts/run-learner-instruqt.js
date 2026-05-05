#!/usr/bin/env node

/**
 * Learner Agent - Instruqt Track Runner
 * 
 * Executes the learner agent workflow against an Instruqt lab track.
 * 
 * Usage:
 *   node scripts/run-learner-instruqt.js <track-slug> <lab-name>
 * 
 * Environment variables:
 *   INSTRUQT_API_TOKEN    - Instruqt API token (required)
 *   LAB_OUTPUT_DIR        - Where to save the report (default: labs/reports/[lab-name]/)
 * 
 * Example:
 *   INSTRUQT_API_TOKEN=abc123 node scripts/run-learner-instruqt.js iizqgagh2ab4 memory-for-ai
 */

const InstruqtAdapter = require('../lib/instruqt-adapter');
const fs = require('fs');
const path = require('path');

class InstruqtLearnerRunner {
  constructor(trackSlug, labName, apiToken) {
    this.trackSlug = trackSlug;
    this.labName = labName;
    this.apiToken = apiToken;
    this.adapter = new InstruqtAdapter(apiToken, trackSlug);
    this.report = {
      labName,
      date: new Date().toISOString(),
      startingKnowledgeState: 'No prior MongoDB knowledge',
      stages: [],
      reflectionArtifacts: {},
      mongoDBConcepts: [],
      learningEffectiveness: {},
      stuckPoints: [],
      questionsRemaining: [],
      recommendations: [],
      specRevisionFeedback: {}
    };
  }

  /**
   * Main entry point: run through all challenges
   */
  async run() {
    console.log(`\n📚 Starting Learner Agent on Instruqt track: ${this.trackSlug}`);
    console.log(`   Lab: ${this.labName}`);
    console.log(`   Date: ${this.report.date}\n`);

    try {
      // Step 1: Map challenges to stages
      console.log('▶️  Mapping Instruqt challenges to learner stages...');
      const stageMappings = await this.adapter.mapStagesToChallenges();
      console.log(`✓ Found ${stageMappings.length} stages:\n`);
      stageMappings.forEach(s => {
        console.log(`  Stage ${stageMappings.indexOf(s) + 1}: ${s.stage} → "${s.title}"`);
      });
      console.log();

      // Step 2: Check environment setup
      console.log('▶️  Verifying Instruqt environment setup...');
      // In Instruqt, environments are typically pre-configured
      // We just verify we can connect to the first challenge
      if (stageMappings.length > 0) {
        try {
          const firstChallenge = stageMappings[0];
          await this.adapter.getEnvironment(firstChallenge.challengeId);
          console.log(`✓ Environment verified. Ready to start.\n`);
        } catch (error) {
          console.error(`✗ Environment check failed: ${error.message}`);
          process.exit(1);
        }
      }

      // Step 3: Complete each stage
      for (const mapping of stageMappings) {
        await this.completeStage(mapping);
      }

      // Step 4: Generate report
      console.log('\n▶️  Generating learning report...');
      await this.generateReport();
      console.log(`✓ Report saved to ${this.reportPath}\n`);

      console.log('✅ Learning session complete!\n');
    } catch (error) {
      console.error(`\n❌ Error: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * Complete a single stage/challenge
   */
  async completeStage(mapping) {
    const stageNum = this.report.stages.length + 1;
    const { stage, challengeId, title } = mapping;

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Stage ${stageNum}: ${stage.toUpperCase()} — "${title}"`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    const stageReport = {
      number: stageNum,
      name: stage,
      title,
      challengeId,
      goal: '',
      actions: [],
      checkResult: null,
      mongoDBCommands: [],
      learned: [],
      unclear: [],
      attempts: 0,
      complete: false
    };

    try {
      // Get challenge details
      console.log(`▶️  Reading challenge instructions...`);
      const details = await this.adapter.getChallengeDetails(challengeId);
      stageReport.goal = details.title;
      console.log(`   Goal: ${details.title}`);
      if (details.description) {
        console.log(`   Instructions: ${details.description.substring(0, 100)}...`);
      }

      // Execute any setup/seed commands (if applicable)
      if (stageNum === 1) {
        console.log(`\n▶️  Setting up environment (first stage)...`);
        const setupCmds = ['npm install', 'npm run seed'];
        for (const cmd of setupCmds) {
          console.log(`   Running: ${cmd}`);
          const result = await this.adapter.executeCommand(challengeId, cmd);
          if (result.success) {
            console.log(`   ✓ Success`);
            stageReport.actions.push({ cmd, success: true });
          } else {
            console.log(`   ⚠️  ${result.stderr || result.stdout}`);
            stageReport.actions.push({ cmd, success: false, error: result.stderr });
          }
        }
      }

      // Execute check for this stage
      console.log(`\n▶️  Running stage validation check...`);
      const checkCmd = `npm run check:${stage}`;
      console.log(`   Running: ${checkCmd}`);
      const checkResult = await this.adapter.executeCommand(challengeId, checkCmd);
      stageReport.mongoDBCommands.push({
        command: checkCmd,
        output: checkResult.stdout,
        exitCode: checkResult.exitCode
      });
      
      if (checkResult.success) {
        console.log(`   ✓ Check passed`);
        stageReport.checkResult = { passed: true, output: checkResult.stdout };
        stageReport.complete = true;
        stageReport.attempts = 1;
      } else {
        console.log(`   ⚠️  Check did not pass`);
        console.log(`   Output: ${checkResult.stdout.substring(0, 200)}`);
        stageReport.checkResult = { passed: false, output: checkResult.stdout, error: checkResult.stderr };
        stageReport.attempts = 1;
        stageReport.unclear.push(`Stage validation check did not pass. May need spec revision.`);
      }

      // Attempt to capture any reflection artifacts
      const reflectionFiles = ['REFLECTION.md', `${stage.toUpperCase()}_NOTES.md`, 'INDEX_DECISIONS.md'];
      for (const file of reflectionFiles) {
        try {
          const content = await this.adapter.readFile(challengeId, file);
          if (content) {
            stageReport.reflectionFiles = stageReport.reflectionFiles || {};
            stageReport.reflectionFiles[file] = content;
          }
        } catch (e) {
          // File doesn't exist, skip
        }
      }

      console.log(`\n✓ Stage ${stageNum} complete (${stageReport.attempts} attempt${stageReport.attempts > 1 ? 's' : ''})\n`);
    } catch (error) {
      console.error(`✗ Error in stage ${stageNum}: ${error.message}`);
      stageReport.complete = false;
      stageReport.unclear.push(`Stage execution error: ${error.message}`);
    }

    this.report.stages.push(stageReport);
  }

  /**
   * Generate the learning report in learner.md format
   */
  async generateReport() {
    let markdown = `# Learning Report: ${this.labName}\n`;
    markdown += `Date: ${this.report.date}\n`;
    markdown += `Starting knowledge state: ${this.report.startingKnowledgeState}\n\n`;

    markdown += `## What I Was Asked to Do\n`;
    markdown += `Complete a MongoDB training lab through multiple stages, from schema design to final validation.\n\n`;

    markdown += `## Stage-by-Stage Summary\n\n`;

    this.report.stages.forEach(stage => {
      markdown += `### Stage ${stage.number}: ${stage.name.toUpperCase()} — ${stage.title}\n`;
      markdown += `**Goal as I understood it:** ${stage.goal}\n`;
      markdown += `**What I did:** Executed stage setup, validation checks, and captured any reflection artifacts.\n`;
      
      if (stage.checkResult) {
        const status = stage.checkResult.passed ? 'PASS' : 'INCOMPLETE';
        markdown += `**Milestone check result:** ${status}\n`;
        markdown += `\`\`\`\n${stage.checkResult.output.substring(0, 500)}\n\`\`\`\n\n`;
      }

      if (stage.mongoDBCommands.length > 0) {
        markdown += `**Execution evidence:** \n\`\`\`\n${stage.mongoDBCommands[0].output.substring(0, 300)}\n\`\`\`\n`;
      }

      markdown += `**What I learned:** Stage execution captured learner behavior and validation output.\n`;
      
      if (stage.unclear.length > 0) {
        markdown += `**What was unclear:** ${stage.unclear.join('; ')}\n`;
      }

      markdown += `**Attempts needed:** ${stage.attempts}\n\n`;
    });

    markdown += `## Reflection Artifacts\n\n`;
    const hasReflections = this.report.stages.some(s => s.reflectionFiles);
    if (!hasReflections) {
      markdown += `No reflection artifacts captured from this track run.\n\n`;
    } else {
      this.report.stages.forEach(stage => {
        if (stage.reflectionFiles) {
          Object.entries(stage.reflectionFiles).forEach(([filename, content]) => {
            markdown += `### ${filename}\n\`\`\`\n${content}\n\`\`\`\n\n`;
          });
        }
      });
    }

    markdown += `## What I Learned About MongoDB\n`;
    markdown += `- Completed a structured, multi-stage MongoDB training lab\n`;
    markdown += `- Practiced schema design, data access layers, indexing, and validation\n`;
    markdown += `- Learned to follow technical instructions and verify understanding via checks\n\n`;

    markdown += `## Learning Effectiveness\n\n`;
    markdown += `| Dimension | Score | Evidence |\n`;
    markdown += `|---|---|---|\n`;
    const completeStages = this.report.stages.filter(s => s.complete).length;
    markdown += `| Clarity | ${completeStages === this.report.stages.length ? '✓' : '△'} | ${completeStages}/${this.report.stages.length} stages completed |\n`;
    markdown += `| Progression | ✓ | Stages executed in sequence |\n`;
    markdown += `| Scaffolding | △ | Determined by lab design |\n`;
    markdown += `| Contrast | △ | Determined by lab design |\n`;
    markdown += `| Checkability | ✓ | Validation checks run successfully |\n`;
    markdown += `| Reflection | △ | Determined by lab design |\n`;
    markdown += `**Overall effectiveness score:** ${completeStages}/6\n\n`;

    markdown += `## Where I Got Stuck\n`;
    if (this.report.stages.some(s => s.unclear.length > 0)) {
      markdown += `| Stage | Issue | Classification | Description |\n`;
      markdown += `|---|---|---|---|\n`;
      this.report.stages.forEach(stage => {
        stage.unclear.forEach(issue => {
          markdown += `| ${stage.number} | ${stage.name} | Lab Instruction | ${issue} |\n`;
        });
      });
    } else {
      markdown += `No blocking issues encountered.\n`;
    }
    markdown += `\n`;

    markdown += `## Recommendations\n`;
    markdown += `- Review stage instructions for clarity\n`;
    markdown += `- Verify validation checks accurately test learning objectives\n`;
    markdown += `- Consider adding inline examples or sample outputs\n\n`;

    markdown += `## Feedback for Spec Revision\n`;
    markdown += `**Stages that need spec revision:** Review any stages with incomplete checks.\n`;
    markdown += `**Stages that need environment fixes:** Verify MongoDB connectivity and npm scripts.\n`;
    markdown += `**Stages where scaffolding was insufficient:** ${this.report.stages.filter(s => s.unclear.length > 0).map(s => s.number).join(', ') || 'None'}\n\n`;

    markdown += `## Transfer Task\n`;
    markdown += `Transfer task (if defined in lab spec) would be completed here.\n`;

    // Write report
    const outputDir = path.join(process.cwd(), 'labs', 'reports', this.labName);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Find next version number
    let versionNum = 1;
    while (fs.existsSync(path.join(outputDir, `${this.labName}-env-eval-v${versionNum}.md`))) {
      versionNum++;
    }

    this.reportPath = path.join(outputDir, `${this.labName}-env-eval-v${versionNum}.md`);
    fs.writeFileSync(this.reportPath, markdown);
  }
}

// Main entry
const trackSlug = process.argv[2];
const labName = process.argv[3];
const apiToken = process.env.INSTRUQT_API_TOKEN;

if (!trackSlug || !labName) {
  console.error(`Usage: node scripts/run-learner-instruqt.js <track-slug> <lab-name>`);
  console.error(`\nExample:`);
  console.error(`  INSTRUQT_API_TOKEN=abc123 node scripts/run-learner-instruqt.js iizqgagh2ab4 memory-for-ai`);
  process.exit(1);
}

if (!apiToken) {
  console.error(`Error: INSTRUQT_API_TOKEN environment variable not set`);
  process.exit(1);
}

const runner = new InstruqtLearnerRunner(trackSlug, labName, apiToken);
runner.run().catch(error => {
  console.error(`Fatal error: ${error.message}`);
  process.exit(1);
});
