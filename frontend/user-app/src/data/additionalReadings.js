const QUESTION_TOTALS = { easy: 3, medium: 4, hard: 5, super_hard: 6 };

const STUDENTS = [
  ['Ming', '明明'], ['Lan', '兰兰'], ['Bo', '波波'], ['Mei', '美美'],
  ['Jun', '军军'], ['Rui', '瑞瑞'], ['Tao', '涛涛'], ['Nina', '妮娜'],
  ['Kai', '凯凯'], ['Lina', '丽娜'], ['Wei', '伟伟'], ['Sara', '莎莎']
];

const TIMES = [
  ['Monday morning', '星期一早上'],
  ['Tuesday afternoon', '星期二下午'],
  ['Saturday morning', '星期六早上']
];

const EXTRA_TIMES = ['Wednesday morning', 'Thursday afternoon', 'Friday morning', 'Sunday afternoon'];
const FALLBACK_OPTIONS = ['a clean cloth', 'a small bag', 'a paper map', 'a bottle of water'];

const parseThemes = (rows) => rows.map(row => {
  const [title, titleZh, verb, past, pastZh, item, itemZh, place, placeZh, extra, extraZh, finish, finishZh] = row.split('|');
  return { title, titleZh, verb, past, pastZh, item, itemZh, place, placeZh, extra, extraZh, finish, finishZh };
});

// The scenes use familiar home, school, farm, and community settings. Each
// theme has three distinct students and times, making 60 new passages per level.
const LEVEL_ONE_THEMES = parseThemes([
  'Planting Bean Seeds|种豆子|plant|planted|种下了|bean seeds|豆种子|the school garden|学校花园|a can of water|一罐水|put the tools away|把工具收好',
  'Feeding the Rabbits|喂兔子|feed|fed|喂了|carrots|胡萝卜|the rabbit pen|兔子围栏|a small basket|一个小篮子|closed the gate gently|轻轻关上了门',
  'Painting a Kite|画风筝|paint|painted|画了|a paper kite|一只纸风筝|the classroom table|教室桌子上|paint brushes|画笔|hung the kite by the window|把风筝挂在窗边',
  'Washing Apples|洗苹果|wash|washed|洗了|apples|苹果|the outdoor tap|室外水龙头旁|a blue bowl|一个蓝碗|put the apples on a plate|把苹果放在盘子上',
  'Collecting Stones|捡石头|collect|collected|捡了|smooth stones|光滑的小石头|the river path|河边小路|a cloth bag|一个布袋|counted the stones|数了石头',
  'Folding Paper Boats|折纸船|fold|folded|折了|paper boats|纸船|the art room|美术教室|crayons|蜡笔|floated one boat in a tub|把一只纸船放进水盆',
  'Watering Flowers|浇花|water|watered|浇了|flowers|花朵|the flower bed|花坛|a small watering can|一个小水壶|watched the drops fall|看着水滴落下',
  'Sorting Crayons|分蜡笔|sort|sorted|分好了|crayons|蜡笔|the class shelf|班级架子|a red box|一个红盒子|put each color in a cup|把每种颜色放进一个杯子',
  'Making Leaf Prints|做树叶拓印|make|made|做了|leaf prints|树叶拓印|a long desk|一张长桌子|clean paper|干净的纸|pressed the leaves carefully|小心地压了树叶',
  'Feeding Birds|喂小鸟|feed|fed|喂了|bird seeds|鸟食|the old tree|老树旁|a small cup|一个小杯子|waited quietly for birds|安静地等小鸟',
  'Packing Lunch|装午餐|pack|packed|装好了|lunch boxes|午餐盒|the kitchen|厨房|a paper napkin|一张餐巾|put fruit beside the rice|把水果放在米饭旁',
  'Sweeping the Path|扫小路|sweep|swept|扫了|the path|小路|the school gate|学校门口|a straw broom|一把扫帚|made a small leaf pile|堆起一小堆树叶',
  'Drawing a Map|画地图|draw|drew|画了|a simple map|一张简单地图|the reading corner|阅读角|colored pencils|彩色铅笔|showed the map to friends|把地图给朋友看',
  'Picking Peaches|摘桃子|pick|picked|摘了|peaches|桃子|the small orchard|小果园|a woven basket|一个编织篮|chose ripe ones|挑了熟的桃子',
  'Cleaning Desks|擦课桌|clean|cleaned|擦了|desks|课桌|Class Two|二班|a damp cloth|一块湿布|lined the chairs up|把椅子排好',
  'Sharing Oranges|分橙子|share|shared|分了|oranges|橙子|the lunch table|午餐桌旁|a small knife|一把小刀|gave one to each friend|给每个朋友一个',
  'Counting Shells|数贝壳|count|counted|数了|shells|贝壳|the sandy ground|沙地上|a paper cup|一个纸杯|made groups of five|分成五个一组',
  'Hanging Paper Stars|挂纸星星|hang|hung|挂了|paper stars|纸星星|the class door|教室门上方|string|一根线|looked at the bright wall|看着明亮的墙',
  'Planting Onion Tops|种葱根|plant|planted|种下了|onion tops|葱根|a glass jar|玻璃罐里|cotton wool|棉花|placed the jar near sunlight|把瓶子放到阳光旁',
  'Carrying Library Books|搬图书|carry|carried|搬了|books|书|the class library|班级图书角|a book band|一条书带|put the books in order|按顺序放好书'
]);

