const PLACEHOLDER_OPTIONS = ['一个小袋子', '一张纸地图', '一个干净的杯子', '一顶蓝色的帽子'];

// Placement vocabulary asks students to recognize an English word. The
// meaning choices are Chinese so children can show word knowledge without
// being held back by an English dictionary definition.
const VOCABULARY_DEFINITIONS_ZH = {
  book: '有许多纸页的读物', pen: '写字用的笔', bag: '装东西的袋子', desk: '学习用的桌子',
  chair: '坐的椅子', school: '孩子学习的地方', teacher: '帮助孩子学习的人', friend: '认识并喜欢的人',
  apple: '一种圆圆的水果', water: '可以喝的水', cat: '会“喵喵”叫的小动物', dog: '会叫的动物',
  bird: '有翅膀的动物', tree: '有树干的高大植物', flower: '植物开出的彩色花朵', sun: '白天在天空中发亮的太阳',
  rain: '从云里落下的水', red: '苹果常见的颜色', blue: '晴朗天空的颜色', green: '草的颜色',
  big: '大的', small: '不大的', hot: '温度高的', cold: '不暖和的', eat: '吃食物', drink: '喝水或果汁',
  run: '用脚快速移动', walk: '用脚慢慢走', open: '把东西打开', close: '把东西关上',
  adventure: '令人兴奋的旅行或活动', arrive: '到达某个地方', belong: '属于某人', collect: '把东西收集在一起',
  decide: '想一想后作出选择', empty: '里面没有东西的', hurry: '快速地做事或走路', invite: '请某人来',
  local: '附近的；当地的', message: '传给别人的信息', notice: '注意到；看到', patient: '能安静等待的',
  prepare: '为某事做好准备', protect: '保护；使安全', quiet: '声音很小的；安静的', return: '回到原来的地方',
  search: '仔细寻找', select: '选出一个', several: '几个', sudden: '突然发生的', travel: '从一个地方去另一个地方',
  useful: '有用的', village: '有一些房子的村庄', warning: '提醒危险的标志或话', weather: '外面的雨、风、太阳或雪',
  wonder: '感到好奇；想知道', wrap: '用纸或布包住', yesterday: '今天的前一天', zigzag: '有尖角转弯的线', proper: '合适的；正确的',
  ancient: '很久以前的；古老的', arrange: '按顺序摆放', balance: '不会倒下的平稳状态', border: '两个地方之间的边界',
  connect: '把两样东西连在一起', discover: '第一次发现', effort: '为做好一件事付出的努力', examine: '非常仔细地查看',
  explain: '讲清楚，让人明白', gather: '把人或东西聚在一起', improve: '让……变得更好', include: '包含在里面',
  journey: '一段旅行', measure: '测量大小、长度或数量', observe: '仔细观察', receive: '收到', reduce: '使变少',
  region: '一个较大的地区', respect: '尊重；好好对待', result: '最后的结果', route: '从一地到另一地的路线',
  separate: '分成不同的部分', solve: '找到问题的答案', supply: '需要的物品储备', support: '帮助；支持',
  value: '有多重要或有多有用', whole: '全部的；完整的', method: '做事的方法'
};

const optionSet = (answer, pool, seed) => {
  const distractors = [];
  for (const value of [...pool, ...PLACEHOLDER_OPTIONS]) {
    if (value !== answer && !distractors.includes(value)) distractors.push(value);
    if (distractors.length === 3) break;
  }
  const options = [...distractors];
  const correct = seed % 4;
  options.splice(correct, 0, answer);
  return { options, correct, answer };
};

const parseWords = (rows) => rows.map(row => {
  const [word, definition] = row.split('|');
  return { word, definition };
});

const makeVocabItems = (level, rows) => {
  const localizedRows = rows.map(row => ({ ...row, definition: VOCABULARY_DEFINITIONS_ZH[row.word] }));
  if (localizedRows.some(row => !row.definition)) throw new Error('A placement vocabulary word is missing its Chinese definition.');
  const pool = localizedRows.map(row => row.definition);
  return localizedRows.map(({ word, definition }, index) => ({
    id: `adaptive-vocab-${level}-${index + 1}`,
    section: 'vocab',
    level,
    q: `What does “${word}” mean?`,
    ...optionSet(definition, pool, index + level * 3)
  }));
};

