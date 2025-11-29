const express = require('express');
const router = express.Router();

// ----------------------
// Menu structure
// ----------------------
const menuTiers = {
  Appetizer: [
    { tier: 'Simple', ingredientsRequired: { Protein:1, Veggie:1 }, salePrice: 5 },
    { tier: 'Intermediate', ingredientsRequired: { Protein:1, Veggie:1, Sauces:1 }, salePrice: 10 },
    { tier: 'Complex', ingredientsRequired: { Protein:2, Veggie:1, Carb:1, "Fats/Oils":1, Sauces:1 }, salePrice: 15 }
  ],
  Entree: [
    { tier: 'Simple', ingredientsRequired: { Protein:2, Carb:1 }, salePrice: 10 },
    { tier: 'Intermediate', ingredientsRequired: { Protein:2, Carb:1, Veggie:1 }, salePrice: 15 },
    { tier: 'Complex', ingredientsRequired: { Protein:3, Carb:2, Veggie:1, "Fats/Oils":1 }, salePrice: 25 }
  ],
  Dessert: [
    { tier: 'Simple', ingredientsRequired: { Sweets:2 }, salePrice: 5 },
    { tier: 'Intermediate', ingredientsRequired: { Sweets:2, Fruits:1 }, salePrice: 10 },
    { tier: 'Complex', ingredientsRequired: { Sweets:3, Fruits:2, Sauces:1 }, salePrice: 20 }
  ]
};

// ----------------------
// Rules text
// ----------------------
const rulesText = `
Kitchen Impossible Game Rules

1. Each round, the dealer deals 5 ingredient cards per player.
2. Players must contribute 1 Appetizer, 1 Entree, and 1 Dessert.
3. Contribution must not exceed cards in hand.
4. Courses have Simple, Intermediate, and Complex tiers, each with ingredient requirements and sale prices.
5. After all players submit, dice are rolled to calculate revenue.
6. Leftover ingredients are counted at the end for food waste.
7. Game ends when target profit or max rounds are reached.
8. Players may negotiate card contributions to maximize profits.
`;

// ----------------------
// Helper: pick a random tier per course for current round
// ----------------------
function pickMenuForRound() {
  const menu = {};
  for (const course in menuTiers) {
    const tiers = menuTiers[course];
    menu[course] = tiers[Math.floor(Math.random() * tiers.length)];
  }
  return menu;
}

// ----------------------
// Endpoints
// ----------------------
router.get('/current', (req, res) => {
  res.json(pickMenuForRound());
});

router.get('/full', (req, res) => {
  res.json(menuTiers);
});

router.get('/rules', (req, res) => {
  res.json({ rulesText });
});

// ----------------------
// Export
// ----------------------
module.exports = router;
module.exports.menuTiers = menuTiers;
