import fs from 'fs';

// The original lists were drawn from general-frequency data.  This pass keeps
// useful classroom words, but removes slang, profanity, adult topics, brands,
// politicians, and random names.  Replacement vocabulary is concrete in
// Level 1, everyday descriptive in Level 2, and lightly academic in Level 3.
const REPLACEMENTS = {
  '1-2': {
    being: ['animal', '动物'], state: ['apple', '苹果'], during: ['afternoon', '下午'], against: ['banana', '香蕉'],
    company: ['bread', '面包'], however: ['butterfly', '蝴蝶'], god: ['cake', '蛋糕'], government: ['cat', '猫'],
    public: ['chicken', '小鸡'], business: ['cloud', '云'], system: ['cow', '奶牛'], case: ['desk', '书桌'],
    support: ['dog', '狗'], including: ['duck', '鸭子'], power: ['egg', '鸡蛋'], states: ['farm', '农场'],
    based: ['fish', '鱼'], believe: ['flower', '花'], national: ['frog', '青蛙'], actually: ['garden', '花园'],
    american: ['goat', '山羊'], order: ['grape', '葡萄'], party: ['grass', '草'], country: ['ice', '冰'],
    shit: ['jacket', '夹克衫'], general: ['juice', '果汁'], united: ['kitchen', '厨房'], area: ['lake', '湖'],
    law: ['leaf', '叶子'], war: ['lemon', '柠檬'], president: ['lion', '狮子'], course: ['moon', '月亮'],
    health: ['mouse', '老鼠'], information: ['orange', '橙子'], social: ['panda', '熊猫'], court: ['pencil', '铅笔'],
    guys: ['pig', '猪'], control: ['rabbit', '兔子'], death: ['rain', '雨'], office: ['rice', '米饭'],
    pay: ['river', '河'], fuck: ['sand', '沙子'], history: ['sheep', '绵羊'], research: ['shoe', '鞋'],
    university: ['sky', '天空'], john: ['snow', '雪'], probably: ['spoon', '勺子'], yeah: ['star', '星星'],
    york: ['table', '桌子'], international: ['tiger', '老虎'], possible: ['turtle', '乌龟'], cause: ['village', '村庄'],
    due: ['watermelon', '西瓜'], human: ['window', '窗户'], members: ['wolf', '狼'], data: ['yellow', '黄色'],
    fucking: ['zebra', '斑马'], future: ['blue', '蓝色'], million: ['brown', '棕色'], police: ['green', '绿色'],
    development: ['pink', '粉色'], services: ['purple', '紫色'], although: ['quiet', '安静的'],
    media: ['round', '圆的'], gonna: ['sing', '唱歌'], market: ['smile', '微笑'], political: ['soft', '柔软的'],
    according: ['strong', '强壮的'], available: ['sun', '太阳'], former: ['swim', '游泳'], current: ['tall', '高的'],
    london: ['teacher', '老师'], program: ['thin', '瘦的'], department: ['train', '火车'], energy: ['tree', '树'],
    fight: ['umbrella', '雨伞'], force: ['toy', '玩具'], issue: ['warm', '温暖的'], price: ['wash', '洗'],
    results: ['wave', '波浪'], space: ['wind', '风'], term: ['write', '写'], wife: ['yard', '院子'],
    america: ['candy', '糖果'], project: ['jump', '跳'], reason: ['laugh', '笑'], report: ['listen', '听'],
    whether: ['draw', '画画'], form: ['dance', '跳舞'], further: ['clean', '打扫'], major: ['orange', '橙色']
  },
  '3-4': {
    died: ['adventure', '冒险'], military: ['artist', '艺术家'], private: ['calendar', '日历'], rights: ['celebrate', '庆祝'],
    policy: ['countryside', '乡村'], society: ['craft', '手工艺'], bank: ['curious', '好奇的'], church: ['decorate', '装饰'],
    medical: ['delicious', '美味的'], press: ['discover', '发现'], stuff: ['earth', '地球'], tax: ['festival', '节日'],
    federal: ['friendly', '友好的'], hey: ['gentle', '温和的'], mom: ['healthy', '健康的'], hate: ['helpful', '乐于助人的'],
    blood: ['holiday', '假期'], hell: ['insect', '昆虫'], lord: ['invite', '邀请'], attack: ['island', '岛'],
    damn: ['question', '问题'], kill: ['journey', '旅行'], election: ['language', '语言'], financial: ['lesson', '课程'],
    legal: ['library', '图书馆'], crazy: ['message', '信息'], career: ['minute', '分钟'], army: ['museum', '博物馆'],
    lol: ['neighbor', '邻居'], wanna: ['noisy', '吵闹的'], professional: ['notice', '注意到'], risk: ['ocean', '海洋'],
    david: ['parrot', '鹦鹉'], james: ['patient', '耐心的'], michael: ['picnic', '野餐'], george: ['planet', '行星'],
    paul: ['polite', '有礼貌的'], washington: ['popular', '受欢迎的'], australia: ['prepare', '准备'], canada: ['proud', '自豪的'],
    europe: ['puzzle', '谜题'], india: ['quick', '快的'], russian: ['quiet', '安静的'], ass: ['rainbow', '彩虹'],
    husband: ['recycle', '回收利用'], female: ['relax', '放松'], jesus: ['restaurant', '餐馆'], married: ['robot', '机器人'],
    officer: ['sandwich', '三明治'], minister: ['season', '季节'], california: ['shadow', '影子'], campaign: ['shallow', '浅的'],
    credit: ['shy', '害羞的'], anti: ['skate', '滑冰'], association: ['smart', '聪明的'], committee: ['smooth', '光滑的'],
    conference: ['sunny', '晴朗的'], population: ['surprise', '惊喜'], potential: ['swim', '游泳'], pressure: ['thirsty', '口渴的'],
    treatment: ['ticket', '票'], western: ['together', '一起'], individual: ['turnip', '萝卜'], particular: ['towel', '毛巾'],
    previous: ['traffic', '交通'], region: ['travel', '旅行'], reported: ['treasure', '宝藏'], section: ['umbrella', '雨伞'],
    consider: ['uniform', '制服'], contact: ['useful', '有用的'], throughout: ['vacation', '假期'], absolutely: ['vegetable', '蔬菜'],
    additional: ['visitor', '参观者'], beyond: ['volleyball', '排球'], forces: ['waiter', '服务员'], immediately: ['waterfall', '瀑布'],
    jobs: ['weather', '天气'], significant: ['whisper', '小声说'], studies: ['winter', '冬天'], unless: ['wonderful', '极好的'],
    winning: ['worker', '工人'], construction: ['worry', '担心'], episode: ['yesterday', '昨天'], income: ['zoo', '动物园'],
    justice: ['airport', '机场'], terms: ['apartment', '公寓'], staff: ['arrive', '到达'], super: ['autumn', '秋天'],
    union: ['bakery', '面包店'], sales: ['basket', '篮子'], spent: ['beach', '海滩'], via: ['blanket', '毯子'],
    weight: ['borrow', '借'], addition: ['bridge', '桥'], capital: ['bright', '明亮的'], described: ['brush', '刷子'],
    despite: ['candle', '蜡烛'], focus: ['carrot', '胡萝卜'], sale: ['castle', '城堡'], tour: ['cave', '洞穴'],
    conditions: ['cheese', '奶酪'], earlier: ['chocolate', '巧克力'], extra: ['circle', '圆形'], manager: ['classmate', '同学']
  },
  '5-6': {
    gun: ['observe', '观察'], wow: ['predict', '预测'], dad: ['discover', '发现'], gotta: ['explore', '探索'],
    secretary: ['organize', '组织'], bar: ['cooperate', '合作'], contract: ['communicate', '交流'], degree: ['contribute', '贡献'],
    insurance: ['improve', '改进'], pro: ['compare', '比较'], stupid: ['describe', '描述'], administration: ['summarize', '总结'],
    cancer: ['researcher', '研究人员'], civil: ['resource', '资源'], russia: ['environment', '环境'], stock: ['climate', '气候'],
    trump: ['responsibility', '责任'], awesome: ['confidence', '信心'], cash: ['creative', '有创意的'], commercial: ['honest', '诚实的'],
    fighting: ['respect', '尊重'], operation: ['volunteer', '志愿者；自愿帮助'], analysis: ['ancient', '古老的'], anyway: ['geography', '地理'],
    commission: ['experiment', '实验'], literally: ['measure', '测量'], marriage: ['method', '方法'], patients: ['evidence', '证据'],
    supposed: ['detail', '细节'], thus: ['example', '例子'], congress: ['explain', '解释'], damage: ['progress', '进步'],
    disease: ['strategy', '办法；策略'], doubt: ['curiosity', '好奇心'], established: ['information', '信息'], facebook: ['topic', '话题'],
    gay: ['science', '科学'], germany: ['nature', '大自然'], professor: ['wildlife', '野生动物'], crime: ['habitat', '栖息地'],
    male: ['pollution', '污染'], mrs: ['conserve', '节约；保护'], smith: ['kindness', '善意'], texas: ['courage', '勇气'],
    christian: ['effort', '努力'], holy: ['patience', '耐心'], killing: ['skill', '技能'], nation: ['talent', '才能'],
    peter: ['habit', '习惯'], william: ['focus', '专心'], agency: ['imagine', '想象'], drug: ['create', '创造'],
    economy: ['celebrate', '庆祝'], executive: ['prepare', '准备'], mass: ['share', '分享'], officers: ['welcome', '欢迎'],
    politics: ['teamwork', '团队合作'], trial: ['traveler', '旅行者'], app: ['inventor', '发明家'], application: ['athlete', '运动员'],
    claims: ['musician', '音乐家'], coffee: ['farmer', '农民'], complex: ['engineer', '工程师'], google: ['writer', '作者'],
    murder: ['reader', '读者'], obama: ['speaker', '说话者'], fat: ['listener', '听者'], prior: ['builder', '建造者'],
    religious: ['designer', '设计者'], robert: ['explorer', '探险者'], royal: ['scientist', '科学家'], whom: ['reporter', '记者'],
    investment: ['neighborhood', '社区'], lie: ['transport', '交通工具'], partner: ['bicycle', '自行车'], structure: ['festival', '节日'],
    thomas: ['holiday', '假期'], americans: ['citizen', '公民'], chicago: ['exercise', '锻炼'], critical: ['balance', '平衡'],
    forced: ['temperature', '温度'], mental: ['sunrise', '日出'], tom: ['moonlight', '月光'], totally: ['starlight', '星光'],
    twitter: ['harvest', '收获'], wedding: ['garden', '花园'], african: ['forest', '森林'], arms: ['riverbank', '河岸'],
    click: ['mountain', '山'], estate: ['countryside', '乡村'], faith: ['landmark', '地标'], fund: ['museum', '博物馆'],
    jack: ['laboratory', '实验室'], louis: ['calendar', '日历'], mid: ['compass', '指南针'], paris: ['horizon', '地平线'],
    profile: ['pathway', '小路'], pull: ['journey', '旅程'], push: ['adventure', '冒险'], sexual: ['recycle', '回收利用'],
    agent: ['reusable', '可重复使用的'], authority: ['community', '社区'], basis: ['culture', '文化'], chris: ['tradition', '传统'],
    dude: ['compassion', '关心；同情'], enter: ['investigate', '调查'], foundation: ['invention', '发明'], gain: ['achievement', '成就'],
    individuals: ['coastal', '沿海的'], japanese: ['international', '国际的'], leaders: ['future', '未来'], prime: ['energy', '能量'],
    projects: ['texture', '质地'], soul: ['stewardship', '照顾与保护'], spread: ['rainfall', '降雨量'], supply: ['season', '季节'],
    waste: ['protect', '保护'], weird: ['curious', '好奇的']
  }
};