const LEVEL_TWO_THEMES = parseThemes([
  'Building a Birdhouse|制作鸟屋|build|built|做了|a wooden birdhouse|一个木制鸟屋|behind the school|学校后面|small nails|小钉子|hung it on a tree|把它挂到树上',
  'Library Labels|图书标签|label|labeled|贴好了标签|library books|图书馆的书|the reading room|阅览室里|colored stickers|彩色贴纸|placed the books on shelves|把书放到书架上',
  'The Rain Gauge|雨量计|measure|measured|测量了|rainwater|雨水|beside the classroom|教室旁边|a clear rain gauge|一个透明雨量计|wrote the number in a notebook|把数字写在本子上',
  'Paper Lanterns|纸灯笼|make|made|做了|paper lanterns|纸灯笼|the art room|美术教室里|red string|红绳|hung them near the window|把它们挂在窗边',
  'The Bicycle Bell|自行车铃|repair|repaired|修好了|a bicycle bell|一个自行车铃|the bike shed|自行车棚旁|a small screwdriver|一把小螺丝刀|tested the clear sound|试了试清脆的铃声',
  'Pumpkin Seeds|南瓜种子|plant|planted|种下了|pumpkin seeds|南瓜种子|the class garden|班级菜园里|soft soil|松软的泥土|marked the row with a stick|用小棍标记了那一行',
  'Sports Boxes|运动器材箱|organize|organized|整理了|sports boxes|运动器材箱|the gym door|体育馆门口|a list of equipment|一张器材清单|put the balls in one box|把球放到一个箱子里',
  'Watching Ants|观察蚂蚁|observe|observed|观察了|ants|蚂蚁|the playground wall|操场墙边|a magnifying glass|一个放大镜|drew the ant trail|画下了蚂蚁的路线',
  'Noodle Lunch|面条午餐|cook|cooked|煮了|vegetable noodles|蔬菜面|the school kitchen|学校厨房里|fresh green onions|新鲜的葱花|served the noodles in bowls|把面条盛进碗里',
  'A Clean Riverbank|干净的河岸|collect|collected|捡起了|litter|垃圾|the riverbank|河岸边|large gloves|大手套|put the bags by the bin|把袋子放在垃圾桶旁',
  'Class Play Costumes|班级话剧服装|prepare|prepared|准备了|play costumes|话剧服装|the music room|音乐教室里|a box of hats|一盒帽子|placed each costume on a chair|把每件衣服放到椅子上',
  'Reusable Bottles|可重复使用的瓶子|collect|collected|收集了|reusable bottles|可重复使用的瓶子|the school gate|学校门口|a large bag|一个大袋子|counted the clean bottles|数了干净的瓶子',
  'Paper Bridges|纸桥|test|tested|测试了|paper bridges|纸桥|the science table|科学桌上|small coins|小硬币|wrote down the strongest bridge|写下了最结实的桥',
  'Fresh Vegetables|新鲜蔬菜|choose|chose|挑选了|fresh vegetables|新鲜蔬菜|the morning market|早市上|a cloth shopping bag|一个布购物袋|washed the vegetables at home|在家洗了蔬菜',
  'Direction Signs|方向牌|paint|painted|画好了|direction signs|方向牌|the school path|学校小路旁|blue paint|蓝色颜料|stood the signs in the ground|把牌子立在地上',
  'Weather Chart|天气图表|record|recorded|记录了|the daily weather|每天的天气|the classroom window|教室窗边|a weather chart|一张天气图表|shared the chart with the class|把图表给全班看',
  'Seed Packets|种子包|sort|sorted|分好了|seed packets|种子包|the garden shed|花园小棚里|small paper trays|小纸盘|put each kind in a tray|把每种放进一个盘子',
  'Dance Practice|舞蹈练习|practice|practiced|练习了|dance steps|舞步|the school hall|学校礼堂里|a music player|一个音乐播放器|clapped at the end|最后拍了拍手',
  'Eggshells for Plants|给植物的蛋壳|crush|crushed|碾碎了|eggshells|蛋壳|the garden table|花园桌子上|a wooden spoon|一把木勺|mixed the shells into the soil|把蛋壳拌进土里',
  'A Letter Home|写给家里的信|write|wrote|写了|a letter home|一封家书|the quiet corner|安静的角落|a blue envelope|一个蓝色信封|put the letter in the mail box|把信投进信箱'
]);

