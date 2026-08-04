import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Mic, Gamepad2, Timer, Heart, Zap, Lock } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';
import { checkSpeechMatch } from '../../../utils/speechScoring';

const VOICE_BATTLE_WORDS_BY_GRADE = {
  "1-2": [
    // Stage 0 (1 word)
    ["sun", "cat", "dog", "red", "big", "run", "bag", "boy", "hat", "pen", "cup", "pig", "map", "bus", "toy"],
    // Stage 1 (1 word)
    ["book", "milk", "fish", "bird", "blue", "jump", "box", "star", "duck", "hand", "ball", "desk", "frog", "lamp", "tree"],
    // Stage 2 (1 word)
    ["moon", "apple", "cake", "shoe", "fast", "good", "food", "bear", "lion", "ship", "park", "room", "song", "door", "face"],
    // Stage 3 (1 word)
    ["rock", "wind", "cold", "wall", "ring", "boat", "card", "desk", "farm", "gift", "hill", "king", "leaf", "nest", "lamp"],
    // Stage 4 (1 word)
    ["night", "dark", "cape", "bat", "fire", "snow", "gold", "rain", "rose", "seed", "tent", "yard", "hero", "star", "bell"],
    // Stage 5 (1 word)
    ["pink", "lake", "fish", "cow", "milk", "soft", "sweet", "loud", "kind", "cool", "clean", "fresh", "happy", "smile", "home"],
    // Stage 6 (1-2 words)
    ["ice", "sky", "sea", "wave", "breeze", "stone", "gate", "path", "wood", "grass", "cloud", "light", "glow", "spark", "magic"],
    // Stage 7 (1-2 words)
    ["red car", "big dog", "blue sky", "good boy", "cat run", "sun shine", "happy face", "hot tea", "two apples", "green tree", "cute cat", "fast bus", "small bag", "sweet cake", "warm sun"],
    // Stage 8 (1-2 words)
    ["cold water", "small mouse", "fly high", "jump up", "read book", "eat bread", "play ball", "sweet milk", "yellow duck", "fast car", "big fish", "little bird", "nice teacher", "open door", "wash hands"],
    // Stage 9 (1-2 words)
    ["bright moon", "white rabbit", "clean shoes", "warm coat", "run fast", "sit down", "say hello", "green grass", "red rose", "happy girl", "good friend", "tall tree", "blue lake", "big ship", "sweet apple"],
    // Stage 10 (Stage 6-7 difficulty: 1-2 words)
    ["heavy stone", "dark night", "loud clock", "fresh air", "deep river", "soft bed", "kind teacher", "smart student", "cute puppy", "bright star", "hot soup", "cold ice", "fast runner", "happy baby", "sweet song"],
    // Stage 11 (Stage 6-7 difficulty: 1-2 words)
    ["black cat", "sharp teeth", "scary face", "deep cave", "cold wind", "night sky", "drink water", "red hat", "big house", "good girl", "strong man", "fast horse", "bright light", "little mouse", "clean room"],
    // Stage 12 (Stage 6-7 difficulty: 1-2 words)
    ["magic hat", "green frog", "black cat", "sweet tea", "look here", "read story", "dance sing", "play music", "hop fast", "big smile", "sun run", "blue sea", "white cloud", "warm day", "good job"],
    // Stage 13 (Stage 6-7 difficulty: 1-2 words)
    ["strong shield", "sharp sword", "ride horse", "black armor", "stand tall", "fight good", "guard gate", "walk high", "run fast", "brave knight", "hold shield", "climb hill", "march fast", "sing song", "jump high"],
    // Stage 14 (Stage 6-7 difficulty: 1-2 words)
    ["red dragon", "hot fire", "fly sky", "sharp claws", "sleep cave", "roar loud", "green tail", "fly hill", "watch sun", "hot smoke", "shine fire", "fly high", "red wings", "guard gold", "sleep day"],
    // Stage 15 (Stage 6-7 difficulty: 1-2 words)
    ["dark spell", "magic wand", "walk shadow", "read book", "ring bell", "scare ghost", "blue moon", "secret box", "bright light", "quiet words", "glowing staff", "find key", "night wind", "quiet night", "dark room"],
    // Stage 16 (Stage 6-7 difficulty: 1-2 words)
    ["red crown", "sit throne", "dark king", "shake ground", "fight good", "win game", "march hill", "shine star", "break wall", "rule land", "brave king", "gold ring", "guard castle", "win prize", "lead team"],
    // Stage 17 (Stage 6-7 difficulty: 1-2 words)
    ["white snow", "ice lake", "winter wind", "walk snow", "white snow", "cold morning", "blue ice", "snowman", "warm gloves", "skate ice", "falling snow", "cold snow", "warm coat", "play snow", "frozen river"],
    // Stage 18 (Stage 6-7 difficulty: 1-2 words)
    ["gold wings", "fly high", "sun beam", "yellow spark", "rise high", "gold bird", "red fire", "shine sky", "fly cloud", "summer day", "bright sun", "fly sky", "gold light", "sweet song", "warm ray"],
    // Stage 19 (Stage 6-7 difficulty: 1-2 words)
    ["magic orb", "night sky", "deep space", "purple star", "glowing stone", "bright star", "fly moon", "magic spell", "look stars", "magic bottle", "shining night", "fly space", "night star", "magic sky", "crystal orb"]
  ],

  "3-4": [
    // Stage 0 (1 word)
    ["green", "soft", "grass", "tree", "river", "cloud", "smile", "happy", "sweet", "bright", "flower", "garden", "valley", "stream", "meadow"],
    // Stage 1 (1 word)
    ["gold", "coin", "trap", "chest", "path", "forest", "quick", "bounty", "spear", "stone", "arrow", "target", "bandit", "loot", "guard"],
    // Stage 2 (1 word)
    ["shadow", "wind", "light", "house", "silent", "hall", "glow", "night", "magic", "spirit", "lantern", "soft sound", "ghost", "tower", "mirror"],
    // Stage 3 (1 word)
    ["rock", "fist", "shield", "mountain", "cave", "wall", "bedrock", "heavy", "giant", "ground", "boulder", "cliff", "iron", "armor", "defense"],
    // Stage 4 (1 word)
    ["cape", "castle", "moon", "bat", "fang", "room", "clock", "cold", "dark", "secret", "stone statue", "throne", "crown", "key", "box"],
    // Stage 5 (1 word)
    ["swift", "fresh", "dew", "honey", "cool", "breeze", "sunny", "clear", "lake", "sea", "peace", "fair", "shine", "warmth", "bloom"],
    // Stage 6 (1-2 words)
    ["fast step", "hidden", "wooden", "climb", "search", "bridge", "hunter", "scout", "guard", "map", "track", "trail", "hill", "peak", "top"],
    // Stage 7 (1-2 words)
    ["green slime", "bouncy ball", "swift stream", "fresh dew", "bright light", "clear water", "soft grass", "sweet honey", "fast runner", "cool breeze", "sunny morning", "green meadow", "fresh air", "blue river", "happy day"],
    // Stage 8 (1-2 words)
    ["fast step", "hidden trap", "golden coin", "wooden chest", "climb tree", "run fast", "jump far", "sharp spear", "forest path", "brave hero", "target practice", "fast arrow", "search woods", "find gold", "guard bridge"],
    // Stage 9 (1-2 words)
    ["scary noise", "dark house", "soft wind", "pale light", "cold wind", "dark hall", "silent steps", "glowing eyes", "run away", "cold night", "magic lantern", "glowing ghost", "dark hallway", "old floor", "secret door"],
    // Stage 10 (Stage 6-7 difficulty: 1-2 words)
    ["stone man", "big fist", "rocky shield", "mountain peak", "heavy hit", "magic mark", "stone wall", "heavy steps", "solid bedrock", "guard cave", "iron armor", "tall cliff", "smash rock", "strong wall", "firm ground"],
    // Stage 11 (Stage 6-7 difficulty: 1-2 words)
    ["dark cape", "old castle", "glowing moon", "dark bat", "sharp fangs", "dark shadow", "dark room", "quick move", "night time", "red jewel", "golden crown", "silver key", "secret box", "castle gate", "king hall"],
    // Stage 12 (Stage 6-7 difficulty: 1-2 words)
    ["magic drink", "flying broom", "magic forest", "cast spell", "make tea", "crystal ball", "magic book", "magic words", "mix herbs", "glowing wand", "green drink", "spell book", "magic garden", "glowing pot", "soft spell"],
    // Stage 13 (Stage 6-7 difficulty: 1-2 words)
    ["brave knight", "shining armor", "iron shield", "go battle", "defend castle", "swing sword", "ride horse", "guard kingdom", "brave warrior", "help weak", "hold line", "raise flag", "fight all", "good guard", "steel blade"],
    // Stage 14 (Stage 6-7 difficulty: 1-2 words)
    ["red dragon", "hot fire", "fly high", "guard chest", "climb mountain", "roar loud", "big wings", "fly valley", "hot fire", "protect tower", "red dragon", "fly hill", "guard chest", "hot breath", "sky dragon"],
    // Stage 15 (Stage 6-7 difficulty: 1-2 words)
    ["dark wizard", "magic power", "old staff", "dark cloak", "cast spell", "hide shadow", "secret box", "magic master", "purple orb", "make wind", "magic wand", "spell book", "purple aura", "get power", "magic words"],
    // Stage 16 (Stage 6-7 difficulty: 1-2 words)
    ["dark king", "rule kingdom", "sit throne", "dark army", "break walls", "win battle", "magic power", "march land", "win victory", "rule night", "top ruler", "break gates", "march war", "win lands", "dark castle"],
    // Stage 17 (Stage 6-7 difficulty: 1-2 words)
    ["ice mountain", "snow monster", "winter storm", "march snow", "mountain top", "polar wind", "ice cave", "winter morning", "walk snow", "ice wall", "snow storm", "ice river", "cold wind", "deep snow", "ice wall"],
    // Stage 18 (Stage 6-7 difficulty: 1-2 words)
    ["gold bird", "rise fire", "gold wings", "sun energy", "fire wings", "bright sunbeam", "gold sparks", "fly sky", "red fire", "born fire", "fly clouds", "gold wings", "fire spark", "sunbeam sky", "fly high"],
    // Stage 19 (Stage 6-7 difficulty: 1-2 words)
    ["magic portal", "glowing orb", "starry sky", "dark power", "crystal prism", "deep space", "magic marks", "look stars", "float space", "star dust", "cosmic star", "purple portal", "starry space", "star galaxy", "crystal orb"]
  ],

  "5-6": [
    // Stage 0 (1 word)
    ["crystal", "stream", "forest", "nature", "energy", "solar", "fresh", "breeze", "valley", "harbor", "plants", "animals", "canyon", "cold land", "ice hill"],
    // Stage 1 (1 word)
    ["reward", "treasure", "shelter", "wood", "canyon", "cold land", "ice hill", "island", "desert", "harbor", "camp", "light", "goods", "new land", "top hill"],
    // Stage 2 (1 word)
    ["ghost", "echo", "mist", "deep cave", "magic view", "shadow", "glowing", "soft voice", "portal", "dream", "magic view", "dark sky", "night time", "safe place", "old item"],
    // Stage 3 (1 word)
    ["bedrock", "rock", "pillar", "statue", "fortress", "shield", "big stone", "building", "wall", "giant", "big rock", "strong castle", "safe wall", "front wall", "front wall"],
    // Stage 4 (1 word)
    ["palace", "dark sky", "hunter", "land", "temple", "knight", "kingdom", "legend", "mystery", "glory", "king line", "king", "ruler", "gold staff", "realm"],
    // Stage 5 (1 word)
    ["fast power", "useful good", "good energy", "smart", "good plan", "new land", "scout", "look around", "ghost light", "hard rock", "stone work", "old style", "night sky", "night bird", "living forever"],
    // Stage 6 (1-2 words)
    ["honor code", "strong wall", "top hunter", "flow", "magic view", "king", "ruler", "cold land", "weather", "shining", "high sky", "warm forest", "tree top", "heavy rain", "star space"],
    // Stage 7 (1-2 words)
    ["liquid energy", "fast motion", "solar energy", "clear water", "clean air", "fresh dewdrop", "strong force", "clean energy", "mountain path", "green forest", "fast power", "nature park", "fresh stream", "solar panel", "clean land"],
    // Stage 8 (1-2 words)
    ["silent step", "hidden treasure", "good item", "old item", "fast flight", "deep forest", "wild home", "green farm", "clever plan", "brave leader", "scout ahead", "paper map", "good resource", "open land", "safe camp"],
    // Stage 9 (1-2 words)
    ["ghost shadow", "strange sound", "air force", "silent spirit", "faint light", "deep cave", "dark shadow", "glowing crystal", "deep cave", "ancient secret", "soft voice", "ghost view", "magic trick", "night zone", "safe temple"],
    // Stage 10 (Stage 6-7 difficulty: 1-2 words)
    ["rock layer", "rock shape", "big stone", "solid bedrock", "ground shake", "strong defense", "solid tower", "ancient stone", "old statue", "stone wall", "stone pillar", "heavy stone", "stone castle", "front wall", "solid barrier"],
    // Stage 11 (Stage 6-7 difficulty: 1-2 words)
    ["night owl", "ancient castle", "golden time", "dark sky", "silent steps", "shadow kingdom", "heroic warrior", "holy temple", "silent flight", "cool breeze", "dark palace", "king family", "gold staff", "king land", "great realm"],
    // Stage 12 (Stage 6-7 difficulty: 1-2 words)
    ["herbal tea", "magic energy", "sky line", "herb garden", "read books", "make tea", "light caves", "learn rules", "drink water", "save books", "plant mix", "study plants", "mix tea", "make tea", "clean water"],
    // Stage 13 (Stage 6-7 difficulty: 1-2 words)
    ["brave warrior", "metal armor", "defense plan", "guard borders", "hold honor", "show courage", "lead soldiers", "keep safe", "champion truth", "battle stance", "army plan", "defend post", "lead guards", "castle stance", "hold honor"],
    // Stage 14 (Stage 6-7 difficulty: 1-2 words)
    ["famous dragon", "fly clouds", "fly air", "guard gold", "fly hills", "big wings", "protect park", "ruler hills", "hot flames", "power symbol", "fly sky", "grand flight", "warm air", "old park", "top ruler"],
    // Stage 15 (Stage 6-7 difficulty: 1-2 words)
    ["magic master", "magic energy", "read marks", "see tombs", "magic power", "hide shadow", "find secrets", "keep books", "control elements", "guard truth", "read letters", "magic aura", "keep history", "master elements", "find truth"],
    // Stage 16 (Stage 6-7 difficulty: 1-2 words)
    ["king ruler", "rule lands", "command power", "win tests", "show leadership", "break walls", "total victory", "lasting peace", "rule wisdom", "stand top", "great king", "lead wisdom", "make peace", "full victory", "top ruler"],
    // Stage 17 (Stage 6-7 difficulty: 1-2 words)
    ["cold ice", "cold snow", "arctic land", "cold weather", "ice layer", "storm wind", "ice path", "cold winter", "snow shape", "weather storm", "land trek", "ice field", "pass winter", "polar weather", "ice land"],
    // Stage 18 (Stage 6-7 difficulty: 1-2 words)
    ["phoenix rise", "warm light", "sun light", "life symbol", "fly sky", "gold glow", "bright sparks", "shine sky", "fly clouds", "win battle", "sun light", "fly high", "bird reborn", "life symbol", "sun rising"],
    // Stage 19 (Stage 6-7 difficulty: 1-2 words)
    ["sky flash", "clean energy", "storm event", "thunder sound", "storm rain", "sky light", "air pressure", "nature power", "weather front", "electric storm", "lightning power", "air pressure", "rain storm", "weather front", "electric force"]
  ]
};

