import fs from 'fs';

// Helper function to create passage object
function createPassage(id, difficulty, dayIndex, titleEn, titleZh, textEn, textZh, questions) {
  return {
    id,
    difficulty,
    dayIndex,
    title: { en: titleEn, zh: titleZh },
    text: { en: textEn, zh: textZh },
    questions
  };
}

// Generate 60 passages for Grade 1-2
// IDs 101 to 160
// easy: 25 (2 sentences, 3 questions)
// medium: 15 (2 sentences, 4 questions)
// hard: 10 (2 sentences, 5 questions)
// super_hard: 10 (3 sentences, 6 questions)

const g12Data = [
  // --- EASY (25 passages, 2 sentences, 3 questions) ---
  createPassage(101, 'easy', 0, "My Cat", "我的猫", 
    "Tim has a small white cat. The cat likes to sleep on the red mat.",
    "蒂姆有一只流行的小白猫。猫喜欢睡在红色的垫子上。",
    [
      { q: "What color is Tim's cat?", options: ["White", "Black", "Brown", "Yellow"], correct: 0 },
      { q: "Where does the cat sleep?", options: ["On the red mat", "On the bed", "In the car", "Under the table"], correct: 0 },
      { q: "What is the cat's size?", options: ["Small", "Big", "Giant", "Tall"], correct: 0 }
    ]
  ),
  createPassage(102, 'easy', 1, "The Red Ball", "红色的球",
    "Sam plays with a big red ball. He rolls the ball to his brother.",
    "萨姆在玩一个很大的红球。他把球滚给了他的弟弟。",
    [
      { q: "What color is the ball?", options: ["Red", "Blue", "Green", "Yellow"], correct: 0 },
      { q: "Who does Sam roll the ball to?", options: ["His brother", "His sister", "His dog", "His friend"], correct: 0 },
      { q: "What does Sam do with the ball?", options: ["He rolls it", "He eats it", "He paints it", "He hides it"], correct: 0 }
    ]
  ),
  createPassage(103, 'easy', 2, "A Hot Day", "炎热的一天",
    "The sun is very bright today. Lily drinks cold water to stay cool.",
    "今天太阳非常明亮。莉莉喝凉水来保持凉爽。",
    [
      { q: "How is the sun today?", options: ["Very bright", "Dark", "Cold", "Rainy"], correct: 0 },
      { q: "What does Lily drink?", options: ["Cold water", "Hot milk", "Warm tea", "Apple juice"], correct: 0 },
      { q: "Why does Lily drink water?", options: ["To stay cool", "To sleep", "To run fast", "To read books"], correct: 0 }
    ]
  ),
  createPassage(104, 'easy', 3, "The Little Bird", "小鸟",
    "A yellow bird sings in the green tree. The bird eats a tiny worm.",
    "一只黄色的鸟在绿色的树上唱歌。小鸟吃了一条小虫子。",
    [
      { q: "What color is the bird?", options: ["Yellow", "Red", "Blue", "Black"], correct: 0 },
      { q: "Where is the bird singing?", options: ["In the green tree", "In the house", "On the boat", "Under the rock"], correct: 0 },
      { q: "What does the bird eat?", options: ["A tiny worm", "A piece of bread", "A big fish", "An apple"], correct: 0 }
    ]
  ),
  createPassage(105, 'easy', 4, "My New Shoes", "我的新鞋",
    "Ben wears his new blue shoes to school. He runs fast on the playground.",
    "本穿着他的新蓝色鞋子去上学。他在操场上跑得很快。",
    [
      { q: "What color are Ben's new shoes?", options: ["Blue", "Red", "White", "Green"], correct: 0 },
      { q: "Where does Ben wear his shoes?", options: ["To school", "To bed", "To the zoo", "To the kitchen"], correct: 0 },
      { q: "How does Ben run on the playground?", options: ["Fast", "Slowly", "Tiredly", "Sad"], correct: 0 }
    ]
  ),
  createPassage(106, 'easy', 5, "The Green Frog", "绿色的青蛙",
    "A small green frog sits on a rock. It jumps into the pond with a splash.",
    "一只小绿青蛙坐在石头上。它啪嗒一声跳进了池塘里。",
    [
      { q: "Where does the frog sit?", options: ["On a rock", "In a tree", "On a chair", "Under a box"], correct: 0 },
      { q: "What color is the frog?", options: ["Green", "Purple", "Pink", "Orange"], correct: 0 },
      { q: "Where does the frog jump?", options: ["Into the pond", "Into the house", "Up a tree", "Onto a bike"], correct: 0 }
    ]
  ),
  createPassage(107, 'easy', 6, "Sweet Apples", "甜苹果",
    "Mia eats a sweet red apple for her snack. She gives one to her friend.",
    "米娅吃了一个甜甜的红苹果当作零食。她给了朋友一个。",
    [
      { q: "What fruit does Mia eat?", options: ["A red apple", "A banana", "An orange", "A grape"], correct: 0 },
      { q: "How does the apple taste?", options: ["Sweet", "Sour", "Salty", "Bitter"], correct: 0 },
      { q: "Who does Mia give an apple to?", options: ["Her friend", "Her teacher", "Her cat", "Her brother"], correct: 0 }
    ]
  ),
  createPassage(108, 'easy', 7, "A Fun Bike", "有趣的自行车",
    "Tom rides his yellow bike in the park. He wears a dark helmet on his head.",
    "汤姆在公园里骑他的黄色自行车。他头上戴着一个深色的头盔。",
    [
      { q: "What color is Tom's bike?", options: ["Yellow", "Red", "Blue", "Black"], correct: 0 },
      { q: "Where does Tom ride his bike?", options: ["In the park", "In the bedroom", "At the beach", "In the store"], correct: 0 },
      { q: "What does Tom wear on his head?", options: ["A helmet", "A cap", "A crown", "A flower"], correct: 0 }
    ]
  ),
  createPassage(109, 'easy', 8, "Rainy Day", "下雨天",
    "Rain falls from the gray clouds outside. Dan stays inside and reads a fun book.",
    "外面灰色的云彩里下着雨。丹待在家里看一本有趣的书。",
    [
      { q: "What is falling from the clouds?", options: ["Rain", "Snow", "Leaves", "Apples"], correct: 0 },
      { q: "Where does Dan stay?", options: ["Inside", "Outside", "In the park", "On the roof"], correct: 0 },
      { q: "What does Dan do inside?", options: ["Reads a fun book", "Sleeps on floor", "Plays football", "Paints the wall"], correct: 0 }
    ]
  ),
  createPassage(110, 'easy', 9, "The Good Dog", "好狗",
    "Max is a friendly brown dog. He barks happily when his owner comes home.",
    "马克斯是一只友好的棕色狗。当主人回家时，他高兴地叫着。",
    [
      { q: "What kind of animal is Max?", options: ["A brown dog", "A cat", "A rabbit", "A bird"], correct: 0 },
      { q: "How does Max bark?", options: ["Happily", "Angrily", "Sad", "Loudly"], correct: 0 },
      { q: "When does Max bark?", options: ["When his owner comes home", "When it rains", "When he sleeps", "When he eats"], correct: 0 }
    ]
  ),
  createPassage(111, 'easy', 10, "A Soft Teddy Bear", "软绵绵的泰迪熊",
    "Emma has a soft brown teddy bear. She hugs it when she goes to sleep.",
    "艾玛有一只软绵绵的棕色泰迪熊。她睡觉时抱着它。",
    [
      { q: "What toy does Emma have?", options: ["A soft teddy bear", "A toy car", "A doll", "A robot"], correct: 0 },
      { q: "What color is the teddy bear?", options: ["Brown", "White", "Blue", "Green"], correct: 0 },
      { q: "When does Emma hug her teddy bear?", options: ["When she goes to sleep", "When she eats lunch", "At school", "In the park"], correct: 0 }
    ]
  ),
  createPassage(112, 'easy', 11, "Fresh Milk", "新鲜牛奶",
    "Leo drinks a glass of fresh warm milk every morning. It helps him grow strong.",
    "里奥每天早上喝一杯新鲜的温牛奶。这有助于他健康成长。",
    [
      { q: "What does Leo drink every morning?", options: ["Fresh warm milk", "Cold water", "Orange juice", "Hot tea"], correct: 0 },
      { q: "When does Leo drink the milk?", options: ["Every morning", "Every night", "At noon", "In the afternoon"], correct: 0 },
      { q: "How does milk help Leo?", options: ["Helps him grow strong", "Makes him sleepy", "Makes him cold", "Helps him sing"], correct: 0 }
    ]
  ),
  createPassage(113, 'easy', 12, "The Little Duck", "小鸭子",
    "A small yellow duck swims in the quiet lake. It catches a small fish.",
    "一只黄色的小鸭子在宁静的湖里游泳。它抓到了一条小鱼。",
    [
      { q: "What color is the little duck?", options: ["Yellow", "White", "Black", "Green"], correct: 0 },
      { q: "Where does the duck swim?", options: ["In the quiet lake", "In the ocean", "In the pool", "In the bathtub"], correct: 0 },
      { q: "What does the duck catch?", options: ["A small fish", "A frog", "A bug", "A bread crumb"], correct: 0 }
    ]
  ),
  createPassage(114, 'easy', 13, "Big Flowers", "大花朵",
    "Anna grows bright yellow flowers in her garden. She waters them with a little can.",
    "安娜在花园里种了鲜艳的黄花。她用一个小水壶给它们浇水。",
    [
      { q: "What does Anna grow in her garden?", options: ["Bright yellow flowers", "Trees", "Grass", "Vegetables"], correct: 0 },
      { q: "What color are the flowers?", options: ["Yellow", "Red", "Blue", "Purple"], correct: 0 },
      { q: "How does Anna water the flowers?", options: ["With a little can", "With a cup", "With rain", "With a hose"], correct: 0 }
    ]
  ),
  createPassage(115, 'easy', 14, "The Fast Kite", "飞得快的风筝",
    "Jack flies his diamond kite on a windy hill. The kite goes high up in the blue sky.",
    "杰克在一个有风的山丘上放风筝。风筝飞上了蓝天的高处。",
    [
      { q: "What does Jack fly?", options: ["A diamond kite", "A paper plane", "A balloon", "A drone"], correct: 0 },
      { q: "Where does Jack fly his kite?", options: ["On a windy hill", "In his room", "At school", "Under a tree"], correct: 0 },
      { q: "Where does the kite go?", options: ["High up in the sky", "Into the lake", "On the ground", "In the tree"], correct: 0 }
    ]
  ),
  createPassage(116, 'easy', 15, "A Cool Bus", "凉爽的公交车",
    "The big yellow bus takes kids to school. The driver smiles and says good morning.",
    "这辆黄色的大公交车接孩子们去上学。司机微笑并说早上好。",
    [
      { q: "What color is the bus?", options: ["Yellow", "Red", "Blue", "Green"], correct: 0 },
      { q: "Where does the bus take the kids?", options: ["To school", "To the park", "To the zoo", "To the beach"], correct: 0 },
      { q: "What does the driver say?", options: ["Good morning", "Goodbye", "Good night", "Hello friend"], correct: 0 }
    ]
  ),
  createPassage(117, 'easy', 16, "Clean Water", "干净的水",
    "The mountain stream has clear cool water. Two small fish swim fast in it.",
    "山间小溪水清凉干净。两条小鱼在里面游得很快。",
    [
      { q: "How is the water in the stream?", options: ["Clear and cool", "Hot and dirty", "Deep and blue", "Salty"], correct: 0 },
      { q: "How many fish swim in the stream?", options: ["Two", "Three", "Five", "One"], correct: 0 },
      { q: "How do the fish swim?", options: ["Fast", "Slowly", "Tiredly", "Upwards"], correct: 0 }
    ]
  ),
  createPassage(118, 'easy', 17, "The Red Bus", "红色的巴士",
    "A tall red bus stops in front of the shop. Many people get off with big bags.",
    "一辆高大的红巴士停在商店门前。许多人拿着大包下车。",
    [
      { q: "Where does the bus stop?", options: ["In front of the shop", "At the park", "Near the river", "On the bridge"], correct: 0 },
      { q: "What color is the bus?", options: ["Red", "Yellow", "White", "Blue"], correct: 0 },
      { q: "What do people carry?", options: ["Big bags", "Small boxes", "Cats", "Books"], correct: 0 }
    ]
  ),
  createPassage(119, 'easy', 18, "Making a Cake", "做蛋糕",
    "Mom bakes a sweet chocolate cake for dinner. She puts three strawberries on top.",
    "妈妈为晚餐烘焙了一个甜甜的巧克力蛋糕。她在上面放了三个草莓。",
    [
      { q: "What cake does Mom bake?", options: ["Chocolate cake", "Apple cake", "Lemon cake", "Banana cake"], correct: 0 },
      { q: "When does Mom bake the cake?", options: ["For dinner", "For breakfast", "For midnight", "For lunch"], correct: 0 },
      { q: "What does Mom put on top?", options: ["Three strawberries", "Two apples", "One cherry", "Nuts"], correct: 0 }
    ]
  ),
  createPassage(120, 'easy', 19, "A Big Tree", "大树",
    "An old oak tree stands in the middle of the yard. Green leaves cover all its branches.",
    "一棵老橡树站在院子中央。绿叶覆盖着它所有的树枝。",
    [
      { q: "What tree stands in the yard?", options: ["An old oak tree", "An apple tree", "A pine tree", "A palm tree"], correct: 0 },
      { q: "Where is the tree?", options: ["In the middle of the yard", "In the forest", "By the lake", "Near the school"], correct: 0 },
      { q: "What covers the branches?", options: ["Green leaves", "Red flowers", "Snow", "Birds"], correct: 0 }
    ]
  ),
  createPassage(121, 'easy', 20, "Funny Monkey", "滑稽的猴子",
    "A funny brown monkey hangs from a thick vine. It eats a ripe yellow banana.",
    "一只滑稽的棕色猴子挂在厚厚的藤蔓上。它吃着成熟的黄香蕉。",
    [
      { q: "What does the monkey hang from?", options: ["A thick vine", "A tree trunk", "A rope", "A fence"], correct: 0 },
      { q: "What color is the monkey?", options: ["Brown", "Black", "Grey", "Orange"], correct: 0 },
      { q: "What food does the monkey eat?", options: ["A ripe yellow banana", "An apple", "A berry", "A nut"], correct: 0 }
    ]
  ),
  createPassage(122, 'easy', 21, "The White Rabbit", "白兔子",
    "A fluffy white rabbit hops across the soft grass. It wiggles its pink nose happily.",
    "一只毛茸茸的白兔子在柔软的草地上跳跃。它高兴地动着粉红色的鼻子。",
    [
      { q: "How does the rabbit move?", options: ["Hops across the grass", "Runs on road", "Swims in water", "Flies in air"], correct: 0 },
      { q: "What color is the rabbit?", options: ["Fluffy white", "Brown", "Black", "Grey"], correct: 0 },
      { q: "What color is its nose?", options: ["Pink", "Black", "White", "Red"], correct: 0 }
    ]
  ),
  createPassage(123, 'easy', 22, "Playing Soccer", "踢足球",
    "Leo kicks the black and white soccer ball into the net. His team cheers out loud.",
    "里奥把黑白相间的足球踢进网里。他的球队高声欢呼。",
    [
      { q: "What ball does Leo kick?", options: ["Soccer ball", "Basketball", "Tennis ball", "Baseball"], correct: 0 },
      { q: "Where does the ball go?", options: ["Into the net", "Over the fence", "Out of bounds", "In the lake"], correct: 0 },
      { q: "What does Leo's team do?", options: ["Cheers out loud", "Cries", "Runs away", "Sits down"], correct: 0 }
    ]
  ),
  createPassage(124, 'easy', 23, "Little Star", "小星星",
    "A bright star shines high in the night sky. Ella watches the star from her bedroom window.",
    "一颗明亮的星星高挂在夜空中。艾拉从卧室的窗户看着星星。",
    [
      { q: "Where does the star shine?", options: ["High in the night sky", "Under the water", "In the room", "On the tree"], correct: 0 },
      { q: "Where does Ella watch the star from?", options: ["Her bedroom window", "The park", "The roof", "The garden"], correct: 0 },
      { q: "How is the star?", options: ["Bright", "Dark", "Small", "Red"], correct: 0 }
    ]
  ),
  createPassage(125, 'easy', 24, "Snowy Day", "下雪天",
    "White snow covers the quiet town in winter. Toby makes a big round snowman.",
    "冬天白雪覆盖着安静的小镇。托比做了个又大又圆的雪人。",
    [
      { q: "What covers the town?", options: ["White snow", "Rain", "Leaves", "Green grass"], correct: 0 },
      { q: "What season is it?", options: ["Winter", "Summer", "Spring", "Autumn"], correct: 0 },
      { q: "What does Toby make?", options: ["A big round snowman", "A snow fort", "A sled", "A snowball"], correct: 0 }
    ]
  ),

  // --- MEDIUM (15 passages, 2 sentences, 4 questions) ---
  createPassage(126, 'medium', 25, "Playing in the Park", "在公园玩耍",
    "Lily and Dan ride the swings at the neighborhood park. They laugh loudly as they swing high up.",
    "莉莉和丹在社区公园荡秋千。当他们荡得很高时，他们大声笑了起来。",
    [
      { q: "Where are Lily and Dan?", options: ["At the park", "At school", "At home", "At the zoo"], correct: 0 },
      { q: "What equipment do they ride?", options: ["Swings", "Slides", "Bikes", "Cars"], correct: 0 },
      { q: "How do they laugh?", options: ["Loudly", "Quietly", "Sadly", "Never"], correct: 0 },
      { q: "How high do they swing?", options: ["High up", "Low down", "Near the grass", "Under the tree"], correct: 0 }
    ]
  ),
  createPassage(127, 'medium', 26, "The Busy Ants", "忙碌的蚂蚁",
    "A line of tiny black ants carries bread crumbs to their nest. They work together all afternoon.",
    "一队黑色的小蚂蚁把面包屑搬到蚁巢里。他们整个下午都在一起工作。",
    [
      { q: "What color are the ants?", options: ["Black", "Red", "Yellow", "Brown"], correct: 0 },
      { q: "What do the ants carry?", options: ["Bread crumbs", "Small leaves", "Water drops", "Seeds"], correct: 0 },
      { q: "Where do they carry the food?", options: ["To their nest", "To a tree", "To a rock", "To a flower"], correct: 0 },
      { q: "When do they work together?", options: ["All afternoon", "At night", "In winter", "Only 5 minutes"], correct: 0 }
    ]
  ),
  createPassage(128, 'medium', 27, "A Good Snack", "一份好零食",
    "Oliver slices a fresh yellow banana into small pieces. He eats the fruit with sweet yogurt.",
    "奥利弗把新鲜的黄香蕉切成小块。他配着甜酸奶吃水果。",
    [
      { q: "What fruit does Oliver slice?", options: ["A yellow banana", "An apple", "A pear", "An orange"], correct: 0 },
      { q: "How does he slice the banana?", options: ["Into small pieces", "In half", "Whole", "Into squares"], correct: 0 },
      { q: "What does he eat the fruit with?", options: ["Sweet yogurt", "Ice cream", "Milk", "Honey"], correct: 0 },
      { q: "What color is the banana?", options: ["Yellow", "Green", "Red", "Brown"], correct: 0 }
    ]
  ),
  createPassage(129, 'medium', 28, "Feeding the Fish", "喂鱼",
    "Amy sprinkles fish food into the glass bowl. Three bright orange goldfish swim up to eat.",
    "艾米把鱼食洒进玻璃碗里。三条鲜艳的橙色金鱼游上来吃。",
    [
      { q: "Where does Amy sprinkle fish food?", options: ["Into the glass bowl", "On the floor", "In the garden", "In the sink"], correct: 0 },
      { q: "How many goldfish are in the bowl?", options: ["Three", "Two", "Four", "Five"], correct: 0 },
      { q: "What color are the goldfish?", options: ["Orange", "Blue", "Black", "Silver"], correct: 0 },
      { q: "Why do the goldfish swim up?", options: ["To eat", "To sleep", "To play", "To jump out"], correct: 0 }
    ]
  ),
  createPassage(130, 'medium', 29, "Building a Castle", "建造城堡",
    "Noah uses wet sand to build a tall castle on the beach. He puts a small red flag on the top.",
    "诺亚用湿沙在海滩上建了一座高高的城堡。他在顶端放了一面红色的小旗。",
    [
      { q: "What material does Noah use?", options: ["Wet sand", "Dry stones", "Wood blocks", "Plastic toys"], correct: 0 },
      { q: "Where is Noah building?", options: ["On the beach", "In the yard", "In his room", "At the park"], correct: 0 },
      { q: "What does Noah build?", options: ["A tall castle", "A small boat", "A house", "A bridge"], correct: 0 },
      { q: "What color is the flag on top?", options: ["Red", "Blue", "Yellow", "Green"], correct: 0 }
    ]
  ),
  createPassage(131, 'medium', 30, "Painting Pictures", "画画",
    "Grace paints a blue ocean with a big green ship. She uses a bright brush to color the waves.",
    "格蕾丝画了一片蓝色的海洋和艘绿色的大船。她用亮丽的画笔给海浪上色。",
    [
      { q: "What does Grace paint?", options: ["A blue ocean with a ship", "A forest", "A house", "A cat"], correct: 0 },
      { q: "What color is the ship?", options: ["Green", "Red", "Black", "White"], correct: 0 },
      { q: "What tool does Grace use?", options: ["A bright brush", "A pencil", "Crayons", "A marker"], correct: 0 },
      { q: "What color are the waves?", options: ["Blue", "Yellow", "Green", "Purple"], correct: 0 }
    ]
  ),
  createPassage(132, 'medium', 31, "The Little Turtle", "小乌龟",
    "A small turtle walks slowly along the river bank. It pulls its head into its hard green shell.",
    "一只小乌龟沿着河岸慢慢地走着。它把头伸进硬硬的绿壳里。",
    [
      { q: "How does the turtle walk?", options: ["Slowly", "Fast", "Jumping", "Running"], correct: 0 },
      { q: "Where does the turtle walk?", options: ["Along the river bank", "In the forest", "On the street", "In the yard"], correct: 0 },
      { q: "Where does the turtle pull its head?", options: ["Into its shell", "Under the mud", "Behind a stone", "In the water"], correct: 0 },
      { q: "What color is the turtle's shell?", options: ["Green", "Black", "Brown", "Yellow"], correct: 0 }
    ]
  ),
  createPassage(133, 'medium', 32, "Flying Kites", "放风筝",
    "The wind blows strongly across the wide green field. Kids run fast and fly colorful kites high up.",
    "风在宽广的绿野上猛烈地吹着。孩子们快速跑着，把五彩缤纷的风筝放得高高的。",
    [
      { q: "How does the wind blow?", options: ["Strongly", "Softly", "Not at all", "Coldly"], correct: 0 },
      { q: "Where are the kids playing?", options: ["Across a wide green field", "In the street", "At home", "In a classroom"], correct: 0 },
      { q: "What are the kids flying?", options: ["Colorful kites", "Paper planes", "Balloons", "Birds"], correct: 0 },
      { q: "How do the kids run?", options: ["Fast", "Slowly", "Quietly", "Tiredly"], correct: 0 }
    ]
  ),
  createPassage(134, 'medium', 33, "A Cool Drink", "一杯冷饮",
    "Leo pours sweet orange juice into a tall glass with ice. He drinks it after playing sports outside.",
    "里奥把甜橙汁倒入带有冰块的高玻璃杯里。他在外面做完运动后喝了它。",
    [
      { q: "What juice does Leo pour?", options: ["Sweet orange juice", "Apple juice", "Grape juice", "Watermelon juice"], correct: 0 },
      { q: "What is inside the glass?", options: ["Ice", "Strawberries", "Lemons", "Sugar"], correct: 0 },
      { q: "When does Leo drink the juice?", options: ["After playing sports outside", "Before bed", "In the morning", "At night"], correct: 0 },
      { q: "What kind of glass is it?", options: ["Tall glass", "Small cup", "Plastic bowl", "Paper cup"], correct: 0 }
    ]
  ),
  createPassage(135, 'medium', 34, "The Little Puppy", "小狗",
    "A cute brown puppy wags its short tail happily. It runs around the yard to chase a red ball.",
    "一只可爱的小棕狗高兴地摇着短尾巴。它在院子里跑来跑去追红球。",
    [
      { q: "What color is the puppy?", options: ["Brown", "White", "Black", "Golden"], correct: 0 },
      { q: "What does the puppy wag?", options: ["Its short tail", "Its ears", "Its paws", "Its nose"], correct: 0 },
      { q: "Where does the puppy run?", options: ["Around the yard", "In the house", "On the street", "In the park"], correct: 0 },
      { q: "What object does it chase?", options: ["A red ball", "A cat", "A butterfly", "A stick"], correct: 0 }
    ]
  ),
  createPassage(136, 'medium', 35, "Gardening Time", "园艺时间",
    "Grandma plants small green seeds in the soft dark soil. She waters the garden every afternoon.",
    "奶奶在柔软的黑土里种下了绿色的种子。她每天下午给花园浇水。",
    [
      { q: "Who plants seeds?", options: ["Grandma", "Mom", "Lily", "Dad"], correct: 0 },
      { q: "What color are the seeds?", options: ["Green", "Black", "Brown", "White"], correct: 0 },
      { q: "Where does she plant seeds?", options: ["In soft dark soil", "In a pot", "On grass", "In sand"], correct: 0 },
      { q: "When does she water the garden?", options: ["Every afternoon", "Every morning", "At night", "Only Sundays"], correct: 0 }
    ]
  ),
  createPassage(137, 'medium', 36, "A Sleepy Cat", "嗜睡的猫",
    "Fluffy the cat lies on the soft sofa near the window. She purrs quietly and closes her eyes.",
    "弗拉菲这只猫躺在窗户附近的软沙发上。她轻轻地发出咕噜声并闭上了眼睛。",
    [
      { q: "What is the cat's name?", options: ["Fluffy", "Max", "Tim", "Sam"], correct: 0 },
      { q: "Where is the cat lying?", options: ["On the soft sofa", "On the bed", "On the rug", "On the chair"], correct: 0 },
      { q: "Where is the sofa located?", options: ["Near the window", "By the door", "In kitchen", "Outside"], correct: 0 },
      { q: "How does the cat purr?", options: ["Quietly", "Loudly", "Angry", "Fast"], correct: 0 }
    ]
  ),
  createPassage(138, 'medium', 37, "Reading at Night", "夜间阅读",
    "Jack turns on his small desk lamp after dinner. He reads an exciting story about wild animals.",
    "杰克晚餐后打开了他的小台灯。他读了一个关于野生动物的令人兴奋的故事。",
    [
      { q: "What does Jack turn on?", options: ["His small desk lamp", "The TV", "The big light", "The radio"], correct: 0 },
      { q: "When does he turn on the lamp?", options: ["After dinner", "Before school", "In the morning", "At noon"], correct: 0 },
      { q: "What is the story about?", options: ["Wild animals", "Space ships", "Deep oceans", "Magic cars"], correct: 0 },
      { q: "How is the story?", options: ["Exciting", "Boring", "Sad", "Scary"], correct: 0 }
    ]
  ),
  createPassage(139, 'medium', 38, "Fresh Bread", "新鲜面包",
    "The baker puts warm round bread on the wooden counter. It smells delicious and tastes fresh.",
    "面包师把温暖的圆面包放在木台面上。它闻起来很香，尝起来很新鲜。",
    [
      { q: "Who puts bread on the counter?", options: ["The baker", "The chef", "Mom", "The boy"], correct: 0 },
      { q: "What shape is the bread?", options: ["Round", "Square", "Long", "Triangle"], correct: 0 },
      { q: "What is the counter made of?", options: ["Wood", "Metal", "Glass", "Stone"], correct: 0 },
      { q: "How does the bread smell?", options: ["Delicious", "Bad", "Sour", "Salty"], correct: 0 }
    ]
  ),
  createPassage(140, 'medium', 39, "Morning Walk", "晨间散步",
    "Grandpa walks slowly down the quiet street with his golden retriever. They stop to look at yellow flowers.",
    "爷爷带着他的金毛犬沿着安静的街道慢走。他们停下来看黄色的花。",
    [
      { q: "Who walks down the street?", options: ["Grandpa", "Dad", "Tom", "The boy"], correct: 0 },
      { q: "What dog does Grandpa have?", options: ["Golden retriever", "Bulldog", "Poodle", "Pug"], correct: 0 },
      { q: "How is the street?", options: ["Quiet", "Busy", "Noisy", "Crowded"], correct: 0 },
      { q: "What flowers do they stop to look at?", options: ["Yellow flowers", "Red roses", "Blue orchids", "White lilies"], correct: 0 }
    ]
  ),

  // --- HARD (10 passages, 2 sentences, 5 questions) ---
  createPassage(141, 'hard', 40, "A Trip to the Zoo", "动物园之旅",
    "Class One visits the city zoo on a bright sunny Tuesday. The students cheer happily when they see two tall giraffes.",
    "一班在阳光明媚的星期二参观了城市动物园。当学生们看到两只高高的长颈鹿时，高兴地欢呼起来。",
    [
      { q: "Which class visits the zoo?", options: ["Class One", "Class Two", "Class Three", "Class Four"], correct: 0 },
      { q: "What day is it?", options: ["Tuesday", "Monday", "Friday", "Sunday"], correct: 0 },
      { q: "How is the weather?", options: ["Bright and sunny", "Rainy", "Windy", "Snowy"], correct: 0 },
      { q: "What animals do the students see?", options: ["Two tall giraffes", "Three elephants", "Four lions", "Five monkeys"], correct: 0 },
      { q: "How do the students cheer?", options: ["Happily", "Sadly", "Quietly", "Angry"], correct: 0 }
    ]
  ),
  createPassage(142, 'hard', 41, "The Bus Driver", "公交车司机",
    "Mr Green drives a clean blue bus around the busy town every day. He always smiles and greets all passengers warmly.",
    "格林先生每天开着一辆干净的蓝色公交车在繁忙的小镇上穿行。他总是面带微笑，热情地招呼所有的乘客。",
    [
      { q: "What is the driver's name?", options: ["Mr. Green", "Mr. Brown", "Mr. Smith", "Mr. White"], correct: 0 },
      { q: "What color is the bus?", options: ["Blue", "Red", "Yellow", "Green"], correct: 0 },
      { q: "Where does he drive the bus?", options: ["Around the busy town", "In the village", "On highway", "At the airport"], correct: 0 },
      { q: "How often does he drive?", options: ["Every day", "Sundays only", "Twice a week", "Never"], correct: 0 },
      { q: "How does he greet passengers?", options: ["Warmly", "Coldly", "Silently", "Quickly"], correct: 0 }
    ]
  ),
  createPassage(143, 'hard', 42, "The Little Farm", "小农场",
    "Old John keeps five white sheep and ten brown hens on his farm. The hens lay fresh eggs in the straw every morning.",
    "老约翰在他的农场里养了五只白羊和十只棕色母鸡。每天早上母鸡都在干草里产新鲜的鸡蛋。",
    [
      { q: "What is the farmer's name?", options: ["Old John", "Old Tom", "Farmer Bob", "Mr. Jack"], correct: 0 },
      { q: "How many sheep does he keep?", options: ["Five", "Ten", "Six", "Two"], correct: 0 },
      { q: "What color are the sheep?", options: ["White", "Brown", "Black", "Spotted"], correct: 0 },
      { q: "How many hens does he keep?", options: ["Ten", "Five", "Eight", "Twelve"], correct: 0 },
      { q: "Where do hens lay eggs?", options: ["In the straw", "On the grass", "In a box", "Near the pond"], correct: 0 }
    ]
  ),
  createPassage(144, 'hard', 43, "A Clean Room", "干净的房间",
    "Sally cleans her bedroom carefully every Saturday morning. She folds her clothes and puts all her books on the shelf.",
    "萨莉每个星期六早上都仔细清洁她的卧室。她折好衣服，把所有的书放在架子上。",
    [
      { q: "Who cleans the bedroom?", options: ["Sally", "Mia", "Anna", "Grace"], correct: 0 },
      { q: "When does she clean her room?", options: ["Every Saturday morning", "Every Sunday night", "On Mondays", "Every afternoon"], correct: 0 },
      { q: "How does she clean?", options: ["Carefully", "Quickly", "Messily", "Slowly"], correct: 0 },
      { q: "What does she fold?", options: ["Her clothes", "Her blankets", "Paper planes", "Towels"], correct: 0 },
      { q: "Where does she put her books?", options: ["On the shelf", "On the floor", "Under the bed", "In a box"], correct: 0 }
    ]
  ),
  createPassage(145, 'hard', 44, "The Toy Store", "玩具店",
    "The new toy store on Main Street opens at nine in the morning. Children rush in to look at shiny colorful trains.",
    "主街上的新玩具店早上九点开门。孩子们冲进去看闪闪发光的彩色火车。",
    [
      { q: "Where is the new toy store?", options: ["On Main Street", "Near park", "By the lake", "At school"], correct: 0 },
      { q: "What time does it open?", options: ["Nine in the morning", "Eight in morning", "Ten at night", "At noon"], correct: 0 },
      { q: "Who rushes into the store?", options: ["Children", "Teachers", "Drivers", "Bakers"], correct: 0 },
      { q: "What toys do children look at?", options: ["Shiny colorful trains", "Dolls", "Balls", "Puzzles"], correct: 0 },
      { q: "How are the trains described?", options: ["Shiny and colorful", "Old and broken", "Dusty", "Small and grey"], correct: 0 }
    ]
  ),
  createPassage(146, 'hard', 45, "Summer Picnic", "夏天野餐",
    "Peter and his family eat sandwiches under a big oak tree. They drink cold lemonade and play fun board games.",
    "彼得和他的家人在大橡树下吃三明治。他们喝冰镇柠檬水，玩有趣的棋盘游戏。",
    [
      { q: "Who goes on a picnic?", options: ["Peter and his family", "Peter's friends", "The teacher", "The class"], correct: 0 },
      { q: "What food do they eat?", options: ["Sandwiches", "Pizza", "Burgers", "Hotdogs"], correct: 0 },
      { q: "Where do they sit?", options: ["Under a big oak tree", "On a boat", "In a house", "By a pool"], correct: 0 },
      { q: "What drink do they have?", options: ["Cold lemonade", "Warm tea", "Apple juice", "Water"], correct: 0 },
      { q: "What games do they play?", options: ["Fun board games", "Card games", "Video games", "Soccer"], correct: 0 }
    ]
  ),
  createPassage(147, 'hard', 46, "The Busy Bee", "忙碌的蜜蜂",
    "A small yellow bee flies from flower to flower in the sun. It collects sweet nectar to make honey for its hive.",
    "一只黄色的小蜜蜂在阳光下从一朵花飞到另一朵花。它收集甜甜的花蜜来为蜂巢做蜂蜜。",
    [
      { q: "What animal is in the story?", options: ["A small yellow bee", "A butterfly", "A ladybug", "A ant"], correct: 0 },
      { q: "Where does the bee fly?", options: ["From flower to flower", "Over the river", "Inside a house", "Up to clouds"], correct: 0 },
      { q: "What does the bee collect?", options: ["Sweet nectar", "Water drops", "Leaves", "Seeds"], correct: 0 },
      { q: "What does the bee make?", options: ["Honey", "Wax", "Jam", "Juice"], correct: 0 },
      { q: "Where does the bee take the food?", options: ["To its hive", "To a tree", "To a nest", "To the grass"], correct: 0 }
    ]
  ),
  createPassage(148, 'hard', 47, "A Good Book", "一本好书",
    "Jenny visits the town library to borrow a picture book about space. She sits in a cozy red chair to read.",
    "珍妮去镇上的图书馆借一本关于太空的绘本。她坐在舒适的红椅子上看书。",
    [
      { q: "Where does Jenny go?", options: ["Town library", "School lab", "Toy store", "Book shop"], correct: 0 },
      { q: "What book does she borrow?", options: ["A picture book about space", "A math book", "A comic", "A novel"], correct: 0 },
      { q: "What color is the chair?", options: ["Red", "Blue", "Green", "Brown"], correct: 0 },
      { q: "How is the chair described?", options: ["Cozy", "Hard", "Cold", "Old"], correct: 0 },
      { q: "Why does she sit in the chair?", options: ["To read", "To sleep", "To eat", "To wait"], correct: 0 }
    ]
  ),
  createPassage(149, 'hard', 48, "Winter Snowman", "冬天雪人",
    "Sam and his sister build a snowman with a carrot nose and coal eyes. They put a bright red scarf around its neck.",
    "萨姆和他的妹妹做了一个有着胡萝卜鼻子和煤炭眼睛的雪人。他们在它的脖子上围了一条鲜红色的围巾。",
    [
      { q: "Who builds a snowman?", options: ["Sam and his sister", "Sam alone", "Sam's parents", "Ben"], correct: 0 },
      { q: "What is the snowman's nose made of?", options: ["A carrot", "A stick", "A stone", "A button"], correct: 0 },
      { q: "What are the eyes made of?", options: ["Coal", "Buttons", "Stones", "Seeds"], correct: 0 },
      { q: "What color is the scarf?", options: ["Bright red", "Blue", "Yellow", "Green"], correct: 0 },
      { q: "Where do they put the scarf?", options: ["Around its neck", "On its head", "On its arm", "Under its base"], correct: 0 }
    ]
  ),
  createPassage(150, 'hard', 49, "Baking Cookies", "烘焙饼干",
    "Mom and Toby mix butter and sugar to bake round oat cookies. The kitchen smells sweet as the cookies bake in the oven.",
    "妈妈和托比混合黄油和糖来烘焙圆形燕麦饼干。当饼干在烤箱里烘烤时，厨房里弥漫着甜香味。",
    [
      { q: "Who bakes cookies?", options: ["Mom and Toby", "Mom alone", "Toby and Sam", "Grandma"], correct: 0 },
      { q: "What ingredients do they mix?", options: ["Butter and sugar", "Milk and water", "Flour and salt", "Eggs and oil"], correct: 0 },
      { q: "What kind of cookies do they make?", options: ["Round oat cookies", "Chocolate chips", "Sugar cookies", "Nut cookies"], correct: 0 },
      { q: "Where do the cookies bake?", options: ["In the oven", "On the stove", "In microwave", "On grill"], correct: 0 },
      { q: "How does the kitchen smell?", options: ["Sweet", "Sour", "Smoky", "Salty"], correct: 0 }
    ]
  ),

  // --- SUPER HARD (10 passages, 3 sentences, 6 questions) ---
  createPassage(151, 'super_hard', 50, "The Apple Orchard", "苹果果园",
    "Farmer Dan picks ripe red apples in his big orchard every autumn. He puts the heavy apples into large wooden crates. Then he drives a green tractor to sell them at the market.",
    "丹农夫每年秋天都在他的大果园里采摘成熟的红苹果。他把沉重的苹果装进大木箱里。然后他开着绿色的拖拉机去集市上卖掉它们。",
    [
      { q: "Who picks the apples?", options: ["Farmer Dan", "Farmer Bob", "John", "Tom"], correct: 0 },
      { q: "When does he pick apples?", options: ["Every autumn", "Every spring", "In summer", "In winter"], correct: 0 },
      { q: "What color are the apples?", options: ["Ripe red", "Green", "Yellow", "Brown"], correct: 0 },
      { q: "Where does he put the apples?", options: ["Into large wooden crates", "In bags", "In boxes", "On the grass"], correct: 0 },
      { q: "What vehicle does he drive?", options: ["A green tractor", "A red truck", "A blue car", "A bicycle"], correct: 0 },
      { q: "Where does he sell the apples?", options: ["At the market", "At school", "In a shop", "At the farm"], correct: 0 }
    ]
  ),
  createPassage(152, 'super_hard', 51, "The Sea Turtle", "海龟",
    "A giant sea turtle swims gracefully through the warm blue ocean. It uses its long flippers to paddle smoothly past colorful coral reefs. Later it rests on the sandy shore under the bright sun.",
    "一只巨大的海龟在温暖的蓝色海洋中优雅地游泳。它用长长的鳍划水，平稳地穿过色彩斑斓的珊瑚礁。后来它在明亮的阳光下躺在沙滩上休息。",
    [
      { q: "What animal is described?", options: ["A giant sea turtle", "A dolphin", "A shark", "A whale"], correct: 0 },
      { q: "How does the turtle swim?", options: ["Gracefully", "Fast and wild", "Slowly and tired", "Splashing"], correct: 0 },
      { q: "What body part does it paddle with?", options: ["Long flippers", "Short legs", "Tail", "Wings"], correct: 0 },
      { q: "What does it paddle past?", options: ["Colorful coral reefs", "Big boats", "Dark caves", "Seaweed"], correct: 0 },
      { q: "Where does it rest later?", options: ["On the sandy shore", "On a rock", "In a cave", "On a boat"], correct: 0 },
      { q: "How is the sun described?", options: ["Bright", "Dim", "Setting", "Hot"], correct: 0 }
    ]
  ),
  createPassage(153, 'super_hard', 52, "A Rainy Morning", "下雨的早晨",
    "Dark clouds cover the sky on a chilly Monday morning. Maya puts on her bright yellow raincoat and matching boots. She splashes happily in clear water puddles on her way to school.",
    "在寒冷的星期一早上，乌云覆盖着天空。玛雅穿上她鲜黄色的雨衣和配套的靴子。在去上学的路上，她在清澈的水坑里快乐地踩水。",
    [
      { q: "What covers the sky?", options: ["Dark clouds", "Blue smoke", "White birds", "Kites"], correct: 0 },
      { q: "What day of the week is it?", options: ["Chilly Monday", "Sunny Friday", "Warm Tuesday", "Sunday"], correct: 0 },
      { q: "What color is Maya's raincoat?", options: ["Bright yellow", "Red", "Blue", "Pink"], correct: 0 },
      { q: "What does she wear on her feet?", options: ["Matching boots", "Slippers", "Sneakers", "Socks"], correct: 0 },
      { q: "Where does Maya splash?", options: ["In clear water puddles", "In a lake", "In a pool", "In mud"], correct: 0 },
      { q: "Where is Maya going?", options: ["To school", "To the park", "To the market", "To home"], correct: 0 }
    ]
  ),
  createPassage(154, 'super_hard', 53, "The School Concert", "学校音乐会",
    "Students gather in the bright auditorium for the annual music concert. Clara plays a soft tune on her wooden violin for the audience. Everyone claps warmly when she finishes her song.",
    "学生们聚集在明亮的礼堂里参加一年一度的音乐会。克拉拉在她的木制小提琴上为观众演奏了一曲柔和的调子。当她演奏完毕时，每个人都热情地鼓掌。",
    [
      { q: "Where do students gather?", options: ["In the bright auditorium", "In gym", "In classroom", "Outside"], correct: 0 },
      { q: "What event is taking place?", options: ["Annual music concert", "Sports day", "Art show", "Science fair"], correct: 0 },
      { q: "What instrument does Clara play?", options: ["Wooden violin", "Piano", "Guitar", "Flute"], correct: 0 },
      { q: "How is Clara's tune described?", options: ["Soft", "Loud", "Fast", "Sad"], correct: 0 },
      { q: "Who listens to Clara?", options: ["The audience", "Her teacher only", "Her parents only", "Nobody"], correct: 0 },
      { q: "What does the audience do when she finishes?", options: ["Claps warmly", "Leaves", "Cries", "Shouts"], correct: 0 }
    ]
  ),
  createPassage(155, 'super_hard', 54, "Camping in the Woods", "树林露营",
    "David and his dad pitch a green tent near a clear forest stream. They build a small campfire to cook fresh sausages for dinner. At night they look at bright twinkling stars in the sky.",
    "戴维和他的爸爸在清澈的森林溪流旁搭起了绿色的帐篷。他们生起小篝火煮新鲜的香肠作为晚餐。晚上，他们看着夜空中闪烁的明亮星星。",
    [
      { q: "Who goes camping?", options: ["David and his dad", "David and his mom", "David alone", "David's class"], correct: 0 },
      { q: "What color is the tent?", options: ["Green", "Blue", "Red", "Yellow"], correct: 0 },
      { q: "Where do they pitch the tent?", options: ["Near a clear forest stream", "On a mountain top", "In yard", "By a cave"], correct: 0 },
      { q: "What do they cook on the campfire?", options: ["Fresh sausages", "Fish", "Marshmallows", "Soup"], correct: 0 },
      { q: "When do they look at stars?", options: ["At night", "At noon", "In morning", "In afternoon"], correct: 0 },
      { q: "How are the stars described?", options: ["Bright twinkling", "Dim", "Red", "Falling"], correct: 0 }
    ]
  ),
  createPassage(156, 'super_hard', 55, "The Friendly Dolphin", "友好的海豚",
    "A silver dolphin leaps high out of the sparkling ocean water. It performs two fun flips before splashing smoothly back into the sea. The passengers on the tour boat cheer in delight.",
    "一只银色的海豚从闪烁的海洋水面高高跃起。它表演了两个有趣的翻滚，然后平稳地落回海里。观光船上的乘客们高兴地欢呼。",
    [
      { q: "What animal leaps out of the water?", options: ["A silver dolphin", "A shark", "A seal", "A turtle"], correct: 0 },
      { q: "How is the water described?", options: ["Sparkling ocean water", "Cold river", "Dark pond", "Dirty lake"], correct: 0 },
      { q: "What trick does the dolphin perform?", options: ["Two fun flips", "A song", "A dive", "A wave"], correct: 0 },
      { q: "Where does it splash back into?", options: ["The sea", "The boat", "The beach", "The sky"], correct: 0 },
      { q: "Who is watching the dolphin?", options: ["Passengers on the tour boat", "Fishermen", "Swimmers", "Nobody"], correct: 0 },
      { q: "How do the passengers react?", options: ["Cheer in delight", "Scream in fear", "Sleep", "Leave"], correct: 0 }
    ]
  ),
  createPassage(157, 'super_hard', 56, "Harvest Season", "丰收季节",
    "Farmers work hard under the golden autumn sun to harvest wheat. Big yellow combine machines cut the tall dry stalks across the field. By evening the barns are full of clean grain.",
    "农夫们在秋天的金色阳光下努力收割小麦。大型黄色联合收割机切断田野里高大干燥的麦秆。到晚上，粮仓里装满了干净的谷物。",
    [
      { q: "What season is described?", options: ["Golden autumn", "Warm spring", "Hot summer", "Cold winter"], correct: 0 },
      { q: "What crop do farmers harvest?", options: ["Wheat", "Corn", "Rice", "Cotton"], correct: 0 },
      { q: "What machines cut the stalks?", options: ["Big yellow combine machines", "Tractors", "Trucks", "Mowers"], correct: 0 },
      { q: "How are the stalks described?", options: ["Tall and dry", "Short and green", "Wet", "Small"], correct: 0 },
      { q: "When are the barns full?", options: ["By evening", "At noon", "In morning", "Midnight"], correct: 0 },
      { q: "What is inside the barns?", options: ["Clean grain", "Hay", "Apples", "Tools"], correct: 0 }
    ]
  ),
  createPassage(158, 'super_hard', 57, "The Public Library", "公共图书馆",
    "The city library has thousands of interesting books on neat wooden shelves. Children sit at round tables to complete their school homework quietly. Friendly librarians help visitors find mystery books.",
    "城市图书馆整洁的木架子上有成千上万本有趣的书。孩子们坐在圆桌前安静地完成学校作业。友好的图书管理员帮助访客找到神秘书籍。",
    [
      { q: "How many books does the library have?", options: ["Thousands", "Hundreds", "Fifty", "Ten"], correct: 0 },
      { q: "Where are the books kept?", options: ["On neat wooden shelves", "In boxes", "On the floor", "In bags"], correct: 0 },
      { q: "Where do children sit?", options: ["At round tables", "On floor", "On stairs", "Outside"], correct: 0 },
      { q: "What do children complete at the tables?", options: ["School homework", "Puzzles", "Drawings", "Lunch"], correct: 0 },
      { q: "How do children work?", options: ["Quietly", "Loudly", "Quickly", "Messily"], correct: 0 },
      { q: "What kind of books do librarians help find?", options: ["Mystery books", "Math books", "Maps", "Magazines"], correct: 0 }
    ]
  ),
  createPassage(159, 'super_hard', 58, "Making Pottery", "制作陶器",
    "An artist shapes soft grey clay on a spinning wheel. She uses her wet hands to smooth the sides of a round vase. After firing in a hot kiln, the vase turns bright blue.",
    "一位艺术家在旋转的轮子上塑造软灰色的粘土。她用湿手抚平圆瓶的四周。在烫窑里烧制后，花瓶变成了亮蓝色。",
    [
      { q: "What material does the artist shape?", options: ["Soft grey clay", "Hard wood", "Glass", "Stone"], correct: 0 },
      { q: "What tool does she use to spin the clay?", options: ["A spinning wheel", "A hammer", "A brush", "A saw"], correct: 0 },
      { q: "How are her hands when smoothing?", options: ["Wet", "Dry", "Cold", "Dirty"], correct: 0 },
      { q: "What object is she making?", options: ["A round vase", "A plate", "A mug", "A bowl"], correct: 0 },
      { q: "Where is the vase fired?", options: ["In a hot kiln", "In an oven", "Outside", "In a furnace"], correct: 0 },
      { q: "What color does the vase turn after firing?", options: ["Bright blue", "Green", "Red", "Grey"], correct: 0 }
    ]
  ),
  createPassage(160, 'super_hard', 59, "The Starry Night", "星光熠熠的夜晚",
    "Leo gazes through his black telescope on a clear summer night. He observes bright craters on the silver surface of the moon. He feels amazed as he tracks a shooting star across space.",
    "在晴朗的夏夜，里奥透过他的黑色望远镜凝视着。他观察到银色月球表面上明亮环形山。当他追踪太空中的一颗流星时，他感到非常神奇。",
    [
      { q: "What instrument does Leo look through?", options: ["His black telescope", "Binoculars", "Camera", "Microscope"], correct: 0 },
      { q: "What season is it?", options: ["Clear summer night", "Winter", "Spring", "Autumn"], correct: 0 },
      { q: "What does he observe on the moon?", options: ["Bright craters", "Trees", "Water", "Clouds"], correct: 0 },
      { q: "What color is the moon's surface described as?", options: ["Silver", "Gold", "White", "Yellow"], correct: 0 },
      { q: "What does Leo track across space?", options: ["A shooting star", "A comet", "A planet", "A plane"], correct: 0 },
      { q: "How does Leo feel?", options: ["Amazed", "Bored", "Scared", "Tired"], correct: 0 }
    ]
  )
];

const fileContent = `export const readingsG12 = ${JSON.stringify(g12Data, null, 2)};\n`;
fs.writeFileSync('./readings_g12.js', fileContent, 'utf8');
console.log('Successfully generated Grade 1-2 reading passages in readings_g12.js!');
