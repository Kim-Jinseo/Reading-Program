import fs from 'fs';

const FILES = ['backend/curriculum.json', 'frontend/user-app/src/data/curriculum.json'];
const ENCOURAGEMENT_EN = 'Try to write 3 short sentences.';
const ENCOURAGEMENT_ZH = '试着写三句短句。';

// These prompts had an advanced topic, hard wording, or an unsafe/less useful
// idea for the age group.  Each replacement uses familiar daily-life words and
// two concrete questions that give students something more to say.
const OVERRIDES = {
  1005: { en: 'What is your favorite toy? Why do you like it?', zh: '你最喜欢的玩具是什么？你为什么喜欢它？' },
  1009: { en: 'What do you like to do on the weekend? Why do you like it?', zh: '你周末喜欢做什么？你为什么喜欢它？' },
  1011: { en: 'What ice cream do you like? When do you eat it?', zh: '你喜欢什么冰淇淋？你什么时候吃它？' },
  1016: { en: 'What class at school do you like best? Why do you like it?', zh: '你最喜欢学校里的哪一节课？你为什么喜欢它？' },
  1027: { en: 'What cartoon do you like? Who do you like in it?', zh: '你喜欢什么动画片？你喜欢里面的谁？' },
  1032: { en: 'Do you like building with blocks? What do you make?', zh: '你喜欢用积木搭东西吗？你搭什么？' },
  1037: { en: 'What snack do you get on weekends? How does it taste?', zh: '你周末吃什么零食？它尝起来怎么样？' },
  1043: { en: 'What do you make with paper? What colors do you use?', zh: '你用纸做什么？你用什么颜色？' },
  1044: { en: 'What do you like to play on at the playground? Who plays with you?', zh: '你在游乐场喜欢玩什么？谁和你一起玩？' },
  1046: { en: 'What toy animal do you sleep with? What color is it?', zh: '你睡觉时抱什么玩具动物？它是什么颜色的？' },
  1048: { en: 'What do you do at break time? Who plays with you?', zh: '课间休息时你做什么？谁和你一起玩？' },
  1052: { en: 'What animal in the sea do you like? What does it look like?', zh: '你喜欢什么海里的动物？它长什么样？' },
  1055: { en: 'What sound outside do you like? Why do you like it?', zh: '你喜欢外面的什么声音？你为什么喜欢它？' },
  1056: { en: 'What song do you like to dance to? Who dances with you?', zh: '你喜欢跟着什么歌跳舞？谁和你一起跳舞？' },

  3001: { en: 'If you could do one amazing thing for a day, what would you do? How would you help a friend?', zh: '如果你一天能做一件很棒的事，你会做什么？你会怎么帮助朋友？' },
  3004: { en: 'Imagine you have a helper at home. What job would it do? Why would it help you?', zh: '想象你家里有一个小帮手。它会做什么事？它为什么能帮到你？' },
  3006: { en: 'Imagine you go on a trip. Where would you go? What would you see there?', zh: '想象你去旅行。你会去哪里？你会在那里看到什么？' },
  3008: { en: 'Imagine you can fly high in the sky. Where would you go? Who would you take with you?', zh: '想象你能飞到高高的天空。你会去哪里？你会带谁一起去？' },
  3013: { en: 'What does your family do together on a special day? Why is it fun?', zh: '你的家人在特别的日子会一起做什么？为什么这很有趣？' },
  3015: { en: 'If you could fly, where would you go first? What would you see?', zh: '如果你能飞，你会先去哪里？你会看到什么？' },
  3027: { en: 'If you could visit a place from long ago, where would you go? What would you do there?', zh: '如果你能去很久以前的一个地方，你会去哪里？你会在那里做什么？' },
  3033: { en: 'If you could be as quiet as a mouse for one hour, where would you go? What would you do?', zh: '如果你能像老鼠一样安静一小时，你会去哪里？你会做什么？' },
  3034: { en: 'What sea animal do you like to see at a place with fish? Why do you like it?', zh: '在有鱼的地方，你喜欢看什么海洋动物？你为什么喜欢它？' },
  3036: { en: 'What is your favorite day from a past holiday? Who was with you?', zh: '过去假期里你最喜欢哪一天？谁和你在一起？' },
  3039: { en: 'If your pet could wear clothes, what would it wear? What color would the clothes be?', zh: '如果你的宠物能穿衣服，它会穿什么？衣服会是什么颜色？' },
  3040: { en: 'What do you like about sleeping outside under the stars? What food would you eat?', zh: '你喜欢在星星下睡在外面的什么？你会吃什么食物？' },
  3041: { en: 'If you found a surprise box, what would be inside? Why would you like it?', zh: '如果你找到一个惊喜盒子，里面会有什么？你为什么喜欢它？' },
  3042: { en: 'What game do you like to play with family or friends? Why is it fun?', zh: '你喜欢和家人或朋友玩什么游戏？为什么它很有趣？' },
  3045: { en: 'If you were as small as an ant, where would you go? What would you see?', zh: '如果你和蚂蚁一样小，你会去哪里？你会看到什么？' },
  3047: { en: 'If you had a magic pencil, what would you draw? What would your drawing do?', zh: '如果你有一支神奇的铅笔，你会画什么？你的画会做什么？' },
  3049: { en: 'If you could build your own bicycle, what color would it be? What could it do?', zh: '如果你能自己造一辆自行车，它会是什么颜色？它能做什么？' },
  3051: { en: 'If you could visit a zoo, what animals would you watch? Why would you watch them?', zh: '如果你能去动物园，你会看什么动物？你为什么想看它们？' },
  3053: { en: 'If you could watch a monkey for one day, what funny things would it do? What would you call it?', zh: '如果你能看一只猴子一天，它会做什么有趣的事？你会叫它什么名字？' },
  3055: { en: 'If you could fly in a hot air balloon, where would you go? What would you see?', zh: '如果你能坐热气球飞行，你会去哪里？你会看到什么？' },
  3057: { en: 'If you could make a new ice cream, what food would you put in it? Why would it taste good?', zh: '如果你能做一种新冰淇淋，你会放什么食物？它为什么会好吃？' },
  3058: { en: 'Who is your favorite person in a storybook? Why do you like this person?', zh: '谁是你最喜欢的故事书人物？你为什么喜欢这个人？' },
  3059: { en: 'If you could make a new festival in your town, what would people do? What food would they eat?', zh: '如果你能在你的镇上办一个新节日，人们会做什么？他们会吃什么？' },
  3060: { en: 'What good thing did you do at school this year? How did you do it?', zh: '今年你在学校做了什么好事？你是怎么做到的？' },

  5001: { en: 'If you could make a useful thing to help students study, what would it do? Why would it help?', zh: '如果你能做一个帮助学生学习的有用东西，它会做什么？它为什么能帮到学生？' },
  5004: { en: 'If you had a helper for one week, what jobs would you ask it to do? Why?', zh: '如果你有一个帮手一周，你会请它做什么事？为什么？' },
  5005: { en: 'Describe a school that saves water and stays clean. What would students do there?', zh: '描述一所节约用水、保持干净的学校。学生会在那里做什么？' },
  5007: { en: 'Describe your dream bedroom. What furniture and useful things would you put inside?', zh: '描述你的梦想卧室。你会在里面放什么家具和有用的东西？' },
  5009: { en: 'If you could make a phone game, what would players do? How would they win?', zh: '如果你能做一个手机游戏，玩家会做什么？他们怎么赢？' },
  5010: { en: 'What is your favorite way to learn something new? Why does it help you learn?', zh: '你最喜欢用什么方法学习新东西？它为什么能帮你学习？' },
  5012: { en: 'What is your favorite book? Who is an important person in the story? Why do you like the book?', zh: '你最喜欢的书是什么？故事里哪个人很重要？你为什么喜欢这本书？' },
  5015: { en: 'If you could make a new drink, what fruit would you mix in? Why would it taste good?', zh: '如果你能做一种新饮料，你会混合什么水果？它为什么会好喝？' },
  5017: { en: 'If you could make a new vehicle, would it fly, drive, or float? Where would it go?', zh: '如果你能做一种新交通工具，它会飞、开，还是在水上走？它会去哪里？' },
  5019: { en: 'If you could meet a person from an old story, who would you meet? What would you ask?', zh: '如果你能见到一个老故事里的人，你会见谁？你会问什么？' },
  5021: { en: 'If you could make a new sport, what would players need? What are two rules?', zh: '如果你能创造一项新运动，选手需要什么？有哪两条规则？' },
  5025: { en: 'If you could live in a home in space, what rooms would it have? Why would you need them?', zh: '如果你能住在太空里的家，它会有什么房间？你为什么需要这些房间？' },
  5033: { en: 'What animal at a zoo would you like to learn about? How should people care for it?', zh: '你想了解动物园里的什么动物？人们应该怎么照顾它？' },
  5034: { en: 'What old thing have you seen in a museum or a book? What did you learn about it?', zh: '你在博物馆或书里看过什么老东西？你学到了什么？' },
  5035: { en: 'If you made a small reading place in the forest, what would you take there? Why?', zh: '如果你在森林里做一个小阅读角，你会带什么去？为什么？' },
  5036: { en: 'What useful thing did you learn in science class this year? How can you use it?', zh: '今年科学课上你学到了什么有用的东西？你怎么使用它？' },
  5037: { en: 'Make a funny movie story. What happens to the people in the story? What happens next?', zh: '编一个有趣的电影故事。故事里的人发生了什么？接下来发生什么？' },
  5041: { en: 'If you could go under the sea in a small boat, what animals would you see? What would you take a picture of?', zh: '如果你能坐小船到海底，你会看到什么动物？你会拍什么照片？' },
  5042: { en: 'What board game do you like? What do you do to play well?', zh: '你喜欢什么桌游？你怎么才能玩得好？' },
  5043: { en: 'What are two ways you could help clean your town? Why are they good ideas?', zh: '你能用哪两种方法帮助清理你的镇？为什么它们是好办法？' },
  5045: { en: 'If you could visit the moon for a weekend, what would you see? What would you do?', zh: '如果你能去月球过一个周末，你会看到什么？你会做什么？' },
  5047: { en: 'If you could choose the weather for a picnic tomorrow, what would you choose? Why?', zh: '如果你能为明天的野餐选天气，你会选什么天气？为什么？' },
  5048: { en: 'What school group or activity do you like? Why do you like it?', zh: '你喜欢什么学校小组或活动？你为什么喜欢它？' },
  5049: { en: 'If you could make a new playground path, what fun things would be on it? Why?', zh: '如果你能做一条新的游乐场小路，上面会有什么好玩的东西？为什么？' },
  5051: { en: 'If you could sleep in a museum for one night, which room would you choose? Why?', zh: '如果你能在博物馆睡一晚，你会选哪个房间？为什么？' },
  5054: { en: 'What outdoor trip do you like in a season? What things do you take with you?', zh: '你喜欢在哪个季节去户外玩？你会带什么东西？' },
  5055: { en: 'If you could make a toy car that uses sunlight, what color would it be? How would it move?', zh: '如果你能做一辆用阳光跑的玩具车，它会是什么颜色？它会怎么动？' },
  5056: { en: 'What simple science activity did you like best? What happened when you did it?', zh: '你最喜欢什么简单的科学活动？你做的时候发生了什么？' },
  5059: { en: 'If you could make a big home for sea animals in your city, what animals would live there? Why?', zh: '如果你能在城市里为海洋动物做一个大房子，什么动物会住在那里？为什么？' },

  3002: { en: 'Imagine you find a small door in your room. Where does it go? What do you see?', zh: '想象你在房间里找到一扇小门。它通向哪里？你看到了什么？' },
  3003: { en: 'What do you like to do after school? Why do you like it?', zh: '放学后你喜欢做什么？你为什么喜欢它？' },
  3005: { en: 'Describe your dream small house. What rooms and games would be inside?', zh: '描述你梦想中的小房子。里面会有什么房间和游戏？' },
  3020: { en: 'What movie or TV show do you like? Who do you like in it?', zh: '你喜欢什么电影或电视节目？你喜欢里面的谁？' },
  3025: { en: 'If you could grow a plant in a magic garden, what would grow there? Why?', zh: '如果你能在魔法花园里种一种植物，那里会长出什么？为什么？' },
  3028: { en: 'What sweet food do you like at a party? Why do you like it?', zh: '在派对上你喜欢吃什么甜食？你为什么喜欢它？' },
  3030: { en: 'Where do you like to rest when you are tired? What do you do there?', zh: '累的时候你喜欢在哪里休息？你在那里做什么？' },
  3031: { en: 'If you could make a new playground slide, what color would it be? Would it be straight or curved?', zh: '如果你能做一个新的游乐场滑梯，它会是什么颜色？它会是直的还是弯的？' },
  3043: { en: 'If you could build a big snow castle in winter, who would help you? What would you do inside?', zh: '如果你能在冬天建一座大雪城堡，谁会帮你？你会在里面做什么？' },
  3050: { en: 'What good time did you have with your grandparents? What did you do together?', zh: '你和祖父母一起度过了什么快乐时光？你们一起做了什么？' },

  5002: { en: 'What job would you like when you grow up? Why do you like this job?', zh: '你长大后想做什么工作？你为什么喜欢这份工作？' },
  5003: { en: 'If you could make a big park to play in, what fun places would it have? What games would you play?', zh: '如果你能做一个大游乐园，它会有什么好玩的地方？你会玩什么游戏？' },
  5006: { en: 'Do you like playing sports with a team? How can a team help you make friends?', zh: '你喜欢和队友一起运动吗？队友怎么能帮你交朋友？' },
  5008: { en: 'If you could do one amazing thing to keep land and water clean, what would you do? Why?', zh: '如果你能做一件很棒的事来保持土地和水干净，你会做什么？为什么？' },
  5011: { en: 'If you were the school leader for one day, what fun day would you plan for students? Why?', zh: '如果你当一天学校负责人，你会为学生安排什么有趣的一天？为什么？' },
  5013: { en: 'If you could visit any country, where would you go? What places would you see?', zh: '如果你能去任何国家，你会去哪里？你会看什么地方？' },
  5014: { en: 'What good habit did you start this year? How does it help you every day?', zh: '今年你开始了什么好习惯？它每天怎么帮助你？' },
  5018: { en: 'What food do you like to help make at home? Why do you like making it?', zh: '你喜欢在家帮忙做什么食物？你为什么喜欢做它？' },
  5020: { en: 'What is something you do well? How do you practice it?', zh: '你有什么做得好的事？你怎么练习它？' },
  5022: { en: 'What was your best family holiday day? What did you do together?', zh: '你最喜欢的家庭节日是哪一天？你们一起做了什么？' },
  5023: { en: 'If you lived on a warm island for a week, what would you do each day? Why?', zh: '如果你在一个温暖的小岛上住一周，你每天会做什么？为什么？' },
  5024: { en: 'What good words did a teacher or parent tell you? How did they help you?', zh: '老师或父母对你说过什么好话？这些话怎么帮助了你？' },
  5030: { en: 'What do you like about working with classmates on one task? Why?', zh: '你喜欢和同学一起做一件事的什么？为什么？' },
  5032: { en: 'What kind of music or instrument do you like? How does it help you feel calm?', zh: '你喜欢什么音乐或乐器？它怎么让你感到平静？' },
  5040: { en: 'What was your favorite part of school sports day? How did your team do?', zh: '学校运动会里你最喜欢哪个部分？你们队表现怎么样？' },
  5046: { en: 'What art or craft thing do you like to make? What colors do you use?', zh: '你喜欢做什么艺术或手工东西？你用什么颜色？' },
  5050: { en: 'What good time did you have at a big park with rides? Who was with you?', zh: '你在有游乐设施的大公园里度过了什么快乐时光？谁和你在一起？' },
  5052: { en: 'What birthday cake do you like best? Who makes or buys it for you?', zh: '你最喜欢什么生日蛋糕？谁为你做或买它？' },
  5057: { en: 'If you could make new sports clothes for your school team, what colors would you choose? Why?', zh: '如果你能为学校运动队做新运动服，你会选什么颜色？为什么？' },
  5058: { en: 'What story did you like when you were younger? Why do you remember it?', zh: '你小时候喜欢什么故事？你为什么记得它？' }
};