const MONSTERS = [
  { name: "Slime", emoji: "💧", maxHp: 40, shield: 0, reward: 3, words: VOICE_BATTLE_WORDS_BY_GRADE["3-4"][0] },
  { name: "Goblin", emoji: "👺", maxHp: 60, shield: 10, reward: 3, words: VOICE_BATTLE_WORDS_BY_GRADE["3-4"][1] },
  { name: "Ghost", emoji: "👻", maxHp: 80, shield: 20, reward: 3, words: VOICE_BATTLE_WORDS_BY_GRADE["3-4"][2] },
  { name: "Golem", emoji: "🗿", maxHp: 120, shield: 40, reward: 4, words: VOICE_BATTLE_WORDS_BY_GRADE["3-4"][3] },
  { name: "Vampire", emoji: "🧛", maxHp: 150, shield: 20, reward: 4, words: VOICE_BATTLE_WORDS_BY_GRADE["3-4"][4] },
  { name: "Witch", emoji: "🧙‍♀️", maxHp: 200, shield: 0, reward: 4, words: VOICE_BATTLE_WORDS_BY_GRADE["3-4"][5] },
  { name: "Dark Knight", emoji: "🤺", maxHp: 250, shield: 50, reward: 5, words: VOICE_BATTLE_WORDS_BY_GRADE["3-4"][6] },
  { name: "Dragon", emoji: "🐉", maxHp: 400, shield: 30, reward: 5, words: VOICE_BATTLE_WORDS_BY_GRADE["3-4"][7] },
  { name: "Necromancer", emoji: "🧙‍♂️", maxHp: 500, shield: 20, reward: 5, words: VOICE_BATTLE_WORDS_BY_GRADE["3-4"][8] },
  { name: "Demon Emperor", emoji: "👿", maxHp: 600, shield: 40, reward: 6, words: VOICE_BATTLE_WORDS_BY_GRADE["3-4"][9] },
  { name: "Frost Giant", emoji: "🧌", maxHp: 350, shield: 25, reward: 6, words: VOICE_BATTLE_WORDS_BY_GRADE["3-4"][10] },
  { name: "Phoenix Lord", emoji: "🦅", maxHp: 400, shield: 30, reward: 6, words: VOICE_BATTLE_WORDS_BY_GRADE["3-4"][11] },
  { name: "Shadow Serpent", emoji: "🐍", maxHp: 420, shield: 35, reward: 7, words: VOICE_BATTLE_WORDS_BY_GRADE["3-4"][12] },
  { name: "Thunder Behemoth", emoji: "🦍", maxHp: 450, shield: 40, reward: 7, words: VOICE_BATTLE_WORDS_BY_GRADE["3-4"][13] },
  { name: "Void Warlock", emoji: "🦹", maxHp: 480, shield: 45, reward: 7, words: VOICE_BATTLE_WORDS_BY_GRADE["3-4"][14] },
  { name: "Crystal Sentinel", emoji: "💂‍♂️", maxHp: 500, shield: 50, reward: 8, words: VOICE_BATTLE_WORDS_BY_GRADE["3-4"][15] },
  { name: "Obsidian Titan", emoji: "👹", maxHp: 520, shield: 60, reward: 8, words: VOICE_BATTLE_WORDS_BY_GRADE["3-4"][16] },
  { name: "Iron Colossus", emoji: "👾", maxHp: 550, shield: 70, reward: 8, words: VOICE_BATTLE_WORDS_BY_GRADE["3-4"][17] },
  { name: "Aegis Guardian", emoji: "🥷", maxHp: 500, shield: 80, reward: 10, words: VOICE_BATTLE_WORDS_BY_GRADE["3-4"][18] },
  { name: "Chaos Overlord", emoji: "👺", image: "/assets/red_demon_boss.png", maxHp: 1000, shield: 50, reward: 15, words: VOICE_BATTLE_WORDS_BY_GRADE["3-4"][19] }
];

