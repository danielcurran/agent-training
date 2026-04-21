const fs = require('fs');
const path = require('path');

function checkReflection() {
  const results = [];
  let passed = true;

  const reflectionPath = path.join(__dirname, '..', 'REFLECTION.md');
  if (!fs.existsSync(reflectionPath)) {
    console.log('✗ REFLECTION.md: not found');
    console.log('Stage 4: FAIL');
    process.exit(1);
  }

  results.push('✓ REFLECTION.md: exists');
  const content = fs.readFileSync(reflectionPath, 'utf8');

  // Check required sections
  const sections = [
    'What You Learned',
    'Design Decisions',
    'Tradeoffs',
    'What Surprised You'
  ];

  sections.forEach(section => {
    if (content.includes(`## ${section}`)) {
      results.push(`✓ Section "${section}": present`);
    } else {
      results.push(`✗ Section "${section}": missing`);
      passed = false;
    }
  });

  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount >= 200) {
    results.push(`✓ Minimum length: ${wordCount} words (≥ 200)`);
  } else {
    results.push(`✗ Minimum length: ${wordCount} words (need ≥ 200)`);
    passed = false;
  }

  results.forEach(r => console.log(r));
  console.log('');
  console.log(passed ? 'Stage 4: PASS' : 'Stage 4: FAIL');
  if (!passed) process.exit(1);
}

checkReflection();