const LEVEL_THREE_THEMES = parseThemes([
  'Saving Water|节约用水|plan|planned|计划了|water-saving steps|节水办法|the class meeting|班会上|a large poster|一张大海报|put the poster beside the taps|把海报贴在水龙头旁',
  'Village Path Map|村庄小路地图|map|mapped|画了地图|village paths|村庄小路|the community hall|社区活动室旁|a ruler and pencil|尺子和铅笔|marked the bridge on the map|在地图上标出小桥',
  'Sunlight Check|阳光观察|measure|measured|测量了|sunlight on the plants|植物上的阳光|the greenhouse|温室里|a small timer|一个小计时器|recorded the hours of light|记录了光照时间',
  'Book Cover Repair|修补书皮|repair|repaired|修补了|old book covers|旧书皮|the village library|村图书馆里|clear tape|透明胶带|returned the books to the shelf|把书放回书架',
  'Stream Level Notes|小溪水位记录|record|recorded|记录了|the stream level|小溪水位|the stone bridge|石桥边|a measuring stick|一根量尺|compared the number with last week|和上周的数字作了比较',
  'Library Donations|图书捐赠|organize|organized|整理了|donated books|捐来的书|the library room|图书室里|small paper labels|小纸标签|made a list of the new books|列出了新书清单',
  'A Wind Vane|风向标|build|built|做了|a simple wind vane|一个简单的风向标|the school roof|学校屋顶上|a plastic arrow|一个塑料箭头|watched which way it turned|观察它转向哪里',
  'Bean Plant Comparison|豆苗比较|compare|compared|比较了|two bean plants|两株豆苗|the classroom window|教室窗边|a short ruler|一把短尺子|wrote the heights in a chart|把高度写进图表',
  'Museum Notes|博物馆笔记|prepare|prepared|准备了|museum notes|博物馆笔记|the history room|历史教室里|a notebook|一个笔记本|read the notes before the visit|参观前读了笔记',
  'Greenhouse Door|温室门|repair|repaired|修好了|the greenhouse door|温室门|behind the science room|科学教室后面|a strong hinge|一个结实的铰链|checked that the door closed well|检查门是否关好',
  'Festival Poster|节日海报|design|designed|设计了|a festival poster|一张节日海报|the art club room|美术社团教室里|bright markers|彩色记号笔|hung the poster by the entrance|把海报挂在入口旁',
  'Recycled Paper|再生纸|sort|sorted|分好了|recycled paper|回收纸|the recycling bins|回收桶旁|a paper box|一个纸箱|tied the paper into bundles|把纸扎成几捆',
  'Weather Station Visit|参观气象站|visit|visited|参观了|the weather station|气象站|outside the town|城外|a question sheet|一张问题单|wrote down the answers|写下答案',
  'Young Trees|小树苗|plant|planted|种下了|young trees|小树苗|the school road|学校路边|a bucket of water|一桶水|placed a guard around each tree|给每棵树围上保护圈',
  'Walking Route|步行路线|design|designed|设计了|a walking route|一条步行路线|the village square|村广场旁|a folded map|一张折叠地图|marked the safest turns|标出最安全的转弯处',
  'Sports Equipment|运动器材|check|checked|检查了|sports equipment|运动器材|the storage room|器材室里|a checklist|一张检查表|put the broken cone aside|把坏的标志桶放到一边',
  'Safe Steps|安全台阶|mark|marked|标出了|safe steps|安全台阶|the hill path|山路上|yellow paint|黄色油漆|waited for the paint to dry|等待油漆晾干',
  'History Stories|历史故事|collect|collected|收集了|local history stories|当地历史故事|the community center|社区中心|a voice recorder|一个录音笔|saved the stories in a folder|把故事保存在文件夹里',
  'Reading Schedule|阅读计划|create|created|制定了|a reading schedule|一个阅读计划|the study group|学习小组里|a calendar page|一张日历纸|gave each reader a copy|给每位读者一份',
  'Soil Samples|土壤样本|test|tested|测试了|soil samples|土壤样本|the science garden|科学花园里|small jars|小罐子|wrote the colors in a notebook|把颜色写在笔记本里'
]);