const MONSTER_STYLES = {
  "Slime": { bg: "from-cyan-400 via-sky-500 to-blue-600", shadow: "shadow-sky-300/80", border: "border-sky-300" },
  "Goblin": { bg: "from-emerald-400 via-green-500 to-teal-700", shadow: "shadow-emerald-300/80", border: "border-emerald-300" },
  "Ghost": { bg: "from-indigo-300 via-purple-400 to-slate-600", shadow: "shadow-purple-300/80", border: "border-purple-300" },
  "Golem": { bg: "from-amber-600 via-stone-600 to-neutral-800", shadow: "shadow-amber-400/80", border: "border-stone-400" },
  "Vampire": { bg: "from-rose-500 via-red-700 to-slate-900", shadow: "shadow-rose-500/80", border: "border-rose-400" },
  "Witch": { bg: "from-fuchsia-500 via-purple-700 to-indigo-950", shadow: "shadow-fuchsia-500/80", border: "border-purple-400" },
  "Dark Knight": { bg: "from-slate-600 via-slate-800 to-black", shadow: "shadow-slate-500/80", border: "border-slate-400" },
  "Dragon": { bg: "from-amber-500 via-orange-600 to-red-800", shadow: "shadow-orange-500/80", border: "border-amber-400" },
  "Necromancer": { bg: "from-purple-600 via-violet-800 to-black", shadow: "shadow-purple-600/80", border: "border-violet-400" },
  "Demon Emperor": { bg: "from-rose-600 via-purple-900 to-slate-950", shadow: "shadow-rose-600/90", border: "border-rose-500" },
  "Frost Giant": { bg: "from-blue-300 via-sky-400 to-indigo-600", shadow: "shadow-sky-300/80", border: "border-sky-300" },
  "Phoenix Lord": { bg: "from-amber-400 via-orange-500 to-red-600", shadow: "shadow-amber-300/80", border: "border-amber-300" },
  "Shadow Serpent": { bg: "from-emerald-600 via-teal-800 to-slate-950", shadow: "shadow-emerald-500/80", border: "border-emerald-500" },
  "Thunder Behemoth": { bg: "from-yellow-400 via-amber-500 to-indigo-900", shadow: "shadow-yellow-300/80", border: "border-yellow-300" },
  "Void Warlock": { bg: "from-fuchsia-600 via-purple-800 to-slate-950", shadow: "shadow-fuchsia-500/80", border: "border-fuchsia-400" },
  "Crystal Sentinel": { bg: "from-cyan-300 via-teal-400 to-blue-700", shadow: "shadow-cyan-300/80", border: "border-cyan-200" },
  "Obsidian Titan": { bg: "from-stone-700 via-slate-900 to-black", shadow: "shadow-stone-500/80", border: "border-stone-500" },
  "Iron Colossus": { bg: "from-slate-500 via-zinc-700 to-slate-950", shadow: "shadow-slate-400/80", border: "border-slate-400" },
  "Aegis Guardian": { bg: "from-amber-300 via-yellow-500 to-stone-800", shadow: "shadow-amber-400/80", border: "border-amber-400" },
  "Chaos Overlord": { bg: "from-rose-600 via-purple-900 to-amber-950", shadow: "shadow-[0_0_40px_rgba(244,63,94,0.9)]", border: "border-amber-400 animate-pulse" }
};

