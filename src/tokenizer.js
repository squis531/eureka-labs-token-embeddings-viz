// Real tokenizer using gpt-tokenizer (cl100k_base — same as GPT-4)
import { encode, decode } from 'gpt-tokenizer/encoding/cl100k_base';

export { encode, decode };

// ── Token colours (cycled by index) ─────────────────────────────────────────
const TOKEN_COLORS = [
  { bg: 'rgba(255,173,17,0.15)',   border: '#ffad11', text: '#ffad11' },
  { bg: 'rgba(99,102,241,0.15)',   border: '#818cf8', text: '#a5b4fc' },
  { bg: 'rgba(16,185,129,0.15)',   border: '#10b981', text: '#34d399' },
  { bg: 'rgba(245,101,101,0.15)',  border: '#f56565', text: '#fc8181' },
  { bg: 'rgba(236,72,153,0.15)',   border: '#ec4899', text: '#f472b6' },
  { bg: 'rgba(20,184,166,0.15)',   border: '#14b8a6', text: '#2dd4bf' },
  { bg: 'rgba(139,92,246,0.15)',   border: '#8b5cf6', text: '#a78bfa' },
];

/**
 * Tokenize a string with real cl100k_base BPE.
 * Returns [{text, id, color}]
 */
export function tokenize(text) {
  if (!text.trim()) return [];
  const ids = encode(text);
  return ids.map((id, i) => ({
    id,
    text: decode([id]),
    color: TOKEN_COLORS[i % TOKEN_COLORS.length],
  }));
}

// ── Deterministic embedding ──────────────────────────────────────────────────
/**
 * Produces a fixed-length float array for a token ID using a seeded
 * sine-based hash. Same ID → same vector every time; no randomness.
 *
 * Formula: v[i] = sin(id * (i+1) * φ)   where φ ≈ golden-angle multiplier
 * This creates a unique, smooth "fingerprint" that is stable across renders.
 */
export function getEmbedding(tokenId, dims = 8) {
  const PHI = 1.6180339887; // golden ratio – gives good spread
  const vec = [];
  for (let i = 0; i < dims; i++) {
    const raw = Math.sin(tokenId * (i + 1) * PHI * 0.001);
    vec.push(parseFloat(raw.toFixed(3)));
  }
  return vec;
}

// ── Next-token logits ────────────────────────────────────────────────────────
// We derive plausible predictions from the actual cl100k_base token ID so
// that the chart always reflects the *real* vocabulary. The probabilities are
// mock-smoothed but the vocab entries are real.
const KNOWN_NEXTS = {
  // key = decoded text (lower-cased for lookup)
  'ai':       [{ id: 374,    word: ' is',       prob: 0.38 }, { id: 649,   word: ' can',   prob: 0.26 }, { id: 5918,  word: ' models', prob: 0.18 }],
  ' is':      [{ id: 264,    word: ' a',        prob: 0.34 }, { id: 539,   word: ' not',   prob: 0.27 }, { id: 459,   word: ' an',    prob: 0.21 }],
  ' simple':  [{ id: 323,    word: ' and',      prob: 0.30 }, { id: 719,   word: ' but',   prob: 0.24 }, { id: 13,    word: '.',      prob: 0.20 }],
  'hello':    [{ id: 1917,   word: ' world',    prob: 0.56 }, { id: 1070,  word: ' there', prob: 0.22 }, { id: 4333,  word: ' friend',prob: 0.13 }],
  ' world':   [{ id: 0,      word: '!',         prob: 0.42 }, { id: 374,   word: ' is',   prob: 0.28 }, { id: 315,   word: ' of',   prob: 0.18 }],
  'the':      [{ id: 1646,   word: ' model',    prob: 0.28 }, { id: 6666,  word: ' next', prob: 0.22 }, { id: 2691,  word: ' first',prob: 0.19 }],
  ' the':     [{ id: 1646,   word: ' model',    prob: 0.28 }, { id: 6666,  word: ' next', prob: 0.22 }, { id: 2691,  word: ' first',prob: 0.19 }],
  ' deep':    [{ id: 6975,   word: ' learning', prob: 0.60 }, { id: 30139, word: ' neural',prob: 0.19 }, { id: 15925, word: ' dive', prob: 0.12 }],
  ' language':[{ id: 1646,   word: ' model',    prob: 0.50 }, { id: 4211,  word: ' models',prob: 0.28 }, { id: 8830,  word: ' understanding',prob:0.11}],
};

export function getLogits(lastToken) {
  const key = lastToken.text.toLowerCase();
  if (KNOWN_NEXTS[key]) return KNOWN_NEXTS[key];

  // Generic fallback: derive 3 neighbour token IDs from the actual token ID
  const id = lastToken.id;
  return [
    { id: id + 1, word: decode([id + 1]) || '…', prob: 0.34 },
    { id: id - 1, word: decode([id - 1]) || '…', prob: 0.22 },
    { id: id + 2, word: decode([id + 2]) || '…', prob: 0.16 },
  ].map(item => ({ ...item, word: item.word.trim() || `#${item.id}` }));
}