const difficultyAt = (index) => index < 25 ? 'easy' : index < 40 ? 'medium' : index < 50 ? 'hard' : 'super_hard';

const makeOptions = (answer, pool, seed) => {
  const distractors = [];
  for (const candidate of [...pool, ...FALLBACK_OPTIONS]) {
    if (candidate !== answer && !distractors.includes(candidate)) distractors.push(candidate);
    if (distractors.length === 3) break;
  }
  const options = [...distractors];
  const correct = seed % 4;
  options.splice(correct, 0, answer);
  return { options, correct };
};

const makeQuestion = (q, answer, pool, seed) => ({ q, ...makeOptions(answer, pool, seed) });

const makeText = (grade, story) => {
  const { who, whoZh, helper, helperZh, time, timeZh, theme } = story;
  if (grade === '1-2') {
    return {
      en: `On ${time}, ${who} ${theme.past} ${theme.item} at ${theme.place}. ${helper} brought ${theme.extra} to help. Before going home, they ${theme.finish}.`,
      zh: `${timeZh}，${whoZh}在${theme.placeZh}${theme.pastZh}${theme.itemZh}。${helperZh}带来了${theme.extraZh}来帮忙。回家前，他们${theme.finishZh}。`
    };
  }
  if (grade === '3-4') {
    return {
      en: `On ${time}, ${who} ${theme.past} ${theme.item} at ${theme.place}. ${helper} brought ${theme.extra}, and they worked carefully together. Before the activity ended, they ${theme.finish}. Their teacher smiled at the work.`,
      zh: `${timeZh}，${whoZh}在${theme.placeZh}${theme.pastZh}${theme.itemZh}。${helperZh}带来了${theme.extraZh}，他们一起认真完成了这项工作。活动结束前，他们${theme.finishZh}。老师看着他们的成果笑了。`
    };
  }
  return {
    en: `On ${time}, ${who} ${theme.past} ${theme.item} at ${theme.place}. ${helper} brought ${theme.extra}, which made the task easier. Before they left, they ${theme.finish}. They planned to check the result again the next week.`,
    zh: `${timeZh}，${whoZh}在${theme.placeZh}${theme.pastZh}${theme.itemZh}。${helperZh}带来了${theme.extraZh}，让这项工作更容易完成。离开前，他们${theme.finishZh}。他们计划下周再查看一次结果。`
  };
};