const LEVEL_ONE_WORDS = parseWords([
  'book|pages you read', 'pen|a tool used for writing', 'bag|something used to carry things',
  'desk|a table used for schoolwork', 'chair|something you sit on', 'school|a place where children learn',
  'teacher|a person who helps children learn', 'friend|a person you like and know', 'apple|a round fruit',
  'water|something you drink', 'cat|a small animal that says meow', 'dog|an animal that can bark',
  'bird|an animal with wings', 'tree|a tall plant with a trunk', 'flower|the colorful part of a plant',
  'sun|the bright thing in the sky in daytime', 'rain|water that falls from clouds', 'red|the color of an apple',
  'blue|the color of a clear sky', 'green|the color of grass', 'big|large in size',
  'small|not large', 'hot|having a high temperature', 'cold|not warm',
  'eat|to have food', 'drink|to have water or juice', 'run|to move very fast on your feet',
  'walk|to move on your feet slowly', 'open|to move something so it is not closed', 'close|to shut something'
]);

const LEVEL_TWO_WORDS = parseWords([
  'adventure|an exciting trip or activity', 'arrive|to get to a place', 'belong|to be owned by someone',
  'collect|to bring things together', 'decide|to choose after thinking', 'empty|having nothing inside',
  'hurry|to move or do something quickly', 'invite|to ask someone to come', 'local|from a nearby place',
  'message|a piece of information sent to someone', 'notice|to see or become aware of something', 'patient|able to wait calmly',
  'prepare|to get ready for something', 'protect|to keep safe', 'quiet|making little or no sound',
  'return|to go back to a place', 'search|to look carefully for something', 'select|to choose one thing',
  'several|more than two but not many', 'sudden|happening quickly and without warning', 'travel|to go from one place to another',
  'useful|helpful for a purpose', 'village|a small group of homes', 'warning|a sign that tells about danger',
  'weather|rain, wind, sun, or snow outside', 'wonder|to want to know about something', 'wrap|to cover something with paper or cloth',
  'yesterday|the day before today', 'zigzag|a line with sharp turns', 'proper|right or suitable for a situation'
]);

const LEVEL_THREE_WORDS = parseWords([
  'ancient|very old from a long time ago', 'arrange|to put things in a careful order', 'balance|a steady position that does not fall',
  'border|the edge between two places', 'connect|to join two things together', 'discover|to find something for the first time',
  'effort|hard work to do something', 'examine|to look at something very carefully', 'explain|to make something clear by telling about it',
  'gather|to bring people or things together', 'improve|to make something better', 'include|to have something as part of a group',
  'journey|a trip from one place to another', 'measure|to find the size or amount of something', 'observe|to watch carefully',
  'protect|to keep safe from harm', 'receive|to get something that is sent or given', 'reduce|to make something less',
  'region|a large area of a country', 'respect|to treat someone or something well', 'result|what happens in the end',
  'route|the way from one place to another', 'separate|to divide things into different groups', 'solve|to find an answer to a problem',
  'supply|a store of things that are needed', 'support|to help a person or idea', 'value|how useful or important something is',
  'whole|all of something, with no part missing', 'wonder|to think with surprise or interest', 'method|a way of doing something'
]);

const grammarItem = (level, index, q, answer, wrongA, wrongB) => ({
  id: `adaptive-grammar-${level}-${index + 1}`,
  section: 'grammar',
  level,
  q,
  options: [answer, wrongA, wrongB],
  answer
});

const LEVEL_ONE_GRAMMAR = [
  ...[['I', 'am'], ['You', 'are'], ['He', 'is'], ['She', 'is'], ['We', 'are'], ['They', 'are'], ['The dog', 'is'], ['My friends', 'are'], ['The apples', 'are'], ['It', 'is']].map(([subject, answer], index) => {
    const otherChoices = ['am', 'is', 'are'].filter(word => word !== answer);
    return grammarItem(1, index, `${subject} ___ ready.`, answer, otherChoices[0], otherChoices[1]);
  }),
  ...[['cat', 'cats'], ['box', 'boxes'], ['bus', 'buses'], ['baby', 'babies'], ['dish', 'dishes'], ['toy', 'toys'], ['fox', 'foxes'], ['leaf', 'leaves'], ['book', 'books'], ['watch', 'watches']].map(([singular, answer], index) => grammarItem(1, index + 10, `Choose the correct plural: ${singular}.`, answer, singular, `a ${singular}`)),
  ...[['The ball is ___ the box.', 'in', 'on', 'under'], ['The cup is ___ the desk.', 'on', 'in', 'under'], ['The cat is ___ the chair.', 'under', 'in', 'on'], ['___ is my red pen.', 'This', 'These', 'Those'], ['___ are my shoes.', 'These', 'This', 'That'], ['I ___ swim.', 'can', 'am', 'is'], ['She ___ a blue bag.', 'has', 'have', 'having'], ['We ___ rice for lunch.', 'have', 'has', 'having'], ['___ is at the door?', 'Who', 'Where', 'When'], ['The bird ___ in the tree.', 'is', 'are', 'am']].map(([q, answer, wrongA, wrongB], index) => grammarItem(1, index + 20, q, answer, wrongA, wrongB))
];

