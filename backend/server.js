const express = require('express');
const app = express();
const PORT = 4000;

// Middleware for JSON (optional for future POST routes)
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
  res.json({ status: "ok", message: "Backend is running" });
});

// Listen on all interfaces so Docker can expose it
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