const buildPassages = (grade, idStart, themes) => {
  const itemPool = themes.map(theme => theme.item);
  const placePool = themes.map(theme => theme.place);
  const extraPool = themes.map(theme => theme.extra);
  const namePool = STUDENTS.map(([name]) => name);
  const timePool = [...TIMES.map(([time]) => time), ...EXTRA_TIMES];

  return themes.flatMap((theme, themeIndex) => TIMES.map(([time, timeZh], variantIndex) => {
    const index = themeIndex * TIMES.length + variantIndex;
    const [who, whoZh] = STUDENTS[index % STUDENTS.length];
    const [helper, helperZh] = STUDENTS[(index + 5) % STUDENTS.length];
    const difficulty = difficultyAt(index);
    const story = { who, whoZh, helper, helperZh, time, timeZh, theme };
    const facts = [
      [`Who ${theme.past} ${theme.item}?`, who, namePool],
      [`What did ${who} ${theme.verb}?`, theme.item, itemPool],
      [`Where did ${who} ${theme.verb} ${theme.item}?`, theme.place, placePool],
      [`When did ${who} ${theme.verb} ${theme.item}?`, time, timePool],
      [`Who helped ${who}?`, helper, namePool],
      [`What did ${helper} bring?`, theme.extra, extraPool]
    ];
    const text = makeText(grade, story);
    const suffix = variantIndex === 0 ? '' : ` on ${time.split(' ')[0]}`;
    const suffixZh = variantIndex === 0 ? '' : `（${timeZh.slice(0, 3)}）`;
    return {
      id: idStart + index,
      dayIndex: 60 + index,
      difficulty,
      title: { en: `${theme.title}${suffix}`, zh: `${theme.titleZh}${suffixZh}` },
      text,
      questions: facts.slice(0, QUESTION_TOTALS[difficulty]).map(([q, answer, pool], questionIndex) => makeQuestion(q, answer, pool, index * 7 + questionIndex))
    };
  }));
};

export const ADDITIONAL_READINGS_BY_GRADE = {
  '1-2': buildPassages('1-2', 1001, LEVEL_ONE_THEMES),
  '3-4': buildPassages('3-4', 2001, LEVEL_TWO_THEMES),
  '5-6': buildPassages('5-6', 3001, LEVEL_THREE_THEMES)
};

export const validateAdditionalReadings = () => {
  const errors = [];
  Object.entries(ADDITIONAL_READINGS_BY_GRADE).forEach(([grade, passages]) => {
    const expected = { easy: 25, medium: 15, hard: 10, super_hard: 10 };
    const seenTexts = new Set();
    const seenIds = new Set();
    passages.forEach((passage, index) => {
      if (passage.dayIndex !== index + 60) errors.push(`${grade}: incorrect day index for ${passage.id}`);
      if (seenIds.has(passage.id)) errors.push(`${grade}: duplicate id ${passage.id}`);
      seenIds.add(passage.id);
      if (!passage.title?.en || !passage.title?.zh || !passage.text?.en || !passage.text?.zh) errors.push(`${grade}: missing bilingual text for ${passage.id}`);
      if (seenTexts.has(passage.text.en)) errors.push(`${grade}: duplicate English passage ${passage.id}`);
      seenTexts.add(passage.text.en);
      if (passage.questions.length !== QUESTION_TOTALS[passage.difficulty]) errors.push(`${grade}: incorrect question count for ${passage.id}`);
      passage.questions.forEach(question => {
        if (!/^(Who|What|Where|When)\b/.test(question.q)) errors.push(`${grade}: non-factual question in ${passage.id}`);
        if (question.options.length !== 4 || new Set(question.options).size !== 4 || question.options[question.correct] === undefined) errors.push(`${grade}: invalid answer choices in ${passage.id}`);
      });
    });
    Object.entries(expected).forEach(([difficulty, count]) => {
      if (passages.filter(passage => passage.difficulty === difficulty).length !== count) errors.push(`${grade}: incorrect ${difficulty} count`);
    });
  });
  if (errors.length) throw new Error(`Additional reading validation failed:\n${errors.join('\n')}`);
  return true;
};

validateAdditionalReadings();