const SAFE_DISTRACTORS = {
  '1-2': ['苹果', '学校', '朋友', '老师', '太阳', '桌子', '水', '书', '花', '鸟'],
  '3-4': ['图书馆', '花园', '假期', '朋友', '老师', '天气', '故事', '游戏', '动物', '旅行'],
  '5-6': ['环境', '科学', '文化', '社区', '自然', '计划', '方法', '进步', '旅行', '团队']
};

// Frequency lists also contained a few duplicate entries.  Each replacement
// below keeps the same level while giving every card a useful, distinct word.
const FINAL_OVERRIDES = {
  '1-2': {
    65: ['foot', '脚'],
    94: ['hair', '头发'],
    110: ['elbow', '手肘'],
    209: ['knee', '膝盖'],
    247: ['ear', '耳朵'],
    266: ['leg', '腿'],
    290: ['mouth', '嘴'],
    410: ['nose', '鼻子'],
    431: ['dress', '连衣裙'],
    495: ['gentle', '温和的'],
    399: ['violet', '紫罗兰色'],
    499: ['clap', '拍手']
  },
  '3-4': {
    1033: ['butter', '黄油'],
    1037: ['farmer', '农民'],
    1108: ['honey', '蜂蜜'],
    1134: ['guitar', '吉他'],
    1296: ['jelly', '果冻'],
    1300: ['kite', '风筝'],
    1305: ['lamp', '灯'],
    1330: ['moon', '月亮'],
    1334: ['nest', '鸟巢'],
    1358: ['onion', '洋葱'],
    1365: ['pocket', '口袋'],
    1368: ['queen', '女王'],
    1373: ['raincoat', '雨衣'],
    1381: ['sail', '帆'],
    1383: ['squirrel', '松鼠'],
    1387: ['stamp', '邮票'],
    1132: ['sunrise', '日出'],
    1238: ['conversation', '交谈'],
    1211: ['coconut', '椰子'],
    1259: ['penguin', '企鹅'],
    1263: ['noodle', '面条'],
    1265: ['pillow', '枕头'],
    1333: ['pumpkin', '南瓜'],
    1452: ['rainy', '下雨的']
  },
  '5-6': {
    2005: ['telescope', '望远镜'],
    2047: ['arrange', '整理；安排'],
    2092: ['carefully', '仔细地'],
    2183: ['discuss', '讨论'],
    2186: ['plan', '计划'],
    2458: ['map', '地图'],
    2470: ['reuse', '再次使用'],
    2480: ['explore', '探索'],
    2485: ['seaside', '海边'],
    2486: ['country', '国家'],
    2496: ['care', '关心；照顾'],
    2110: ['ecosystem', '生态系统'],
    2244: ['friendship', '友谊'],
    2268: ['invent', '发明'],
    2499: ['renew', '更新；再利用']
  }
};

