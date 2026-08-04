export const calculateLevenshtein = (a, b) => {
  if (!a || !b) return 0;
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1.0;
  return 1.0 - matrix[a.length][b.length] / maxLen;
};

// SOTA Phonetic Algorithm: Maps words to their phonetic sounds (e.g. "red", "rad", "read" -> "r300")
export const getSoundex = (s) => {
  if (!s) return '';
  let a = s.toLowerCase().replace(/[^a-z]/g, '').split('');
  if (!a.length) return '';
  let f = a.shift();
  let codes = {
      a: '', e: '', i: '', o: '', u: '', h: '', w: '', y: '',
      b: 1, f: 1, p: 1, v: 1,
      c: 2, g: 2, j: 2, k: 2, q: 2, s: 2, x: 2, z: 2,
      d: 3, t: 3,
      l: 4,
      m: 5, n: 5,
      r: 6
  };
  let r = f + a.map((v, i, arr) => codes[v] === codes[arr[i - 1]] ? '' : codes[v])
      .filter(v => v !== undefined && v !== '')
      .join('')
      .substring(0, 3);
  return r.padEnd(4, '0');
};

export const SOUNDALIKE_MAP = {
  "up": ["up", "app", "op", "uhp", "uh", "of", "off", "us", "ut", "ap", "ab", "cup", "pup", "hop", "top", "pop", "mop", "upward", "upper", "ups"],
  "dog": ["dog", "dug", "doc", "dock", "doug", "dark", "god", "dot", "dawg", "dogs", "duck", "done", "dong", "thug", "dad", "dull", "doll"],
  "cat": ["cat", "kat", "cut", "cap", "cot", "cats", "ket"],
  "apple": ["apple", "apples", "apo", "able", "appl"],
  "red": ["red", "read", "rad", "rid", "rat", "rads"],
  "blue": ["blue", "blew", "blow", "bloo", "blues"],
  "run": ["run", "ran", "ron", "rum", "runs", "one", "won", "ram", "rung", "ring", "rang"],
  "sun": ["sun", "son", "some", "sum", "san", "sam", "sung", "song"],
  "fun": ["fun", "fan", "fin", "fon", "fund"],
  "gun": ["gun", "gan", "gum"],
  "hot": ["hot", "hat", "hit", "hut", "hop", "heart", "hard"],
  "big": ["big", "beg", "bag", "bug", "bog", "pig", "dig", "fig"],
  "pig": ["pig", "big", "peg", "pug"],
  "dig": ["dig", "big", "dog", "dug"],
  "fig": ["fig", "fog", "fox"],
  "tree": ["tree", "three", "free", "try", "trees"],
  "bird": ["bird", "burt", "board", "bard", "birds", "third"],
  "fish": ["fish", "fishes", "phish", "dish", "fash"],
  "book": ["book", "books", "look", "took", "cook", "buk"],
  "ball": ["ball", "balls", "bowl", "bell", "fall", "tall", "call", "wall"],
  "car": ["car", "cars", "care", "can", "card", "bar", "far", "jar"],
  "hat": ["hat", "hot", "hit", "hut", "cat", "bat", "mat", "rat", "fat", "pat", "sat"],
  "shoe": ["shoe", "shoes", "shu", "show", "shop"],
  "milk": ["milk", "milks", "melk", "silk"],
  "water": ["water", "wata", "walter", "waiter"],
  "food": ["food", "foot", "fed", "feed"],
  "jump": ["jump", "jumps", "gump", "dump", "pump", "jamp"],
  "play": ["play", "plays", "plei", "pay", "plan"],
  "fast": ["fast", "first", "fist", "fact"],
  "slow": ["slow", "slowly", "slot", "sloth"],
  "happy": ["happy", "hapi", "hoppy", "hapy"],
  "sad": ["sad", "said", "sat", "sid"],
  "good": ["good", "god", "wood", "could"],
  "bad": ["bad", "bed", "bat", "dad"],
  "cold": ["cold", "gold", "hold", "told", "called"],
  "in": ["in", "inn", "an", "en", "on", "it", "is", "if", "into", "inside"],
  "on": ["on", "own", "an", "un", "one", "onto", "off"],
  "go": ["go", "gow", "gold", "goes", "going", "gone", "got"],
  "to": ["to", "too", "two", "tu", "toe", "into"],
  "at": ["at", "et", "it", "ot", "ut", "ad", "as"],
  "my": ["my", "mai", "me", "may", "mine"],
  "me": ["me", "mi", "my", "may", "we", "he"],
  "we": ["we", "wee", "way", "whee"],
  "he": ["he", "hee", "hi", "him"],
  "am": ["am", "um", "an", "arm"],
  "an": ["an", "and", "am", "in"],
  "as": ["as", "has", "is", "us"],
  "is": ["is", "iz", "his", "es", "as", "it"],
  "it": ["it", "eat", "et", "is", "if", "in", "its"],
  "if": ["if", "is", "it", "of"],
  "of": ["of", "off", "up", "on"],
  "or": ["or", "ore", "oar", "our"],
  "us": ["us", "as", "is", "up", "bus"],
  "no": ["no", "know", "noh", "now"],
  "so": ["so", "sew", "sow", "saw"],
  "do": ["do", "due", "dew", "du"],
  "be": ["be", "bee", "bay", "by"],
  "by": ["by", "buy", "bye", "be"],
  "hi": ["hi", "high", "hey"],
  "fox": ["fox", "box", "fax", "fix"],
  "box": ["box", "fox", "baks"],
  "hello": ["hello", "hallo", "helo", "halo"]
};

