const LEVEL_THREE_FINAL_SENTENCES = {
  'Renewable Energy Technology': {
    en: 'Students can see solar panels on some school roofs.',
    zh: '学生可以在一些学校屋顶上看到太阳能板。',
    q: 'What can students see on some school roofs?',
    answer: 'solar panels',
    distractors: ['snowmen', 'kite strings', 'fish tanks']
  },
  'The Great Barrier Reef Ecosystem': {
    en: 'Fish can swim between the coral branches.',
    zh: '鱼可以在珊瑚的枝状部分之间游动。',
    q: 'What can swim between the coral branches?',
    answer: 'fish',
    distractors: ['trains', 'dogs', 'bicycles']
  },
  'The History of Printing Press': {
    en: 'Today, students can read many printed books at school.',
    zh: '今天，学生可以在学校读到许多印刷的书。',
    q: 'What can students read at school today?',
    answer: 'many printed books',
    distractors: ['storm clouds', 'toy trains', 'fresh fish']
  },
  'The Science of Photosynthesis': {
    en: 'Leaves use the sugar to help the plant grow.',
    zh: '叶子用糖来帮助植物生长。',
    q: 'What do leaves use to help the plant grow?',
    answer: 'the sugar',
    distractors: ['the snow', 'the sand', 'the smoke']
  },
  'Robotic Exploration of Mars': {
    en: 'The rovers send their pictures back to Earth.',
    zh: '探测车把它们拍的照片传回地球。',
    q: 'Where do the rovers send their pictures?',
    answer: 'back to Earth',
    distractors: ['under the sea', 'to a farm', 'into a cave']
  },
  'Deep-Sea Light': {
    en: 'Doctors can use these tools to help sick people.',
    zh: '医生可以用这些工具帮助生病的人。',
    q: 'Who can use these tools to help sick people?',
    answer: 'Doctors',
    distractors: ['Drivers', 'Farmers', 'Singers']
  },
  'The Physics of Aviation Flight': {
    en: 'Pilots check the wings before a flight.',
    zh: '飞行员在飞行前检查机翼。',
    q: 'Who checks the wings before a flight?',
    answer: 'Pilots',
    distractors: ['Swimmers', 'Painters', 'Gardeners']
  },
  'The Amazon Basin Ecosystem': {
    en: 'Some people plant new trees to help the forest.',
    zh: '一些人种下新树来帮助森林。',
    q: 'What do some people plant to help the forest?',
    answer: 'new trees',
    distractors: ['old shoes', 'paper boats', 'snowballs']
  },
  'The Architecture of Pyramids': {
    en: 'Visitors take photos of the huge pyramid today.',
    zh: '今天，游客给这座巨大的金字塔拍照。',
    q: 'What do visitors take at the huge pyramid?',
    answer: 'photos',
    distractors: ['swimming lessons', 'bus tickets', 'apple seeds']
  },
  'The Science of Hurricanes': {
    en: 'Families listen to weather warnings before a hurricane.',
    zh: '飓风来临前，家人会听天气警报。',
    q: 'What do families listen to before a hurricane?',
    answer: 'weather warnings',
    distractors: ['bedtime stories', 'music lessons', 'bird songs']
  }
};

const sentenceCount = text => (text.match(/[.!?](?=\s|$)/g) || []).length;
const chineseSentenceCount = text => (text.match(/。/g) || []).length;

const shuffledQuestion = (detail, seed) => {
  const options = [detail.answer, ...detail.distractors];
  const answerIndex = seed % options.length;
  const [answer] = options.splice(0, 1);
  options.splice(answerIndex, 0, answer);
  return { q: detail.q, options, correct: answerIndex };
};

// The bundled Level 2 passages already have five sentences. Level 3 receives
// one final factual sentence and a matching question so every Very Hard
// passage has the requested six English and Chinese sentences.
export const applyVeryHardReadingUpdates = (grade, readings) => {
  const updated = grade === '5-6'
    ? readings.map((passage, index) => {
      if (passage.difficulty !== 'super_hard') return passage;
      const detail = LEVEL_THREE_FINAL_SENTENCES[passage.title.en];
      if (!detail) throw new Error(`Missing Level 3 Very Hard update for ${passage.title.en}.`);
      return {
        ...passage,
        text: { en: `${passage.text.en} ${detail.en}`, zh: `${passage.text.zh}${detail.zh}` },
        questions: [...passage.questions.slice(0, 5), shuffledQuestion(detail, index)]
      };
    })
    : readings;

  const targetCount = grade === '3-4' ? 5 : grade === '5-6' ? 6 : null;
  if (targetCount) {
    const invalid = updated.filter(passage => passage.difficulty === 'super_hard' && (
      sentenceCount(passage.text.en) !== targetCount || chineseSentenceCount(passage.text.zh) !== targetCount ||
      passage.questions.length !== 6 || !passage.questions.every(question => question.q && question.options?.length === 4 && Number.isInteger(question.correct)) ||
      (grade === '5-6' && !passage.text.en.includes(passage.questions[5].options[passage.questions[5].correct]))
    ));
    if (invalid.length) throw new Error(`${grade} Very Hard readings do not meet the sentence or question requirements: ${invalid.map(passage => passage.title.en).join(', ')}.`);
  }

  return updated;
};