const LEVEL_TWO_GRAMMAR = [
  ...[
    ['Yesterday, Mia ___ home.', 'walked', 'walk', 'walking'],
    ['Yesterday, the children ___ a game.', 'played', 'play', 'playing'],
    ['Yesterday, Dad ___ the car.', 'washed', 'wash', 'washing'],
    ['Yesterday, Bo ___ over a puddle.', 'jumped', 'jump', 'jumping'],
    ['Yesterday, we ___ Grandma.', 'visited', 'visit', 'visiting'],
    ['Yesterday, Lan ___ for her pencil.', 'looked', 'look', 'looking'],
    ['Yesterday, I ___ my little sister.', 'helped', 'help', 'helping'],
    ['Yesterday, Mei ___ a picture.', 'painted', 'paint', 'painting'],
    ['Yesterday, Mom ___ her friend.', 'called', 'call', 'calling'],
    ['Yesterday, Jun ___ the bag home.', 'carried', 'carry', 'carrying']
  ].map(([q, answer, wrongA, wrongB], index) => grammarItem(2, index, q, answer, wrongA, wrongB)),
  ...[
    ['Look! Mia ___ a story now.', 'is reading', 'reads', 'read'],
    ['Look! The children ___ outside now.', 'are playing', 'play', 'played'],
    ['Look! Dad ___ dinner now.', 'is cooking', 'cooks', 'cooked'],
    ['Look! We ___ for the bus now.', 'are waiting', 'wait', 'waited'],
    ['Look! The dog ___ fast now.', 'is running', 'runs', 'ran'],
    ['Look! The students ___ pictures now.', 'are drawing', 'draw', 'drew'],
    ['Look! The baby ___ now.', 'is sleeping', 'sleeps', 'slept'],
    ['Look! The girls ___ now.', 'are singing', 'sing', 'sang'],
    ['Look! Bo ___ a note now.', 'is writing', 'writes', 'wrote'],
    ['Look! We ___ the room now.', 'are cleaning', 'clean', 'cleaned']
  ].map(([q, answer, wrongA, wrongB], index) => grammarItem(2, index + 10, q, answer, wrongA, wrongB)),
  ...[
    ['This box is ___ than that box.', 'bigger', 'big', 'biggest'],
    ['This cup is ___ than that cup.', 'smaller', 'small', 'smallest'],
    ['A bike is ___ than walking.', 'faster', 'fast', 'fastest'],
    ['My brother is ___ than me.', 'taller', 'tall', 'tallest'],
    ['Mia is ___ than Bo when she writes.', 'more careful', 'careful', 'most careful'],
    ['A clean bottle is ___ than a broken one.', 'more useful', 'useful', 'most useful'],
    ['Today is ___ than yesterday.', 'warmer', 'warm', 'warmest'],
    ['This ruler is ___ than that ruler.', 'shorter', 'short', 'shortest'],
    ['A rope is ___ than a thread.', 'stronger', 'strong', 'strongest'],
    ['This book is ___ than that book.', 'more interesting', 'interesting', 'most interesting']
  ].map(([q, answer, wrongA, wrongB], index) => grammarItem(2, index + 20, q, answer, wrongA, wrongB))
];

