import { reviewReadingPack } from './reading_review.js';

const rawReadingsG34 = [
  {
    "id": 201,
    "difficulty": "easy",
    "dayIndex": 0,
    "title": {
      "en": "The School Garden",
      "zh": "学校花园"
    },
    "text": {
      "en": "Students in Class Three planted a small garden behind their school. They grew bright red tomatoes and sweet green peas together. Everyone took turns watering the vegetables after lunch.",
      "zh": "三年级的学生在学校后面种了一个小花园。他们一起种了鲜红的番茄和甜甜的青豆。午饭后，每个人轮流给蔬菜浇水。"
    },
    "questions": [
      {
        "q": "Where is the school garden located?",
        "options": [
          "Behind their school",
          "In front of park",
          "On the roof",
          "Inside auditorium"
        ],
        "correct": 0
      },
      {
        "q": "What vegetables did they grow?",
        "options": [
          "Red tomatoes and green peas",
          "Carrots and potatoes",
          "Cabbage and corn",
          "Beans and onions"
        ],
        "correct": 0
      },
      {
        "q": "When did students water the garden?",
        "options": [
          "After lunch",
          "Before breakfast",
          "At night",
          "During recess"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 202,
    "difficulty": "easy",
    "dayIndex": 1,
    "title": {
      "en": "A Visit to the Farm",
      "zh": "参观农场"
    },
    "text": {
      "en": "Leo went to his uncle's dairy farm during the sunny spring break. He helped feed the small calves with bottles of warm milk. He also watched how fresh milk was gathered in large metal buckets.",
      "zh": "在阳光明媚的春假期间，里奥去了他叔叔的奶牛场。他帮忙用温牛奶瓶喂小牛。他还观察了如何用大金属桶收集新鲜牛奶。"
    },
    "questions": [
      {
        "q": "Whose farm did Leo visit?",
        "options": [
          "His uncle's dairy farm",
          "His friend's farm",
          "His teacher's farm",
          "A public park"
        ],
        "correct": 0
      },
      {
        "q": "How did Leo feed the calves?",
        "options": [
          "With bottles of warm milk",
          "With fresh grass",
          "With bread",
          "With dry corn"
        ],
        "correct": 0
      },
      {
        "q": "Where was fresh milk gathered?",
        "options": [
          "In large metal buckets",
          "In plastic cups",
          "In glass bottles",
          "In wooden boxes"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 203,
    "difficulty": "easy",
    "dayIndex": 2,
    "title": {
      "en": "Building a Birdhouse",
      "zh": "制作鸟窝"
    },
    "text": {
      "en": "Sam and his father built a wooden birdhouse on Saturday afternoon. They painted the outer walls light blue and added a small round roof. Then they hung it high up on a thick oak branch.",
      "zh": "萨姆和他的父亲在星期六下午建了一个木制鸟窝。他们把外墙刷成浅蓝色，并添加了一个圆形小屋顶。然后他们把它高高地挂在粗壮的橡树枝上。"
    },
    "questions": [
      {
        "q": "When did Sam build the birdhouse?",
        "options": [
          "Saturday afternoon",
          "Sunday morning",
          "Friday night",
          "Monday noon"
        ],
        "correct": 0
      },
      {
        "q": "What color did they paint the walls?",
        "options": [
          "Light blue",
          "Bright red",
          "Dark green",
          "Yellow"
        ],
        "correct": 0
      },
      {
        "q": "Where did they hang the birdhouse?",
        "options": [
          "High up on an oak branch",
          "On a wooden fence",
          "Under the porch",
          "Inside the garage"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 204,
    "difficulty": "easy",
    "dayIndex": 3,
    "title": {
      "en": "The Clever Honeybee",
      "zh": "聪明的小蜜蜂"
    },
    "text": {
      "en": "Honeybees travel miles across green fields to find sweet flower nectar. They dance in special patterns to tell other bees where to look. By working as a team, their hive stays full of sweet honey.",
      "zh": "蜜蜂穿过绿色的田野飞翔数英里去寻找甜美的花蜜。它们通过特殊的舞蹈图案告诉其他蜜蜂去哪里寻找。通过团队合作，它们的蜂巢里装满了甜甜的蜂蜜。"
    },
    "questions": [
      {
        "q": "Why do honeybees travel across fields?",
        "options": [
          "To find sweet flower nectar",
          "To look for water",
          "To play with butterflies",
          "To escape rain"
        ],
        "correct": 0
      },
      {
        "q": "How do bees communicate with others?",
        "options": [
          "They dance in special patterns",
          "They make loud noise",
          "They fly in circle",
          "They leave scents"
        ],
        "correct": 0
      },
      {
        "q": "What stays full in their hive?",
        "options": [
          "Sweet honey",
          "Fresh water",
          "Green leaves",
          "Dry pollen"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 205,
    "difficulty": "easy",
    "dayIndex": 4,
    "title": {
      "en": "The Sunny Beach",
      "zh": "阳光沙滩"
    },
    "text": {
      "en": "Maya spent a hot summer afternoon playing near the ocean waves. She collected smooth colorful seashells and put them into a yellow bucket. Before leaving, she built a big sandcastle with a red flag.",
      "zh": "玛雅在一个炎热的夏天下午在海浪附近玩耍。她收集了光滑的彩色海贝壳，放进了一个黄色的桶里。离开前，她建了一座带着红旗的大沙堡。"
    },
    "questions": [
      {
        "q": "Where did Maya spend her afternoon?",
        "options": [
          "Near the ocean waves",
          "In a city park",
          "At a swimming pool",
          "In her backyard"
        ],
        "correct": 0
      },
      {
        "q": "What did Maya collect?",
        "options": [
          "Smooth colorful seashells",
          "Small river stones",
          "Pretty flowers",
          "Driftwood"
        ],
        "correct": 0
      },
      {
        "q": "What did she build before leaving?",
        "options": [
          "A big sandcastle",
          "A wooden boat",
          "A fort",
          "A kite"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 206,
    "difficulty": "easy",
    "dayIndex": 5,
    "title": {
      "en": "Learning to Swim",
      "zh": "学习游泳"
    },
    "text": {
      "en": "Ben joined a beginner swimming class at the local community center. His coach taught him how to kick his legs and float on his back. By the third week, Ben could swim across the shallow pool safely.",
      "zh": "本参加了当地社区中心的初学者游泳班。他的教练教他如何踢腿和仰泳漂浮。到了第三周，本就可以安全地游过浅水池了。"
    },
    "questions": [
      {
        "q": "Where did Ben join the swimming class?",
        "options": [
          "Local community center",
          "School gym",
          "Beach resort",
          "Friend's house"
        ],
        "correct": 0
      },
      {
        "q": "What did his coach teach him first?",
        "options": [
          "To kick legs and float",
          "To dive deep",
          "To hold breath",
          "To jump off board"
        ],
        "correct": 0
      },
      {
        "q": "When could Ben swim across the pool?",
        "options": [
          "By the third week",
          "On the first day",
          "After one year",
          "In two days"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 207,
    "difficulty": "easy",
    "dayIndex": 6,
    "title": {
      "en": "The Friendly Dolphin",
      "zh": "友好的海豚"
    },
    "text": {
      "en": "Dolphins are smart mammals that live together in warm ocean waters. They use high clicks and whistles to talk with each other underwater. Sometimes they leap high into the air to play with passing boats.",
      "zh": "海豚是生活在温暖海洋水域的聪明哺乳动物。它们用高频的嗒嗒声和哨声在水下互相交流。有时它们跃入空中，与路过的船只玩耍。"
    },
    "questions": [
      {
        "q": "What kind of animals are dolphins?",
        "options": [
          "Smart mammals",
          "Fish",
          "Reptiles",
          "Birds"
        ],
        "correct": 0
      },
      {
        "q": "How do dolphins talk underwater?",
        "options": [
          "High clicks and whistles",
          "Tail slaps",
          "Bubbles",
          "Color changes"
        ],
        "correct": 0
      },
      {
        "q": "Why do dolphins leap into the air?",
        "options": [
          "To play with passing boats",
          "To find food",
          "To escape sharks",
          "To sleep"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 208,
    "difficulty": "easy",
    "dayIndex": 7,
    "title": {
      "en": "A Trip to the Library",
      "zh": "图书馆之旅"
    },
    "text": {
      "en": "Emma likes visiting the public library near her house every Friday afternoon. She borrows storybooks about magic castles and ancient rainforest animals. The quiet environment helps her read smoothly without distraction.",
      "zh": "艾玛喜欢每周五下午去她家附近的公共图书馆。她借阅关于神奇城堡和古代雨林动物的故事书。安静的环境有助于她顺利阅读而不受干扰。"
    },
    "questions": [
      {
        "q": "How often does Emma visit the library?",
        "options": [
          "Every Friday afternoon",
          "Every day",
          "Once a month",
          "On weekends"
        ],
        "correct": 0
      },
      {
        "q": "What topics are her storybooks about?",
        "options": [
          "Magic castles and animals",
          "Sports and cars",
          "Math and science",
          "Cooking"
        ],
        "correct": 0
      },
      {
        "q": "How does the quiet environment help her?",
        "options": [
          "Helps her read smoothly",
          "Makes her sleep",
          "Helps her draw",
          "Makes her write"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 209,
    "difficulty": "easy",
    "dayIndex": 8,
    "title": {
      "en": "Baking Apple Pie",
      "zh": "烘焙苹果派"
    },
    "text": {
      "en": "Grandma and Lucy prepared a warm apple pie for dinner dessert. They peeled sweet red apples and mixed them with cinnamon powder. The entire house smelled wonderful as the pie baked in the oven.",
      "zh": "奶奶和露西准备了一个温暖的苹果派作为晚餐甜点。她们剥了甜红苹果，并把它们与肉桂粉混合在一起。当派在烤箱里烘烤时，整座房子都散发着香气。"
    },
    "questions": [
      {
        "q": "What dessert did Grandma and Lucy make?",
        "options": [
          "A warm apple pie",
          "A chocolate cake",
          "Berry muffins",
          "Ice cream"
        ],
        "correct": 0
      },
      {
        "q": "What spice did they mix with apples?",
        "options": [
          "Cinnamon powder",
          "Vanilla extract",
          "Sugar cane",
          "Cocoa powder"
        ],
        "correct": 0
      },
      {
        "q": "How did the house smell while baking?",
        "options": [
          "Wonderful",
          "Burnt",
          "Sour",
          "Smoky"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 210,
    "difficulty": "easy",
    "dayIndex": 9,
    "title": {
      "en": "The Starry Night",
      "zh": "星光熠熠的夜晚"
    },
    "text": {
      "en": "Oliver set up his small metal telescope on the grass behind his house. He observed craters on the bright surface of the moon during midnight. He was amazed to see shooting stars flash across the sky.",
      "zh": "奥利弗在他房子后面的草地上架起了他的小金属望远镜。午夜时分，他观察到了明亮月球表面上的环形山。看到流星划过天空，他感到很惊奇。"
    },
    "questions": [
      {
        "q": "Where did Oliver set up his telescope?",
        "options": [
          "On the grass behind house",
          "On the roof",
          "At school",
          "In his room"
        ],
        "correct": 0
      },
      {
        "q": "What did Oliver observe on the moon?",
        "options": [
          "Craters on its surface",
          "Aliens",
          "Water lakes",
          "Green trees"
        ],
        "correct": 0
      },
      {
        "q": "What flashed across the sky?",
        "options": [
          "Shooting stars",
          "Airplanes",
          "Balloons",
          "Birds"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 211,
    "difficulty": "easy",
    "dayIndex": 10,
    "title": {
      "en": "Making Fresh Juice",
      "zh": "制作新鲜果汁"
    },
    "text": {
      "en": "Tom washed three sweet oranges and sliced them in half. He squeezed the fresh juice into a clean glass cup with ice. Drinking cold orange juice refreshed him after his long bike ride.",
      "zh": "汤姆洗了三个甜橙子，切成两半。他把新鲜的果汁挤进一个干净的带有冰块的玻璃杯里。长途骑车后，喝冷橙汁让他神清气爽。"
    },
    "questions": [
      {
        "q": "How many oranges did Tom slice?",
        "options": [
          "Three",
          "Two",
          "Four",
          "Five"
        ],
        "correct": 0
      },
      {
        "q": "What did Tom put in the glass cup?",
        "options": [
          "Fresh juice with ice",
          "Warm milk",
          "Cold tea",
          "Soda"
        ],
        "correct": 0
      },
      {
        "q": "When did Tom drink the juice?",
        "options": [
          "After his long bike ride",
          "Before sleeping",
          "At school",
          "During breakfast"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 212,
    "difficulty": "easy",
    "dayIndex": 11,
    "title": {
      "en": "Autumn Leaves",
      "zh": "秋天的树叶"
    },
    "text": {
      "en": "Cool autumn winds blew colorful leaves off the old trees in the park. Children collected red and yellow leaves to make fun art craft projects. They piled them together and jumped into the soft leaf stack.",
      "zh": "凉爽的秋风把公园老树上五彩缤纷的树叶吹落。孩子们收集红黄两色的树叶来制作有趣的手工艺术项目。他们把它们堆在一起，跳进柔软的叶堆里。"
    },
    "questions": [
      {
        "q": "What blew the leaves off the trees?",
        "options": [
          "Cool autumn winds",
          "Heavy rain",
          "Snowstorm",
          "Animals"
        ],
        "correct": 0
      },
      {
        "q": "What did children make with the leaves?",
        "options": [
          "Fun art craft projects",
          "Leaf tea",
          "Firewood",
          "Baskets"
        ],
        "correct": 0
      },
      {
        "q": "What did children jump into?",
        "options": [
          "The soft leaf stack",
          "A deep puddle",
          "A sand pit",
          "A cold lake"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 213,
    "difficulty": "easy",
    "dayIndex": 12,
    "title": {
      "en": "The Little Kitten",
      "zh": "小猫咪"
    },
    "text": {
      "en": "Mia found a tiny grey kitten sitting alone under a wooden bench. She brought the kitten home and gave it a small dish of milk. The happy kitten purred softly and fell asleep in her lap.",
      "zh": "米娅在一条木凳下发现了一只独自坐着的小灰猫。她把小猫带回家，给了它一小盘牛奶。高兴的小猫轻轻地发出咕噜声，在她腿上睡着了。"
    },
    "questions": [
      {
        "q": "Where did Mia find the kitten?",
        "options": [
          "Under a wooden bench",
          "In a tree",
          "On the street",
          "At the park"
        ],
        "correct": 0
      },
      {
        "q": "What did Mia give the kitten?",
        "options": [
          "A small dish of milk",
          "Water",
          "Fish",
          "Cat food"
        ],
        "correct": 0
      },
      {
        "q": "Where did the kitten fall asleep?",
        "options": [
          "In Mia's lap",
          "On the sofa",
          "In a basket",
          "Under bed"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 214,
    "difficulty": "easy",
    "dayIndex": 13,
    "title": {
      "en": "A Camping Trip",
      "zh": "一次露营之旅"
    },
    "text": {
      "en": "David and his dad pitched a green tent near a quiet river bank. They roasted sweet marshmallows over a small crackling campfire at dusk. At night they listened to crickets chirping softly in the forest.",
      "zh": "戴维和他的爸爸在一条安静的河岸附近搭起了绿色的帐篷。黄昏时分，他们在噼啪作响的小篝火上烤甜棉花糖。晚上，他们听着森林里蟋蟀柔和的鸣叫声。"
    },
    "questions": [
      {
        "q": "Where did David and his dad pitch the tent?",
        "options": [
          "Near a quiet river bank",
          "On a mountain peak",
          "In a backyard",
          "By the beach"
        ],
        "correct": 0
      },
      {
        "q": "What food did they roast over the campfire?",
        "options": [
          "Sweet marshmallows",
          "Hot dogs",
          "Corn",
          "Potatoes"
        ],
        "correct": 0
      },
      {
        "q": "What sound did they listen to at night?",
        "options": [
          "Crickets chirping softly",
          "Owls hooting",
          "River flowing",
          "Wind blowing"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 215,
    "difficulty": "easy",
    "dayIndex": 14,
    "title": {
      "en": "The Giant Panda",
      "zh": "大熊猫"
    },
    "text": {
      "en": "Giant pandas live in cool bamboo forests high up in mountain areas. They spend most of their day eating fresh green bamboo stalks. Their thick black and white fur keeps them warm during cold winter weather.",
      "zh": "大熊猫生活在高山地区凉爽的竹林里。它们一天中的大部分时间都在吃新鲜的绿竹秆。它们厚厚的黑白皮毛使它们在寒冷的冬天保持温暖。"
    },
    "questions": [
      {
        "q": "Where do giant pandas live?",
        "options": [
          "Cool bamboo forests in mountains",
          "Hot deserts",
          "Tropical rainforests",
          "Grassy plains"
        ],
        "correct": 0
      },
      {
        "q": "What do pandas spend most of their day eating?",
        "options": [
          "Fresh green bamboo stalks",
          "Fruits",
          "Fish",
          "Grass"
        ],
        "correct": 0
      },
      {
        "q": "How does their thick fur help them?",
        "options": [
          "Keeps them warm in winter",
          "Helps them swim",
          "Helps them run fast",
          "Hides them"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 216,
    "difficulty": "easy",
    "dayIndex": 15,
    "title": {
      "en": "The City Bus",
      "zh": "城市公交车"
    },
    "text": {
      "en": "The bright yellow city bus travels down Main Street every fifteen minutes. Passengers tap their plastic cards and sit near the clean glass windows. The friendly driver always announces upcoming stops clearly to everyone.",
      "zh": "明亮的黄色城市公交车每十五分钟沿主街行驶一次。乘客刷塑料卡，坐在干净的玻璃窗旁。友好的司机总是向大家清楚地播报即将到来的站点。"
    },
    "questions": [
      {
        "q": "How often does the city bus travel?",
        "options": [
          "Every fifteen minutes",
          "Every hour",
          "Once a day",
          "Every five minutes"
        ],
        "correct": 0
      },
      {
        "q": "How do passengers pay for their ride?",
        "options": [
          "Tap their plastic cards",
          "Pay cash",
          "Show ticket",
          "Use coins"
        ],
        "correct": 0
      },
      {
        "q": "What does the driver announce clearly?",
        "options": [
          "Upcoming stops",
          "Weather forecast",
          "News headlines",
          "Bus prices"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 217,
    "difficulty": "easy",
    "dayIndex": 16,
    "title": {
      "en": "A Snowman in Winter",
      "zh": "冬天的雪人"
    },
    "text": {
      "en": "Heavy white snow covered the entire yard on a chilly January morning. Toby and his sister built a tall snowman with a bright orange carrot. They wrapped a warm red wool scarf around the snowman's neck.",
      "zh": "在寒冷的一月早上，大白雪覆盖了整个院子。托比和他的妹妹用鲜艳的橙色胡萝卜建了一个高大的雪人。他们在雪人的脖子上围了一条温暖的红羊毛围巾。"
    },
    "questions": [
      {
        "q": "What covered the yard in January?",
        "options": [
          "Heavy white snow",
          "Green leaves",
          "Rain puddles",
          "Mud"
        ],
        "correct": 0
      },
      {
        "q": "What did they use for the snowman's nose?",
        "options": [
          "Bright orange carrot",
          "Small stone",
          "Button",
          "Pinecone"
        ],
        "correct": 0
      },
      {
        "q": "Where did they wrap the red wool scarf?",
        "options": [
          "Around the snowman's neck",
          "On its head",
          "Around its waist",
          "On its arm"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 218,
    "difficulty": "easy",
    "dayIndex": 17,
    "title": {
      "en": "The School Bakery",
      "zh": "学校烘焙坊"
    },
    "text": {
      "en": "The school bakery sells fresh warm rolls every morning before first class. Students line up quietly to buy honey bread and oat cookies. All money raised helps purchase new storybooks for the school library.",
      "zh": "学校烘焙坊每天第一节课前卖新鲜的温卷面包。学生们安静地排队买蜂蜜面包和燕麦饼干。筹集到的所有资金都有助于为学校图书馆购买新的故事书。"
    },
    "questions": [
      {
        "q": "When does the school bakery sell rolls?",
        "options": [
          "Every morning before class",
          "After school",
          "At noon",
          "On weekends"
        ],
        "correct": 0
      },
      {
        "q": "What items do students buy?",
        "options": [
          "Honey bread and oat cookies",
          "Cakes and pies",
          "Juice and milk",
          "Candy"
        ],
        "correct": 0
      },
      {
        "q": "How is the raised money used?",
        "options": [
          "Purchases storybooks for library",
          "Buys sports gear",
          "Pays for trips",
          "Buys toys"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 219,
    "difficulty": "easy",
    "dayIndex": 18,
    "title": {
      "en": "Visiting the Aquarium",
      "zh": "参观水族馆"
    },
    "text": {
      "en": "Class Four visited the large city aquarium to learn about sea life. They watched colorful tropical fish swim through clear blue water tanks. The guide explained how sea turtles protect their eggs on sandy beaches.",
      "zh": "四班参观了城市大型水族馆，了解海洋生物。他们看着色彩斑斓的热带鱼穿过清澈的蓝水箱。导游解释了海龟如何在沙滩上保护它们的蛋。"
    },
    "questions": [
      {
        "q": "Why did Class Four visit the aquarium?",
        "options": [
          "To learn about sea life",
          "To go swimming",
          "To buy fish",
          "To watch movies"
        ],
        "correct": 0
      },
      {
        "q": "What swam through the blue water tanks?",
        "options": [
          "Colorful tropical fish",
          "Dolphins",
          "Whales",
          "Seals"
        ],
        "correct": 0
      },
      {
        "q": "What did the guide explain about sea turtles?",
        "options": [
          "How they protect their eggs",
          "How fast they swim",
          "What they eat",
          "How big they get"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 220,
    "difficulty": "easy",
    "dayIndex": 19,
    "title": {
      "en": "A Sunny Picnic",
      "zh": "阳光野餐"
    },
    "text": {
      "en": "Sarah and her family laid a red checkered blanket on the grass. They enjoyed turkey sandwiches, sweet grapes, and cold apple juice under a tree. After eating, they played fun frisbee games near the pond.",
      "zh": "萨拉和她的家人在草地上铺了一块红格毯子。他们在树下享用了火鸡三明治、甜葡萄和冷苹果汁。吃完饭后，他们在池塘附近玩了有趣的飞盘游戏。"
    },
    "questions": [
      {
        "q": "Where did Sarah's family lay their blanket?",
        "options": [
          "On the grass under a tree",
          "On the sand",
          "On a wooden table",
          "Inside a tent"
        ],
        "correct": 0
      },
      {
        "q": "What food and drinks did they enjoy?",
        "options": [
          "Sandwiches, grapes, apple juice",
          "Pizza and soda",
          "Burgers and milk",
          "Hot dogs and tea"
        ],
        "correct": 0
      },
      {
        "q": "What game did they play after eating?",
        "options": [
          "Fun frisbee games",
          "Soccer",
          "Volleyball",
          "Badminton"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 221,
    "difficulty": "easy",
    "dayIndex": 20,
    "title": {
      "en": "The Little Robot",
      "zh": "小机器人"
    },
    "text": {
      "en": "Alex built a small plastic toy robot using colorful snap blocks. The robot can roll across the wooden floor and flash yellow lights. Alex pressed a red button to make the robot turn in circles.",
      "zh": "亚历克斯用彩色的扣合积木建造了一个小塑料玩具机器人。机器人可以在木地板上滚动并闪烁黄光。亚历克斯按下红按钮让机器人打转。"
    },
    "questions": [
      {
        "q": "What did Alex use to build the robot?",
        "options": [
          "Colorful snap blocks",
          "Metal screws",
          "Cardboard boxes",
          "Clay"
        ],
        "correct": 0
      },
      {
        "q": "Where can the robot roll?",
        "options": [
          "Across the wooden floor",
          "On the grass",
          "In water",
          "On table"
        ],
        "correct": 0
      },
      {
        "q": "What happens when Alex presses the red button?",
        "options": [
          "Robot turns in circles",
          "Robot sings a song",
          "Robot stops moving",
          "Robot flies"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 222,
    "difficulty": "easy",
    "dayIndex": 21,
    "title": {
      "en": "The Ocean Lighthouse",
      "zh": "海洋灯塔"
    },
    "text": {
      "en": "A tall white lighthouse stands safely on the rocky ocean cliff. Its powerful beam of light guides nighttime ships safely away from sharp rocks. The keeper checks the giant light bulb every evening at sunset.",
      "zh": "一座高高的白灯塔安全地伫立在多石的海洋崖顶上。它强有力的光束引导夜间航行的船只安全避开尖锐的岩石。管理员每天日落时分都会检查巨型灯泡。"
    },
    "questions": [
      {
        "q": "Where does the white lighthouse stand?",
        "options": [
          "On a rocky ocean cliff",
          "On a sandy beach",
          "In a harbor",
          "On a mountain"
        ],
        "correct": 0
      },
      {
        "q": "How does the lighthouse beam help ships?",
        "options": [
          "Guides them away from rocks",
          "Makes them sail fast",
          "Signals for help",
          "Warms them"
        ],
        "correct": 0
      },
      {
        "q": "When does the keeper check the light bulb?",
        "options": [
          "Every evening at sunset",
          "At noon",
          "In morning",
          "Every midnight"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 223,
    "difficulty": "easy",
    "dayIndex": 22,
    "title": {
      "en": "Spring Rain",
      "zh": "春雨"
    },
    "text": {
      "en": "Soft rain fell gently on the thirsty green grass all morning. Flowers opened their colorful petals to catch the fresh raindrops. Soon a bright rainbow appeared across the clear blue sky.",
      "zh": "整个早上柔和的雨水轻轻地落在口渴的绿草上。花儿张开色彩缤纷的花瓣去接新鲜的雨滴。很快，一条明彩虹出现在晴朗的蓝天上。"
    },
    "questions": [
      {
        "q": "How did the rain fall on the grass?",
        "options": [
          "Softly and gently",
          "Hard and fast",
          "Cold and icy",
          "Not at all"
        ],
        "correct": 0
      },
      {
        "q": "Why did flowers open their petals?",
        "options": [
          "To catch fresh raindrops",
          "To get sunshine",
          "To attract bees",
          "To grow roots"
        ],
        "correct": 0
      },
      {
        "q": "What appeared across the sky after rain?",
        "options": [
          "A bright rainbow",
          "Dark clouds",
          "Bright stars",
          "A full moon"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 224,
    "difficulty": "easy",
    "dayIndex": 23,
    "title": {
      "en": "The Wooden Toy Train",
      "zh": "木制玩具火车"
    },
    "text": {
      "en": "Grandpa carved a small wooden toy train for Jack's eighth birthday. The train has three dark red cars connected by tiny metal hooks. Jack rolls the train along a smooth track in his bedroom.",
      "zh": "爷爷在杰克八岁生日时为他雕刻了一列小木制玩具火车。火车有三节由小金属钩连接的深红色车厢。杰克在卧室平滑的轨道上滚动火车。"
    },
    "questions": [
      {
        "q": "Who carved the wooden toy train?",
        "options": [
          "Grandpa",
          "Dad",
          "Jack's brother",
          "A carpenter"
        ],
        "correct": 0
      },
      {
        "q": "How many cars does the train have?",
        "options": [
          "Three dark red cars",
          "Two blue cars",
          "Four yellow cars",
          "Five green cars"
        ],
        "correct": 0
      },
      {
        "q": "Where does Jack roll the train?",
        "options": [
          "Along a smooth track in room",
          "On the grass",
          "On the table",
          "Outside"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 225,
    "difficulty": "easy",
    "dayIndex": 24,
    "title": {
      "en": "The Honey Pancake",
      "zh": "蜂蜜煎饼"
    },
    "text": {
      "en": "Mom cooked round golden pancakes for Sunday morning family breakfast. She poured sweet yellow honey and added fresh strawberry slices on top. Everyone ate two delicious pancakes before going to the park.",
      "zh": "妈妈在星期天早晨的家庭早餐中煎了金黄色的圆煎饼。她在上面淋上了甜黄蜂蜜，并加上了新鲜的草莓片。每个人在去公园前都吃了两个美味的煎饼。"
    },
    "questions": [
      {
        "q": "When did Mom cook golden pancakes?",
        "options": [
          "Sunday morning family breakfast",
          "Saturday night",
          "Friday afternoon",
          "Monday noon"
        ],
        "correct": 0
      },
      {
        "q": "What did Mom add on top of pancakes?",
        "options": [
          "Sweet yellow honey and strawberries",
          "Chocolate syrup",
          "Butter and sugar",
          "Jam"
        ],
        "correct": 0
      },
      {
        "q": "Where did the family go after breakfast?",
        "options": [
          "To the park",
          "To school",
          "To the store",
          "To the cinema"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 226,
    "difficulty": "medium",
    "dayIndex": 25,
    "title": {
      "en": "The Village Fire Station",
      "zh": "村庄消防局"
    },
    "text": {
      "en": "The local fire station stands in the middle of our small quiet town. Three brave firefighters wear thick yellow suits and red helmets every day. When the alarm sounds, they drive a large shiny fire truck to help people. They work hard to keep our neighborhood safe and happy.",
      "zh": "当地的消防局站在我们安静的小镇中央。三位勇敢的消防员每天穿着厚厚的黄色衣服，戴着红色的头盔。当警报响起时，他们开着一辆闪亮的大消防车去帮助人们。他们努力工作，确保我们的社区安全和快乐。"
    },
    "questions": [
      {
        "q": "Where is the local fire station located?",
        "options": [
          "In the middle of our town",
          "Near the highway",
          "By the lake",
          "At the airport"
        ],
        "correct": 0
      },
      {
        "q": "What color suits do the firefighters wear?",
        "options": [
          "Thick yellow suits",
          "Red suits",
          "Blue suits",
          "Black suits"
        ],
        "correct": 0
      },
      {
        "q": "What vehicle do they drive when alarm sounds?",
        "options": [
          "Large shiny fire truck",
          "Police car",
          "Ambulance",
          "Bus"
        ],
        "correct": 0
      },
      {
        "q": "What is the main goal of firefighters?",
        "options": [
          "Keep neighborhood safe and happy",
          "Paint houses",
          "Clean streets",
          "Build roads"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 227,
    "difficulty": "medium",
    "dayIndex": 26,
    "title": {
      "en": "Learning to Ride a Bike",
      "zh": "学习骑自行车"
    },
    "text": {
      "en": "Lucas received a bright red bicycle for his eighth birthday. His older brother guided him carefully on the paved park path. At first, Lucas felt nervous and wobbly while holding the handles. After much practice, he could ride smoothly all by himself.",
      "zh": "卢卡斯在八岁生日时收到了一辆鲜红色的自行车。他的哥哥在公园的小路上仔细地引导他。起初，卢卡斯在握住手把时感到紧张和摇晃。经过多次练习，他可以自己流畅地骑行了。"
    },
    "questions": [
      {
        "q": "What gift did Lucas receive for his birthday?",
        "options": [
          "Bright red bicycle",
          "Skateboard",
          "Roller skates",
          "Toy train"
        ],
        "correct": 0
      },
      {
        "q": "Who guided Lucas while learning?",
        "options": [
          "His older brother",
          "His father",
          "His teacher",
          "His friend"
        ],
        "correct": 0
      },
      {
        "q": "How did Lucas feel at first?",
        "options": [
          "Nervous and wobbly",
          "Brave and excited",
          "Sleepy",
          "Angry"
        ],
        "correct": 0
      },
      {
        "q": "What happened after much practice?",
        "options": [
          "He rode smoothly by himself",
          "He gave up",
          "He sold the bike",
          "He broke the bike"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 228,
    "difficulty": "medium",
    "dayIndex": 27,
    "title": {
      "en": "The School Science Fair",
      "zh": "学校科学展览会"
    },
    "text": {
      "en": "Students gathered in the gymnasium for the annual science project show. Ella built a working volcano model using paper and brown clay. When she mixed vinegar and baking soda, red foam bubbled out. Everyone cheered and awarded her project a blue prize ribbon.",
      "zh": "学生们聚集在体育馆参加一年一度的科学项目展示会。艾拉用纸和棕色粘土制作了一座会运转的火山模型。当她把醋和小苏打混合在一起时，红色的泡沫冒了出来。大家欢呼并给她的项目颁发了蓝色获奖丝带。"
    },
    "questions": [
      {
        "q": "Where was the science project show held?",
        "options": [
          "In the gymnasium",
          "In classroom",
          "In library",
          "Outside"
        ],
        "correct": 0
      },
      {
        "q": "What model did Ella build?",
        "options": [
          "A working volcano model",
          "A rocket model",
          "A solar system",
          "A robot"
        ],
        "correct": 0
      },
      {
        "q": "What caused red foam to bubble out?",
        "options": [
          "Mixing vinegar and baking soda",
          "Adding water and salt",
          "Heating clay",
          "Blowing air"
        ],
        "correct": 0
      },
      {
        "q": "What award did Ella receive?",
        "options": [
          "A blue prize ribbon",
          "A gold medal",
          "A trophy",
          "A certificate"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 229,
    "difficulty": "medium",
    "dayIndex": 28,
    "title": {
      "en": "Life of a Sea Turtle",
      "zh": "海龟的一生"
    },
    "text": {
      "en": "Sea turtles spend almost their entire lives swimming in ocean waters. Female turtles crawl onto sandy beaches at night to lay round eggs. They cover the nest with sand to protect eggs from predators. Weeks later, tiny baby turtles hatch and scramble into the sea.",
      "zh": "海龟几乎一生都在海洋中游泳。雌龟夜间爬上沙滩产圆蛋。它们用沙子盖住巢穴，以保护蛋免受捕食者的伤害。几周后，微小的小海龟孵化出来，爬进海里。"
    },
    "questions": [
      {
        "q": "Where do sea turtles spend almost their entire lives?",
        "options": [
          "Swimming in ocean waters",
          "On sandy beaches",
          "In fresh rivers",
          "In shallow ponds"
        ],
        "correct": 0
      },
      {
        "q": "When do female turtles lay their eggs?",
        "options": [
          "At night on sandy beaches",
          "During noon in ocean",
          "In morning on rocks",
          "In winter"
        ],
        "correct": 0
      },
      {
        "q": "Why do turtles cover their nest with sand?",
        "options": [
          "Protect eggs from predators",
          "Keep eggs cool",
          "Hide from people",
          "Make nest big"
        ],
        "correct": 0
      },
      {
        "q": "What do baby turtles do after hatching?",
        "options": [
          "Scramble into the sea",
          "Stay in sand",
          "Fly away",
          "Climb trees"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 230,
    "difficulty": "medium",
    "dayIndex": 29,
    "title": {
      "en": "A Visit to the Zoo",
      "zh": "游览动物园"
    },
    "text": {
      "en": "Class Three took a yellow school bus to the national zoo. They saw two giant pandas eating fresh bamboo leaves in the shade. Later they watched a trainer feed fish to energetic seals in a pool. Before going home, everyone bought animal bookmarks at the gift shop.",
      "zh": "三年级坐着黄色的校车去了国家动物园。他们看到两只大熊猫在树荫下吃新鲜的竹叶。后来，他们看训导员在池塘里给精力充沛的海豹喂鱼。在回家之前，每个人都在礼品店买了动物书签。"
    },
    "questions": [
      {
        "q": "How did Class Three travel to the zoo?",
        "options": [
          "Yellow school bus",
          "By train",
          "By car",
          "Walking"
        ],
        "correct": 0
      },
      {
        "q": "What were giant pandas eating?",
        "options": [
          "Fresh bamboo leaves",
          "Apples",
          "Fish",
          "Sugar cane"
        ],
        "correct": 0
      },
      {
        "q": "What animal was fed fish by the trainer?",
        "options": [
          "Energetic seals",
          "Penguins",
          "Dolphins",
          "Bears"
        ],
        "correct": 0
      },
      {
        "q": "What souvenir did students buy before leaving?",
        "options": [
          "Animal bookmarks",
          "Toy pandas",
          "Postcards",
          "Hats"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 231,
    "difficulty": "medium",
    "dayIndex": 30,
    "title": {
      "en": "The Apple Harvest",
      "zh": "苹果丰收"
    },
    "text": {
      "en": "Autumn is the harvest season for local fruit orchards across the valley. Farmers pick thousands of crisp red apples from tall trees each day. They pack the fresh apples neatly into sturdy wooden crates. Soon trucks carry the fruit crates to markets in the nearby city.",
      "zh": "秋天是山谷地方果园的丰收季节。农夫们每天从高高的树上采摘成千上万脆嫩的红苹果。他们把新鲜的苹果整齐地装进坚固的木箱里。很快，卡车把水果箱运往附近城市的集市。"
    },
    "questions": [
      {
        "q": "What season is the apple harvest?",
        "options": [
          "Autumn",
          "Spring",
          "Summer",
          "Winter"
        ],
        "correct": 0
      },
      {
        "q": "How do farmers store the picked apples?",
        "options": [
          "Pack neatly into wooden crates",
          "Put in plastic bags",
          "Pile on ground",
          "Store in water"
        ],
        "correct": 0
      },
      {
        "q": "How are the apples described?",
        "options": [
          "Crisp red apples",
          "Soft green apples",
          "Small yellow apples",
          "Sour apples"
        ],
        "correct": 0
      },
      {
        "q": "Where do trucks take the crates?",
        "options": [
          "To markets in nearby city",
          "To factories",
          "To the farm",
          "To port"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 232,
    "difficulty": "medium",
    "dayIndex": 31,
    "title": {
      "en": "Baking Homemade Bread",
      "zh": "烘焙自制面包"
    },
    "text": {
      "en": "Mom mixed white flour, warm water, and yeast in a large bowl. She kneaded the soft dough on a wooden board until smooth. After letting it rise in a warm spot, she baked it in the oven. The fresh bread came out with a crispy crust and soft center.",
      "zh": "妈妈在大碗里混合了白面粉、温水和酵母。她在木板上揉揉软的面团，直到它变得光滑。在温暖的地方让它发酵后，她在烤箱里烘烤。新鲜的面包出来了，带着酥脆的外壳和柔软的中心。"
    },
    "questions": [
      {
        "q": "What ingredients did Mom mix together?",
        "options": [
          "Flour, warm water, and yeast",
          "Sugar, eggs, and milk",
          "Butter, cocoa, and salt",
          "Oats and honey"
        ],
        "correct": 0
      },
      {
        "q": "Where did Mom knead the dough?",
        "options": [
          "On a wooden board",
          "In a glass bowl",
          "On counter",
          "In pan"
        ],
        "correct": 0
      },
      {
        "q": "What did Mom do before baking?",
        "options": [
          "Let dough rise in warm spot",
          "Put dough in fridge",
          "Added apples",
          "Cut dough"
        ],
        "correct": 0
      },
      {
        "q": "How was the baked bread described?",
        "options": [
          "Crispy crust and soft center",
          "Hard and dry",
          "Burnt and black",
          "Salty and wet"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 233,
    "difficulty": "medium",
    "dayIndex": 32,
    "title": {
      "en": "The Little Penguin",
      "zh": "小企鹅"
    },
    "text": {
      "en": "Little penguins live in colonies along the cold coasts of Antarctica. They swim extremely fast in icy ocean water to hunt for small fish. Their thick oily feathers keep water out and trap body heat inside. At night they huddle closely together to stay warm against icy winds.",
      "zh": "小企鹅生活在南极洲寒冷海岸的群体中。它们在冰冷的海洋水中游得极快，捕食小鱼。它们厚厚的油性羽毛可以防止水进入，并将体热留在体内。晚上，它们紧紧地挤在一起，在冰冷的风中保持温暖。"
    },
    "questions": [
      {
        "q": "Where do little penguins live?",
        "options": [
          "Cold coasts of Antarctica",
          "Warm tropical islands",
          "Grassy forests",
          "Desert sand dunes"
        ],
        "correct": 0
      },
      {
        "q": "Why do penguins swim fast in icy water?",
        "options": [
          "To hunt for small fish",
          "To escape boats",
          "To play games",
          "To travel north"
        ],
        "correct": 0
      },
      {
        "q": "How do oily feathers help penguins?",
        "options": [
          "Keep water out and trap heat",
          "Help them fly",
          "Make them heavy",
          "Change color"
        ],
        "correct": 0
      },
      {
        "q": "What do penguins do at night against cold winds?",
        "options": [
          "Huddle closely together",
          "Hide under rocks",
          "Sleep underwater",
          "Build nests"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 234,
    "difficulty": "medium",
    "dayIndex": 33,
    "title": {
      "en": "A Camping Adventure",
      "zh": "一次露营冒险"
    },
    "text": {
      "en": "Jack and his family pitched a green tent near a mountain stream. They spent the afternoon hiking along scenic trails surrounded by pine trees. At sunset they cooked fresh soup over a warm crackling campfire. After dark they pointed at bright constellation stars in the night sky.",
      "zh": "杰克和他的家人在一条山溪附近搭起了绿色的帐篷。他们整个下午都在被松树环绕的景色宜人的小径上徒步旅行。日落时分，他们在温暖噼啪作响的篝火上煮新鲜的汤。天黑后，他们指着夜空中明亮的星座。"
    },
    "questions": [
      {
        "q": "Where did Jack's family pitch their tent?",
        "options": [
          "Near a mountain stream",
          "On a sandy beach",
          "In a city park",
          "In backyard"
        ],
        "correct": 0
      },
      {
        "q": "What activity did they do during the afternoon?",
        "options": [
          "Hiking along scenic trails",
          "Swimming in lake",
          "Fishing",
          "Riding bikes"
        ],
        "correct": 0
      },
      {
        "q": "What food did they prepare over the campfire?",
        "options": [
          "Fresh soup",
          "Roasted corn",
          "Sandwiches",
          "Grilled fish"
        ],
        "correct": 0
      },
      {
        "q": "What did they look at after dark?",
        "options": [
          "Bright constellation stars",
          "Moonlight",
          "Fireflies",
          "Forest animals"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 235,
    "difficulty": "medium",
    "dayIndex": 34,
    "title": {
      "en": "The Honeybee Colony",
      "zh": "蜜蜂群体"
    },
    "text": {
      "en": "A honeybee colony contains thousands of busy worker bees and one queen. Worker bees collect sweet nectar from colorful spring flowers in fields. They bring nectar back to the hive and make delicious honey. Honeybees help plants grow by carrying pollen from flower to flower.",
      "zh": "一个蜜蜂群体包含数千只忙碌的工蜂和一只女王。工蜂从田野里五彩缤纷的春花中收集甜美的花蜜。它们把花蜜带回蜂巢，制作出美味的蜂蜜。蜜蜂通过将花粉从一朵花传到另一朵花来帮助植物生长。"
    },
    "questions": [
      {
        "q": "How many queens are in a honeybee colony?",
        "options": [
          "One queen",
          "Two queens",
          "Five queens",
          "Ten queens"
        ],
        "correct": 0
      },
      {
        "q": "What do worker bees collect from flowers?",
        "options": [
          "Sweet nectar",
          "Water drops",
          "Leaves",
          "Seeds"
        ],
        "correct": 0
      },
      {
        "q": "What do worker bees make back at the hive?",
        "options": [
          "Delicious honey",
          "Wax candles",
          "Flower jam",
          "Plant food"
        ],
        "correct": 0
      },
      {
        "q": "How do honeybees help plants grow?",
        "options": [
          "Carrying pollen from flower to flower",
          "Watering roots",
          "Eating weeds",
          "Shading leaves"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 236,
    "difficulty": "medium",
    "dayIndex": 35,
    "title": {
      "en": "The City Public Park",
      "zh": "城市公共公园"
    },
    "text": {
      "en": "Our city park is a green haven located right in the town center. Families come on weekends to picnic under tall shading maple trees. Children play happily on modern playground swings, slides, and climbing frames. A paved walking path loops around a quiet pond full of ducks.",
      "zh": "我们的城市公园是一个绿色的避风港，位于城镇中心。家庭在周末来到高大的遮阴枫树下野餐。孩子们在现代化的游乐场秋千、滑梯和攀爬架上快乐地玩耍。一条铺平的步行道绕着一个满是鸭子的安静池塘。"
    },
    "questions": [
      {
        "q": "Where is the city park located?",
        "options": [
          "Right in the town center",
          "On outskirts",
          "Near harbor",
          "On mountain top"
        ],
        "correct": 0
      },
      {
        "q": "What kind of trees shade the picnic area?",
        "options": [
          "Tall maple trees",
          "Pine trees",
          "Oak trees",
          "Palm trees"
        ],
        "correct": 0
      },
      {
        "q": "What playground equipment do children use?",
        "options": [
          "Swings, slides, climbing frames",
          "Bikes only",
          "Kites",
          "Sandbox"
        ],
        "correct": 0
      },
      {
        "q": "What animal lives in the park pond?",
        "options": [
          "Ducks",
          "Turtles",
          "Frogs",
          "Fish"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 237,
    "difficulty": "medium",
    "dayIndex": 36,
    "title": {
      "en": "The Busy Harbor",
      "zh": "繁忙的港口"
    },
    "text": {
      "en": "Big cargo ships dock safely at the busy ocean harbor every morning. Giant cranes lift heavy metal containers off the wide ship decks. Dockworkers guide trucks as they carry goods to warehouses nearby. Seagulls fly high above the blue water searching for fish scraps.",
      "zh": "每天早上大货船安全地停靠在繁忙的海洋港口。巨型起重机从宽阔的船板上吊起重金属集装箱。码头工人引导卡车将货物运往附近的仓库。海鸥在蓝色的水面上飞得高高的，寻找鱼屑。"
    },
    "questions": [
      {
        "q": "What ships dock at the harbor every morning?",
        "options": [
          "Big cargo ships",
          "Fishing boats",
          "Sailboats",
          "Cruise ships"
        ],
        "correct": 0
      },
      {
        "q": "What machinery lifts heavy metal containers?",
        "options": [
          "Giant cranes",
          "Forklifts",
          "Ropes",
          "Tractors"
        ],
        "correct": 0
      },
      {
        "q": "Who guides the trucks carrying goods?",
        "options": [
          "Dockworkers",
          "Captains",
          "Sailors",
          "Police"
        ],
        "correct": 0
      },
      {
        "q": "What birds fly above searching for fish scraps?",
        "options": [
          "Seagulls",
          "Pigeons",
          "Eagles",
          "Pelicans"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 238,
    "difficulty": "medium",
    "dayIndex": 37,
    "title": {
      "en": "Making Pottery",
      "zh": "制作陶器"
    },
    "text": {
      "en": "An artist places soft grey clay on a fast spinning wheel. She uses her wet fingers to shape the clay into a smooth bowl. After drying in the air, the bowl is baked in a very hot kiln. Finally she paints colorful patterns and glazes the pottery bowl.",
      "zh": "一位艺术家把软灰色的粘土放在一个快速旋转的轮子上。她用湿手指把粘土揉成一个光滑的碗。在空气中干燥后，碗在非常烫的窑里烧制。最后，她画上彩色的图案，给陶碗上釉。"
    },
    "questions": [
      {
        "q": "What material does the artist place on the wheel?",
        "options": [
          "Soft grey clay",
          "Hard wood",
          "Glass",
          "Plastic"
        ],
        "correct": 0
      },
      {
        "q": "How does she shape the clay bowl?",
        "options": [
          "With her wet fingers",
          "With a knife",
          "With a mold",
          "With a hammer"
        ],
        "correct": 0
      },
      {
        "q": "Where is the bowl baked after drying?",
        "options": [
          "In a very hot kiln",
          "In an oven",
          "In sun",
          "In microwave"
        ],
        "correct": 0
      },
      {
        "q": "What is the final step in making pottery?",
        "options": [
          "Paints patterns and glazes",
          "Dries in water",
          "Breaks it",
          "Washes it"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 239,
    "difficulty": "medium",
    "dayIndex": 38,
    "title": {
      "en": "The Solar System",
      "zh": "太阳系"
    },
    "text": {
      "en": "Our solar system consists of the sun and eight orbiting planets. Earth is the third planet from the sun and has liquid water oceans. Mars is known as the red planet due to rusty iron dust on its surface. Scientists send space probes to explore distant planets and gather data.",
      "zh": "我们的太阳系由太阳和八颗运行的行星组成。地球是距离太阳第三近的行星，拥有液态水海洋。火星因其表面生锈的铁尘被称为红行星。科学家派遣太空探测器探索遥远的行星并收集数据。"
    },
    "questions": [
      {
        "q": "How many planets orbit the sun in our solar system?",
        "options": [
          "Eight planets",
          "Nine planets",
          "Seven planets",
          "Ten planets"
        ],
        "correct": 0
      },
      {
        "q": "Which position is Earth from the sun?",
        "options": [
          "Third planet",
          "First planet",
          "Second planet",
          "Fourth planet"
        ],
        "correct": 0
      },
      {
        "q": "Why is Mars known as the red planet?",
        "options": [
          "Rusty iron dust on its surface",
          "Hot lava",
          "Red flowers",
          "Red gas"
        ],
        "correct": 0
      },
      {
        "q": "What do scientists send to explore distant planets?",
        "options": [
          "Space probes",
          "Rockets with people",
          "Telescopes only",
          "Satellites"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 240,
    "difficulty": "medium",
    "dayIndex": 39,
    "title": {
      "en": "The Public Library",
      "zh": "公共图书馆"
    },
    "text": {
      "en": "The city library has thousands of interesting books organized neatly on shelves. Children visit after school to complete homework and read quiet storybooks. Friendly librarians guide students to find reference books for class projects. Special reading clubs meet every Saturday morning to share favorite stories.",
      "zh": "城市图书馆有成千上万本有趣的书，整齐地安排在架子上。孩子们放学后拜访，完成作业，阅读安静的故事书。友好的图书管理员指导学生找到课堂项目的参考书。每周六早晨，特别的阅读俱乐部聚在一起分享最喜欢的故事。"
    },
    "questions": [
      {
        "q": "How are books organized in the library?",
        "options": [
          "Organized neatly on shelves",
          "Piled on floor",
          "Stored in boxes",
          "In bags"
        ],
        "correct": 0
      },
      {
        "q": "When do children visit to do homework?",
        "options": [
          "After school",
          "During midnight",
          "Before breakfast",
          "On holidays"
        ],
        "correct": 0
      },
      {
        "q": "Who guides students to find reference books?",
        "options": [
          "Friendly librarians",
          "Teachers",
          "Parents",
          "Friends"
        ],
        "correct": 0
      },
      {
        "q": "When do special reading clubs meet?",
        "options": [
          "Every Saturday morning",
          "Friday night",
          "Sunday noon",
          "Every day"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 241,
    "difficulty": "hard",
    "dayIndex": 40,
    "title": {
      "en": "Life in the Desert",
      "zh": "沙漠生活"
    },
    "text": {
      "en": "Deserts are dry regions that receive very little rain throughout the year. Camels are famous desert animals that can travel long distances without drinking water. Their wide flat feet prevent them from sinking into deep soft sand dunes. Many desert plants store water in thick fleshy stems to survive hot sun.",
      "zh": "沙漠是全年降雨很少的干燥地区。骆驼是著名的沙漠动物，不用喝水就能长途飞行。它们宽大的扁平脚防止它们沉入深深的软沙丘中。许多沙漠植物在厚厚的多肉茎里储存水，以在炎热的阳光下生存。"
    },
    "questions": [
      {
        "q": "How are desert regions described?",
        "options": [
          "Dry with very little rain",
          "Wet and cold",
          "Full of trees",
          "Snowy"
        ],
        "correct": 0
      },
      {
        "q": "Why are camels famous desert animals?",
        "options": [
          "Travel far without drinking water",
          "Run fast",
          "Carry heavy loads",
          "Swim well"
        ],
        "correct": 0
      },
      {
        "q": "How do wide flat feet help camels?",
        "options": [
          "Prevent sinking into sand dunes",
          "Make them jump",
          "Keep feet cool",
          "Help them run"
        ],
        "correct": 0
      },
      {
        "q": "Where do desert plants store water?",
        "options": [
          "In thick fleshy stems",
          "In roots",
          "In leaves",
          "In flowers"
        ],
        "correct": 0
      },
      {
        "q": "What weather condition do desert plants survive?",
        "options": [
          "Hot sun",
          "Freezing snow",
          "Heavy rain",
          "Strong wind"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 242,
    "difficulty": "hard",
    "dayIndex": 41,
    "title": {
      "en": "The History of Basketball",
      "zh": "篮球的历史"
    },
    "text": {
      "en": "Basketball was invented by Doctor James Naismith in December eighteen ninety-one. He nailed two peach baskets onto a gym balcony to create the first goals. Players threw a soccer ball into the baskets to earn game points. Today basketball is a popular global sport played by millions worldwide.",
      "zh": "篮球是詹姆斯·奈史密斯博士于一八九一年十二月发明的。他把两个桃子筐钉在体育馆的阳台上，创造了最早的球门。球员们把足球投进篮筐里来赢得比赛积分。今天，篮球是一项广受欢迎的全球运动，全世界有数百万人参与。"
    },
    "questions": [
      {
        "q": "Who invented basketball?",
        "options": [
          "Dr. James Naismith",
          "Michael Jordan",
          "LeBron James",
          "Dr. John Smith"
        ],
        "correct": 0
      },
      {
        "q": "When was basketball invented?",
        "options": [
          "December 1891",
          "January 1900",
          "July 1850",
          "March 1920"
        ],
        "correct": 0
      },
      {
        "q": "What did Naismith use for the first goals?",
        "options": [
          "Two peach baskets",
          "Metal hoops",
          "Wooden boxes",
          "Nets"
        ],
        "correct": 0
      },
      {
        "q": "What ball was used in the first basketball games?",
        "options": [
          "A soccer ball",
          "A rubber ball",
          "A leather ball",
          "A tennis ball"
        ],
        "correct": 0
      },
      {
        "q": "How is basketball described today?",
        "options": [
          "Popular global sport",
          "Local game",
          "Rare sport",
          "School game only"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 243,
    "difficulty": "hard",
    "dayIndex": 42,
    "title": {
      "en": "How Paper Was Invented",
      "zh": "纸张是如何发明的"
    },
    "text": {
      "en": "Paper was first invented in ancient China about two thousand years ago. An official named Cai Lun combined tree bark, hemp, and old rags with water. He mashed the mixture into a wet pulp and pressed it flat into sheets. This revolutionary invention allowed people to write books and record history easily.",
      "zh": "纸最早于大约二千年前在中国古代发明。一位名叫蔡伦的官员把树皮、麻和旧布与水结合在一起。他把混合物捣成湿浆，并压平制成片。这项革命性的发明使人们能够容易地写书和记录历史。"
    },
    "questions": [
      {
        "q": "Where was paper first invented?",
        "options": [
          "Ancient China",
          "Ancient Egypt",
          "Greece",
          "Rome"
        ],
        "correct": 0
      },
      {
        "q": "Who is credited with inventing paper?",
        "options": [
          "Cai Lun",
          "Confucius",
          "Li Bai",
          "Zhang Heng"
        ],
        "correct": 0
      },
      {
        "q": "What ingredients were combined to make paper pulp?",
        "options": [
          "Tree bark, hemp, old rags, water",
          "Wood chips and glue",
          "Cotton and silk",
          "Straw and mud"
        ],
        "correct": 0
      },
      {
        "q": "How did Cai Lun process the mixture into sheets?",
        "options": [
          "Mashed into pulp and pressed flat",
          "Boiled and baked",
          "Dried in sun",
          "Wove like cloth"
        ],
        "correct": 0
      },
      {
        "q": "Why was the invention of paper important?",
        "options": [
          "Allowed writing books and recording history",
          "Made clothes",
          "Built houses",
          "Wrapped food"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 244,
    "difficulty": "hard",
    "dayIndex": 43,
    "title": {
      "en": "The Coral Reef",
      "zh": "珊瑚礁"
    },
    "text": {
      "en": "Coral reefs are vibrant underwater ecosystems built by tiny coral polyps. Thousands of marine creatures like sea turtles, clownfish, and crabs live here. The bright corals provide shelter and abundant food for small ocean fish. Protecting coral reefs helps maintain healthy ocean life for our planet.",
      "zh": "珊瑚礁是由微小的珊瑚虫建造的充满生机的水下生态系统。成千上万的海洋生物，如海龟、小丑鱼和螃蟹都生活在这里。鲜艳的珊瑚为小海鱼提供了庇护所和丰富的食物。保护珊瑚礁有助于为我们的星球维持健康的海洋生物。"
    },
    "questions": [
      {
        "q": "What creatures build coral reefs?",
        "options": [
          "Tiny coral polyps",
          "Giant whales",
          "Sea turtles",
          "Sharks"
        ],
        "correct": 0
      },
      {
        "q": "What animals live in coral reef ecosystems?",
        "options": [
          "Turtles, clownfish, crabs",
          "Lions and bears",
          "Frogs and snakes",
          "Birds and bats"
        ],
        "correct": 0
      },
      {
        "q": "What do bright corals provide for small fish?",
        "options": [
          "Shelter and abundant food",
          "Warm water",
          "Air",
          "Light"
        ],
        "correct": 0
      },
      {
        "q": "Why is protecting coral reefs important?",
        "options": [
          "Maintains healthy ocean life",
          "Keeps water warm",
          "Stops waves",
          "Makes salt"
        ],
        "correct": 0
      },
      {
        "q": "How are coral reef ecosystems described?",
        "options": [
          "Vibrant underwater ecosystems",
          "Dark caves",
          "Empty sands",
          "Cold lakes"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 245,
    "difficulty": "hard",
    "dayIndex": 44,
    "title": {
      "en": "The Honeybee Life",
      "zh": "蜜蜂的一生"
    },
    "text": {
      "en": "Honeybees play a vital role in pollinating flowers, fruits, and vegetables. A single hive can contain over fifty thousand bees working in total harmony. Worker bees fly miles to collect pollen and sweet nectar every day. Without honeybees, many crops and delicious fruits could not grow.",
      "zh": "蜜蜂在给花朵、水果和蔬菜传粉方面发挥着至关重要的作用。一个蜂巢可以包含超过五万只完全和谐工作的蜜蜂。工蜂每天飞几英里去收集花粉和甜花蜜。没有蜜蜂，许多作物和美味的水果就无法生长。"
    },
    "questions": [
      {
        "q": "What vital role do honeybees play?",
        "options": [
          "Pollinating flowers, fruits, vegetables",
          "Making rain",
          "Digging soil",
          "Cleaning leaves"
        ],
        "correct": 0
      },
      {
        "q": "How many bees can a single hive contain?",
        "options": [
          "Over fifty thousand bees",
          "Ten thousand",
          "One hundred",
          "One million"
        ],
        "correct": 0
      },
      {
        "q": "What do worker bees collect every day?",
        "options": [
          "Pollen and sweet nectar",
          "Water and mud",
          "Leaves and seeds",
          "Grass"
        ],
        "correct": 0
      },
      {
        "q": "How far do worker bees fly to gather food?",
        "options": [
          "Miles away",
          "A few inches",
          "Inside hive only",
          "To next tree only"
        ],
        "correct": 0
      },
      {
        "q": "What would happen without honeybees?",
        "options": [
          "Many crops and fruits could not grow",
          "Rain would stop",
          "Trees would die",
          "Nothing changes"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 246,
    "difficulty": "hard",
    "dayIndex": 45,
    "title": {
      "en": "The Wind Energy",
      "zh": "风能"
    },
    "text": {
      "en": "Wind is a renewable source of natural energy that never runs out. Giant wind turbines stand on windy hills to catch strong air currents. As the huge turbine blades spin, generators turn wind power into electricity. Clean wind energy powers homes and schools without polluting our environment.",
      "zh": "风是一种永不枯竭的可再生自然能源。巨型风力发电机伫立在有风的山丘上，捕捉强劲的气流。当巨大的发电机叶片旋转时，发电机将风力转化为电力。干净的风能为家庭和学校提供动力，而不会污染我们的环境。"
    },
    "questions": [
      {
        "q": "What kind of energy source is wind?",
        "options": [
          "Renewable natural energy",
          "Fossil fuel",
          "Chemical power",
          "Coal energy"
        ],
        "correct": 0
      },
      {
        "q": "Where do giant wind turbines stand?",
        "options": [
          "On windy hills",
          "In ocean caves",
          "Underground",
          "Inside factories"
        ],
        "correct": 0
      },
      {
        "q": "What happens when turbine blades spin?",
        "options": [
          "Generators turn wind into electricity",
          "Air gets cold",
          "Rain falls",
          "Noise stops"
        ],
        "correct": 0
      },
      {
        "q": "What can clean wind energy power?",
        "options": [
          "Homes and schools",
          "Cars only",
          "Toys only",
          "Planes"
        ],
        "correct": 0
      },
      {
        "q": "What benefit does wind energy offer?",
        "options": [
          "Powers homes without polluting environment",
          "Cheap food",
          "Makes rain",
          "Stops wind"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 247,
    "difficulty": "hard",
    "dayIndex": 46,
    "title": {
      "en": "The Steam Engine",
      "zh": "蒸汽机"
    },
    "text": {
      "en": "The steam engine was improved by James Watt in the eighteenth century. It used boiling water steam to move heavy pistons and turn big iron wheels. Steam engines powered early train locomotives and automated factory machinery. This invention triggered the rapid growth of modern industry worldwide.",
      "zh": "蒸汽机在十八世纪由詹姆斯·瓦特进行了改进。它利用沸水的蒸汽移动重活塞并转动大铁轮。蒸汽机为早期的火车头和自动化工厂机械提供动力。这项发明引发了全世界现代工业的快速增长。"
    },
    "questions": [
      {
        "q": "Who improved the steam engine?",
        "options": [
          "James Watt",
          "Thomas Edison",
          "Benjamin Franklin",
          "Isaac Newton"
        ],
        "correct": 0
      },
      {
        "q": "When was the steam engine improved?",
        "options": [
          "Eighteenth century",
          "Twentieth century",
          "Sixteenth century",
          "Nineteenth century"
        ],
        "correct": 0
      },
      {
        "q": "What did the steam engine use to move pistons?",
        "options": [
          "Boiling water steam",
          "Oil fuel",
          "Electricity",
          "Wind power"
        ],
        "correct": 0
      },
      {
        "q": "What machinery did steam engines power?",
        "options": [
          "Early trains and factory machinery",
          "Cars and trucks",
          "Airplanes",
          "Computers"
        ],
        "correct": 0
      },
      {
        "q": "What effect did the steam engine have?",
        "options": [
          "Triggered rapid growth of modern industry",
          "Ended farming",
          "Created internet",
          "Stopped trade"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 248,
    "difficulty": "hard",
    "dayIndex": 47,
    "title": {
      "en": "The Solar Panels",
      "zh": "太阳能电池板"
    },
    "text": {
      "en": "Solar panels capture clean sunlight and transform it into usable electrical power. Dark silicon cells on the panels absorb sun rays throughout sunny days. Inverters convert direct current into alternating current for household appliance use. Utilizing solar energy reduces electricity bills and protects planet Earth.",
      "zh": "太阳能电池板捕捉干净的阳光并将其转化为可用的电能。电池板上的暗硅电池在阳光明媚的日子里吸收太阳光线。逆变器将直流电转换为交流电，供家用电器使用。利用太阳能可以减少电费支出并保护地球。"
    },
    "questions": [
      {
        "q": "What do solar panels capture?",
        "options": [
          "Clean sunlight",
          "Wind currents",
          "Raindrops",
          "Heat waves"
        ],
        "correct": 0
      },
      {
        "q": "What material absorbs sun rays on panels?",
        "options": [
          "Dark silicon cells",
          "Glass sheets",
          "Copper wires",
          "Plastic films"
        ],
        "correct": 0
      },
      {
        "q": "What do inverters do to electrical current?",
        "options": [
          "Convert DC into AC for appliances",
          "Store electricity",
          "Cool the panels",
          "Make light"
        ],
        "correct": 0
      },
      {
        "q": "When do silicon cells absorb sun rays?",
        "options": [
          "Throughout sunny days",
          "At midnight",
          "In rain",
          "In winter"
        ],
        "correct": 0
      },
      {
        "q": "What twin benefits does solar energy provide?",
        "options": [
          "Reduces electricity bills and protects Earth",
          "Makes rain and wind",
          "Cools house",
          "Provides gas"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 249,
    "difficulty": "hard",
    "dayIndex": 48,
    "title": {
      "en": "The Rainforest Canopy",
      "zh": "雨林树冠"
    },
    "text": {
      "en": "The rainforest canopy is the dense upper layer formed by tall tree branches. Over eighty percent of all rainforest wildlife lives high up in this canopy. Toucans, monkeys, and tree frogs find shelter and fruits in the thick leaves. Sunlight shines brightly on top while the forest floor below stays dark.",
      "zh": "雨林树冠是由高大的树枝密密麻麻构成的上层。超过百分之八十的雨林野生动物生活在这树冠的高处。巨嘴鸟、猴子和树蛙在厚厚的叶子里寻找庇护所和水果。阳光在顶部明亮地照射着，而下面的森林地面保持着黑暗。"
    },
    "questions": [
      {
        "q": "What forms the rainforest canopy?",
        "options": [
          "Dense upper layer of tall tree branches",
          "Forest floor",
          "River banks",
          "Vines"
        ],
        "correct": 0
      },
      {
        "q": "What percentage of rainforest wildlife lives in the canopy?",
        "options": [
          "Over eighty percent",
          "Fifty percent",
          "Ten percent",
          "Twenty percent"
        ],
        "correct": 0
      },
      {
        "q": "Which animals live high up in the canopy?",
        "options": [
          "Toucans, monkeys, tree frogs",
          "Fish and whales",
          "Lions and wolves",
          "Penguins"
        ],
        "correct": 0
      },
      {
        "q": "What do animals find in thick canopy leaves?",
        "options": [
          "Shelter and fruits",
          "Fresh water",
          "Ice",
          "Dry seeds"
        ],
        "correct": 0
      },
      {
        "q": "How is light described at the forest floor below?",
        "options": [
          "Forest floor stays dark",
          "Very bright",
          "Sunny",
          "Blue light"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 250,
    "difficulty": "hard",
    "dayIndex": 49,
    "title": {
      "en": "The Ancient Pyramids",
      "zh": "古代金字塔"
    },
    "text": {
      "en": "The ancient pyramids of Egypt were built thousands of years ago as royal tombs. Skilled workers moved millions of heavy limestone blocks to construct these massive structures. The Great Pyramid of Giza was the tallest man-made structure for centuries. Today visitors from all over the world admire these historic stone wonders.",
      "zh": "埃及的古代金字塔是几千年前作为皇家陵墓建造的。熟练的工人移动数百万重石灰石块来建造这些巨大的建筑物。吉萨大金字塔几个世纪以来一直是最高的人造建筑。今天，来自世界各地的游客都钦佩这些历史悠久的石头奇迹。"
    },
    "questions": [
      {
        "q": "Why were ancient pyramids built?",
        "options": [
          "As royal tombs",
          "As fortresses",
          "As schools",
          "As markets"
        ],
        "correct": 0
      },
      {
        "q": "What stone blocks were used to build pyramids?",
        "options": [
          "Heavy limestone blocks",
          "Marble",
          "Granite",
          "Bricks"
        ],
        "correct": 0
      },
      {
        "q": "Which pyramid was the tallest man-made structure for centuries?",
        "options": [
          "Great Pyramid of Giza",
          "Pyramid of Sun",
          "Red Pyramid",
          "Bent Pyramid"
        ],
        "correct": 0
      },
      {
        "q": "Who constructed these massive pyramid structures?",
        "options": [
          "Skilled workers",
          "Soldiers",
          "Sailors",
          "Farmers"
        ],
        "correct": 0
      },
      {
        "q": "What do visitors admire today?",
        "options": [
          "Historic stone wonders",
          "Gold treasures",
          "Secret rooms",
          "Ancient gardens"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 251,
    "difficulty": "super_hard",
    "dayIndex": 50,
    "title": {
      "en": "Deep Ocean Life",
      "zh": "深海生物"
    },
    "text": {
      "en": "The deep ocean is a cold dark environment located thousands of meters below sea level. No sunlight can reach this incredible depth, so creatures live in complete pitch darkness. Many deep sea fish have glowing body parts called bioluminescence to attract prey. Strange creatures like anglerfish and giant squids adapt to immense water pressure. Scientists use advanced robotic submarines to explore this fascinating underwater world.",
      "zh": "深海是位于海平面以下几千米的寒冷黑暗环境。没有阳光能到达这个难以置信的深度，所以生物生活在完全漆黑的世界里。许多深海鱼有被称为生物发光的发光身体部位来吸引猎物。像鮟鱇鱼和巨型乌贼这样的奇怪生物适应了巨大的水压。科学家使用先进的机器人潜艇来探索这个迷人的水下世界。"
    },
    "questions": [
      {
        "q": "Where is the deep ocean environment located?",
        "options": [
          "Thousands of meters below sea level",
          "On ocean surface",
          "Near beach",
          "In shallow bay"
        ],
        "correct": 0
      },
      {
        "q": "Why do deep sea creatures live in darkness?",
        "options": [
          "No sunlight can reach the depth",
          "Water is dirty",
          "They close eyes",
          "Clouds block sun"
        ],
        "correct": 0
      },
      {
        "q": "What glowing feature do deep sea fish have?",
        "options": [
          "Bioluminescence",
          "Fluorescence",
          "Electric sparks",
          "Solar glow"
        ],
        "correct": 0
      },
      {
        "q": "Which strange creatures adapt to high water pressure?",
        "options": [
          "Anglerfish and giant squids",
          "Dolphins and seals",
          "Turtles and crabs",
          "Sharks and rays"
        ],
        "correct": 0
      },
      {
        "q": "What tool do scientists use to explore deep ocean?",
        "options": [
          "Advanced robotic submarines",
          "Diving suits",
          "Rowboats",
          "Sensors"
        ],
        "correct": 0
      },
      {
        "q": "How is the deep ocean world described?",
        "options": [
          "Fascinating underwater world",
          "Boring desert",
          "Warm pool",
          "Sunny lake"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 252,
    "difficulty": "super_hard",
    "dayIndex": 51,
    "title": {
      "en": "The Great Wall of China",
      "zh": "中国长城"
    },
    "text": {
      "en": "The Great Wall of China is one of the most famous historic structures in the world. It stretches thousands of miles across steep mountains and wide northern deserts. Ancient soldiers built watchtowers along the wall to guard borders and send signal smoke. Millions of travelers visit restored sections like Badaling to walk along the historic stones. The wall stands today as a magnificent symbol of Chinese history and engineering.",
      "zh": "中国长城是世界上最著名的历史建筑之一。它绵延几千英里，穿过陡峭的山脉和辽阔的北方沙漠。古代士兵在长城沿线建造了烽火台，以守卫边境并发送信号烟雾。数以百万计的游客游览八达岭等修复好的路段，在历史悠久的石头上行走。今天，长城是中国历史和工程的壮丽象征。"
    },
    "questions": [
      {
        "q": "How is the Great Wall of China described?",
        "options": [
          "Famous historic structure",
          "Modern road",
          "Tall tower",
          "Wooden bridge"
        ],
        "correct": 0
      },
      {
        "q": "Across what terrain does the wall stretch?",
        "options": [
          "Steep mountains and wide deserts",
          "Deep oceans",
          "Tropical forests",
          "Grassy fields"
        ],
        "correct": 0
      },
      {
        "q": "Why did ancient soldiers build watchtowers?",
        "options": [
          "Guard borders and send signal smoke",
          "Store food",
          "Sleep",
          "Cook meals"
        ],
        "correct": 0
      },
      {
        "q": "Which restored wall section is mentioned for visitors?",
        "options": [
          "Badaling",
          "Mutianyu",
          "Simatai",
          "Jiayuguan"
        ],
        "correct": 0
      },
      {
        "q": "What does the Great Wall symbolize today?",
        "options": [
          "Chinese history and engineering",
          "Modern trade",
          "Space travel",
          "War"
        ],
        "correct": 0
      },
      {
        "q": "Who visits the Great Wall today?",
        "options": [
          "Millions of travelers",
          "Only local people",
          "Soldiers",
          "Scientists"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 253,
    "difficulty": "super_hard",
    "dayIndex": 52,
    "title": {
      "en": "The Invention of Printing",
      "zh": "印刷术的发明"
    },
    "text": {
      "en": "Movable type printing was invented by Bi Sheng in eleventh century China. He carved individual Chinese characters onto small durable clay blocks and baked them hard. Later in Germany Johannes Gutenberg created a metal printing press with movable letters. Books could be printed much faster and cheaper than writing by hand. This grand invention spread knowledge and literacy rapidly across the entire globe.",
      "zh": "活字印刷术是由毕昇于十一世纪在中国发明的。他在小而耐用的粘土块上雕刻单独的汉字，并将其烧硬。后来在德国，约翰内斯·谷登堡发明了带有活字字母的金属印刷机。书籍的印刷速度和价格远快于手写。这项伟大的发明在全球范围内迅速传播了知识和识字率。"
    },
    "questions": [
      {
        "q": "Who invented movable type printing in China?",
        "options": [
          "Bi Sheng",
          "Cai Lun",
          "Shen Kuo",
          "Zhang Heng"
        ],
        "correct": 0
      },
      {
        "q": "What material did Bi Sheng carve characters on?",
        "options": [
          "Small durable clay blocks",
          "Wood blocks",
          "Metal plates",
          "Stone slabs"
        ],
        "correct": 0
      },
      {
        "q": "Who created a metal printing press in Germany?",
        "options": [
          "Johannes Gutenberg",
          "James Watt",
          "Alexander Bell",
          "Galileo"
        ],
        "correct": 0
      },
      {
        "q": "Why was printing better than writing by hand?",
        "options": [
          "Printed faster and cheaper",
          "Easier to burn",
          "Looks prettier",
          "Uses no ink"
        ],
        "correct": 0
      },
      {
        "q": "What impact did printing have on the world?",
        "options": [
          "Spread knowledge and literacy rapidly",
          "Ended schooling",
          "Created newspapers only",
          "Stopped trade"
        ],
        "correct": 0
      },
      {
        "q": "When was movable type invented in China?",
        "options": [
          "Eleventh century",
          "Fifteenth century",
          "Eighth century",
          "First century"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 254,
    "difficulty": "super_hard",
    "dayIndex": 53,
    "title": {
      "en": "How Plants Make Food",
      "zh": "植物如何制作食物"
    },
    "text": {
      "en": "Green plants make their own food through a natural process called photosynthesis. Plant roots absorb fresh water and minerals from the surrounding dark soil. Green leaves collect carbon dioxide gas from the air and absorb sunlight. Sunlight energy converts water and gas into sweet glucose sugar and oxygen. This vital process provides fresh oxygen for humans and animals to breathe.",
      "zh": "绿色植物通过一种叫做光合作用的自然过程自己制作食物。植物根部从周围的黑土中吸收新鲜的水分和矿物质。绿叶从空气中收集二氧化碳气体并吸收阳光。阳光能将水和气体转化为甜葡萄糖和氧气。这一至关重要的过程为人类和动物呼吸提供了新鲜的氧气。"
    },
    "questions": [
      {
        "q": "What is the natural process of plant food making called?",
        "options": [
          "Photosynthesis",
          "Respiration",
          "Evaporation",
          "Digestion"
        ],
        "correct": 0
      },
      {
        "q": "What do plant roots absorb from soil?",
        "options": [
          "Fresh water and minerals",
          "Sunlight",
          "Carbon dioxide",
          "Oxygen"
        ],
        "correct": 0
      },
      {
        "q": "What gas do green leaves collect from air?",
        "options": [
          "Carbon dioxide",
          "Oxygen",
          "Nitrogen",
          "Hydrogen"
        ],
        "correct": 0
      },
      {
        "q": "What does sunlight energy convert water and gas into?",
        "options": [
          "Sweet glucose sugar and oxygen",
          "Starch and water",
          "Fruit juice",
          "Salt"
        ],
        "correct": 0
      },
      {
        "q": "Why is photosynthesis vital for humans and animals?",
        "options": [
          "Provides fresh oxygen to breathe",
          "Makes rain",
          "Cools earth",
          "Creates soil"
        ],
        "correct": 0
      },
      {
        "q": "What absorbs sunlight in plants?",
        "options": [
          "Green leaves",
          "Roots",
          "Stems",
          "Flowers"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 255,
    "difficulty": "super_hard",
    "dayIndex": 54,
    "title": {
      "en": "The Exploration of Mars",
      "zh": "探索火星"
    },
    "text": {
      "en": "Mars is the fourth planet from the sun and our closest planetary neighbor. Scientists send robotic rovers like Perseverance to explore its dry rocky surface. These rovers take high resolution photos and drill rock samples for analysis. Robotic rovers search for ancient signs of microscopic water life in dried lakebeds. Future space missions aim to send human astronauts to land on Mars.",
      "zh": "火星是距离太阳第四近的行星，也是我们最近的行星邻居。科学家派遣像“毅力号”这样的机器人漫游车去探索它干燥的岩石表面。这些漫游车拍摄高分辨率照片并钻取岩石样本进行分析。机器人漫游车在干涸的湖床中寻找古老的微小水生生命迹象。未来的太空任务旨在派遣人类宇航员登陆火星。"
    },
    "questions": [
      {
        "q": "Which position is Mars from the sun?",
        "options": [
          "Fourth planet",
          "Third planet",
          "Fifth planet",
          "Second planet"
        ],
        "correct": 0
      },
      {
        "q": "What is the name of the robotic rover mentioned?",
        "options": [
          "Perseverance",
          "Curiosity",
          "Spirit",
          "Opportunity"
        ],
        "correct": 0
      },
      {
        "q": "What do robotic rovers do on Mars?",
        "options": [
          "Take photos and drill rock samples",
          "Build houses",
          "Plant trees",
          "Fly airplanes"
        ],
        "correct": 0
      },
      {
        "q": "Where do rovers search for ancient signs of water life?",
        "options": [
          "In dried lakebeds",
          "On high mountains",
          "Inside craters",
          "In ice caps"
        ],
        "correct": 0
      },
      {
        "q": "What is the future goal for Mars space missions?",
        "options": [
          "Send human astronauts to land on Mars",
          "Build cities",
          "Move Earth",
          "Destroy rovers"
        ],
        "correct": 0
      },
      {
        "q": "How is the surface of Mars described?",
        "options": [
          "Dry rocky surface",
          "Wet muddy surface",
          "Icy ocean",
          "Grassy plain"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 256,
    "difficulty": "super_hard",
    "dayIndex": 55,
    "title": {
      "en": "Renewable Energy Physics",
      "zh": "可再生能源物理学"
    },
    "text": {
      "en": "Clean energy comes from natural sources that replenish themselves continuously over time. Solar panels turn sunlight photons into clean electric current using silicon cells. Wind turbines capture kinetic energy from moving air to spin heavy generators. Hydroelectric dams harness flowing water power to produce renewable electricity for cities. Using clean energy cuts carbon emissions and protects our global climate.",
      "zh": "清洁能源来自于随时间不断自我补充的自然资源。太阳能电池板利用硅电池将阳光光子转化为干净的电流。风力发电机捕捉来自流动空气的动能来旋转重型发电机。水力发电坝利用流动的水力为城市产生可再生电力。使用清洁能源可以减少碳排放，保护我们的全球气候。"
    },
    "questions": [
      {
        "q": "What characterizes renewable clean energy?",
        "options": [
          "Replenishes itself continuously over time",
          "Runs out quickly",
          "Pollutes air",
          "Is made from coal"
        ],
        "correct": 0
      },
      {
        "q": "What do solar panels use to turn photons into electric current?",
        "options": [
          "Silicon cells",
          "Glass lenses",
          "Copper rods",
          "Mirrors"
        ],
        "correct": 0
      },
      {
        "q": "What energy do wind turbines capture from moving air?",
        "options": [
          "Kinetic energy",
          "Heat energy",
          "Chemical energy",
          "Nuclear energy"
        ],
        "correct": 0
      },
      {
        "q": "How do hydroelectric dams produce renewable electricity?",
        "options": [
          "Harness flowing water power",
          "Burn wood",
          "Boil oil",
          "Trap steam"
        ],
        "correct": 0
      },
      {
        "q": "What benefit does clean energy offer global climate?",
        "options": [
          "Cuts carbon emissions and protects climate",
          "Increases heat",
          "Makes rain",
          "Stops wind"
        ],
        "correct": 0
      },
      {
        "q": "What do wind turbines spin to make electricity?",
        "options": [
          "Heavy generators",
          "Water wheels",
          "Solar panels",
          "Batteries"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 257,
    "difficulty": "super_hard",
    "dayIndex": 56,
    "title": {
      "en": "The Honeybee Ecosystem",
      "zh": "蜜蜂生态系统"
    },
    "text": {
      "en": "Honeybees are essential pollinators that sustain wild habitats and agricultural crops worldwide. A worker bee visits over one thousand flowers a day to collect nectar. While feeding, pollen grains stick to its fuzzy body and transfer between flowers. This pollination process allows plants to produce seeds, nuts, and delicious fruits. Protecting honeybee populations is crucial for maintaining global food supplies.",
      "zh": "蜜蜂是至关重要的传粉者，维持着世界各地的野生栖息地和农作物。一只工蜂一天拜访一千多朵花来收集花蜜。在取食时，花粉粒粘在其毛茸茸的身体上，并在花朵之间传递。这种授粉过程使植物能够产生种子、坚果和美味的水果。保护蜜蜂种群对于维持全球粮食供应至关重要。"
    },
    "questions": [
      {
        "q": "What essential role do honeybees perform worldwide?",
        "options": [
          "Essential pollinators for habitats and crops",
          "Soil aerators",
          "Pest controllers",
          "Water collectors"
        ],
        "correct": 0
      },
      {
        "q": "How many flowers can a single worker bee visit in one day?",
        "options": [
          "Over one thousand flowers",
          "One hundred",
          "Fifty",
          "Ten"
        ],
        "correct": 0
      },
      {
        "q": "Where do pollen grains stick on the bee's body?",
        "options": [
          "To its fuzzy body",
          "To its wings",
          "To its eyes",
          "To its feet"
        ],
        "correct": 0
      },
      {
        "q": "What does pollination allow plants to produce?",
        "options": [
          "Seeds, nuts, delicious fruits",
          "Leaves and wood",
          "Flowers only",
          "Fresh water"
        ],
        "correct": 0
      },
      {
        "q": "Why is protecting honeybee populations crucial?",
        "options": [
          "Maintaining global food supplies",
          "Making honey only",
          "Keeping parks clean",
          "Stopping rain"
        ],
        "correct": 0
      },
      {
        "q": "What food do bees gather for energy?",
        "options": [
          "Nectar",
          "Water",
          "Leaves",
          "Mud"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 258,
    "difficulty": "super_hard",
    "dayIndex": 57,
    "title": {
      "en": "The History of Aviation",
      "zh": "航空的历史"
    },
    "text": {
      "en": "Humans dreamed of flying high like birds for thousands of historic years. In nineteen hundred and three, Orville and Wilbur Wright built the first powered airplane. Their motorized glider flew for twelve seconds over the sandy dunes of Kitty Hawk. Today jet airplanes carry hundreds of passengers across oceans in a few hours. Modern aviation connects people, cultures, and trade across the entire world.",
      "zh": "人类几千年来一直梦想着像鸟儿一样高飞。一九〇三年，奥维尔和威尔伯·莱特兄弟制造了第一架动力飞机。他们的机动滑翔机在基蒂霍克的沙丘上飞了十二秒。今天，喷气式飞机在几个小时内将数百名乘客送过大洋。现代航空将全世界的人们、文化和贸易联系在一起。"
    },
    "questions": [
      {
        "q": "Who built the first powered airplane in 1903?",
        "options": [
          "Orville and Wilbur Wright",
          "James Watt",
          "Henry Ford",
          "Alexander Bell"
        ],
        "correct": 0
      },
      {
        "q": "How long did their first motorized flight last?",
        "options": [
          "Twelve seconds",
          "One hour",
          "Five minutes",
          "Ten seconds"
        ],
        "correct": 0
      },
      {
        "q": "Where did the Wright brothers make their historic flight?",
        "options": [
          "Sandy dunes of Kitty Hawk",
          "In New York",
          "In London",
          "On a mountain peak"
        ],
        "correct": 0
      },
      {
        "q": "What do modern jet airplanes carry across oceans?",
        "options": [
          "Hundreds of passengers",
          "Cargo only",
          "Mail only",
          "Soldiers only"
        ],
        "correct": 0
      },
      {
        "q": "How does modern aviation impact our world?",
        "options": [
          "Connects people, cultures, trade",
          "Slows travel",
          "Pollutes only",
          "Ends trade"
        ],
        "correct": 0
      },
      {
        "q": "When was the first powered airplane built?",
        "options": [
          "In 1903",
          "In 1800",
          "In 1950",
          "In 1920"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 259,
    "difficulty": "super_hard",
    "dayIndex": 58,
    "title": {
      "en": "Ocean Bioluminescence",
      "zh": "海洋生物发光"
    },
    "text": {
      "en": "Bioluminescence is the production of light by living organisms in dark environments. Special chemical reactions inside ocean creatures produce glowing blue or green light. Tiny plankton glow brightly when ocean waves crash against night shores. Deep sea jellyfish use light flashes to scare away hungry predators. Scientists study bioluminescence to create new medical tools and glowing dyes.",
      "zh": "生物发光是生物在黑暗环境中产生光的过程。海洋生物体内的特殊化学反应产生闪耀的蓝色或绿色光。当海浪在夜间海岸掀起时，微小的浮游生物发出亮光。深海水母利用闪光吓走饥饿的捕食者。科学家研究生物发光来创造新的医疗工具和发光染料。"
    },
    "questions": [
      {
        "q": "What is bioluminescence?",
        "options": [
          "Production of light by living organisms",
          "Reflection of sunlight",
          "Heat from rocks",
          "Electric shocks"
        ],
        "correct": 0
      },
      {
        "q": "What colors of light do ocean chemical reactions produce?",
        "options": [
          "Glowing blue or green light",
          "Red or purple",
          "Yellow or orange",
          "White or black"
        ],
        "correct": 0
      },
      {
        "q": "When do tiny ocean plankton glow brightly?",
        "options": [
          "When waves crash against night shores",
          "During sunny noon",
          "In rain",
          "When eaten"
        ],
        "correct": 0
      },
      {
        "q": "Why do deep sea jellyfish use light flashes?",
        "options": [
          "To scare away hungry predators",
          "To find mates",
          "To warm up",
          "To sleep"
        ],
        "correct": 0
      },
      {
        "q": "Why do scientists study bioluminescence?",
        "options": [
          "Create new medical tools and glowing dyes",
          "Make toys",
          "Light houses",
          "Catch fish"
        ],
        "correct": 0
      },
      {
        "q": "Where do living organisms produce light?",
        "options": [
          "In dark environments",
          "In bright sun",
          "In desert sand",
          "In air"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": 260,
    "difficulty": "super_hard",
    "dayIndex": 59,
    "title": {
      "en": "The Story of Invention",
      "zh": "发明的故事"
    },
    "text": {
      "en": "Great inventions shape human history and improve daily life for everyone. Thomas Edison invented the practical electric light bulb in eighteen seventy-nine. Alexander Graham Bell created the first telephone to send voices across wires. Modern inventors design smart computers and clean energy systems to solve problems. Curiosity and hard work inspire new discoveries that change our future world.",
      "zh": "伟大的发明塑造了人类历史，改善了每个人的日常生活。托马斯·爱迪生于一八七九年发明的实用的白炽灯泡。亚历山大·格雷厄姆·贝尔创造了第一部通过电线传输声音的电话。现代发明家设计智能计算机和清洁能源系统来解决问题。好奇心和努力工作激发出改变我们未来世界的新发现。"
    },
    "questions": [
      {
        "q": "Who invented the practical electric light bulb in 1879?",
        "options": [
          "Thomas Edison",
          "Alexander Bell",
          "James Watt",
          "Bi Sheng"
        ],
        "correct": 0
      },
      {
        "q": "What did Alexander Graham Bell create?",
        "options": [
          "First telephone to send voices",
          "Radio",
          "Telegraph",
          "Television"
        ],
        "correct": 0
      },
      {
        "q": "What do modern inventors design to solve global problems?",
        "options": [
          "Smart computers and clean energy systems",
          "Cars only",
          "Toys",
          "Paper books"
        ],
        "correct": 0
      },
      {
        "q": "What virtues inspire new discoveries that change the world?",
        "options": [
          "Curiosity and hard work",
          "Luck and money",
          "Speed and power",
          "Rest and play"
        ],
        "correct": 0
      },
      {
        "q": "How do great inventions affect human life?",
        "options": [
          "Shape history and improve daily life",
          "Make life harder",
          "Stop progress",
          "Cause wars"
        ],
        "correct": 0
      },
      {
        "q": "When was the electric light bulb invented?",
        "options": [
          "In 1879",
          "In 1900",
          "In 1800",
          "In 1950"
        ],
        "correct": 0
      }
    ]
  }
];

export const readingsG34 = reviewReadingPack(rawReadingsG34);