const UNSAFE_CHINESE = /粗俗|脏话|性别|同性|性的|杀|死亡|战争|政治|总统|宗教|上帝|地狱|毒品|酒吧|酒精|犯罪|婚姻|丈夫|妻子|肥胖|血液|疾病|癌症|枪|武器|金融|税|政府|军事|军队|教会/;

function applyReview(curriculum) {
  const removedDefinitions = new Set();
  const changed = { '1-2': 0, '3-4': 0, '5-6': 0 };

  for (const [grade, replacements] of Object.entries(REPLACEMENTS)) {
    for (const item of curriculum[grade].vocab) {
      const sourceWord = item.word;
      const replacement = replacements[sourceWord];
      if (!replacement) continue;

      removedDefinitions.add(String(item.def ?? '').trim());
      item.word = replacement[0];
      item.def = replacement[1];
      item.answer = replacement[1];
      changed[grade]++;
    }

  }

  for (const [grade, overrides] of Object.entries(FINAL_OVERRIDES)) {
    for (const item of curriculum[grade].vocab ?? []) {
      const override = overrides[item.id];
      if (!override || (item.word === override[0] && item.def === override[1])) continue;
      removedDefinitions.add(String(item.def ?? '').trim());
      item.word = override[0];
      item.def = override[1];
      item.answer = override[1];
      changed[grade]++;
    }
  }

  for (const [grade, gradeData] of Object.entries(curriculum)) {
    for (const item of gradeData.vocab ?? []) {
      const originalIndex = Math.max(0, (item.options ?? []).indexOf(item.answer));
      const options = (item.options ?? []).filter(option => {
        const text = String(option ?? '').trim();
        return text && text !== item.answer && !removedDefinitions.has(text) && !UNSAFE_CHINESE.test(text);
      });
      options.splice(Math.min(originalIndex, options.length), 0, item.answer);

      for (const distractor of SAFE_DISTRACTORS[grade]) {
        if (options.length === 4) break;
        if (distractor !== item.answer && !options.includes(distractor)) options.push(distractor);
      }
      item.options = [...new Set(options)].slice(0, 4);
      if (item.options.length !== 4 || !item.options.includes(item.answer)) {
        throw new Error(`Could not make four safe choices for ${grade} vocabulary ${item.id}.`);
      }
    }
  }

  const invalid = Object.entries(curriculum).flatMap(([grade, gradeData]) =>
    (gradeData.vocab ?? []).filter(item =>
      !item.word || !item.def || item.def !== item.answer || item.options.length !== 4 ||
      new Set(item.options).size !== 4 || !item.options.includes(item.answer) || UNSAFE_CHINESE.test(item.def)
    ).map(item => `${grade}:${item.id}:${item.word}`)
  );
  if (invalid.length) throw new Error(`Vocabulary validation failed: ${invalid.slice(0, 10).join(', ')}`);

  const blocked = Object.entries(curriculum).flatMap(([grade, gradeData]) =>
    (gradeData.vocab ?? []).filter(item =>
      Object.prototype.hasOwnProperty.call(REPLACEMENTS[grade] ?? {}, item.word)
    ).map(item => `${grade}:${item.word}`)
  );
  if (blocked.length) throw new Error(`Unsuitable vocabulary remains: ${blocked.slice(0, 10).join(', ')}`);

  const duplicates = Object.entries(curriculum).flatMap(([grade, gradeData]) => {
    const seen = new Set();
    return (gradeData.vocab ?? []).filter(item => {
      if (seen.has(item.word)) return true;
      seen.add(item.word);
      return false;
    }).map(item => `${grade}:${item.word}`);
  });
  if (duplicates.length) throw new Error(`Duplicate vocabulary remains: ${duplicates.join(', ')}`);

  return changed;
}

const files = ['backend/curriculum.json', 'frontend/user-app/src/data/curriculum.json'];
const results = files.map(file => {
  const curriculum = JSON.parse(fs.readFileSync(file, 'utf8'));
  const changed = applyReview(curriculum);
  fs.writeFileSync(file, `${JSON.stringify(curriculum, null, 2)}\n`, 'utf8');
  return changed;
});

if (JSON.stringify(results[0]) !== JSON.stringify(results[1])) {
  throw new Error('Frontend and backend vocabulary edits do not match.');
}

console.log(`Replaced ${results[0]['1-2']} Level 1 words, ${results[0]['3-4']} Level 2 words, and ${results[0]['5-6']} Level 3 words.`);