const LEVEL_THREE_GRAMMAR = [
  ...[
    ['They ___ their work already.', 'have finished', 'finished', 'finish'],
    ['Mia ___ her aunt this month.', 'has visited', 'visited', 'visit'],
    ['We ___ that bird before.', 'have seen', 'saw', 'see'],
    ['Dad ___ the table already.', 'has cleaned', 'cleaned', 'clean'],
    ['We ___ a paper bridge.', 'have made', 'made', 'make'],
    ['Mei ___ a letter to her friend.', 'has written', 'wrote', 'write'],
    ['The students ___ many new words.', 'have learned', 'learned', 'learn'],
    ['Bo ___ his lost hat.', 'has found', 'found', 'find'],
    ['We ___ beans in the garden.', 'have planted', 'planted', 'plant'],
    ['Lan ___ this story before.', 'has read', 'read', 'reads']
  ].map(([q, answer, wrongA, wrongB], index) => grammarItem(3, index, q, answer, wrongA, wrongB)),
  ...[
    ['If it rains, we ___ inside.', 'will stay', 'stayed', 'stays'],
    ['If we leave now, we ___ the early bus.', 'will take', 'took', 'takes'],
    ['If we water it, the plant ___.', 'will grow', 'grew', 'grows'],
    ['If you ask, I ___ you.', 'will help', 'helped', 'helps'],
    ['If the bell rings, the shop ___.', 'will close', 'closed', 'closes'],
    ['If everyone is ready, we ___ the game.', 'will start', 'started', 'starts'],
    ['If the bag is heavy, I ___ it.', 'will carry', 'carried', 'carries'],
    ['If you practice, you ___ more words.', 'will learn', 'learned', 'learns'],
    ['If we have time, we ___ the museum.', 'will visit', 'visited', 'visits'],
    ['If the train is on time, it ___ at noon.', 'will arrive', 'arrived', 'arrives']
  ].map(([q, answer, wrongA, wrongB], index) => grammarItem(3, index + 10, q, answer, wrongA, wrongB)),
  ...[
    ['The bridge ___ by workers last year.', 'was built', 'built', 'is building'],
    ['The tree ___ by our class last spring.', 'was planted', 'planted', 'is planting'],
    ['The wall ___ by the students yesterday.', 'was painted', 'painted', 'is painting'],
    ['The room ___ by the class after lunch.', 'was cleaned', 'cleaned', 'is cleaning'],
    ['The boxes ___ by Dad this morning.', 'were carried', 'carried', 'are carrying'],
    ['The bike ___ by Uncle Li last week.', 'was fixed', 'fixed', 'is fixing'],
    ['The snacks ___ by all the children.', 'were shared', 'shared', 'are sharing'],
    ['The plant ___ by Mei yesterday.', 'was measured', 'measured', 'is measuring'],
    ['The bottles ___ by the class last Friday.', 'were collected', 'collected', 'are collecting'],
    ['The homework ___ by the teacher.', 'was checked', 'checked', 'is checking']
  ].map(([q, answer, wrongA, wrongB], index) => grammarItem(3, index + 20, q, answer, wrongA, wrongB))
];

const READING_STUDENTS = [['Ming', '明明'], ['Lan', '兰兰'], ['Bo', '波波'], ['Mei', '美美'], ['Jun', '军军'], ['Rui', '瑞瑞']];
const READING_TIMES = [['Monday', '星期一'], ['Tuesday', '星期二'], ['Saturday', '星期六']];

const parseReadingThemes = rows => rows.map(row => {
  const parts = row.split('|');
  // Level 1 themes include a Chinese title, while the later banks omit it.
  // Parse both shapes explicitly so Chinese support fields can never shift
  // into the English passage or question text.
  const hasChineseTitle = parts.length === 11;
  const [title, titleZh, past, verb, pastZh, item, itemZh, place, placeZh, helper, helperZh] = hasChineseTitle
    ? parts
    : [parts[0], parts[0], ...parts.slice(1)];
  return { title, titleZh, past, verb, pastZh, item, itemZh, place, placeZh, helper, helperZh };
});

