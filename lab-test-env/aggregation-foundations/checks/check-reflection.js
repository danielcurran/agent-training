// filepath: checks/check-reflection.js
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

async function checkReflection() {
  let passed = 0;
  let failed = 0;

  function pass(msg) { console.log(`  ✓ ${msg}`); passed++; }
  function fail(msg) { console.error(`  ✗ ${msg}`); failed++; }

  // Check 1: File exists at lab root
  const reflectionPath = path.join(ROOT, 'REFLECTION.md');
  if (!fs.existsSync(reflectionPath)) {
    fail('REFLECTION.md not found at lab root. Create this file and write your pipeline design.');
    return { pass: false, error: 'REFLECTION.md not found at lab root', passed, failed };
  }
  pass('REFLECTION.md exists');

  const content = fs.readFileSync(reflectionPath, 'utf-8');

  // Check 2: Minimum length
  if (content.trim().length < 150) {
    fail('REFLECTION.md is too short. Provide a complete pipeline design (minimum ~150 characters).');
    return { pass: false, error: 'REFLECTION.md is too short', passed, failed };
  }
  pass(`REFLECTION.md has sufficient content (${content.trim().length} characters)`);

  // Check 3: Required stage names present
  const requiredStages = ['$match', '$unwind', '$group', '$sort', '$limit'];
  const missingStages = requiredStages.filter(stage => !content.includes(stage));
  if (missingStages.length > 0) {
    fail(`Pipeline design is missing required stages: ${missingStages.join(', ')}`);
    return { pass: false, error: `Missing required stages: ${missingStages.join(', ')}`, passed, failed };
  }
  pass('All required stage names present ($match, $unwind, $group, $sort, $limit)');

  // Check 4: Groups by genre
  if (!content.toLowerCase().includes('genre')) {
    fail('Pipeline design must reference grouping by genre');
    return { pass: false, error: 'Pipeline design must reference grouping by genre', passed, failed };
  }
  pass('Design references genre grouping');

  // Check 5: Revenue accumulation
  if (!content.includes('$sum') && !content.toLowerCase().includes('revenue')) {
    fail('Pipeline design must describe revenue accumulation (e.g., $sum or totalRevenue)');
    return { pass: false, error: 'Pipeline design must describe revenue accumulation', passed, failed };
  }
  pass('Design describes revenue accumulation');

  return {
    pass: true,
    message: `Reflection check passed (${passed} checks). Flag for human review if borderline.`,
    passed,
    failed
  };
}

module.exports = { checkReflection };