function questionCount(text) {
  return (text.match(/\?/g) ?? []).length;
}

function reviewPrompt(item) {
  const override = OVERRIDES[item.id];
  let en = override?.en ?? item.en.trim();
  let zh = override?.zh ?? item.zh.trim();
  zh = zh.replace(/。\s+为什么？/g, '。为什么？');

  if (questionCount(en) < 2) {
    en = `${en} Why?`;
    zh = `${zh}为什么？`;
  }

  if (!en.endsWith(ENCOURAGEMENT_EN)) en = `${en} ${ENCOURAGEMENT_EN}`;
  if (!zh.endsWith(ENCOURAGEMENT_ZH)) zh = `${zh}${ENCOURAGEMENT_ZH}`;
  return { ...item, en, zh };
}

function reviewFile(filePath) {
  const curriculum = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const allPrompts = [];

  for (const gradeData of Object.values(curriculum)) {
    gradeData.writing = (gradeData.writing ?? []).map(reviewPrompt);
    allPrompts.push(...gradeData.writing);
  }

  const hardTerms = /\b(?:ai|artificial intelligence|robot|eco-friendly|futuristic|technology|research labs?|strategy|zero gravity|virtue|national holiday|career|theme|teamwork|environment|principal|genre|tropical|advice|project|amusement|obstacle)\b/i;
  const invalid = allPrompts.filter(item =>
    !item.en || !item.zh || questionCount(item.en) < 2 ||
    !item.en.endsWith(ENCOURAGEMENT_EN) || !item.zh.endsWith(ENCOURAGEMENT_ZH) ||
    hardTerms.test(item.en)
  );
  if (allPrompts.length !== 180 || invalid.length) {
    throw new Error(`Writing prompt review failed: ${invalid.length} invalid prompts out of ${allPrompts.length}.`);
  }

  fs.writeFileSync(filePath, `${JSON.stringify(curriculum, null, 2)}\n`, 'utf8');
  return allPrompts.length;
}

const results = FILES.map(reviewFile);
if (results[0] !== results[1]) throw new Error('Backend and frontend writing prompts do not match.');
console.log(`Reviewed and improved ${results[0]} writing prompts.`);