const READING_THEMES = {
  1: parseReadingThemes([
    'A New Plant|新植物|planted|plant|种下了|a bean seed|一颗豆种子|the school garden|学校花园|a cup of water|一杯水',
    'The Lost Mitten|丢失的手套|found|find|找到了|a blue mitten|一只蓝手套|the playground|操场|a small bench|一张小凳子',
    'Morning Bread|早晨的面包|bought|buy|买了|warm bread|热面包|the village shop|村里的小店|a paper bag|一个纸袋',
    'A Little Nest|小鸟窝|watched|watch|看着|a bird nest|一个鸟窝|the old tree|老树上|three small eggs|三颗小鸟蛋',
    'The Yellow Boots|黄色雨靴|wore|wear|穿着|yellow boots|黄色雨靴|the wet path|湿湿的小路|a red umbrella|一把红伞',
    'Paper Flowers|纸花|made|make|做了|paper flowers|纸花|the art table|美术桌上|green paper leaves|绿色纸叶',
    'A Clean Bowl|washed|wash|洗了|a rice bowl|一个饭碗|the kitchen tap|厨房水龙头旁|a soft cloth|一块软布',
    'The Red Kite|flew|fly|放飞了|a red kite|一只红风筝|the open field|空地上|a long string|一根长线',
    'Sweet Corn|picked|pick|摘了|sweet corn|甜玉米|the family farm|家里的农田|a woven basket|一个编织篮',
    'The Class Fish|fed|feed|喂了|the class fish|班里的小鱼|the classroom corner|教室角落|tiny fish food|小鱼食'
  ]),
  2: parseReadingThemes([
    'Garden Labels|花园标签|labeled|label|贴好了标签|young plants|小植物|the class garden|班级菜园|small wooden signs|小木牌',
    'Rainy Day Books|sorted|sort|整理了|library books|图书馆的书|the reading room|阅览室|a dry cloth|一块干布',
    'Market List|checked|check|核对了|a food list|一张食物清单|the morning market|早市上|fresh tomatoes|新鲜番茄',
    'The Bike Pump|repaired|repair|修好了|a bike tire|一个自行车轮胎|the bike shed|自行车棚旁|a hand pump|一个打气筒',
    'Weather Notes|recorded|record|记录了|the daily weather|每天的天气|the classroom window|教室窗边|a blue chart|一张蓝色图表',
    'A Paper Bridge|tested|test|测试了|a paper bridge|一座纸桥|the science table|科学桌上|four small coins|四枚小硬币',
    'Classroom Map|drew|draw|画了|a classroom map|一张教室地图|the quiet corner|安静的角落|colored pencils|彩色铅笔',
    'A Noodle Meal|cooked|cook|煮了|vegetable noodles|蔬菜面|the school kitchen|学校厨房|a bowl of greens|一碗青菜',
    'Clean Water Bottles|collected|collect|收集了|reusable bottles|可重复使用的瓶子|the school gate|学校门口|a large bag|一个大袋子',
    'Dance Steps|practiced|practice|练习了|dance steps|舞步|the school hall|学校礼堂|a music player|一个音乐播放器'
  ]),
  3: parseReadingThemes([
    'Water Plan|planned|plan|计划了|water-saving steps|节水办法|the class meeting|班会上|a large poster|一张大海报',
    'Village Route|mapped|map|画了地图|village paths|村庄小路|the community hall|社区活动室|a folded map|一张折叠地图',
    'Sunlight Notes|measured|measure|测量了|sunlight on plants|植物上的阳光|the greenhouse|温室里|a small timer|一个小计时器',
    'Old Book Covers|repaired|repair|修补了|old book covers|旧书皮|the village library|村图书馆里|clear tape|透明胶带',
    'Stream Number|recorded|record|记录了|the stream level|小溪水位|the stone bridge|石桥边|a measuring stick|一根量尺',
    'New Library Books|organized|organize|整理了|donated books|捐来的书|the library room|图书室里|paper labels|纸标签',
    'Wind Vane|built|build|做了|a wind vane|一个风向标|the school roof|学校屋顶上|a plastic arrow|一个塑料箭头',
    'Bean Plant Chart|compared|compare|比较了|two bean plants|两株豆苗|the class window|教室窗边|a short ruler|一把短尺子',
    'Festival Poster|designed|design|设计了|a festival poster|一张节日海报|the art club|美术社团|bright markers|彩色记号笔',
    'Soil Samples|tested|test|测试了|soil samples|土壤样本|the science garden|科学花园|small jars|小罐子'
  ])
};

