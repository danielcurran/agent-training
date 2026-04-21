const fs = require('fs');
const path = require('path');

function checkReflection() {
  const results = [];
  let passed = true;

  const notesPath = path.join(__dirname, '..', 'NOTES.md');

  if (!fs.existsSync(notesPath)) {
    console.log('✗ NOTES.md: not found — create it in the project root');
    console.log('\nStage 3: FAIL');
    process.exit(1);
  }

  results.push('✓ NOTES.md: exists');
  const content = fs.readFileSync(notesPath, 'utf8');

  const section1 = content.match(/##\s+What a MongoDB Document Is\s*\n+([\s\S]*?)(?=##|$)/);
  section1 && section1[1].trim().length > 10
    ? results.push('✓ Section "What a MongoDB Document Is": present, non-empty')
    : (results.push('✗ Section "What a MongoDB Document Is": missing or empty'), passed = false);

  const section2 = content.match(/##\s+What insertOne\(\) Does Differently[\s\S]*?\n+([\s\S]*?)(?=##|$)/);
  section2 && section2[1].trim().length > 10
    ? results.push('✓ Section "What insertOne() Does Differently": present, non-empty')
    : (results.push('✗ Section "What insertOne() Does Differently": missing or empty'), passed = false);

  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
  wordCount >= 20
    ? results.push(`✓ Minimum length: ${wordCount} words (≥ 20 required)`)
    : (results.push(`✗ Minimum length: ${wordCount} words — need at least 20`), passed = false);

  results.forEach(r => console.log(r));
  console.log('');
  console.log(passed ? 'Stage 3: PASS' : 'Stage 3: FAIL');
  if (!passed) process.exit(1);
}

checkReflection();