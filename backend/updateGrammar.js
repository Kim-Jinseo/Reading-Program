import fs from 'fs';

const grade12 = [
  {
    "id": 201,
    "dayIndex": 100,
    "title": { "en": "A vs An", "zh": "A 和 An 的用法" },
    "desc": { "en": "Learn when to use 'a' and 'an'.", "zh": "学习什么时候用 'a'，什么时候用 'an'。" },
    "rule": { "en": "Use 'a' before consonants and 'an' before vowels (a, e, i, o, u).", "zh": "在辅音前用 'a'，在元音 (a, e, i, o, u) 前用 'an'。" },
    "questions": [
      { "q": "I have ___ cat.", "options": ["a", "an", "the"], "a": "a", "difficulty": 1 },
      { "q": "It is ___ dog.", "options": ["a", "an", "the"], "a": "a", "difficulty": 1 },
      { "q": "He eats ___ apple.", "options": ["a", "an", "the"], "a": "an", "difficulty": 2 },
      { "q": "She sees ___ elephant.", "options": ["a", "an", "the"], "a": "an", "difficulty": 2 },
      { "q": "I want ___ umbrella.", "options": ["a", "an", "the"], "a": "an", "difficulty": 3 },
      { "q": "This is ___ book.", "options": ["a", "an", "the"], "a": "a", "difficulty": 3 }
    ]
  },
  {
    "id": 202,
    "dayIndex": 100,
    "title": { "en": "Pronouns", "zh": "代词" },
    "desc": { "en": "Learn how to say I, You, He, and She.", "zh": "学习如何表达我、你、他、她。" },
    "rule": { "en": "Use 'I' for yourself, 'You' for another person, 'He' for a boy, and 'She' for a girl.", "zh": "用 'I' 表示自己，'You' 表示对方，'He' 表示男孩，'She' 表示女孩。" },
    "questions": [
      { "q": "___ am a boy.", "options": ["I", "You", "He"], "a": "I", "difficulty": 1 },
      { "q": "___ are my friend.", "options": ["I", "You", "She"], "a": "You", "difficulty": 1 },
      { "q": "Look at my brother. ___ is tall.", "options": ["I", "He", "She"], "a": "He", "difficulty": 2 },
      { "q": "This is my sister. ___ is happy.", "options": ["He", "She", "You"], "a": "She", "difficulty": 2 },
      { "q": "___ am reading a book.", "options": ["I", "He", "She"], "a": "I", "difficulty": 3 },
      { "q": "Is ___ a good boy?", "options": ["I", "He", "She"], "a": "He", "difficulty": 3 }
    ]
  },
  {
    "id": 203,
    "dayIndex": 100,
    "title": { "en": "Simple Plurals", "zh": "简单的复数" },
    "desc": { "en": "Learn how to talk about more than one thing.", "zh": "学习如何谈论多个事物。" },
    "rule": { "en": "Add 's' to most words to show there is more than one.", "zh": "在大多数单词后面加上 's' 表示不止一个。" },
    "questions": [
      { "q": "One cat, two ___.", "options": ["cat", "cats", "cates"], "a": "cats", "difficulty": 1 },
      { "q": "One dog, three ___.", "options": ["dog", "dogs", "doges"], "a": "dogs", "difficulty": 1 },
      { "q": "I have four ___.", "options": ["apple", "apples", "appls"], "a": "apples", "difficulty": 2 },
      { "q": "She sees five ___.", "options": ["bird", "birds", "birdes"], "a": "birds", "difficulty": 2 },
      { "q": "There are two ___ on the desk.", "options": ["book", "books", "bookes"], "a": "books", "difficulty": 3 },
      { "q": "Look at the three ___.", "options": ["tree", "trees", "tres"], "a": "trees", "difficulty": 3 }
    ]
  }
];

const grade34 = [
  {
    "id": 301,
    "dayIndex": 100,
    "title": { "en": "Prepositions of Location", "zh": "方位介词" },
    "desc": { "en": "Learn how to describe where things are.", "zh": "学习如何描述事物的位置。" },
    "rule": { "en": "Use 'in' for inside, 'on' for top, and 'under' for below.", "zh": "用 'in' 表示在里面，'on' 表示在上面，'under' 表示在下面。" },
    "questions": [
      { "q": "The book is ___ the desk.", "options": ["in", "on", "under"], "a": "on", "difficulty": 1 },
      { "q": "The apple is ___ the box.", "options": ["in", "on", "under"], "a": "in", "difficulty": 1 },
      { "q": "The dog is sleeping ___ the table.", "options": ["in", "on", "under"], "a": "under", "difficulty": 2 },
      { "q": "The bird is ___ the tree.", "options": ["in", "on", "under"], "a": "in", "difficulty": 2 },
      { "q": "Put the pen ___ the desk.", "options": ["in", "on", "under"], "a": "on", "difficulty": 3 },
      { "q": "My shoes are ___ the bed.", "options": ["in", "on", "under"], "a": "under", "difficulty": 3 }
    ]
  },
  {
    "id": 302,
    "dayIndex": 100,
    "title": { "en": "The 'Be' Verb", "zh": "Be 动词" },
    "desc": { "en": "Learn to use am, is, and are.", "zh": "学习使用 am、is 和 are。" },
    "rule": { "en": "Use 'am' with I, 'is' with He/She/It, and 'are' with You/We/They.", "zh": "I 用 am，He/She/It 用 is，You/We/They 用 are。" },
    "questions": [
      { "q": "I ___ a student.", "options": ["am", "is", "are"], "a": "am", "difficulty": 1 },
      { "q": "He ___ my friend.", "options": ["am", "is", "are"], "a": "is", "difficulty": 1 },
      { "q": "They ___ playing.", "options": ["am", "is", "are"], "a": "are", "difficulty": 2 },
      { "q": "You ___ very kind.", "options": ["am", "is", "are"], "a": "are", "difficulty": 2 },
      { "q": "She ___ reading a book.", "options": ["am", "is", "are"], "a": "is", "difficulty": 3 },
      { "q": "We ___ happy today.", "options": ["am", "is", "are"], "a": "are", "difficulty": 3 }
    ]
  },
  {
    "id": 303,
    "dayIndex": 100,
    "title": { "en": "Simple Present Verbs", "zh": "一般现在时动词" },
    "desc": { "en": "Learn how to talk about habits.", "zh": "学习如何谈论习惯。" },
    "rule": { "en": "Add 's' or 'es' to the verb for He, She, and It.", "zh": "对于 He、She 和 It，在动词后加 's' 或 'es'。" },
    "questions": [
      { "q": "I ___ apples.", "options": ["like", "likes"], "a": "like", "difficulty": 1 },
      { "q": "He ___ apples.", "options": ["like", "likes"], "a": "likes", "difficulty": 1 },
      { "q": "They ___ football.", "options": ["play", "plays"], "a": "play", "difficulty": 2 },
      { "q": "She ___ football.", "options": ["play", "plays"], "a": "plays", "difficulty": 2 },
      { "q": "We ___ to school every day.", "options": ["go", "goes"], "a": "go", "difficulty": 3 },
      { "q": "My dog ___ fast.", "options": ["run", "runs"], "a": "runs", "difficulty": 3 }
    ]
  }
];