const buildReadingItems = level => {
  const themes = READING_THEMES[level];
  const people = READING_STUDENTS.map(([name]) => name);
  const helpers = themes.map(theme => theme.helper);
  return themes.flatMap((theme, themeIndex) => READING_TIMES.map(([time, timeZh], variantIndex) => {
    const index = themeIndex * 3 + variantIndex;
    const [who, whoZh] = READING_STUDENTS[index % READING_STUDENTS.length];
    const titleSuffix = variantIndex ? ` on ${time}` : '';
    const titleSuffixZh = variantIndex ? `（${timeZh}）` : '';
    const text = level === 1
      ? { en: `On ${time}, ${who} ${theme.past} ${theme.item} at ${theme.place}. A friend brought ${theme.helper}. ${who} smiled before going home.`, zh: `${timeZh}，${whoZh}在${theme.placeZh}${theme.pastZh}${theme.itemZh}。一位朋友带来了${theme.helperZh}。回家前，${whoZh}笑了。` }
      : level === 2
        ? { en: `On ${time}, ${who} ${theme.past} ${theme.item} at ${theme.place}. A friend brought ${theme.helper}, so the work was easier. Before leaving, ${who} checked the work once more. The teacher thanked the pair.`, zh: `${timeZh}，${whoZh}在${theme.placeZh}${theme.pastZh}${theme.itemZh}。一位朋友带来了${theme.helperZh}，所以工作更容易完成。离开前，${whoZh}又检查了一次。老师感谢了他们。` }
        : { en: `On ${time}, ${who} ${theme.past} ${theme.item} at ${theme.place}. A friend brought ${theme.helper}, which helped the group work carefully. Before leaving, ${who} checked the result and wrote a short note. They planned to look at it again next week.`, zh: `${timeZh}，${whoZh}在${theme.placeZh}${theme.pastZh}${theme.itemZh}。一位朋友带来了${theme.helperZh}，帮助大家认真完成工作。离开前，${whoZh}检查了结果并写下一条短笔记。他们计划下周再看一次。` };
    // Every reading question is answered by a later sentence. This makes
    // children read the whole short passage, while the question itself stays
    // a concrete Who, What, or When question.
    const questions = level === 1
      ? [
        ['What did a friend bring?', theme.helper, helpers, 2],
        [`Who smiled before going home?`, who, people, 3],
        [`When did ${who} smile?`, 'before going home', ['before going home', 'after lunch', 'in the morning', 'at night'], 3]
      ]
      : level === 2
        ? [
          ['What did a friend bring?', theme.helper, helpers, 2],
          [`What did ${who} do before leaving?`, 'checked the work once more', ['checked the work once more', 'went home at once', 'played a game', 'ate lunch'], 3],
          ['Who thanked the pair?', 'the teacher', people, 4]
        ]
        : [
          ['What did a friend bring?', theme.helper, helpers, 2],
          [`What did ${who} write before leaving?`, 'a short note', ['a short note', 'a long letter', 'a song', 'a shopping list'], 3],
          ['When did they plan to look at it again?', 'next week', ['next week', 'tomorrow', 'after lunch', 'last year'], 4]
        ];
    const preparedQuestions = questions.map(([q, answer, pool, evidenceSentence], questionIndex) => ({
      q,
      evidenceSentence,
      ...optionSet(answer, pool, index * 5 + questionIndex)
    }));
    return { id: `adaptive-reading-${level}-${index + 1}`, passageId: `adaptive-passage-${level}-${index + 1}`, section: 'reading', level, title: { en: `${theme.title}${titleSuffix}`, zh: `${theme.titleZh}${titleSuffixZh}` }, text, questions: preparedQuestions };
  }));
};

const speakingItems = (level, sentences) => sentences.map((target, index) => ({ id: `adaptive-speaking-${level}-${index + 1}`, section: 'speaking', level, target }));

const LEVEL_ONE_SPEAKING = [
  'I see a red bus.', 'The cat is on the mat.', 'My bag is blue.', 'We can jump high.', 'I have two pens.',
  'The sun is warm.', 'A bird can sing.', 'This is my book.', 'The dog is small.', 'We play after class.',
  'My mom has a hat.', 'The fish is in water.', 'I like sweet corn.', 'The tree is tall.', 'He can ride a bike.',
  'She has a yellow kite.', 'The ball is under the chair.', 'I wash my hands.', 'We eat rice at school.', 'The baby is asleep.',
  'They are my friends.', 'The cup is on the table.', 'I can read this word.', 'The duck is by the pond.', 'My shoes are new.',
  'The rabbit has long ears.', 'We walk home together.', 'The flower is pink.', 'I see three stars.', 'Please close the door.'
];