export const VoiceJump = ({ onBack }) => {
  const { t, grade, user, handleEarnBattleStars, syncProgress } = useAppContext();
  
  const isAdmin = user?.role === 'admin' || user?.name?.toLowerCase() === 'teacher2026' || user?.username?.toLowerCase() === 'teacher2026';
  const hasHourglass = isAdmin || user?.inventory?.includes('relic_hourglass');
  const baseTimer = hasHourglass ? 90 : 60;
  
  const activeGrade = grade || '3-4';

  const [clearedStagesByGrade, setClearedStagesByGrade] = useState(() => {
    if (user?.clearedVoiceStages && typeof user.clearedVoiceStages === 'object' && !Array.isArray(user.clearedVoiceStages)) {
      return user.clearedVoiceStages;
    }
    const saved = localStorage.getItem('voiceBattleClearedByGrade');
    if (saved) {
      try { return JSON.parse(saved); } catch(e) {}
    }
    return {
      '1-2': [],
      '3-4': [],
      '5-6': []
    };
  });

  const clearedStages = (clearedStagesByGrade && clearedStagesByGrade[activeGrade]) ? clearedStagesByGrade[activeGrade] : [];
  
  const [view, setView] = useState('levels'); // 'levels', 'combat'
  const [stage, setStage] = useState(0);
  const [hp, setHp] = useState(MONSTERS[0].maxHp);
  const [word, setWord] = useState(() => (VOICE_BATTLE_WORDS_BY_GRADE[grade || '3-4']?.[0]?.[0]) || MONSTERS[0].words[0]);
  const [timer, setTimer] = useState(baseTimer);
  const [gameState, setGameState] = useState('playing'); // playing, stage_clear, game_over, victory
  const [petDisabledTimer, setPetDisabledTimer] = useState(0);

  const hasKnight = isAdmin || user?.inventory?.includes('char_knight');
  const hasPaladin = isAdmin || user?.inventory?.includes('char_paladin');
  
  const hasDragon = isAdmin || user?.inventory?.includes('pet_dragon');
  const hasGriffin = isAdmin || user?.inventory?.includes('pet_griffin');
  const hasGolem = isAdmin || user?.inventory?.includes('pet_golem');
  
  const [selectedChar, setSelectedChar] = useState(user?.equippedChar || 'char_wizard');
  const [selectedPet, setSelectedPet] = useState(user?.equippedPet || null);

  const selectedPetRef = useRef(selectedPet);
  useEffect(() => { selectedPetRef.current = selectedPet; }, [selectedPet]);

  const selectedCharRef = useRef(selectedChar);
  useEffect(() => { selectedCharRef.current = selectedChar; }, [selectedChar]);

  const gameStateRef = useRef(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);
  
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState('ready'); // ready, loading
  const [feedback, setFeedback] = useState("Click the mic to attack!");
  
  const [animTrigger, setAnimTrigger] = useState(null);
  const [critTrigger, setCritTrigger] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const nativeSuccessRef = useRef(false);
  const isRecordingRef = useRef(false);
  const isEvaluatingRef = useRef(false);
  const evalDebounceRef = useRef(null);
  // Store ALL heard text as plain strings (NOT live DOM references that Chrome invalidates)
  const allHeardTextRef = useRef('');
  const wordRef = useRef(word);

  // Volume Meter Refs
  const [micVolume, setMicVolume] = useState(0);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const rafIdRef = useRef(null);
  const micStreamRef = useRef(null);


  // Pet auto-attack interval (paused if pet is silenced/disabled)
  useEffect(() => {
    let interval = null;
    if (gameState === 'playing' && selectedPet === 'pet_dragon' && petDisabledTimer === 0) {
      interval = setInterval(() => {
         // Dragon deals 10 passive damage
         triggerAttack(10, true, true, false);
      }, 3000);
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, selectedPet, petDisabledTimer]);

  const cleanupVolumeMeter = () => {
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
       try { audioCtxRef.current.close(); } catch(e){}
       audioCtxRef.current = null;
    }
    if (micStreamRef.current) {
       micStreamRef.current.getTracks().forEach(t => t.stop());
       micStreamRef.current = null;
    }
    setMicVolume(0);
  };

  // Keep wordRef in sync so onresult closure always has the current word
  useEffect(() => { wordRef.current = word; }, [word]);

  // Auto-start microphone on entering level combat; auto-close when leaving combat or game ends
  useEffect(() => {
    let timerId;
    if (view === 'combat' && gameState === 'playing') {
      timerId = setTimeout(() => {
        if (!isRecordingRef.current) {
          startRecording();
        }
      }, 250);
    } else {
      if (isRecordingRef.current) {
        stopRecording();
      }
    }
    return () => {
      if (timerId) clearTimeout(timerId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, gameState]);

  // Unmount safety cleanup: stop recording & release audio tracks completely
  useEffect(() => {
    return () => {
      stopRecording();
      cleanupVolumeMeter();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let interval = null;
    if (gameState === 'playing' && timer > 0) {
      interval = setInterval(() => {
        setTimer(t => t - 1);
        setPetDisabledTimer(p => Math.max(0, p - 1));
      }, 1000);
    } else if (timer === 0 && gameState === 'playing') {
      setGameState('game_over');
      // Clean up any active recognition
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e){}
        recognitionRef.current = null;
      }
      isRecordingRef.current = false;
      setIsRecording(false);
    }
    return () => clearInterval(interval);
  }, [gameState, timer]);

  const pickNewWord = (stg) => {
    const activeGrade = grade || '3-4';
    const gradeWords = VOICE_BATTLE_WORDS_BY_GRADE[activeGrade] || VOICE_BATTLE_WORDS_BY_GRADE['3-4'];
    const wordBank = (gradeWords && gradeWords[stg]) ? gradeWords[stg] : MONSTERS[stg].words;
    let next;
    do {
      next = wordBank[Math.floor(Math.random() * wordBank.length)];
    } while (next === wordRef.current && wordBank.length > 1);
    setWord(next);
    wordRef.current = next; // Immediately update wordRef sync
    
    // Clear the STT accumulated history buffer
    allHeardTextRef.current = '';
    isEvaluatingRef.current = false;
    
    // Kill stale recognition instance so startRecording creates a fresh instance with NEW word grammars!
    if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e){}
        recognitionRef.current = null;
    }
    
    if (isRecordingRef.current) {
        setTimeout(() => {
            if (isRecordingRef.current) {
                startRecording();
            }
        }, 100);
    }
  };

  const startLevel = (stg) => {
    setStage(stg);
    setHp(MONSTERS[stg].maxHp);
    setPetDisabledTimer(0);
    pickNewWord(stg);
    setTimer(baseTimer);
    setGameState('playing');
    setFeedback(t('click_mic_attack'));
    setView('combat');
  };

  const resetGame = () => {
    startLevel(stage);
  };

  const toggleRecording = () => {
    if (status === 'loading' || gameState !== 'playing') return;
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const executeAttackSuccess = (evalResult, isInstant = true) => {
    if (gameStateRef.current !== 'playing') return;
    
    const activeChar = selectedCharRef.current || selectedChar;
    const activePet = selectedPetRef.current || selectedPet;

    let baseDamage = 20;
    if (activeChar === 'char_paladin') baseDamage = 50;
    else if (activeChar === 'char_knight') baseDamage = 30;
    
    // Griffin multiplier (5x Damage! Silenced if petDisabledTimer > 0)
    if (activePet === 'pet_griffin') {
        const mult = petDisabledTimer > 0 ? 1.0 : 5.0;
        baseDamage = Math.round(baseDamage * mult);
    }
    
    const multiplier = evalResult?.multiplier !== undefined ? evalResult.multiplier : 1.0;
    let rawDamage = Math.round(baseDamage * multiplier);
    
    let isCrit = false;
    if (evalResult?.stars >= 2 && Math.random() < 0.20) {
        isCrit = true;
        rawDamage *= 2;
    }
    
    // Monster Base Shield
    let baseShield = MONSTERS[stage].shield || 0;
    
    // Golem shield breaker (bypasses all shields completely!)
    const isGolemActive = (activePet === 'pet_golem' && petDisabledTimer === 0);
    const shield = isGolemActive ? 0 : baseShield;
    const finalDamage = Math.max(1, Math.floor(rawDamage * (1 - (shield / 100))));
    
    let msg = evalResult?.feedback || "Hit!";
    if (isCrit) msg = `💥 CRITICAL! ${msg}`;
    
    if (isGolemActive && baseShield > 0) {
      setFeedback(`${msg} ${finalDamage} DMG! 🗿 GOLEM SHIELD BREAKER (Bypassed ${baseShield}% Shield)`);
    } else if (shield > 0) {
      setFeedback(`${msg} ${finalDamage} DMG (-${shield}% Shield)`);
    } else {
      setFeedback(`${msg} ${finalDamage} DMG!`);
    }
    triggerAttack(finalDamage, true, false, isCrit);
  };


  const startRecording = async () => {
    nativeSuccessRef.current = false;
    allHeardTextRef.current = '';
    isRecordingRef.current = true;
    
    // Instantly show recording UI (zero latency response)
    // Instantly show recording UI (zero latency response)
    setIsRecording(true);
    setStatus('ready');
    
    // Live Volume Meter setup: Taps into the microphone's live AudioStream 
    // to render a pulsing red ring around the button that expands dynamically 
    // based on the volume of the user's voice.
    (async () => {
      try {
        // Re-enable Auto-Gain Control so the OS boosts quiet microphones!
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } 
        });
        micStreamRef.current = stream;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioContext();
        analyserRef.current = audioCtxRef.current.createAnalyser();
        const source = audioCtxRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);
        analyserRef.current.fftSize = 256;
        const bufferLength = analyserRef.current.fftSize;
        const dataArray = new Uint8Array(bufferLength);

        const updateVolume = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteTimeDomainData(dataArray);
          
          let maxDeviation = 0;
          for(let i = 0; i < bufferLength; i++) {
            const deviation = Math.abs(dataArray[i] - 128);
            if (deviation > maxDeviation) maxDeviation = deviation;
          }
          
          // Ultra-amplification: Multiply the raw deviation by 15!
          // If the mic only registers a tiny deviation of 4 out of 128, it becomes 60% full!
          setMicVolume(Math.min(100, Math.round(maxDeviation * 15)));
          rafIdRef.current = requestAnimationFrame(updateVolume);
        };
        updateVolume();
      } catch (e) {
        console.warn("Could not start volume meter", e);
      }
    })();

    // 1. Check for Native SpeechRecognition (Chrome, Safari, Edge, Android, iOS)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
    
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        // Restore continuous mode so you never have to click to start
        recognition.continuous = true;   
        recognition.interimResults = true; // Get real-time feedback
        recognition.maxAlternatives = 5;
        recognition.lang = 'en-US';
        
        // SOTA: Inject JSGF Grammar to heavily bias the browser's STT weights toward the target word!
        if (SpeechGrammarList) {
          const speechRecognitionList = new SpeechGrammarList();
          const targetW = wordRef.current || word;
          // Format: JSGF V1.0 Grammar
          const grammar = '#JSGF V1.0; grammar targetWord; public <targetWord> = ' + targetW + ' ;';
          try {
            speechRecognitionList.addFromString(grammar, 1);
            recognition.grammars = speechRecognitionList;
          } catch(e){
            console.warn("Grammar injection not supported on this browser version");
          }
        }
        
        recognition.onresult = (event) => {
          if (isEvaluatingRef.current) return; // Ignore background speech during attack animation!
          
          // Extract ONLY the current utterance from the resultIndex onwards
          let fullText = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i] && event.results[i][0]) {
              fullText += event.results[i][0].transcript + ' ';
            }
          }
          fullText = fullText.trim();
          
          // Also collect alternative transcripts
          let altTexts = [];
          for (let i = 0; i < event.results.length; i++) {
            if (event.results[i]) {
              for (let j = 0; j < event.results[i].length; j++) {
                if (event.results[i][j] && event.results[i][j].transcript) {
                  altTexts.push(event.results[i][j].transcript.trim());
                }
              }
            }
          }
          
          // Store as plain string (safe from Chrome invalidation!)
          if (fullText) {
            allHeardTextRef.current = fullText;
            setIsSpeaking(true);
            
            // clear it after a short delay so they stop animating if they pause
            setTimeout(() => {
              if (allHeardTextRef.current === fullText) {
                setIsSpeaking(false);
              }
            }, 1000);
          }
          
          // Show live feedback so user sees what Chrome is hearing
          if (fullText) {
            setFeedback(`🎤 Hearing: "${fullText}"...`);
          }
          
          // Wait exactly 0.75s (750ms) of silence to ensure user has finished talking!
          if (evalDebounceRef.current) clearTimeout(evalDebounceRef.current);
          
          evalDebounceRef.current = setTimeout(() => {
            const currentWord = wordRef.current;
            const allToCheck = [fullText, ...altTexts].filter(Boolean);
            
            for (const text of allToCheck) {
              const evalResult = checkSpeechMatch(text, currentWord);
              if (evalResult) {
                // Mute the AI for 1.5s during the attack animation so it doesn't double-trigger
                isEvaluatingRef.current = true;
                executeAttackSuccess(evalResult, true);
                
                setTimeout(() => {
                  isEvaluatingRef.current = false;
                }, 1500);
                return;
              }
            }
          }, 750);
        };

        recognition.onstart = () => {
          setTimeout(() => {
            if (isRecordingRef.current) {
              setFeedback(`🎤 Mic active - Speak "${wordRef.current || word}"!`);
            }
          }, 150);
        };

        // CRITICAL: Handle Chrome auto-stopping (silence timeout, network blip, or manual stop)
        recognition.onend = () => {
          // If mic is supposed to be on and instance wasn't killed by word transition, auto-restart
          if (isRecordingRef.current && recognitionRef.current === recognition) {
            setTimeout(() => {
              if (isRecordingRef.current && recognitionRef.current === recognition) {
                try {
                  recognition.start();
                } catch(e) {
                  // Fallback: re-initialize recording if engine instance was killed
                  startRecording();
                }
              }
            }, 150);
          }
        };

        recognition.onerror = (err) => {
          console.warn("Native SpeechRecognition error:", err.error);
          // Don't stop on 'no-speech' — just let onend restart it
          if (err.error === 'not-allowed' || err.error === 'audio-capture') {
            isRecordingRef.current = false;
            setIsRecording(false);
            setStatus('ready');
            setFeedback("Mic access denied. Check browser permissions!");
          }
        };

        recognition.onstart = () => {
          // Native engine has fully attached to the mic
        };

        recognition.start();
        recognitionRef.current = recognition;
        setStatus('ready');
        setIsRecording(true);
        setFeedback("⚡ Listening... Speak now!");
        return; // Pure native mode: DO NOT start MediaRecorder or call Gemini API!
      } catch (e) {
        console.warn("Native SpeechRecognition start error, falling back:", e);
      }
    }

    // 2. Fallback for browsers without Native SpeechRecognition (e.g. Firefox)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm', audioBitsPerSecond: 16000 });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        handleAudioSubmit(audioBlob);
      };

      recorder.start();
      setIsRecording(true);
      setFeedback("Listening (Gemini Backup)...");
    } catch (err) {
      console.error(err);
      setFeedback("Mic error. Check permissions.");
    }
  };

  const stopRecording = () => {
    isRecordingRef.current = false; // Signal onend NOT to restart
    setIsRecording(false);
    cleanupVolumeMeter();

    // Native Browser STT Mode
    if (recognitionRef.current) {
       try { recognitionRef.current.stop(); } catch(e){}
       recognitionRef.current = null;

       if (!nativeSuccessRef.current) {
          // Final check on accumulated plain-string transcript
          const heardText = allHeardTextRef.current;
          const evalResult = checkSpeechMatch(heardText, word);
          if (evalResult) {
             nativeSuccessRef.current = true;
             setStatus('ready');
             executeAttackSuccess(evalResult, true);
          } else {
             setStatus('ready');
             if (heardText) {
               setFeedback(`Heard: "${heardText}" — Try saying "${word}"!`);
             } else {
               setFeedback(`Press mic and say "${word}"!`);
             }
          }
       }
       return;
    }

    // Fallback MediaRecorder Mode for Firefox
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
       mediaRecorderRef.current.stop();
       setStatus('loading');
       setFeedback("Analyzing audio...");
    }
  };

  const handleAudioSubmit = async (blob) => {
    try {
      const formData = new FormData();
      formData.append('voiceRecord', blob, 'attack.webm');
      formData.append('targetSentence', word);
      formData.append('grade', grade || '3rd Grade');

      const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/audio/evaluate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      const data = await res.json();
      setStatus('ready');
      
      if (gameStateRef.current !== 'playing') {
        return; // Game over or stage cleared while waiting for AI
      }

      if (data.success) {
        const score = data.score;
        if (score > 0) {
          const mult = score === 4 ? 1.0 : score === 3 ? 0.85 : score === 2 ? 0.7 : 0.5;
          const evalRes = {
            stars: score,
            multiplier: mult,
            feedback: "Hit!"
          };
          executeAttackSuccess(evalRes, false);
        } else {
          setFeedback("Missed! Try to speak clearer!");
          pickNewWord(stage);
        }
      } else {
        setFeedback(data.error || "Didn't hear you clearly. Try again!");
        pickNewWord(stage);
      }
    } catch (err) {
      console.error(err);
      setStatus('ready');
      setFeedback("Network error.");
      pickNewWord(stage);
    }
  };

  const triggerAttack = (damage, success = true, isPetAttack = false, isCrit = false) => {
    if (isCrit) {
      setCritTrigger(true);
      setTimeout(() => setCritTrigger(false), 1200);
    }
    if (!isPetAttack) {
        setAnimTrigger('player_attack');
        setTimeout(() => {
          setAnimTrigger('monster_hit');
          setHp(prev => {
            const monster = MONSTERS[stage];
            let newHp = Math.max(0, prev - damage);
            
            if (newHp === 0) {
               setTimeout(() => {
                 setGameState('stage_clear');
                 handleEarnBattleStars(monster.reward || 10);
                 if (!clearedStages.includes(stage)) {
                   const newGradeCleared = [...clearedStages, stage];
                   const newMap = { ...clearedStagesByGrade, [activeGrade]: newGradeCleared };
                   setClearedStagesByGrade(newMap);
                   localStorage.setItem('voiceBattleClearedByGrade', JSON.stringify(newMap));
                   if (syncProgress) syncProgress({ clearedVoiceStages: newMap });
                 }
               }, 500);
            } else {
               if (success) {
                   pickNewWord(stage);
               }
            }
            return newHp;
          });
        }, 300);
    } else {
        // Pet 3-step sequence
        setAnimTrigger('pet_inhale');
        
        setTimeout(() => {
            setAnimTrigger('pet_attack');
        }, 150);
        
        setTimeout(() => {
          setAnimTrigger('monster_hit_fire');
          setHp(prev => {
            const monster = MONSTERS[stage];
            let newHp = Math.max(0, prev - damage);
            
            if (newHp === 0) {
               setTimeout(() => {
                 setGameState('stage_clear');
                 handleEarnBattleStars(monster.reward || 10);
                 if (!clearedStages.includes(stage)) {
                   const newGradeCleared = [...clearedStages, stage];
                   const newMap = { ...clearedStagesByGrade, [activeGrade]: newGradeCleared };
                   setClearedStagesByGrade(newMap);
                   localStorage.setItem('voiceBattleClearedByGrade', JSON.stringify(newMap));
                   if (syncProgress) syncProgress({ clearedVoiceStages: newMap });
                 }
               }, 500);
            }
            return newHp;
          });
        }, 450);
    }
  };

  if (view === 'levels') {
    return (
      <div className="max-w-5xl mx-auto pt-6 animate-in fade-in slide-in-from-bottom-4">
        <button onClick={onBack} className="mb-4 text-slate-500 hover:text-slate-800 font-bold flex items-center gap-2">
          <ChevronLeft size={16}/> Back to Menu
        </button>
        
        <div className="bg-white p-10 rounded-[3rem] shadow-xl text-center border-4 border-indigo-100">
          <div className="flex justify-center items-center mb-8">
            <h2 className="text-4xl font-extrabold text-slate-800 flex items-center gap-3">
               <Gamepad2 className="text-indigo-500" size={40} />
               {t('voice_battle_title')}
            </h2>
          </div>

          {/* Character and Pet Selection */}
          <div className="flex flex-col md:flex-row justify-center gap-8 mb-12">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
               <p className="text-xl text-slate-500 font-bold mb-4">{t('choose_hero')}</p>
               <div className="flex justify-center gap-6">
                  <button onClick={() => setSelectedChar('char_wizard')} className={`group relative w-24 h-24 rounded-3xl border-4 flex items-center justify-center text-5xl transition-all ${selectedChar === 'char_wizard' ? 'border-indigo-500 bg-indigo-50 scale-110 shadow-lg' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                    🧙‍♂️
                    <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap pointer-events-none z-50">
                      <div className="font-bold">Wizard</div>
                      <div className="text-slate-300">Base Damage: 20</div>
                    </div>
                  </button>
                  
                  <button disabled={!hasKnight} onClick={() => setSelectedChar('char_knight')} className={`group relative w-24 h-24 rounded-3xl border-4 flex items-center justify-center overflow-visible transition-all ${!hasKnight ? 'opacity-50 grayscale cursor-not-allowed border-slate-200 bg-slate-100' : selectedChar === 'char_knight' ? 'border-indigo-500 bg-indigo-50 scale-110 shadow-lg' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                    <div className="w-full h-full rounded-2xl overflow-hidden flex items-center justify-center relative">
                      <img src="/assets/knight_hero.jpg" alt="Knight" className="w-20 h-20 object-contain mix-blend-multiply" />
                      {!hasKnight && <div className="absolute inset-0 bg-slate-900/10 flex items-center justify-center"><Lock size={24} className="text-slate-800 bg-white/80 p-1 rounded-full"/></div>}
                    </div>
                    {hasKnight && (
                      <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap pointer-events-none z-50">
                        <div className="font-bold">Knight</div>
                        <div className="text-slate-300">Base Damage: 30</div>
                      </div>
                    )}
                  </button>
                  
                  <button disabled={!hasPaladin} onClick={() => setSelectedChar('char_paladin')} className={`group relative w-24 h-24 rounded-3xl border-4 flex items-center justify-center overflow-visible transition-all ${!hasPaladin ? 'opacity-50 grayscale cursor-not-allowed border-slate-200 bg-slate-100' : selectedChar === 'char_paladin' ? 'border-indigo-500 bg-indigo-50 scale-110 shadow-lg' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                    <div className="w-full h-full rounded-2xl overflow-hidden flex items-center justify-center relative">
                      <img src="/assets/paladin_hero.jpg" alt="Paladin" className="w-20 h-20 object-contain mix-blend-multiply" />
                      {!hasPaladin && <div className="absolute inset-0 bg-slate-900/10 flex items-center justify-center"><Lock size={24} className="text-slate-800 bg-white/80 p-1 rounded-full"/></div>}
                    </div>
                    {hasPaladin && (
                      <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap pointer-events-none z-50">
                        <div className="font-bold">Paladin</div>
                        <div className="text-slate-300">Base Damage: 50</div>
                      </div>
                    )}
                  </button>
               </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
               <p className="text-xl text-slate-500 font-bold mb-4">{t('choose_pet')}</p>
               <div className="flex justify-center gap-6">
                  <button disabled={!hasDragon} onClick={() => setSelectedPet(selectedPet === 'pet_dragon' ? null : 'pet_dragon')} className={`group relative w-24 h-24 rounded-3xl border-4 flex items-center justify-center overflow-visible transition-all ${!hasDragon ? 'opacity-50 grayscale cursor-not-allowed border-slate-200 bg-slate-100' : selectedPet === 'pet_dragon' ? 'border-indigo-500 bg-indigo-50 scale-110 shadow-lg' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                    <div className="w-full h-full rounded-2xl overflow-hidden flex items-center justify-center relative">
                      <img src="/assets/pet_dragon.png" alt="Dragon" className="w-16 h-16 object-contain" />
                      {!hasDragon && <div className="absolute inset-0 bg-slate-900/10 flex items-center justify-center"><Lock size={24} className="text-slate-800 bg-white/80 p-1 rounded-full"/></div>}
                    </div>
                    {hasDragon && (
                      <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap pointer-events-none z-50">
                        <div className="font-bold">Dragon</div>
                        <div className="text-slate-300">Passive: 10 DMG / 3s</div>
                      </div>
                    )}
                  </button>

                  <button disabled={!hasGriffin} onClick={() => setSelectedPet(selectedPet === 'pet_griffin' ? null : 'pet_griffin')} className={`group relative w-24 h-24 rounded-3xl border-4 flex items-center justify-center overflow-visible transition-all ${!hasGriffin ? 'opacity-50 grayscale cursor-not-allowed border-slate-200 bg-slate-100' : selectedPet === 'pet_griffin' ? 'border-indigo-500 bg-indigo-50 scale-110 shadow-lg' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                    <div className="w-full h-full rounded-2xl overflow-hidden flex items-center justify-center relative">
                      <img src="/assets/pet_griffin.png" alt="Griffin" className="w-16 h-16 object-contain" />
                      {!hasGriffin && <div className="absolute inset-0 bg-slate-900/10 flex items-center justify-center"><Lock size={24} className="text-slate-800 bg-white/80 p-1 rounded-full"/></div>}
                    </div>
                    {hasGriffin && (
                      <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap pointer-events-none z-50">
                        <div className="font-bold">Griffin</div>
                        <div className="text-slate-300">Passive: 5x Damage</div>
                      </div>
                    )}
                  </button>

                  <button disabled={!hasGolem} onClick={() => setSelectedPet(selectedPet === 'pet_golem' ? null : 'pet_golem')} className={`group relative w-24 h-24 rounded-3xl border-4 flex items-center justify-center overflow-visible transition-all ${!hasGolem ? 'opacity-50 grayscale cursor-not-allowed border-slate-200 bg-slate-100' : selectedPet === 'pet_golem' ? 'border-indigo-500 bg-indigo-50 scale-110 shadow-lg' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                    <div className="w-full h-full rounded-2xl overflow-hidden flex items-center justify-center relative">
                      <img src="/assets/pet_golem.png" alt="Golem" className="w-16 h-16 object-contain" />
                      {!hasGolem && <div className="absolute inset-0 bg-slate-900/10 flex items-center justify-center"><Lock size={24} className="text-slate-800 bg-white/80 p-1 rounded-full"/></div>}
                    </div>
                    {hasGolem && (
                      <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap pointer-events-none z-50">
                        <div className="font-bold">Golem</div>
                        <div className="text-slate-300">Passive: Ignore Shields</div>
                      </div>
                    )}
                  </button>
               </div>
            </div>
          </div>
          
          <p className="text-xl text-slate-500 font-bold mb-10">{t('select_monster')}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {MONSTERS.map((monster, idx) => {
              // Level 1 (idx 0) is always unlocked; subsequent levels require ALL previous levels to be cleared (bypassed for teacher2026/admin)
              const isLocked = !isAdmin && idx > 0 && Array.from({ length: idx }, (_, i) => i).some(prevIdx => !clearedStages.includes(prevIdx));
              const mStyle = MONSTER_STYLES[monster.name] || MONSTER_STYLES["Slime"];

              return (
                <div 
                  key={idx} 
                  onClick={() => !isLocked && startLevel(idx)}
                  className={`border-2 rounded-[2.5rem] p-6 transition-all duration-300 relative group flex flex-col items-center ${
                    idx === 19 && !isLocked
                      ? 'bg-slate-900 border-amber-400 shadow-[0_0_30px_rgba(244,63,94,0.4)] text-white hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(244,63,94,0.7)]'
                      : isLocked 
                        ? 'bg-slate-100 border-slate-200 cursor-not-allowed opacity-75' 
                        : 'bg-white border-slate-100 cursor-pointer hover:border-indigo-300 hover:-translate-y-2 shadow-lg hover:shadow-2xl'
                  }`}
                >
                  {idx === 19 && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 via-rose-500 to-amber-400 text-white text-[0.65rem] font-black tracking-widest uppercase px-4 py-1 rounded-full shadow-lg border-2 border-white z-30 animate-pulse whitespace-nowrap">
                      👑 FINAL SUPREME BOSS 👑
                    </div>
                  )}

                  {isLocked && (
                    <div className="absolute inset-0 bg-slate-900/15 rounded-[2.5rem] flex flex-col items-center justify-center backdrop-blur-[2px] z-20">
                      <div className="bg-slate-800 text-white p-4 rounded-full shadow-lg mb-2">
                        <Lock size={32} />
                      </div>
                      <span className="font-extrabold text-slate-800 bg-white/95 px-4 py-1.5 rounded-full shadow-md text-xs text-center border border-slate-200">
                        Clear Stage {idx} to Unlock
                      </span>
                    </div>
                  )}
                  
                  {/* 3D Monster Avatar Orb */}
                  <div className={`${idx === 19 ? 'w-36 h-36 border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.8)] animate-pulse' : 'w-32 h-32 border-4'} rounded-full mb-4 bg-gradient-to-br ${mStyle.bg} flex items-center justify-center border-4 ${mStyle.border} shadow-xl relative transition-transform duration-300 group-hover:scale-110 overflow-hidden ${isLocked ? 'grayscale opacity-50' : ''}`}>
                    {monster.image ? (
                      <img src={monster.image} alt={monster.name} className="w-full h-full object-cover rounded-full mix-blend-screen scale-110" />
                    ) : (
                      <span className={`${idx === 19 ? 'text-[5.5rem]' : 'text-[5rem]'} relative z-10`}>{monster.emoji}</span>
                    )}
                  </div>

                  <h3 className={`text-2xl font-black mb-0.5 ${idx === 19 && !isLocked ? 'text-amber-400' : 'text-slate-800'}`}>Stage {idx + 1}</h3>
                  <h4 className={`text-lg font-extrabold mb-4 ${idx === 19 && !isLocked ? 'text-rose-400' : 'text-indigo-600'}`}>{monster.name}</h4>
                  
                  <div className="flex flex-wrap justify-center items-center gap-2 text-xs font-extrabold mt-auto">
                    <span className="flex items-center gap-1 text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                      <Heart size={14} className="fill-rose-500" /> {monster.maxHp} HP
                    </span>
                    <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                      <Zap size={14} className="fill-blue-500" /> {monster.shield}% Shield
                    </span>
                    <span className="flex items-center gap-1 text-amber-700 bg-gradient-to-r from-amber-100 to-yellow-100 px-3 py-1 rounded-full border border-amber-300 shadow-2xs">
                      ⭐ +{monster.reward} Stars
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const currentMonster = MONSTERS[stage];
  const hpPercentage = Math.max(0, (hp / currentMonster.maxHp) * 100);

  return (
    <div className="max-w-5xl mx-auto pt-6 animate-in fade-in slide-in-from-bottom-4">
      <button onClick={() => { stopRecording(); setView('levels'); }} className="mb-4 text-slate-500 hover:text-slate-800 font-bold flex items-center gap-2">
        <ChevronLeft size={16}/> Back to Levels
      </button>
      
      <div className="bg-white p-10 rounded-[3rem] shadow-xl text-center border-4 border-indigo-100">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-extrabold text-slate-800 flex items-center gap-3">
             <Gamepad2 className="text-indigo-500" size={40} />
             Voice Battle
          </h2>
          <div className="flex items-center gap-8">
             <div className="text-2xl font-bold text-slate-500">Stage {stage + 1}</div>
             <div className={`flex items-center gap-2 text-2xl font-bold px-4 py-2 rounded-full ${timer <= 10 ? 'bg-red-100 text-red-500 animate-pulse' : 'bg-slate-100 text-slate-700'}`}>
                <Timer size={24} /> 0:{timer < 10 ? `0${timer}` : timer}
             </div>
          </div>
        </div>

        {/* Game Stage */}
        <div className="relative w-full h-80 bg-sky-100 rounded-3xl overflow-hidden mb-8 shadow-inner border-8 border-sky-200">
           {/* Floor */}
           <div className="absolute bottom-0 w-full h-1/4 bg-green-500 border-t-8 border-green-600"></div>

           {/* Monster Area */}
           {(() => {
             const mStyle = MONSTER_STYLES[currentMonster.name] || MONSTER_STYLES["Slime"];
             return (
               <div className="absolute right-[16%] bottom-[16%] flex flex-col items-center z-20">
                 {/* Monster HP & Name Badge */}
                 <div className="flex flex-col items-center mb-3">
                   <div className="flex items-center gap-2 bg-slate-900/90 text-white text-xs font-black px-3.5 py-1 rounded-full border border-slate-700 shadow-md mb-1.5">
                     <span>{currentMonster.emoji} {currentMonster.name}</span>
                     <span className="text-amber-400">Lv.{stage + 1}</span>
                   </div>
                   <div className="w-48 h-6 bg-slate-900 border-2 border-slate-700 rounded-full overflow-hidden relative shadow-lg">
                     <div className="h-full bg-gradient-to-r from-rose-500 to-red-600 transition-all duration-500" style={{ width: `${hpPercentage}%` }}></div>
                     <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{hp} / {currentMonster.maxHp} HP</span>
                   </div>
                 </div>

                 {/* Clean Monster Avatar on Battle Arena Floor */}
                  {currentMonster.image ? (
                    <div className={`relative flex items-center justify-center transition-all duration-300 ${animTrigger === 'monster_hit' ? 'animate-shake scale-110' : 'animate-bounce-slow'}`}>
                      <img src={currentMonster.image} alt={currentMonster.name} className="w-40 h-40 sm:w-44 sm:h-44 object-contain filter drop-shadow-[0_0_20px_rgba(244,63,94,0.9)] relative z-10" />
                      <div className="absolute -bottom-2 w-32 h-6 bg-black/30 rounded-full blur-xs -z-10"></div>
                    </div>
                  ) : (
                    <div className={`relative flex items-center justify-center transition-all duration-300 ${animTrigger === 'monster_hit' ? 'animate-shake scale-110' : 'animate-bounce-slow'}`}>
                      <div className={`w-36 h-36 rounded-full bg-gradient-to-br ${mStyle.bg} flex items-center justify-center border-4 ${mStyle.border} shadow-xl relative`}>
                        <span className="text-[5.5rem] relative z-10">
                          {currentMonster.emoji}
                        </span>
                      </div>

                      {/* Shadow Pedestal under Monster */}
                      <div className="absolute -bottom-4 w-32 h-6 bg-black/20 rounded-full blur-xs -z-10"></div>
                    </div>
                  )}
               </div>
             );
           })()}

           {/* Player Area */}
           <div className={`absolute left-[15%] bottom-1/4 filter drop-shadow-2xl transition-all duration-300 ${
             animTrigger === 'player_attack' 
               ? 'translate-x-12 -translate-y-4 scale-110' 
               : isSpeaking 
                 ? 'scale-110 -translate-y-2' 
                 : 'scale-100'
             }`}
           >
             {selectedChar === 'char_paladin' ? (
               <img src={animTrigger === 'player_attack' ? "/assets/paladin_attack.png" : "/assets/paladin_idle.png"} alt="Paladin" className="w-40 h-40 object-contain" />
             ) : selectedChar === 'char_knight' ? (
               <img src={animTrigger === 'player_attack' ? "/assets/knight_attack.png" : "/assets/knight_idle.png"} alt="Knight" className="w-40 h-40 object-contain" />
             ) : (
               <span className="text-[7rem] filter drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">🧙‍♂️</span>
             )}
             
             {/* Custom Pet */}
             {selectedPet === 'pet_dragon' && (
                <>
                  <div className="relative">
                    <img 
                      src={animTrigger === 'pet_attack' ? "/assets/pet_dragon_attack.png" : "/assets/pet_dragon.png"} 
                      alt="Dragonling" 
                      className={`absolute -top-10 -right-16 h-24 object-contain filter drop-shadow-[0_0_10px_rgba(255,100,0,0.5)] transition-all duration-[150ms] ease-out ${animTrigger === 'pet_attack' ? 'w-36 [mask-image:linear-gradient(to_right,black_65%,transparent_98%)] [-webkit-mask-image:linear-gradient(to_right,black_65%,transparent_98%)]' : 'w-24'} ${
                         petDisabledTimer > 0 ? 'grayscale opacity-60' :
                         animTrigger === 'pet_inhale' ? 'scale-x-[-0.9] scale-y-110 -translate-x-4' : 
                         animTrigger === 'pet_attack' ? 'scale-x-[-1] scale-110 translate-x-6 -translate-y-2' : 
                         'scale-x-[-1] animate-bounce-slow'
                      }`} 
                    />
                    {petDisabledTimer > 0 && (
                      <span className="absolute -top-14 -right-16 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-white shadow-md z-30 whitespace-nowrap animate-pulse">
                        🚫 Silenced ({petDisabledTimer}s)
                      </span>
                    )}
                  </div>
                  {/* Natural Dragon Fireball Effect originating directly from the mouth */}
                  {animTrigger === 'pet_inhale' && (
                    <div 
                      className="absolute z-30 pointer-events-none rounded-full animate-ping"
                      style={{
                        top: '90px',
                        right: '-84px',
                        width: '18px',
                        height: '18px',
                        background: 'radial-gradient(circle, #ffffff 20%, #f97316 60%, #dc2626 100%)',
                        boxShadow: '0 0 20px 8px rgba(249, 115, 22, 0.9)',
                      }}
                    />
                  )}

                  <div 
                    className="absolute z-30 pointer-events-none flex items-center"
                    style={{
                      top: animTrigger === 'pet_attack' ? '90px' : '90px',
                      right: animTrigger === 'pet_attack' ? '-500px' : '-85px',
                      opacity: animTrigger === 'pet_attack' ? 1 : 0,
                      transform: animTrigger === 'pet_attack' ? 'scale(1.25)' : 'scale(0.2)',
                      transition: animTrigger === 'pet_attack' 
                        ? 'right 300ms cubic-bezier(0.2, 0.8, 0.4, 1), transform 300ms ease-out, opacity 100ms ease-in' 
                        : 'none'
                    }}
                  >
                    {/* Fiery Trail stretching to the left behind the fireball */}
                    <div 
                      className="h-6 rounded-l-full animate-pulse"
                      style={{
                        width: '45px',
                        background: 'linear-gradient(to right, transparent, #ef4444, #f97316, #fbbf24)',
                        filter: 'blur(2px)',
                        marginRight: '-10px'
                      }}
                    />

                    {/* Main Fireball Body */}
                    <div className="relative w-10 h-10 flex items-center justify-center">
                      {/* Outer Flame Aura */}
                      <div 
                        className="absolute inset-0 rounded-full animate-spin"
                        style={{
                          background: 'radial-gradient(circle, #fef08a 0%, #f97316 50%, #dc2626 90%)',
                          boxShadow: '0 0 25px 10px rgba(249, 115, 22, 0.85), 0 0 10px 4px rgba(239, 68, 68, 0.9)',
                          borderRadius: '50% 40% 50% 40%'
                        }}
                      />

                      {/* White-Hot Core */}
                      <div className="relative w-5 h-5 rounded-full bg-white shadow-[0_0_12px_#fff]" />

                      {/* Flame Particles */}
                      <span 
                        className="absolute text-2xl transform rotate-90 -translate-x-1"
                        style={{ filter: 'drop-shadow(0 0 8px #f97316)' }}
                      >
                        🔥
                      </span>
                    </div>
                  </div>
                </>
             )}
             {selectedPet === 'pet_griffin' && (
                <div className="relative">
                  <img src="/assets/pet_griffin.png" alt="Griffin" className={`absolute -top-12 -right-20 w-32 h-32 object-contain animate-bounce-slow filter drop-shadow-[0_0_15px_rgba(0,150,255,0.5)] scale-x-[-1] ${petDisabledTimer > 0 ? 'grayscale opacity-60' : ''}`} />
                  {petDisabledTimer > 0 && (
                    <span className="absolute -top-14 -right-16 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-white shadow-md z-30 whitespace-nowrap animate-pulse">
                      🚫 Silenced ({petDisabledTimer}s)
                    </span>
                  )}
                </div>
             )}
             {selectedPet === 'pet_golem' && (
                <div className="relative">
                  <img src="/assets/pet_golem.png" alt="Golem" className={`absolute -top-4 -right-16 w-24 h-24 object-contain animate-bounce-slow filter drop-shadow-[0_0_10px_rgba(0,255,100,0.5)] scale-x-[-1] ${petDisabledTimer > 0 ? 'grayscale opacity-60' : ''}`} />
                  {petDisabledTimer > 0 && (
                    <span className="absolute -top-14 -right-16 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-white shadow-md z-30 whitespace-nowrap animate-pulse">
                      🚫 Silenced ({petDisabledTimer}s)
                    </span>
                  )}
                </div>
             )}
           </div>

           {/* Magic Projectile FX (Only for Wizard) - Facing Forward & Disappears on Impact */}
           {selectedChar !== 'char_paladin' && selectedChar !== 'char_knight' && (
             <div 
               className={`absolute text-6xl z-30 pointer-events-none transition-all ease-linear`}
               style={{
                 left: animTrigger === 'player_attack' ? '70%' : '22%',
                 bottom: animTrigger === 'player_attack' ? '40%' : '40%',
                 opacity: animTrigger === 'player_attack' ? 1 : 0,
                 transform: 'scale-x-[-1] rotate(-45deg)',
                 transitionDuration: animTrigger === 'player_attack' ? '300ms' : '0ms'
               }}
             >
               ☄️
             </div>
           )}

           {/* (Pet Fireball has been moved inside the Player Area container) */}


           {/* FX */}
           {animTrigger === 'monster_hit' && (
              <div className="absolute right-1/4 bottom-1/2 text-5xl text-yellow-400 animate-ping z-40">
                 <Zap size={64} fill="currentColor" />
              </div>
           )}
           {critTrigger && gameState === 'playing' && (
              <div className="absolute right-1/4 top-1/4 text-5xl font-black text-red-500 drop-shadow-[0_0_15px_rgba(255,0,0,1)] animate-in zoom-in fade-in duration-300 z-40 transform rotate-12">
                 💥 CRITICAL HIT! 💥
              </div>
           )}

           {/* Overlays */}
           {gameState === 'stage_clear' && (
              <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 z-[100]">
                 <div className="text-6xl mb-2 animate-bounce">🎉</div>
                 <h3 className="text-5xl font-black text-amber-400 mb-2 drop-shadow-md">STAGE CLEAR!</h3>
                 <p className="text-slate-300 font-bold text-lg mb-6">Great job! You defeated the monster!</p>
                 <button onClick={() => setView('levels')} className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-2xl rounded-full shadow-[0_8px_0_rgba(202,138,4,1)] active:shadow-none active:translate-y-2 transition-all">
                   Back to Levels
                 </button>
              </div>
           )}

           {gameState === 'game_over' && (
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 z-[100]">
                 <div className="text-6xl mb-2 animate-bounce">⏰</div>
                 <h3 className="text-5xl font-black text-rose-500 mb-2 drop-shadow-md">TIME'S UP!</h3>
                 <p className="text-slate-300 font-bold text-lg mb-6">Don't give up! Try speaking faster next time!</p>
                 <button onClick={resetGame} className="px-8 py-4 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-2xl rounded-full shadow-[0_8px_0_rgb(225,29,72)] active:shadow-none active:translate-y-2 transition-all">
                   Try Again
                 </button>
              </div>
           )}

           {gameState === 'victory' && (
              <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 z-[100]">
                 <div className="text-6xl mb-2 animate-bounce">🏆</div>
                 <h3 className="text-5xl font-black text-amber-400 mb-2 drop-shadow-md">VICTORY!</h3>
                 <p className="text-slate-300 font-bold text-lg mb-6">You defeated all the monsters in Voice Battle!</p>
                 <button onClick={resetGame} className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-2xl rounded-full shadow-[0_8px_0_rgba(202,138,4,1)] active:shadow-none active:translate-y-2 transition-all">
                   Play Again
                 </button>
              </div>
           )}
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center opacity-100 transition-opacity" style={{ opacity: gameState === 'playing' ? 1 : 0.3, pointerEvents: gameState === 'playing' ? 'auto' : 'none' }}>
           <div className="text-6xl font-black text-indigo-700 mb-2 tracking-wider uppercase drop-shadow-sm">
             {word}
           </div>
           <p className="text-xl text-slate-500 font-bold h-8 mb-8">{status === 'loading' ? 'Analyzing...' : feedback}</p>

           <button 
             onClick={toggleRecording}
             disabled={status === 'loading' || gameState !== 'playing'}
             className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center transition-all ${
               isRecording 
                 ? 'bg-green-500 text-white animate-pulse shadow-[0_0_60px_rgba(34,197,94,0.8)] scale-110' 
                 : status === 'loading'
                   ? 'bg-slate-300 text-slate-500'
                   : 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-[0_8px_0_rgb(79,70,229)] active:shadow-none active:translate-y-2'
             }`}
           >
             <Mic size={48} />
           </button>
           
           <div className="flex flex-col items-center justify-center gap-2 mt-6">
             {isRecording && (
                <div className="flex flex-col items-center">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">
                    🔴 MIC ON - SPEAK NOW
                  </p>
                  <div className="w-64 h-4 bg-slate-200 rounded-full overflow-hidden border border-slate-300 relative">
                     <div 
                       className={`absolute left-0 top-0 bottom-0 transition-all duration-75 ${micVolume > 15 ? 'bg-green-500' : 'bg-amber-400'}`} 
                       style={{ width: `${Math.max(5, micVolume)}%` }}
                     ></div>
                  </div>
                  <span className="text-xs font-bold mt-1 text-slate-400">{micVolume > 15 ? "Loud & Clear!" : "Too quiet..."}</span>
                </div>
             )}

             {!isRecording && (
               <button 
                 onClick={() => {
                   pickNewWord(stage);
                   if (!isRecording) startRecording();
                 }}
                 className="mt-4 text-sm font-bold text-indigo-500 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-6 py-3 rounded-full transition-colors shadow-sm"
               >
                 Skip Word ⏭️
               </button>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};
