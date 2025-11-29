// frontend.js

let playerId = null;
let selectedCards = [];

const handDiv = document.getElementById('hand');
const submissionsDiv = document.getElementById('submissions');
const joinBtn = document.getElementById('join-btn');
const submitBtn = document.getElementById('submit-btn');

// Backend base URL
const API_BASE = 'http://localhost:4000/api';

// ----------------------
// Join Game
// ----------------------
joinBtn.addEventListener('click', async () => {
  const nameInput = document.getElementById('player-name');
  const name = nameInput.value.trim();
  if (!name) return alert('Please enter a name');

  try {
    const res = await fetch(`${API_BASE}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    const data = await res.json();

    if (res.ok) {
      playerId = data.playerId;
      renderHand(data.hand);
      alert('Joined game successfully!');
    } else {
      alert(data.error || 'Failed to join game');
    }
  } catch (err) {
    console.error('Error joining game:', err);
    alert('Could not connect to backend');
  }
});

// ----------------------
// Render Hand
// ----------------------
function renderHand(hand) {
  handDiv.innerHTML = '';
  selectedCards = [];

  hand.forEach((card, index) => {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    cardEl.textContent = card.type;

    cardEl.addEventListener('click', () => {
      if (selectedCards.includes(index)) {
        selectedCards = selectedCards.filter(i => i !== index);
        cardEl.style.background = '';
      } else {
        selectedCards.push(index);
        cardEl.style.background = '#ddd';
      }
    });

    handDiv.appendChild(cardEl);
  });
}

// ----------------------
// Submit Selected Cards
// ----------------------
submitBtn.addEventListener('click', async () => {
  if (!playerId) return alert('Join the game first');
  if (selectedCards.length === 0) return alert('Select cards to submit');

  const cardsToSubmit = selectedCards.map(i => ({ type: handDiv.children[i].textContent }));

  try {
    const res = await fetch(`${API_BASE}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, cards: cardsToSubmit })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      // Remove submitted cards from hand
      const remainingHand = Array.from(handDiv.children)
        .filter((_, i) => !selectedCards.includes(i))
        .map(el => ({ type: el.textContent }));

      selectedCards = [];
      renderHand(remainingHand);

      // Fetch latest round submissions
      const submissionsRes = await fetch(`${API_BASE}/round/1`);
      const submissionsData = await submissionsRes.json();
      renderSubmissions(submissionsData.submissions);
    } else {
      alert(data.error || 'Failed to submit cards');
    }
  } catch (err) {
    console.error('Error submitting cards:', err);
    alert('Could not connect to backend');
  }
});

// ----------------------
// Render Submissions
// ----------------------
function renderSubmissions(subs) {
  submissionsDiv.innerHTML = '';
  subs.forEach(sub => {
    const p = document.createElement('p');
    p.textContent = `Player ${sub.playerId} submitted: ${sub.cards.map(c => c.type).join(', ')}`;
    submissionsDiv.appendChild(p);
  });
}