const LEVEL_TWO_SPEAKING = [
  'I am reading a new story.', 'We walked to the market yesterday.', 'My brother is drawing a map.', 'They played football after school.', 'The rain stopped before lunch.',
  'She is carrying a basket of apples.', 'We visited our grandparents last weekend.', 'The children are waiting by the gate.', 'My class made paper lanterns.', 'He is washing the blue cups.',
  'The bus arrived early this morning.', 'We are planting seeds in the garden.', 'I helped my teacher clean the desk.', 'They are looking at the weather chart.', 'My sister cooked noodles for dinner.',
  'We watched birds near the river.', 'The dog is sleeping by the door.', 'I collected smooth stones on Saturday.', 'They are making a birdhouse now.', 'My friend borrowed my red ruler.',
  'We carried the boxes to class.', 'She is writing a letter home.', 'The team practiced dance steps today.', 'I found my mitten under the bench.', 'They are sorting books in the library.',
  'My father repaired the bicycle bell.', 'We are sharing oranges at lunch.', 'The farmer picked corn this morning.', 'I measured the rain in a cup.', 'Please show me the way.'
];

const LEVEL_THREE_SPEAKING = [
  'I have finished my reading task.', 'We have planted young trees by the road.', 'My group is planning a water-saving poster.', 'They have measured the stream level today.', 'I will check the map again tomorrow.',
  'The old book cover was repaired carefully.', 'We have organized the donated books.', 'If it rains, we will stay inside.', 'My class has created a reading schedule.', 'They are comparing two bean plants.',
  'I have written the results in my notebook.', 'The route begins near the village square.', 'We will visit the weather station on Friday.', 'The soil samples were placed in small jars.', 'My friend has explained the project clearly.',
  'We have collected stories from local elders.', 'The poster was hung by the entrance.', 'I will bring a ruler for the science task.', 'They have checked the sports equipment.', 'The wind vane turned toward the north.',
  'We are reducing the paper we throw away.', 'The bridge was marked on the map.', 'I have received a new library card.', 'If the door is loose, we will repair it.', 'Our teacher has encouraged the whole class.',
  'We will compare the results next week.', 'The class has prepared museum notes.', 'I have arranged the books by topic.', 'The team will support the new students.', 'Please tell me where the path begins.'
];

export const ADAPTIVE_PLACEMENT_BANK = {
  vocab: [
    ...makeVocabItems(1, LEVEL_ONE_WORDS),
    ...makeVocabItems(2, LEVEL_TWO_WORDS),
    ...makeVocabItems(3, LEVEL_THREE_WORDS)
  ],
  grammar: [...LEVEL_ONE_GRAMMAR, ...LEVEL_TWO_GRAMMAR, ...LEVEL_THREE_GRAMMAR],
  reading: [...buildReadingItems(1), ...buildReadingItems(2), ...buildReadingItems(3)],
  speaking: [
    ...speakingItems(1, LEVEL_ONE_SPEAKING),
    ...speakingItems(2, LEVEL_TWO_SPEAKING),
    ...speakingItems(3, LEVEL_THREE_SPEAKING)
  ]
};

export const ADAPTIVE_SECTION_ORDER = ['vocab', 'grammar', 'reading', 'speaking'];

export const validateAdaptivePlacementBank = () => {
  const errors = [];
  Object.entries(ADAPTIVE_PLACEMENT_BANK).forEach(([section, items]) => {
    [1, 2, 3].forEach(level => {
      const levelItems = items.filter(item => item.level === level);
      if (levelItems.length !== 30) errors.push(`${section} level ${level} has ${levelItems.length} items, expected 30.`);
      if (new Set(levelItems.map(item => item.id)).size !== levelItems.length) errors.push(`${section} level ${level} has duplicate IDs.`);
      if (section === 'reading' && new Set(levelItems.map(item => item.text.en)).size !== levelItems.length) errors.push(`reading level ${level} has duplicate passages.`);
      if (section === 'speaking' && new Set(levelItems.map(item => item.target)).size !== levelItems.length) errors.push(`speaking level ${level} has duplicate sentences.`);
      levelItems.forEach(item => {
        const questions = section === 'reading' ? item.questions : section === 'speaking' ? [] : [item];
        questions.forEach(question => {
          const answer = question.answer ?? question.options?.[question.correct];
          if (!question.q || !question.options || question.options.length < 3 || new Set(question.options).size !== question.options.length || !question.options.includes(answer)) errors.push(`${item.id} has invalid answer choices.`);
          if (section === 'reading' && Number(question.evidenceSentence) < 2) errors.push(`${item.id} has a reading question answered by its first sentence.`);
        });
      });
    });
  });
  if (errors.length) throw new Error(`Adaptive placement bank validation failed:\n${errors.join('\n')}`);
  return true;
};

validateAdaptivePlacementBank();