// Simple but bulletproof speech matching: does the heard text contain the target?
export const checkSpeechMatch = (heardText, targetWord) => {
  if (!heardText || !targetWord) return null;
  const norm = heardText.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const normTarget = targetWord.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  if (!norm || !normTarget) return null;

  // 1. Exact match or substring inclusion
  if (norm === normTarget || norm.includes(normTarget) || normTarget.includes(norm)) {
    return { stars: 3, multiplier: 1.0, feedback: "⚡ Perfect!" };
  }

  // 2. Short word special matcher (e.g. "up", "cat", "dog", "in", "on", "go", "red")
  const heardWords = norm.split(/\s+/);
  if (normTarget.length <= 3) {
    for (const hw of heardWords) {
      if (hw === normTarget) return { stars: 3, multiplier: 1.0, feedback: "⚡ Perfect!" };
      if (normTarget === 'up' && (hw === 'app' || hw === 'op' || hw === 'uhp' || hw === 'ap' || hw === 'ab' || hw === 'uh' || hw === 'of' || hw === 'off' || hw === 'us' || hw === 'ut' || hw === 'cup' || hw === 'pup' || hw === 'hop' || hw === 'top')) {
        return { stars: 3, multiplier: 1.0, feedback: "⚡ Perfect!" };
      }
    }
  }

  // 3. Check soundalike dictionary
  const soundalikes = SOUNDALIKE_MAP[normTarget] || [];
  for (const sa of soundalikes) {
    if (norm.includes(sa) || heardWords.includes(sa)) {
      return { stars: 3, multiplier: 1.0, feedback: "⚡ Perfect!" };
    }
  }

  // 4. SOTA Phonetic Soundex Matching (Ultra Lenient for Accents)
  const targetWordsList = normTarget.split(/\s+/);
  if (targetWordsList.length === 1 && heardWords.length > 0) {
    const targetSoundex = getSoundex(normTarget).substring(0, 2);
    for (const hw of heardWords) {
       // Match just the first 2 characters of the phonetic hash! (e.g. R3 = R3)
       if (getSoundex(hw).substring(0, 2) === targetSoundex && hw.length > 1) {
          return { stars: 3, multiplier: 1.0, feedback: "⚡ Perfect!" };
       }
    }
  }

  // 5. Levenshtein similarity
  const sim = calculateLevenshtein(norm, normTarget);
  if (sim >= 0.75) return { stars: 3, multiplier: 1.0, feedback: "⚡ Perfect!" };
  if (sim >= 0.55) return { stars: 2, multiplier: 0.8, feedback: "⚡ Good!" };

  // 6. Word overlap for multi-word phrases
  if (targetWordsList.length > 1) {
    const matched = targetWordsList.filter(w => heardWords.includes(w)).length;
    const ratio = matched / targetWordsList.length;
    if (ratio >= 0.6) return { stars: 3, multiplier: 1.0, feedback: "⚡ Perfect!" };
    if (ratio >= 0.4) return { stars: 2, multiplier: 0.8, feedback: "⚡ Good!" };
    if (ratio > 0) return { stars: 1, multiplier: 0.5, feedback: "⚡ Close!" };
  }

  if (sim >= 0.2) return { stars: 1, multiplier: 0.5, feedback: "⚡ Close!" };
  return null;
};