const grade56 = [
  {
    "id": 501,
    "dayIndex": 100,
    "title": { "en": "Present Continuous", "zh": "现在进行时" },
    "desc": { "en": "Learn to talk about things happening right now.", "zh": "学习谈论正在发生的事情。" },
    "rule": { "en": "Use am/is/are + verb ending in -ing.", "zh": "使用 am/is/are + 以 -ing 结尾的动词。" },
    "questions": [
      { "q": "I am ___ a book.", "options": ["read", "reading", "reads"], "a": "reading", "difficulty": 1 },
      { "q": "She is ___ milk.", "options": ["drink", "drinking", "drinks"], "a": "drinking", "difficulty": 1 },
      { "q": "They are ___ football.", "options": ["play", "playing", "plays"], "a": "playing", "difficulty": 2 },
      { "q": "He ___ swimming.", "options": ["am", "is", "are"], "a": "is", "difficulty": 2 },
      { "q": "We ___ eating dinner.", "options": ["am", "is", "are"], "a": "are", "difficulty": 3 },
      { "q": "Look! The dog is ___.", "options": ["run", "running", "runs"], "a": "running", "difficulty": 3 }
    ]
  },
  {
    "id": 502,
    "dayIndex": 100,
    "title": { "en": "Comparative Adjectives", "zh": "比较级形容词" },
    "desc": { "en": "Learn how to compare two things.", "zh": "学习如何比较两件事物。" },
    "rule": { "en": "Add -er to short adjectives and use 'than'.", "zh": "在短形容词后加 -er，并使用 'than'。" },
    "questions": [
      { "q": "An elephant is ___ than a dog.", "options": ["big", "bigger", "biggest"], "a": "bigger", "difficulty": 1 },
      { "q": "A mouse is ___ than a cat.", "options": ["small", "smaller", "smallest"], "a": "smaller", "difficulty": 1 },
      { "q": "My car is ___ than yours.", "options": ["fast", "faster", "fastest"], "a": "faster", "difficulty": 2 },
      { "q": "This book is ___ than that one.", "options": ["long", "longer", "longest"], "a": "longer", "difficulty": 2 },
      { "q": "She is ___ than her brother.", "options": ["tall", "taller", "tallest"], "a": "taller", "difficulty": 3 },
      { "q": "Today is ___ than yesterday.", "options": ["cold", "colder", "coldest"], "a": "colder", "difficulty": 3 }
    ]
  },
  {
    "id": 503,
    "dayIndex": 100,
    "title": { "en": "Simple Past Tense", "zh": "一般过去时" },
    "desc": { "en": "Learn how to talk about the past.", "zh": "学习如何谈论过去。" },
    "rule": { "en": "Add -ed to regular verbs. Use 'was' and 'were'.", "zh": "在规则动词后加 -ed。使用 'was' 和 'were'。" },
    "questions": [
      { "q": "I ___ to school yesterday.", "options": ["walk", "walks", "walked"], "a": "walked", "difficulty": 1 },
      { "q": "She ___ TV last night.", "options": ["watch", "watches", "watched"], "a": "watched", "difficulty": 1 },
      { "q": "He ___ happy yesterday.", "options": ["is", "was", "were"], "a": "was", "difficulty": 2 },
      { "q": "They ___ at the park.", "options": ["are", "was", "were"], "a": "were", "difficulty": 2 },
      { "q": "We ___ a good game last week.", "options": ["play", "plays", "played"], "a": "played", "difficulty": 3 },
      { "q": "It ___ very cold last winter.", "options": ["is", "was", "were"], "a": "was", "difficulty": 3 }
    ]
  }
];

const curriculum = JSON.parse(fs.readFileSync('curriculum.json', 'utf8'));
curriculum['1-2'].grammar = grade12;
curriculum['3-4'].grammar = grade34;
curriculum['5-6'].grammar = grade56;

fs.writeFileSync('curriculum.json', JSON.stringify(curriculum, null, 2));
console.log("Updated curriculum.json directly!");
