const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 4000;

// ----------------------
// Middleware
// ----------------------
app.use(cors());
app.use(express.json());

// ----------------------
// Menu & Rules
// ----------------------
const menuRoutes = require('./menu');
app.use('/api/menu', menuRoutes);

// Import menuTiers for validation
const { menuTiers } = require('./menu');

// ----------------------
// Game State
// ----------------------
const gameState = {
  players: [],      // { id, name, hand: [], score }
  deck: [],         // cards left in the deck
  round: 1,
  submissions: []   // { playerId, course, tier, cards }
};

// ----------------------
// Deck setup
// ----------------------
const cardTypes = [
  "Protein",
  "Veggie",
  "Carb",
  "Fats/Oils",
  "Fruits",
  "Sauces",
  "Sweets"
];

// Shuffle helper
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// Reset deck
function resetDeck() {
  gameState.deck = [];
  cardTypes.forEach(type => {
    for (let i = 0; i < 10; i++) { // 10 copies of each type
      gameState.deck.push({ type });
    }
  });
  gameState.deck = shuffle(gameState.deck);
}

// Deal hand
function dealHand() {
  const hand = [];
  for (let i = 0; i < 5; i++) {
    if (gameState.deck.length === 0) resetDeck();
    hand.push(gameState.deck.pop());
  }
  return hand;
}

// Initialize deck
resetDeck();

// ----------------------
// Routes
// ----------------------

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ status: "ok", message: "Backend is running" });
});

// Join game
app.post('/api/join', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name required" });

  const playerId = uuidv4();
  const hand = dealHand();
  const player = { id: playerId, name, hand, score: 0 };

  gameState.players.push(player);
  res.json({ playerId, hand });
});

// Get player hand
app.get('/api/hand/:playerId', (req, res) => {
  const player = gameState.players.find(p => p.id === req.params.playerId);
  if (!player) return res.status(404).json({ error: "Player not found" });
  res.json({ hand: player.hand });
});

// Submit cards for a round (with course/tier validation)
app.post('/api/submit', (req, res) => {
  const { playerId, course, tier, cards } = req.body;

  if (!playerId || !course || !tier || !cards || !Array.isArray(cards)) {
    return res.status(400).json({ error: "playerId, course, tier, and cards array required" });
  }

  const player = gameState.players.find(p => p.id === playerId);
  if (!player) return res.status(404).json({ error: "Player not found" });

  // Check player has these cards
  const handCounts = {};
  player.hand.forEach(c => handCounts[c.type] = (handCounts[c.type] || 0) + 1);
  const submitCounts = {};
  cards.forEach(c => submitCounts[c.type] = (submitCounts[c.type] || 0) + 1);
  for (const type in submitCounts) {
    if (!handCounts[type] || submitCounts[type] > handCounts[type]) {
      return res.status(400).json({ error: `You do not have enough cards of type ${type}` });
    }
  }

  // Validate against menu
  if (!menuTiers[course]) return res.status(400).json({ error: "Invalid course" });
  const tierObj = menuTiers[course].find(t => t.tier === tier);
  if (!tierObj) return res.status(400).json({ error: "Invalid tier for course" });

  const counts = {};
  cards.forEach(c => counts[c.type] = (counts[c.type] || 0) + 1);
  for (const [ing, qty] of Object.entries(tierObj.ingredientsRequired)) {
    if ((counts[ing] || 0) < qty) {
      return res.status(400).json({ error: "Submitted cards do not meet required ingredients" });
    }
  }

  // Remove submitted cards from player's hand
  player.hand = player.hand.filter(card => {
    if (submitCounts[card.type]) {
      submitCounts[card.type]--;
      return false;
    }
    return true;
  });

  // Record submission
  gameState.submissions.push({ playerId, course, tier, cards });
  res.json({ success: true });
});

// Get round results
app.get('/api/round/:roundNumber', (req, res) => {
  res.json({ round: req.params.roundNumber, submissions: gameState.submissions });
});

// ----------------------
// Start server
// ----------------------
app.listen(PORT, '0.0.0.0', () => console.log(`Server listening on port ${PORT}`));
