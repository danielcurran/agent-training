const express = require('express');
const app = express();
app.use(express.json());

// Returns a deterministic mock embedding (1536 dimensions)
app.post('/embed', (req, res) => {
  const text = req.body?.text;
  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'text field required and must be non-empty string' });
  }
  const seed = text.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const embedding = Array.from({ length: 1536 }, (_, i) => 
    Math.sin(seed + i) * 0.5
  );
  res.json({ embedding });
});

app.get('/health', (_, res) => res.json({ ok: true }));
app.listen(3001, () => console.log('Mock embed server running on :3001'));