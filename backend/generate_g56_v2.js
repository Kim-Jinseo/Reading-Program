import fs from 'fs';

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

// Grade 5-6 (60 passages: IDs 301 to 360)
// easy: 25 (3 sentences, 3 questions)
// medium: 15 (4 sentences, 4 questions)
// hard: 10 (4 sentences, 5 questions)
// super_hard: 10 (5 sentences, 6 questions)

const g56Data = [
  // --- EASY (25 passages, 3 sentences, 3 questions) ---
  createPassage(301, 'easy', 0, "The Planet Mars", "火星",
    "Mars is the fourth planet from our sun in space. It looks red because there is a lot of iron dust on its rocky ground. Scientists use robotic cameras to take clear pictures of its mountains.",
    "火星是太空里距离太阳第四近的行星。它看起来是红色的，因为它的岩石地面上有大量的铁尘。科学家使用机器人相机拍摄其山脉的清晰照片。",
    [
      { q: "Which position is Mars from the sun?", options: ["Fourth planet", "First planet", "Second planet", "Fifth planet"], correct: 0 },
      { q: "Why does Mars look red?", options: ["Because of iron dust on ground", "Because of red flowers", "Because of hot fire", "Because of red paint"], correct: 0 },
      { q: "What do scientists use to take pictures?", options: ["Robotic cameras", "Small mirrors", "Big flashlights", "Paper maps"], correct: 0 }
    ]
  ),
  createPassage(302, 'easy', 1, "Deep Ocean Fish", "深海鱼类",
    "Deep ocean fish live in dark waters far below the surface. Many of these fish make their own soft blue light to find food. They have large eyes to help them see in the dark sea.",
    "深海鱼生活在水面以下深处的黑暗水域中。这些鱼中的许多鱼能发出自己的柔和蓝光来寻找食物。它们有大眼睛来帮助它们在黑暗的大海中看清东西。",
    [
      { q: "Where do deep ocean fish live?", options: ["In dark waters far below surface", "In sunny ponds", "In warm rivers", "On sandy beaches"], correct: 0 },
      { q: "What color light do many deep fish make?", options: ["Soft blue light", "Bright red light", "Yellow light", "Green light"], correct: 0 },
      { q: "Why do they have large eyes?", options: ["To see in the dark sea", "To look scary", "To swim fast", "To sleep better"], correct: 0 }
    ]
  ),
  createPassage(303, 'easy', 2, "Solar Energy", "太阳能",
    "Solar panels turn clean sunlight into electric power for homes. They work best on warm sunny days when the sky is clear. Using solar energy helps keep our air clean and fresh.",
    "太阳能电池板将干净的阳光转化为供家庭使用的电能。在天空晴朗的温暖晴天，它们工作得最好。使用太阳能有助于保持我们的空气干净清新。",
    [
      { q: "What do solar panels turn into electric power?", options: ["Clean sunlight", "Wind power", "Raindrops", "Cold air"], correct: 0 },
      { q: "When do solar panels work best?", options: ["On warm sunny days", "On rainy nights", "In snowy winter", "During storms"], correct: 0 },
      { q: "How does solar energy help our environment?", options: ["Keeps air clean and fresh", "Makes weather cold", "Creates rain", "Stops wind"], correct: 0 }
    ]
  ),
  createPassage(304, 'easy', 3, "The Honeybee Hive", "蜜蜂蜂巢",
    "Thousands of worker bees live together inside a large wooden hive. They fly to colorful flowers every morning to collect sweet nectar. Then they bring the nectar back home to make delicious honey.",
    "数以千计的工蜂共同生活在一个大木蜂巢里。它们每天早上飞向五彩缤纷的花朵收集甜美的花蜜。然后它们把花蜜带回家制作美味的蜂蜜。",
    [
      { q: "Where do worker bees live together?", options: ["Inside a large wooden hive", "In tree hollows", "Under rocks", "In underground caves"], correct: 0 },
      { q: "Why do worker bees fly to flowers?", options: ["To collect sweet nectar", "To drink water", "To sleep", "To play games"], correct: 0 },
      { q: "What do bees make with the nectar?", options: ["Delicious honey", "Fruit juice", "Flower oil", "Sweet tea"], correct: 0 }
    ]
  ),
  createPassage(305, 'easy', 4, "Wind Turbines", "风力发电机",
    "Tall wind turbines stand on open grassy hills where the wind is strong. Their huge white blades turn slowly as the wind blows past. This movement drives generators to create clean electricity for towns.",
    "高大的风力发电机立在风力强劲的开阔草丘上。当风吹过时，它们巨大的白叶片缓慢旋转。这种运动驱动发电机为城镇创造清洁电力。",
    [
      { q: "Where do wind turbines stand?", options: ["On open grassy hills", "Inside deep forests", "In river valleys", "On city roofs"], correct: 0 },
      { q: "What color are the turbine blades?", options: ["White", "Red", "Blue", "Black"], correct: 0 },
      { q: "What do wind turbines create for towns?", options: ["Clean electricity", "Fresh water", "Warm air", "Rain clouds"], correct: 0 }
    ]
  ),
  createPassage(306, 'easy', 5, "Ancient Pyramids", "古代金字塔",
    "The ancient pyramids of Egypt were built using heavy stone blocks. Thousands of workers helped move the giant stones across the dry sand. Today visitors travel from all over the world to see these historic wonders.",
    "埃及的古代金字塔是用沉重的石块建造的。数千名工人帮助将巨石搬过干燥的沙子。今天，游客从世界各地赶来看这些历史奇迹。",
    [
      { q: "What were ancient pyramids built with?", options: ["Heavy stone blocks", "Wood logs", "Clay bricks", "Metal beams"], correct: 0 },
      { q: "Where were the giant stones moved across?", options: ["Across the dry sand", "Over a big river", "Through mountains", "Across grass"], correct: 0 },
      { q: "Why do visitors travel from around the world?", options: ["To see these historic wonders", "To buy stones", "To go swimming", "To work there"], correct: 0 }
    ]
  ),
  createPassage(307, 'easy', 6, "The Rainforest Canopy", "雨林树冠",
    "The rainforest canopy is the top layer formed by tall tree branches. Many colorful parrots and playful monkeys spend their lives up in these leaves. They find plenty of sweet fruits and fresh water in the high trees.",
    "雨林树冠是由高大的树枝构成的顶层。许多色彩斑斓的鹦鹉和淘气的猴子在这些树叶里度过一生。它们在耸立的树上找到了丰富的甜水果和新鲜水。",
    [
      { q: "What forms the rainforest canopy?", options: ["Tall tree branches", "River banks", "Low bushes", "Underground roots"], correct: 0 },
      { q: "Which animals spend their lives up in the canopy?", options: ["Parrots and monkeys", "Bears and wolves", "Fish and frogs", "Lions and tigers"], correct: 0 },
      { q: "What food do animals find in the high trees?", options: ["Sweet fruits and water", "Seeds and nuts", "Fish", "Grass"], correct: 0 }
    ]
  ),
  createPassage(308, 'easy', 7, "Great Wall of China", "中国长城",
    "The Great Wall of China is a very famous structure built long ago. It stretches over high mountains and wide valleys for thousands of miles. Ancient soldiers built watchtowers along the wall to protect their country.",
    "中国长城是很久以前建造的非常有名的建筑。它穿过高山和宽阔的山谷，绵延数千英里。古代士兵在长城沿线建造了烽火台来保护他们的国家。",
    [
      { q: "What is the Great Wall of China?", options: ["A famous historic structure", "A modern highway", "A tall bridge", "A castle"], correct: 0 },
      { q: "Where does the Great Wall stretch?", options: ["Over high mountains and valleys", "Across the ocean", "Inside cities", "Underground"], correct: 0 },
      { q: "Why did ancient soldiers build watchtowers?", options: ["To protect their country", "To store food", "To rest", "To trade goods"], correct: 0 }
    ]
  ),
  createPassage(309, 'easy', 8, "How Paper Is Made", "纸张是如何制作的",
    "Paper was first invented in ancient China using wood bark and water. Workers mashed materials into a wet pulp and pressed it into thin sheets. Today modern machines make paper quickly so people can write and learn.",
    "纸最早是在中国古代用树木外皮和水发明的。工人将材料压碎成湿浆，然后将其压成薄片。今天，现代机器快速造纸，以便人们能够写作和学习。",
    [
      { q: "Where was paper first invented?", options: ["Ancient China", "Ancient Rome", "Egypt", "Greece"], correct: 0 },
      { q: "What did workers mash materials into?", options: ["A wet pulp", "Dry powder", "Small blocks", "Long threads"], correct: 0 },
      { q: "Why do modern machines make paper quickly today?", options: ["So people can write and learn", "To make toys", "To burn it", "To build houses"], correct: 0 }
    ]
  ),
  createPassage(310, 'easy', 9, "Electric Bicycles", "电动自行车",
    "Electric bicycles use small rechargeable batteries to power a quiet motor. Riders can pedal easily up steep hills without getting too tired. They are a great way to travel around cities without polluting the air.",
    "电动自行车使用小型可充电电池为安静的电机提供动力。骑手可以轻松骑车上陡坡，而不会太累。它们是在城市里出行而又不污染空气的好方法。",
    [
      { q: "What powers the quiet motor on electric bicycles?", options: ["Small rechargeable batteries", "Gasoline fuel", "Solar panels", "Wind power"], correct: 0 },
      { q: "How do electric bikes help riders on steep hills?", options: ["Allow pedaling easily without getting tired", "Make bike fly", "Stop bike", "Run backward"], correct: 0 },
      { q: "Why are electric bikes good for cities?", options: ["Travel without polluting the air", "Go faster than cars", "Are free", "Are very big"], correct: 0 }
    ]
  ),
  createPassage(311, 'easy', 10, "The Life of Coral", "珊瑚的生命",
    "Coral reefs are colorful ocean habitats built by tiny living sea creatures. Thousands of bright tropical fish find shelter and food among the coral branches. Keeping ocean waters clean helps protect these delicate marine ecosystems for the future.",
    "珊瑚礁是由微小的海洋生物建造的色彩斑斓的海洋栖息地。成千上万鲜艳的热带鱼在珊瑚枝中寻找到庇护所和食物。保持海洋水质干净有助于为未来保护这些脆弱的海洋生态系统。",
    [
      { q: "What builds colorful coral reefs?", options: ["Tiny living sea creatures", "Big whales", "Dolphins", "Sea birds"], correct: 0 },
      { q: "What finds shelter among coral branches?", options: ["Bright tropical fish", "Sharks", "Bears", "Eagles"], correct: 0 },
      { q: "How can we protect delicate marine ecosystems?", options: ["Keeping ocean waters clean", "Fishing more", "Building boats", "Making noise"], correct: 0 }
    ]
  ),
  createPassage(312, 'easy', 11, "Exploring Space", "探索太空",
    "Astronauts travel to space aboard advanced rockets to conduct scientific experiments. They live inside a space station that orbits high above our Earth every day. Looking out the window, astronauts see our bright blue planet surrounded by black space.",
    "宇航员乘坐先进的火箭前往太空进行科学实验。他们住在每天绕我们地球高高运行的空间站里。透过窗户看出去，宇航员能看到我们明亮的蓝色星球被黑色的太空包围着。",
    [
      { q: "How do astronauts travel to space?", options: ["Aboard advanced rockets", "In airplanes", "In hot air balloons", "In submarines"], correct: 0 },
      { q: "Where do astronauts live while in space?", options: ["Inside a space station", "On the moon", "On Mars", "In a satellite"], correct: 0 },
      { q: "What does Earth look like from space?", options: ["Bright blue planet in black space", "Red ball", "Green circle", "White square"], correct: 0 }
    ]
  ),
  createPassage(313, 'easy', 12, "The History of Trains", "火车的历史",
    "The first trains were powered by steam engines that burned coal to heat water. Today modern trains run silently on fast electric tracks across long distances. They carry passengers and heavy cargo safely between busy cities every day.",
    "第一批火车由燃烧煤炭加热水的蒸汽机提供动力。今天，现代火车在快速的电力轨道上安静地长途运行。它们每天在繁忙的城市之间安全地运送乘客和重货物。",
    [
      { q: "What powered the first trains?", options: ["Steam engines burning coal", "Electric batteries", "Gasoline", "Wind power"], correct: 0 },
      { q: "How do modern trains run today?", options: ["Silently on fast electric tracks", "Loudly on dirt roads", "On water", "Slowly on wood"], correct: 0 },
      { q: "What do modern trains carry between cities?", options: ["Passengers and heavy cargo", "Mail only", "Cars only", "Food only"], correct: 0 }
    ]
  ),
  createPassage(314, 'easy', 13, "Ocean Dolphins", "海洋海豚",
    "Dolphins are playful ocean mammals that communicate using whistles and clicks underwater. They swim together in groups called pods to hunt for small fish. Sometimes they leap high out of the blue water to show off their speed.",
    "海豚是顽皮的海洋哺乳动物，在水下利用哨声和嗒嗒声进行交流。它们在一个叫作“豆荚”的群体里一起游泳来捕食小鱼。有时它们跃出蓝色的水面展示速度。",
    [
      { q: "How do dolphins communicate underwater?", options: ["Using whistles and clicks", "By splashing water", "With light", "By changing color"], correct: 0 },
      { q: "What is a group of dolphins called?", options: ["A pod", "A herd", "A flock", "A pack"], correct: 0 },
      { q: "Why do dolphins swim together in pods?", options: ["To hunt for small fish", "To sleep", "To hide", "To race boats"], correct: 0 }
    ]
  ),
  createPassage(315, 'easy', 14, "The Power of Wind", "风的力量",
    "Wind is created when the sun heats different parts of the Earth unevenly. Warm air rises into the sky while cooler air moves in to take its place. We can use this moving air to generate clean power for our cities.",
    "当太阳对地球不同部位加热不均匀时，就形成了风。暖空气上升到空中，而冷空气移动进来取而代之。我们可以利用这种流动的空气为我们的城市产生清洁的电力。",
    [
      { q: "What creates wind on Earth?", options: ["Sun heating different parts unevenly", "Ocean waves", "Rainfall", "Trees waving"], correct: 0 },
      { q: "What happens when warm air rises?", options: ["Cooler air moves in to take its place", "Rain falls", "Sun stops", "Wind dies"], correct: 0 },
      { q: "How can we use moving air?", options: ["Generate clean power for cities", "Make weather hot", "Fly kites only", "Cool ocean"], correct: 0 }
    ]
  ),
  createPassage(316, 'easy', 15, "The Giant Sequoia", "巨杉",
    "Giant sequoia trees are among the largest and oldest living things on Earth. Their thick reddish bark protects them from forest fires and small insects. Some of these ancient trees have been growing in California for thousands of years.",
    "巨杉树是地球上最大和最古老的大型生物之一。它们厚厚的红棕色树皮保护它们免受森林火灾和小昆虫的侵害。其中一些古老的树木已经在加利福尼亚生长的数千年。",
    [
      { q: "How are giant sequoia trees described?", options: ["Largest and oldest living things", "Smallest plants", "Young trees", "Fastest growing bushes"], correct: 0 },
      { q: "What protects sequoia trees from fires?", options: ["Their thick reddish bark", "Green leaves", "Deep roots", "Cold water"], correct: 0 },
      { q: "Where have some ancient sequoias grown for thousands of years?", options: ["In California", "In Alaska", "In Florida", "In Texas"], correct: 0 }
    ]
  ),
  createPassage(317, 'easy', 16, "How Bridges Stand", "桥梁是如何立稳的",
    "Suspension bridges use strong steel cables to support heavy roads over wide rivers. The cables stretch between tall towers anchored firmly into solid ground. Engineers design these long bridges to flex safely when strong winds blow across the water.",
    "悬索桥使用坚固的钢缆在宽阔的河流上支撑沉重的道路。钢缆在坚固固定在沉重地面上的高塔之间延伸。工程师将这些长桥设计成在强风吹过水面时能够安全地弯曲。",
    [
      { q: "What supports heavy roads on suspension bridges?", options: ["Strong steel cables", "Wooden posts", "Ropes", "Plastic beams"], correct: 0 },
      { q: "Where are the tall bridge towers anchored?", options: ["Firmly into solid ground", "In water only", "On boats", "On trees"], correct: 0 },
      { q: "Why do engineers design bridges to flex?", options: ["To flex safely during strong winds", "To look pretty", "To make noise", "To catch fish"], correct: 0 }
    ]
  ),
  createPassage(318, 'easy', 17, "The Arctic Fox", "北极狐",
    "The Arctic fox has thick white fur that matches the surrounding winter snow. This warm fur coat helps the small animal hide from danger and stay warm in freezing cold. In summer, its fur turns brown to blend in with rocks and dirt.",
    "北极狐有着厚厚的白皮毛，与周围冬天的雪相匹配。这件温暖的皮毛外套有助于这种小动物躲避危险，并在严寒中保持温暖。夏天，它的皮毛变成棕色，与岩石和泥土融为一体。",
    [
      { q: "What color is the Arctic fox's fur in winter?", options: ["White", "Brown", "Grey", "Black"], correct: 0 },
      { q: "How does thick white fur help the fox?", options: ["Hides from danger and stays warm", "Helps it swim", "Makes it run fast", "Helps it climb"], correct: 0 },
      { q: "What color does its fur turn in summer?", options: ["Brown", "White", "Yellow", "Red"], correct: 0 }
    ]
  ),
  createPassage(319, 'easy', 18, "Invention of the Light Bulb", "灯泡的发明",
    "Thomas Edison invented a long-lasting electric light bulb in eighteen seventy-nine. Before his invention, people used wax candles and oil lamps to light their homes at night. Today electric light bulbs brighten houses, schools, and streets all around the world.",
    "托马斯·爱迪生于一八七九年发明的耐用的白炽灯泡。在他的发明之前，人们在晚上使用蜡烛和油灯给家里照明。今天，电灯泡照亮了世界各地的房屋、学校和街道。",
    [
      { q: "Who invented a long-lasting electric light bulb?", options: ["Thomas Edison", "Benjamin Franklin", "Alexander Bell", "James Watt"], correct: 0 },
      { q: "What did people use before the light bulb was invented?", options: ["Wax candles and oil lamps", "Torches only", "Solar lights", "Flashlights"], correct: 0 },
      { q: "When was the light bulb invented?", options: ["In 1879", "In 1900", "In 1850", "In 1920"], correct: 0 }
    ]
  ),
  createPassage(320, 'easy', 19, "Hydroelectric Dams", "水力发电坝",
    "Hydroelectric dams use the power of flowing river water to create clean electricity. Water rushes through giant pipes and turns heavy turbine wheels fast. This reliable green energy powers thousands of nearby homes without burning coal.",
    "水力发电坝利用流动的河水动力来创造清洁的电力。水流过巨型管道，快速转动沉重的水轮机轮。这种可靠的绿色能源为附近的数千户家庭提供动力，而无需烧煤。",
    [
      { q: "What do hydroelectric dams use to create electricity?", options: ["Power of flowing river water", "Wind energy", "Solar light", "Coal burning"], correct: 0 },
      { q: "What turns heavy turbine wheels inside the dam?", options: ["Water rushing through giant pipes", "Wind currents", "Steam", "Motors"], correct: 0 },
      { q: "What is an advantage of hydroelectric energy?", options: ["Powers homes without burning coal", "Makes water hot", "Stops river flow", "Is free"], correct: 0 }
    ]
  ),
  createPassage(321, 'easy', 20, "The Desert Camel", "沙漠骆驼",
    "Camels are tough animals well suited for living in dry hot desert environments. They store fat in their back humps to use for energy when food is scarce. Their wide padded feet help them walk across soft sand without sinking.",
    "骆驼是强壮的动物，非常适合生活在干燥炎热的沙漠环境中。当食物匮乏时，它们在背部的驼峰里储存脂肪作为能量。它们宽大的有垫脚掌有助于它们在软沙上行走而不会下沉。",
    [
      { q: "Where do camels live?", options: ["Dry hot desert environments", "Cold snowy mountains", "Rainforests", "Grassy wetlands"], correct: 0 },
      { q: "What do camels store in their back humps?", options: ["Fat for energy", "Water", "Food", "Sand"], correct: 0 },
      { q: "How do wide padded feet help camels?", options: ["Help them walk on sand without sinking", "Make them swim", "Help them jump high", "Keep them cold"], correct: 0 }
    ]
  ),
  createPassage(322, 'easy', 21, "The Great Barrier Reef", "大堡礁",
    "The Great Barrier Reef is the world's largest coral reef system located off Australia. It can be seen from space because of its huge size and bright colors. Protecting this marine wonder ensures hundreds of ocean species remain safe.",
    "大堡礁是位于澳大利亚海岸的世界上最大的珊瑚礁系统。从太空都可以看到它，因为它庞大的规模和鲜艳的色彩。保护这一海洋奇观可以确保数百种海洋物种保持安全。",
    [
      { q: "Where is the Great Barrier Reef located?", options: ["Off Australia", "Off America", "Near Africa", "In Asia"], correct: 0 },
      { q: "Why can the reef be seen from space?", options: ["Huge size and bright colors", "It glows in dark", "It has lights", "It is on land"], correct: 0 },
      { q: "Why is protecting the reef important?", options: ["Ensures ocean species remain safe", "Makes boats fast", "Helps fishing", "Creates islands"], correct: 0 }
    ]
  ),
  createPassage(323, 'easy', 22, "Telescopes in Astronomy", "天文学中的望远镜",
    "Telescopes help astronomers look deep into distant space to discover new stars. They use curved glass lenses and mirrors to make dim objects look bright and clear. Space telescopes like Hubble take amazing photos of galaxies far away.",
    "望远镜帮助天文学家深入遥远的太空发现新恒星。它们使用弯曲的玻璃镜头和镜子使暗淡的物体看起来明亮清晰。像哈勃这样的空间望远镜拍摄了遥远星系的惊人照片。",
    [
      { q: "How do telescopes help astronomers?", options: ["Look deep into space to discover stars", "Predict weather", "Measure temperature", "Fly to space"], correct: 0 },
      { q: "What do telescopes use to make dim objects look clear?", options: ["Curved glass lenses and mirrors", "Bright flashlights", "Lasers", "Prisms"], correct: 0 },
      { q: "What famous space telescope takes photos of galaxies?", options: ["Hubble", "Apollo", "Voyager", "Rover"], correct: 0 }
    ]
  ),
  createPassage(324, 'easy', 23, "The Honeybee Dance", "蜜蜂之舞",
    "When a worker bee finds fresh flowers, it returns to the hive to share news. It performs a figure-eight waggle dance to show other bees the exact direction. This clever communication helps the colony find food quickly without getting lost.",
    "当工蜂找到新鲜的花朵时，它会返回蜂巢分享消息。它表演八字形摆尾舞，向其他蜜蜂展示确切的方向。这种聪明的交流有助于蜂群快速找到食物而不迷路。",
    [
      { q: "What does a worker bee do after finding fresh flowers?", options: ["Returns to hive to share news", "Eats all nectar alone", "Sleeps", "Flies away"], correct: 0 },
      { q: "What shape is the waggle dance?", options: ["Figure-eight", "Circle", "Square", "Straight line"], correct: 0 },
      { q: "How does the dance help the colony?", options: ["Find food quickly without getting lost", "Scare enemies", "Keep warm", "Make honey fast"], correct: 0 }
    ]
  ),
  createPassage(325, 'easy', 24, "The Monarch Butterfly", "帝王蝶",
    "Monarch butterflies travel thousands of miles every autumn from Canada to Mexico. They migrate in huge orange flocks to escape freezing cold northern winters. After resting in warm mountain forests, they fly back north when spring arrives.",
    "帝王蝶每年秋天从加拿大飞到墨西哥，飞行数千英里。它们成群结队地迁移，以躲避北方寒冷的冬天。在温暖的高山森林里休息后，当春天到来时，它们飞回北方。",
    [
      { q: "Where do monarch butterflies travel every autumn?", options: ["From Canada to Mexico", "From China to India", "From Europe to Africa", "Across Asia"], correct: 0 },
      { q: "Why do monarch butterflies migrate in flocks?", options: ["To escape freezing northern winters", "To find water", "To play", "To lay eggs"], correct: 0 },
      { q: "When do they fly back north?", options: ["When spring arrives", "In middle of winter", "In late autumn", "Never"], correct: 0 }
    ]
  ),

  // --- MEDIUM (15 passages, 4 sentences, 4 questions) ---
  createPassage(326, 'medium', 25, "The Invention of the Telephone", "电话的发明",
    "Alexander Graham Bell invented the first practical telephone in eighteen seventy-six. He discovered how to convert human voice sounds into electrical signals across copper wires. His famous first words on the telephone were spoken to his assistant Thomas Watson. This groundbreaking invention changed global communication forever by connecting people instantly.",
    "亚历山大·格雷厄姆·贝尔于一八七六年发明了第一部实用的电话。他发现了如何通过铜线将人声转化为电信号。他在电话里的第一句名言是向他的助手托马斯·沃特森说的。这项突破性的发明通过实现即时联系，永远改变了全球通信。",
    [
      { q: "Who invented the first practical telephone?", options: ["Alexander Graham Bell", "Thomas Edison", "Nikola Tesla", "Samuel Morse"], correct: 0 },
      { q: "When was the telephone invented?", options: ["In 1876", "In 1900", "In 1850", "In 1920"], correct: 0 },
      { q: "How did the telephone send voice sounds?", options: ["Converted voice into electrical signals across wires", "Using radio waves", "Through light beams", "With sound pipes"], correct: 0 },
      { q: "Who was Bell's assistant that heard his first words?", options: ["Thomas Watson", "Thomas Edison", "John Smith", "Robert Brown"], correct: 0 }
    ]
  ),
  createPassage(327, 'medium', 26, "The Renewable Wind Power", "可再生风力能源",
    "Wind is a clean renewable source of energy that never runs out over time. Giant wind turbines are placed on open breezy plains to capture strong air currents. As the wind turns the huge white blades, internal generators create electric power. This green energy powers thousands of homes without releasing harmful carbon smoke.",
    "风是一种清洁的可再生能源，随着时间的推移永远不会耗尽。巨型风力发电机被放置在开阔有风的平原上，捕捉强劲的气流。当风转动巨大的白叶片时，内部发电机产生电能。这种绿色能源为数千户家庭提供动力，而不会释放有害的碳烟。",
    [
      { q: "What type of energy source is wind?", options: ["Clean renewable source that never runs out", "Fossil fuel", "Chemical energy", "Gasoline power"], correct: 0 },
      { q: "Where are giant wind turbines placed?", options: ["On open breezy plains", "Deep in valleys", "Inside forests", "In dark caves"], correct: 0 },
      { q: "What generates electric power inside wind turbines?", options: ["Internal generators turned by blades", "Solar cells", "Batteries", "Water pumps"], correct: 0 },
      { q: "What environmental advantage does wind energy provide?", options: ["Powers homes without releasing carbon smoke", "Makes rain fall", "Cools cities", "Cleans water"], correct: 0 }
    ]
  ),
  createPassage(328, 'medium', 27, "The Secrets of Coral Reefs", "珊瑚礁的秘密",
    "Coral reefs are diverse marine ecosystems built by tiny living coral polyps. They cover less than one percent of the ocean floor but support twenty-five percent of marine life. Bright corals provide shelter, breeding grounds, and food for fish, turtles, and crabs. Protecting coral reefs from pollution is essential for maintaining ocean health.",
    "珊瑚礁是由微小的活珊瑚虫建造的多样化海洋生态系统。它们覆盖了不到百分之一的海底，但支持着百分之二十五的海洋生物。鲜艳的珊瑚为鱼类、海龟和螃蟹提供庇护所、繁殖地和食物。保护珊瑚礁免受污染对于维护海洋健康至关重要。",
    [
      { q: "What builds diverse coral reef ecosystems?", options: ["Tiny living coral polyps", "Giant sea whales", "Ocean currents", "Volcanoes"], correct: 0 },
      { q: "What percentage of marine life do coral reefs support?", options: ["Twenty-five percent", "Ten percent", "Fifty percent", "Eighty percent"], correct: 0 },
      { q: "What benefits do bright corals offer ocean animals?", options: ["Shelter, breeding grounds, food", "Fresh air", "Warm sunlight", "Fresh water"], correct: 0 },
      { q: "Why is protecting coral reefs from pollution essential?", options: ["Maintaining ocean health", "Making water salty", "Helping ships sail", "Creating beaches"], correct: 0 }
    ]
  ),
  createPassage(329, 'medium', 28, "Volcanic Eruptions", "火山爆发",
    "A volcano is an opening in the Earth's crust where melted rock erupts. Deep beneath the surface, intense heat creates liquid rock called magma. When pressure builds up, magma bursts through the top vent as glowing lava. Over time, cooled lava layers form steep volcanic mountains around the vent.",
    "火山是地壳上的一个口子，融化的岩石从这里喷发出来。在地表深处，剧烈的热量创造出被称为岩浆的液体岩石。当压力聚集时，岩浆作为发光的熔岩从顶部喷气孔喷出。随着时间的推移，冷却的熔岩层在喷气孔周围形成陡峭的火山山脉。",
    [
      { q: "What is a volcano?", options: ["An opening in Earth's crust where melted rock erupts", "A deep lake", "A tall cave", "A mountain of ice"], correct: 0 },
      { q: "What is liquid rock beneath Earth's surface called?", options: ["Magma", "Lava", "Ash", "Granite"], correct: 0 },
      { q: "What happens when pressure builds up inside a volcano?", options: ["Magma bursts through top vent as lava", "It cools down", "It becomes water", "It shrinks"], correct: 0 },
      { q: "How do steep volcanic mountains form over time?", options: ["From layers of cooled lava around the vent", "From wind blown sand", "From rain water", "From earthquake shocks"], correct: 0 }
    ]
  ),
  createPassage(330, 'medium', 29, "The Story of Steam Trains", "蒸汽火车的故事",
    "Steam locomotives revolutionized land transport during the nineteenth century industrial revolution. Firemen burned heavy coal in a furnace to heat water inside a big boiler. High pressure steam expanded to drive heavy metal pistons and turn locomotive wheels. Trains connected distant towns and made transporting heavy trade goods fast and easy.",
    "在十九世纪工业革命时期，蒸汽机车彻底改变了陆路交通。消防员在炉子里烧重煤，加热大锅炉里的水。高压蒸汽膨胀驱动重金属活塞，转动机车车轮。火车连接了遥远的城镇，使运输重工业商品变得快速而简单。",
    [
      { q: "When did steam locomotives revolutionize land transport?", options: ["Nineteenth century", "Eighteenth century", "Twentieth century", "Seventeenth century"], correct: 0 },
      { q: "How was water heated inside the locomotive boiler?", options: ["Burning heavy coal in a furnace", "Using solar energy", "With wood fires", "Using electricity"], correct: 0 },
      { q: "What drove the heavy metal pistons in steam trains?", options: ["High pressure steam", "Electric motors", "Wind energy", "Oil pumps"], correct: 0 },
      { q: "What impact did steam trains have on towns?", options: ["Connected towns and made transport fast", "Caused traffic", "Stopped trade", "Closed roads"], correct: 0 }
    ]
  ),
  createPassage(331, 'medium', 30, "The Life of Honeybees", "蜜蜂的一生",
    "Honeybees are social insects that live together in highly organized colonies. Each colony has one egg-laying queen, thousands of female workers, and male drones. Worker bees build wax honeycomb cells to store sweet honey and nurse young larvae. Their hard work pollinating crops contributes significantly to human food production.",
    "蜜蜂是群居昆虫，生活在高度组织化的群体中。每个蜂群都有一只产卵的女王、数千只雌性工蜂和雄性雄蜂。工蜂建立蜡质蜂巢细胞来储存甜蜂蜜和护理幼虫。它们为农作物传粉的努力工作对人类粮食生产作出了重大贡献。",
    [
      { q: "What structure defines a honeybee colony?", options: ["Highly organized social insect colony", "Random group", "Solitary nest", "Temporary swarm"], correct: 0 },
      { q: "What role does the queen bee perform?", options: ["Laying eggs", "Gathering nectar", "Building comb", "Guarding hive"], correct: 0 },
      { q: "What do worker bees build honeycomb cells out of?", options: ["Wax", "Clay", "Leaves", "Paper"], correct: 0 },
      { q: "How does bee pollination help humans?", options: ["Contributes significantly to food production", "Makes water clean", "Cools cities", "Stops weeds"], correct: 0 }
    ]
  ),
  createPassage(332, 'medium', 31, "Photosynthesis in Plants", "植物的光合作用",
    "Photosynthesis is the natural chemical process green plants use to create food. Plant leaves absorb sunlight energy and take in carbon dioxide gas from the air. Roots pull fresh water and vital minerals up from the dark soil. This process converts sunlight into glucose sugar for plant growth and releases oxygen.",
    "光合作用是绿色植物用来制造食物的自然化学过程。植物叶子吸收阳光能，并从空气中吸收二氧化碳气体。根部从黑土中向上吸收新鲜水分和至关重要的矿物质。这个过程将阳光转化为供植物生长的葡萄糖并释放氧气。",
    [
      { q: "What is photosynthesis?", options: ["Natural chemical process plants use to create food", "Plant water loss", "Root growth", "Leaf fall"], correct: 0 },
      { q: "What gas do leaves absorb from air during photosynthesis?", options: ["Carbon dioxide", "Oxygen", "Nitrogen", "Hydrogen"], correct: 0 },
      { q: "What do plant roots pull up from dark soil?", options: ["Fresh water and vital minerals", "Sunlight", "Sugar", "Air"], correct: 0 },
      { q: "What two products are generated by photosynthesis?", options: ["Glucose sugar and oxygen", "Water and carbon dioxide", "Starch and salt", "Sunlight and rain"], correct: 0 }
    ]
  ),
  createPassage(333, 'medium', 32, "The Deep Ocean Zone", "深海带",
    "The deep ocean zone begins two hundred meters below the sunlit surface. Sunlight cannot penetrate this depth, leaving the environment in total pitch darkness. Animals here adapt to freezing water temperatures and tremendous water pressure. Some fish use bioluminescent light organs to attract prey and find mates.",
    "深海带始于阳光照射的海平面以下二百米处。阳光无法穿透这个深度，使得环境处于完全漆黑的状态。这里的动物适应冰冷的水温和巨大的水压。一些鱼使用生物发光器官来吸引猎物和寻找配偶。",
    [
      { q: "At what depth does the deep ocean zone begin?", options: ["Two hundred meters below surface", "One hundred meters", "Fifty meters", "Five hundred meters"], correct: 0 },
      { q: "Why is the deep ocean zone in pitch darkness?", options: ["Sunlight cannot penetrate this depth", "Water is muddy", "Clouds block light", "Seaweed is thick"], correct: 0 },
      { q: "What extreme conditions must deep ocean animals adapt to?", options: ["Freezing temperatures and high pressure", "Hot water", "Strong waves", "High salt"], correct: 0 },
      { q: "Why do some deep ocean fish use bioluminescent light organs?", options: ["Attract prey and find mates", "Warm water", "Swim fast", "Scare boats"], correct: 0 }
    ]
  ),
  createPassage(334, 'medium', 33, "The Invention of Printing", "印刷术的发明",
    "Bi Sheng invented movable clay type printing in China during the eleventh century. He carved individual Chinese characters on small clay blocks and baked them hard. Centuries later, Johannes Gutenberg invented a metal mechanical printing press in Germany. This revolutionary technology made books affordable and spread knowledge rapidly across the world.",
    "十一世纪，毕昇在中国发明的粘土活字印刷术。他在小粘土块上雕刻单独的汉字，并将其烧硬。几个世纪后，约翰内斯·谷登堡在德国发明了金属机械印刷机。这项革命性的技术使书籍变得负担得起，并在世界各地迅速传播了知识。",
    [
      { q: "Who invented movable clay type printing in China?", options: ["Bi Sheng", "Cai Lun", "Shen Kuo", "Li Bai"], correct: 0 },
      { q: "What did Bi Sheng carve characters on?", options: ["Small clay blocks baked hard", "Wood boards", "Stone slabs", "Metal sheets"], correct: 0 },
      { q: "What invention did Johannes Gutenberg create in Germany?", options: ["Metal mechanical printing press", "Steam engine", "Telephone", "Paper"], correct: 0 },
      { q: "How did printing technology affect books and knowledge?", options: ["Made books affordable and spread knowledge", "Made books rare", "Stopped reading", "Used more ink"], correct: 0 }
    ]
  ),
  createPassage(335, 'medium', 34, "The Giant Sequoias", "巨杉",
    "Giant sequoias are massive trees growing in the foggy Sierra Nevada mountains. They can live for over three thousand years and grow as tall as skyscrapers. Their thick fire-resistant bark contains tannin that protects against wood-rotting fungi. These ancient forest giants play an important role in forest carbon storage.",
    "巨杉生长在多雾的内华达山脉中，是巨大的树木。它们可以活三千多年，长得像摩天大楼一样高。它们厚厚的耐火树皮含有丹宁酸，可以防止木材腐烂真菌。这些古代森林巨人在森林碳储存中发挥着重要作用。",
    [
      { q: "Where do giant sequoias grow?", options: ["Foggy Sierra Nevada mountains", "Tropical islands", "Desert valleys", "Coastal plains"], correct: 0 },
      { q: "How long can giant sequoias live?", options: ["Over three thousand years", "One hundred years", "Five hundred years", "One thousand years"], correct: 0 },
      { q: "What substance in their bark protects against fungi?", options: ["Tannin", "Resin", "Sap", "Sugar"], correct: 0 },
      { q: "What ecological role do sequoias perform for forests?", options: ["Forest carbon storage", "Making rain", "Cooling soil", "Producing fruit"], correct: 0 }
    ]
  ),
  createPassage(336, 'medium', 35, "The Robotic Space Rovers", "机器人太空漫游车",
    "Robotic space rovers explore the dry rocky terrain of the planet Mars. Scientists control these wheeled robots from Earth using long-distance radio signals. Rovers feature high resolution cameras, laser tools, and drills to analyze Martian soil. They search for ancient chemical clues that suggest water once flowed on Mars.",
    "机器人太空漫游车探索火星干燥的岩石地形。科学家使用长途无线电信号从地球控制这些带轮子的机器人。漫游车配备高分辨率相机、激光工具和钻头，以分析火星土壤。它们寻找表明火星上曾经流过水的古老化学线索。",
    [
      { q: "What terrain do robotic rovers explore on Mars?", options: ["Dry rocky terrain", "Icy oceans", "Green valleys", "Sandy dunes"], correct: 0 },
      { q: "How do scientists control rovers from Earth?", options: ["Long-distance radio signals", "Satellite cables", "Laser beams", "Sound waves"], correct: 0 },
      { q: "What tools do rovers feature to analyze Martian soil?", options: ["Cameras, laser tools, drills", "Microscopes only", "Sensors only", "Hammers"], correct: 0 },
      { q: "What chemical clues do rovers search for on Mars?", options: ["Suggest water once flowed on Mars", "Proof of alien cities", "Gold deposits", "Oil fields"], correct: 0 }
    ]
  ),
  createPassage(337, 'medium', 36, "The Electric Car Revolution", "电动汽车革命",
    "Electric cars use rechargeable lithium batteries instead of gasoline engines for power. Electric motors drive the wheels smoothly with zero direct tailpipe carbon emissions. Charging stations are popping up along highways to allow long distance travel. Switching to electric transportation helps reduce city air pollution and noise.",
    "电动汽车使用可充电锂电池替代汽油发动机提供动力。电动机平稳地驱动车轮，零直接尾气碳排放。充电站在公路沿线涌现，允许长途旅行。转向电动交通工具有助于减少城市空气污染和噪音。",
    [
      { q: "What powers electric cars instead of gasoline engines?", options: ["Rechargeable lithium batteries", "Solar power", "Hydrogen tanks", "Steam boilers"], correct: 0 },
      { q: "What environmental advantage do electric motors offer?", options: ["Zero direct tailpipe carbon emissions", "Make roads smooth", "Cool the air", "Use no tires"], correct: 0 },
      { q: "What infrastructure allows long distance electric travel?", options: ["Charging stations along highways", "Gas stations", "Power lines", "Battery shops"], correct: 0 },
      { q: "How does electric transportation benefit city residents?", options: ["Reduces city air pollution and noise", "Makes cars free", "Increases speed", "Eliminates traffic"], correct: 0 }
    ]
  ),
  createPassage(338, 'medium', 37, "The Science of Hurricanes", "台风的科学",
    "Hurricanes are massive rotating tropical storms that form over warm ocean waters. Evaporating warm water feeds moisture into the rising air, creating strong winds. As the storm spins, a calm area called the eye forms at its center. Meterologists track hurricane paths using satellites to warn coastal towns in advance.",
    "飓风是在温暖的海洋水域上形成的巨大的旋转热带风暴。蒸发的热水将水分馈送到上升的空气中，产生强风。随着风暴的旋转，一个被称为眼区的平静区域在其中心形成。气象学家使用卫星跟踪飓风路径，提前警告沿海城镇。",
    [
      { q: "Where do massive rotating hurricanes form?", options: ["Over warm ocean waters", "On icy mountains", "In cold deserts", "Over dry land"], correct: 0 },
      { q: "What feeds moisture into the rising air of a hurricane?", options: ["Evaporating warm water", "Rain drops", "Ocean currents", "Cold wind"], correct: 0 },
      { q: "What is the calm central area of a hurricane called?", options: ["The eye", "The core", "The hub", "The peak"], correct: 0 },
      { q: "How do meteorologists track hurricane paths to warn towns?", options: ["Using satellites", "Using airplanes", "With weather balloons", "Using ships"], correct: 0 }
    ]
  ),
  createPassage(339, 'medium', 38, "The Amazon Rainforest", "亚马逊雨林",
    "The Amazon rainforest is the largest tropical wilderness area on planet Earth. It spans nine South American countries and produces huge amounts of global oxygen. Millions of unique plant and animal species thrive under the dense forest canopy. Protecting the Amazon is vital for absorbing carbon dioxide and stabilizing global climate.",
    "亚马逊雨林是地球上最大的热带荒野地区。它横跨九个南美洲国家，产生大量的全球氧气。数以百万计的独特植物和动物物种在稠密的森林树冠下茁壮成长。保护亚马逊对于吸收二氧化碳和稳定全球气候至关重要。",
    [
      { q: "What is the Amazon rainforest known as?", options: ["Largest tropical wilderness on Earth", "Smallest forest", "Oldest desert", "Coldest park"], correct: 0 },
      { q: "How many South American countries does the Amazon span?", options: ["Nine countries", "Five countries", "Seven countries", "Twelve countries"], correct: 0 },
      { q: "Where do millions of plant and animal species thrive?", options: ["Under the dense forest canopy", "In rivers", "On mountains", "In desert"], correct: 0 },
      { q: "Why is protecting the Amazon vital for Earth's climate?", options: ["Absorbs carbon dioxide and stabilizes climate", "Stops rain", "Makes weather hot", "Cools oceans"], correct: 0 }
    ]
  ),
  createPassage(340, 'medium', 39, "The Hubble Space Telescope", "哈勃空间望远镜",
    "The Hubble Space Telescope was launched into Earth orbit in nineteen ninety. Positioned high above atmospheric distortion, it captures crystal clear images of deep space. Hubble has helped astronomers determine the precise age of our universe. Its breathtaking photos of colorful nebulae and galaxies continue to inspire scientists.",
    "哈勃空间望远镜于一九九〇年发射进入地球轨道。它被安置在大气干扰的高空，捕捉深空水晶般清晰的图像。哈勃帮助天文学家确定了我们宇宙的精确年龄。它拍摄的五彩斑斓星云和星系的令人惊叹的照片继续激励着科学家。",
    [
      { q: "When was the Hubble Space Telescope launched?", options: ["In 1990", "In 1980", "In 2000", "In 1975"], correct: 0 },
      { q: "Why can Hubble capture crystal clear images of deep space?", options: ["Positioned high above atmospheric distortion", "It has big lights", "It is near stars", "It moves fast"], correct: 0 },
      { q: "What important discovery did Hubble help astronomers make?", options: ["Determine precise age of universe", "Find water on moon", "Discover new sun", "Measure Earth"], correct: 0 },
      { q: "What photos taken by Hubble continue to inspire scientists?", options: ["Colorful nebulae and galaxies", "Moon craters", "Earth cities", "Sun spots"], correct: 0 }
    ]
  ),

  // --- HARD (10 passages, 4 sentences, 5 questions) ---
  createPassage(341, 'hard', 40, "Wind Energy Physics", "风能物理学",
    "Wind power utilizes the kinetic energy of moving air masses across Earth's surface. Solar radiation heats land and ocean surfaces unevenly, causing atmospheric pressure differences. As air flows from high to low pressure zones, giant wind turbine blades spin. Generators convert this mechanical motion into clean electrical current without carbon emissions.",
    "风力发电利用跨越地球表面的流动气团的动能。太阳辐射对陆地和海洋表面的加热不均匀，造成大气压力差异。当空气从高压区流向低压区时，巨型风力发电机叶片旋转。发电机将这种机械运动转化为干净的电流，而不会产生碳排放。",
    [
      { q: "What type of energy from air masses does wind power utilize?", options: ["Kinetic energy", "Heat energy", "Chemical energy", "Potential energy"], correct: 0 },
      { q: "What causes atmospheric pressure differences across Earth?", options: ["Uneven solar radiation heating surfaces", "Ocean tides", "Earth's rotation", "Rainfall"], correct: 0 },
      { q: "How does air flow between pressure zones?", options: ["From high to low pressure zones", "From low to high", "In circles only", "Upwards only"], correct: 0 },
      { q: "What converts turbine mechanical motion into electrical current?", options: ["Generators", "Silicon cells", "Transformers", "Batteries"], correct: 0 },
      { q: "What environmental advantage does wind power possess?", options: ["Generates electricity without carbon emissions", "Cools atmosphere", "Makes rain", "Stops wind"], correct: 0 }
    ]
  ),
  createPassage(342, 'hard', 41, "The Ocean Tides", "海洋潮汐",
    "Ocean tides are the periodic rising and falling of sea levels worldwide. They are caused primarily by the gravitational pull of the moon and sun. High tides occur on coastal shores aligned with the moon's position. Tidal power stations capture this predictable water movement to generate green electricity.",
    "海洋潮汐是全世界海平面定期升降的现象。它们主要是由月球和太阳的万有引力引起的。高潮发生在与月球位置对齐的沿海海岸上。潮汐发电站捕捉这种可预测的水流运动来产生绿色电力。",
    [
      { q: "What are ocean tides?", options: ["Periodic rising and falling of sea levels", "Underwater earthquakes", "Big storm waves", "Ocean currents"], correct: 0 },
      { q: "What primarily causes ocean tides?", options: ["Gravitational pull of moon and sun", "Wind blowing", "Earth rotation", "Hot water"], correct: 0 },
      { q: "Where do high tides occur on Earth?", options: ["Coastal shores aligned with moon's position", "Equator only", "Poles only", "In lakes"], correct: 0 },
      { q: "What do tidal power stations capture to generate green electricity?", options: ["Predictable water movement", "Wave splashing", "Sunlight on water", "Wind over sea"], correct: 0 },
      { q: "How is tidal water movement described?", options: ["Predictable", "Random", "Dangerous", "Slow"], correct: 0 }
    ]
  ),
  createPassage(343, 'hard', 42, "Bioluminescence in Nature", "自然界中的生物发光",
    "Bioluminescence is light produced by living organisms through chemical reactions. Fireflies use rhythmic light flashes to attract mates on warm summer nights. Deep sea anglerfish dangle glowing lures in pitch darkness to catch unsuspecting prey. Scientists study these natural cold light reactions to develop advanced medical imaging.",
    "生物发光是生物通过化学反应产生的光。萤火虫在温暖的夏夜利用有节奏的闪光来吸引配偶。深海鮟鱇鱼在漆黑的夜里悬挂发光的诱饵来捕捉毫无防备的猎物。科学家研究这些自然冷光反应，以开发先进的医学成像。",
    [
      { q: "How do living organisms produce bioluminescent light?", options: ["Through chemical reactions inside body", "Absorbing sunlight", "Electric shocks", "Reflecting moon"], correct: 0 },
      { q: "Why do fireflies use rhythmic light flashes on summer nights?", options: ["To attract mates", "To scare predators", "To find food", "To keep warm"], correct: 0 },
      { q: "How do anglerfish hunt in the pitch dark deep sea?", options: ["Dangle glowing lures to catch prey", "Swim fast", "Use echolocation", "Wait in mud"], correct: 0 },
      { q: "What type of light reaction is bioluminescence?", options: ["Natural cold light reaction", "Hot thermal light", "Laser light", "Solar beam"], correct: 0 },
      { q: "How do scientists apply studies of bioluminescence?", options: ["Develop advanced medical imaging", "Make lamps", "Build solar panels", "Light cities"], correct: 0 }
    ]
  ),
  createPassage(344, 'hard', 43, "The History of Aviation", "航空的历史",
    "Humans dreamed of soaring like birds throughout centuries of historic aviation development. In nineteen hundred and three, the Wright brothers achieved the first powered flight. Their motorized aircraft flew twelve seconds over the windswept dunes of Kitty Hawk. Today modern jet liners carry hundreds of passengers across oceans in hours.",
    "在几个世纪的历史航空发展中，人类梦想着像鸟儿一样翱翔。一九〇三年，莱特兄弟实现了第一次动力飞行。他们的机动飞机在基蒂霍克被风吹拂的沙丘上飞了十二秒。今天，现代喷气客机在几个小时内将数百名乘客送过大洋。",
    [
      { q: "What long-held dream did humans pursue in aviation?", options: ["Soaring like birds", "Traveling to moon", "Swimming underwater", "Building towers"], correct: 0 },
      { q: "Who achieved the first powered aircraft flight in 1903?", options: ["The Wright brothers", "Alexander Bell", "Thomas Edison", "Henry Ford"], correct: 0 },
      { q: "How long did the Wright brothers' first motorized flight last?", options: ["Twelve seconds", "One hour", "Five minutes", "Ten minutes"], correct: 0 },
      { q: "Where did the historic first flight take place?", options: ["Windswept dunes of Kitty Hawk", "In Chicago", "In London", "On mountain peak"], correct: 0 },
      { q: "How do modern jet liners impact transoceanic travel today?", options: ["Carry hundreds of passengers across oceans in hours", "Take weeks", "Are dangerous", "Carry cargo only"], correct: 0 }
    ]
  ),
  createPassage(345, 'hard', 44, "The Physics of Rainbows", "彩虹的物理学",
    "Rainbows are optical phenomena caused by sunlight refracting through airborne water droplets. As sunlight enters a raindrop, white light bends and splits into spectral colors. Reflection inside the droplet bounces colored rays back toward the observer's eyes. This creates a spectacular multi-colored circular arch across the rain-cleared sky.",
    "彩虹是由阳光在空气中的水滴中折射而引起的显光学现象。当阳光进入雨滴时，白光弯曲并分解成光谱颜色。水滴内部的反射将彩色光线弹回观察者的眼睛。这在雨过天晴的天空上创造了一个壮观的色彩斑斓的圆形拱门。",
    [
      { q: "What optical process causes rainbows in the sky?", options: ["Sunlight refracting through airborne water droplets", "Sun reflecting off clouds", "Moon light", "Wind friction"], correct: 0 },
      { q: "What happens when white sunlight enters a raindrop?", options: ["Bends and splits into spectral colors", "Turns black", "Disappears", "Heats up"], correct: 0 },
      { q: "What role does internal reflection inside the droplet play?", options: ["Bounces colored rays toward observer's eyes", "Absorbs light", "Makes rain fall", "Cools air"], correct: 0 },
      { q: "What shape does a rainbow form across the sky?", options: ["Spectacular multi-colored circular arch", "Straight line", "Square", "Spiral"], correct: 0 },
      { q: "When are rainbows visible in nature?", options: ["Across rain-cleared sky with sun", "At midnight", "In heavy fog", "During snowstorms"], correct: 0 }
    ]
  ),
  createPassage(346, 'hard', 45, "The Antarctic Continent", "南极大陆",
    "Antarctica is the coldest, driest, and windiest continent on planet Earth. Over ninety-eight percent of its land surface is buried under thick ice sheets. Despite harsh conditions, emperor penguins and Weddell seals thrive along coastal margins. International treaties protect Antarctica as a scientific preserve dedicated to peace.",
    "南极洲是地球上最冷、最干燥、风最大的大陆。其超过百分之九十八的陆地表面埋在厚厚的冰盖之下。尽管条件恶劣，帝企鹅和韦德尔氏海豹仍沿着海岸边缘茁壮成长。国际条约保护南极洲作为一个致力于和平的科学保护区。",
    [
      { q: "How is the climate of Antarctica described?", options: ["Coldest, driest, windiest continent", "Warm and rainy", "Tropical jungle", "Hot desert"], correct: 0 },
      { q: "What percentage of Antarctica's land is buried under ice?", options: ["Over ninety-eight percent", "Fifty percent", "Seventy percent", "Thirty percent"], correct: 0 },
      { q: "Which animals thrive along Antarctic coastal margins?", options: ["Emperor penguins and Weddell seals", "Polar bears and foxes", "Whales only", "Sea gulls"], correct: 0 },
      { q: "How do international treaties protect Antarctica today?", options: ["As a scientific preserve dedicated to peace", "As a mining site", "As a tourist city", "As a military base"], correct: 0 },
      { q: "What covers almost the entire Antarctic land surface?", options: ["Thick ice sheets", "Rock deserts", "Volcanic ash", "Deep water"], correct: 0 }
    ]
  ),
  createPassage(347, 'hard', 46, "The Solar System Formation", "太阳系的形成",
    "Our solar system formed four point six billion years ago from gas and dust. A giant rotating interstellar cloud collapsed under its own gravitational force. Most matter pulled into the center to ignite our glowing sun. Remaining dust collided over millions of years to form the orbiting planets.",
    "我们的太阳系形成于四十 point 六亿年前的气体和尘埃。巨大旋转的星际云在其自身万有引力作用下坍缩。大部分物质被拉入中心，点燃了我们发光的太阳。剩余的尘埃在数百万年中碰撞，形成了运行的行星。",
    [
      { q: "When did our solar system form?", options: ["4.6 billion years ago", "1 million years ago", "100 billion years ago", "10,000 years ago"], correct: 0 },
      { q: "What collapsed under gravitational force to form the solar system?", options: ["Giant rotating interstellar cloud of gas and dust", "A dying star", "A black hole", "A comet"], correct: 0 },
      { q: "What formed when most matter pulled into the center?", options: ["Our glowing sun", "Jupiter", "Earth", "The moon"], correct: 0 },
      { q: "How did orbiting planets form over millions of years?", options: ["Remaining dust collided and clumped together", "Sun split apart", "Comets exploded", "Gases cooled"], correct: 0 },
      { q: "What force pulled matter into the center of the cloud?", options: ["Gravitational force", "Magnetic force", "Nuclear force", "Wind power"], correct: 0 }
    ]
  ),
  createPassage(348, 'hard', 47, "The Invention of Paper", "造纸术的发明",
    "Cai Lun invented paper making in China during the Han Dynasty around AD 105. He combined mulberry bark, hemp fibers, and old fishing nets in water. The mixture was mashed into pulp, spread on bamboo screens, and dried. This cheap durable material revolutionized record keeping and spread literacy worldwide.",
    "蔡伦在公元105年前后的汉朝在中国发明的造纸术。他在水里结合了桑树皮、麻纤维和旧鱼网。将混合物捣成浆，摊在竹筛上，晒干。这种便宜耐用的材料彻底改变了记录保持，并在全世界传播了识字率。",
    [
      { q: "Who invented paper making in China during the Han Dynasty?", options: ["Cai Lun", "Bi Sheng", "Zhang Heng", "Shen Kuo"], correct: 0 },
      { q: "What raw materials did Cai Lun combine in water?", options: ["Mulberry bark, hemp fibers, old fishing nets", "Wood pulp and glue", "Cotton and silk", "Straw and mud"], correct: 0 },
      { q: "How was the mashed pulp dried into paper sheets?", options: ["Spread on bamboo screens and dried", "Baked in oven", "Pressed with iron", "Sun-dried in water"], correct: 0 },
      { q: "What historical impact did the invention of paper have?", options: ["Revolutionized record keeping and spread literacy", "Made clothes cheaper", "Ended writing", "Built houses"], correct: 0 },
      { q: "When was paper making invented in ancient China?", options: ["Around AD 105", "AD 1000", "500 BC", "AD 1500"], correct: 0 }
    ]
  ),
  createPassage(349, 'hard', 48, "Plant Adaptation in Deserts", "沙漠中植物的适应性",
    "Desert plants develop specialized adaptations to survive extreme heat and drought. Cacti feature thick waxy stems that store water and sharp spines instead of leaves. Their shallow widespread root systems collect surface rainwater before it evaporates quickly. These unique features allow cacti to thrive in arid desert regions.",
    "沙漠植物开发出专门的适应性，以在酷热和干旱中生存。仙人掌的特点是厚厚的蜡质茎储存水，针状刺代替了叶子。它们浅而广泛的根系在地表雨水快速蒸发前进行收集。这些独特的特征使仙人掌能够在干旱的沙漠地区茁壮成长。",
    [
      { q: "Why do desert plants develop specialized adaptations?", options: ["Survive extreme heat and drought", "Grow tall", "Attract insects", "Produce fruit fast"], correct: 0 },
      { q: "What features help cacti store water in deserts?", options: ["Thick waxy stems and sharp spines", "Broad green leaves", "Deep taproots", "Flowers"], correct: 0 },
      { q: "How do shallow widespread root systems help cacti?", options: ["Collect surface rainwater before it evaporates", "Anchor in deep mud", "Reach groundwater", "Store food"], correct: 0 },
      { q: "What replaced traditional leaves on cacti to reduce water loss?", options: ["Sharp spines", "Waxy scales", "Needles", "Bark"], correct: 0 },
      { q: "In what environment do cacti thrive due to their unique features?", options: ["Arid desert regions", "Tropical jungles", "Cold tundras", "Swamps"], correct: 0 }
    ]
  ),
  createPassage(350, 'hard', 49, "The Science of Hurricanes", "飓风的科学",
    "Hurricanes are violent rotating tropical cyclones that form over warm ocean waters. Evaporating seawater feeds moisture into air currents, driving winds up to high speeds. As storms spin, a calm circular center called the eye develops. Satellite radar tracks hurricane paths to issue early evacuation warnings.",
    "飓风是在温暖的海洋水域上形成的剧烈旋转的热带气旋。蒸发的海水将水分馈送到气流中，驱使风速达到极高速度。随着风暴的旋转，一个被称为眼区的平静圆形中心显现出来。卫星雷达跟踪飓风路径，以发布早期疏散警告。",
    [
      { q: "What are hurricanes?", options: ["Violent rotating tropical cyclones over warm oceans", "Tornadoes on land", "Winter snowstorms", "Earthquake waves"], correct: 0 },
      { q: "What fuels the strong winds of a hurricane?", options: ["Evaporating seawater feeding moisture into air", "Cold air from poles", "Volcanic heat", "Ocean tides"], correct: 0 },
      { q: "What is the calm circular center of a hurricane called?", options: ["The eye", "The core", "The vortex", "The peak"], correct: 0 },
      { q: "How do meteorologists issue early evacuation warnings?", options: ["Satellite radar tracking hurricane paths", "Listening to wind", "Using ships", "Weather balloons"], correct: 0 },
      { q: "Over what type of water do hurricanes form?", options: ["Warm ocean waters", "Cold polar seas", "Freshwater lakes", "Rivers"], correct: 0 }
    ]
  ),

  // --- SUPER HARD (10 passages, 5 sentences, 6 questions) ---
  createPassage(351, 'super_hard', 50, "Renewable Energy Technology", "可再生能源技术",
    "Renewable energy technologies harness continuous natural processes to generate clean electricity. Solar photovoltaic panels convert sunlight photons directly into direct electric current using silicon. Wind turbines capture moving atmospheric kinetic energy with large aerodynamic blades to drive generators. Hydroelectric facilities utilize gravitational water flow through turbines to produce reliable green power. Transitioning to renewable energy mitigates global climate change and reduces environmental pollution.",
    "可再生能源技术利用连续的自然过程产生清洁电力。太阳能光伏电池板利用硅将阳光光子直接转化为直流电。风力发电机利用大型空气动力学叶片捕捉流动的重大气动能来驱动发电机。水力发电设施利用通过水轮机的重力水流来产生可靠的绿色电力。转向可再生能源可以缓解全球气候变化并减少环境污染。",
    [
      { q: "What do renewable energy technologies harness to generate electricity?", options: ["Continuous natural processes", "Fossil fuels", "Nuclear materials", "Coal reserves"], correct: 0 },
      { q: "What material in solar panels converts photons into direct electric current?", options: ["Silicon", "Copper", "Aluminum", "Silver"], correct: 0 },
      { q: "How do wind turbines capture atmospheric kinetic energy?", options: ["Large aerodynamic blades driving generators", "Solar reflectors", "Heat sinks", "Water wheels"], correct: 0 },
      { q: "What force powers hydroelectric facilities through turbines?", options: ["Gravitational water flow", "Wind pressure", "Solar radiation", "Geothermal heat"], correct: 0 },
      { q: "What global environmental benefit results from transitioning to renewable energy?", options: ["Mitigates climate change and reduces pollution", "Makes weather cold", "Stops rainfall", "Creates fossil fuels"], correct: 0 },
      { q: "What type of electrical current do solar panels produce directly?", options: ["Direct electric current", "Alternating current", "Static charge", "Magnetic field"], correct: 0 }
    ]
  ),
  createPassage(352, 'super_hard', 51, "The Great Barrier Reef Ecosystem", "大堡礁生态系统",
    "The Great Barrier Reef off Australia is the largest living structure on Earth. Thousands of individual coral reefs are constructed by tiny reef-building coral polyps. This vibrant marine habitat supports over fifteen hundred fish species, sea turtles, and whales. Coral polyps live in symbiotic harmony with microscopic algae that produce food through photosynthesis. Protecting the reef from climate warming and ocean acidification is critical for global marine biodiversity.",
    "澳大利亚海岸的大堡礁是地球上最大的活体建筑。数以千计的独立珊瑚礁是由微小的造礁珊瑚虫建造的。这个充满生机的海洋栖息地支持着一千五百多种鱼类、海龟和鲸鱼。珊瑚虫与通过光合作用产生食物的微小藻类共生和谐地生活在一起。保护珊瑚礁免受气候变暖和海洋酸化的影响，对全球海洋生物多样性至关重要。",
    [
      { q: "What distinction does the Great Barrier Reef hold on Earth?", options: ["Largest living structure on Earth", "Oldest desert", "Highest mountain", "Deepest trench"], correct: 0 },
      { q: "What organisms construct the individual coral reefs?", options: ["Tiny reef-building coral polyps", "Giant whales", "Sea turtles", "Sharks"], correct: 0 },
      { q: "How many fish species does this vibrant marine habitat support?", options: ["Over fifteen hundred fish species", "Five hundred", "One hundred", "Ten thousand"], correct: 0 },
      { q: "With what organism do coral polyps live in symbiotic harmony?", options: ["Microscopic algae producing food by photosynthesis", "Seaweed", "Bacteria", "Plankton"], correct: 0 },
      { q: "Why is protecting the reef critical for our planet?", options: ["Preserving global marine biodiversity", "Helping trade ships", "Increasing fishing", "Creating islands"], correct: 0 },
      { q: "What threats jeopardize the Great Barrier Reef?", options: ["Climate warming and ocean acidification", "Overcrowding", "Tides", "Rainfall"], correct: 0 }
    ]
  ),
  createPassage(353, 'super_hard', 52, "The History of Printing Press", "印刷机的历史",
    "Movable type printing was pioneered by Bi Sheng in eleventh century Song Dynasty China. He fashioned durable individual Chinese characters out of baked ceramic clay blocks. In the 1440s, Johannes Gutenberg developed the European mechanical printing press using metal type. This groundbreaking innovation allowed mass production of uniform books and accelerated the Renaissance. The printing press democratized access to information and laid the foundation for modern education.",
    "活字印刷术由毕昇于十一世纪中国宋朝开创。他用烧制好的陶瓷粘土块制作了耐用的单个汉字。在15世纪40年代，约翰内斯·谷登堡利用金属活字发明了欧洲机械印刷机。这一突破性的创新允许大批量生产统一的书籍，并加速了文艺复兴。印刷机使获取信息的途径民主化，并为现代教育奠定了基础。",
    [
      { q: "Who pioneered movable type printing during Song Dynasty China?", options: ["Bi Sheng", "Cai Lun", "Shen Kuo", "Wang Anshi"], correct: 0 },
      { q: "What material did Bi Sheng use to fashion durable character blocks?", options: ["Baked ceramic clay blocks", "Hard wood", "Carved stone", "Cast iron"], correct: 0 },
      { q: "What innovation did Johannes Gutenberg develop in the 1440s?", options: ["European mechanical printing press with metal type", "Paper making", "Steam engine", "Telegraph"], correct: 0 },
      { q: "What major European historical movement was accelerated by the printing press?", options: ["The Renaissance", "The Industrial Revolution", "The Middle Ages", "The Space Age"], correct: 0 },
      { q: "How did the printing press transform human society?", options: ["Democratized access to information and education", "Stopped writing", "Made books expensive", "Ended schooling"], correct: 0 },
      { q: "In what century did Bi Sheng invent clay movable type?", options: ["Eleventh century", "Fifteenth century", "Ninth century", "Seventh century"], correct: 0 }
    ]
  ),
  createPassage(354, 'super_hard', 53, "The Science of Photosynthesis", "光合作用的科学",
    "Photosynthesis is the biochemical mechanism by which green plants synthesize organic nutrients. Chlorophyll pigments inside leaf chloroplasts absorb solar energy from incoming sunlight. Plant roots draw water and dissolved mineral ions up from the surrounding soil matrix. Solar energy drives reactions that convert carbon dioxide and water into glucose and oxygen gas. This essential process forms the primary foundation of food chains and atmospheric oxygen.",
    "光合作用是绿色植物合成有机营养素的生物化学机制。叶肉叶绿体内部的叶绿素色素吸收来自入射阳光的太阳能。植物根部从周围的土壤基质中吸取水和溶解的矿物质离子。太阳能驱动反应，将二氧化碳和水转化为葡萄糖和氧气。这一至关重要的过程构成了食物链和大气氧气的主要基础。",
    [
      { q: "What is photosynthesis defined as in plant biology?", options: ["Biochemical mechanism synthesizing organic nutrients", "Water loss process", "Cell division", "Root expansion"], correct: 0 },
      { q: "What pigment inside leaf chloroplasts absorbs solar energy?", options: ["Chlorophyll pigments", "Carotenoids", "Melanin", "Hemoglobin"], correct: 0 },
      { q: "What do plant roots draw up from the surrounding soil matrix?", options: ["Water and dissolved mineral ions", "Carbon dioxide", "Oxygen", "Glucose"], correct: 0 },
      { q: "What chemical products result from solar energy driven reactions?", options: ["Glucose sugar and oxygen gas", "Water and nitrogen", "Starch and carbon", "Salt and water"], correct: 0 },
      { q: "Why is photosynthesis considered the primary foundation of nature?", options: ["Sustains food chains and atmospheric oxygen", "Creates weather", "Forms soil", "Makes rain"], correct: 0 },
      { q: "Where in plant cells do chlorophyll pigments reside?", options: ["Inside leaf chloroplasts", "In cell wall", "In root hairs", "In stem bark"], correct: 0 }
    ]
  ),
  createPassage(355, 'super_hard', 54, "Robotic Exploration of Mars", "火星的机器人探索",
    "Mars has been the target of extensive interplanetary robotic exploration for decades. Space agencies deploy advanced autonomous rovers like Perseverance to traverse its barren landscape. Equipped with sophisticated spectrometers and drills, rovers analyze ancient Martian rock strata. Scientists seek biosignature evidence of past microbial life in dried river deltas and craters. Discoveries from robotic missions pave the way for eventual crewed human missions to Mars.",
    "几十年来，火星一直是广泛的际机器人探索的目标。太空机构部署了像“毅力号”这样的先进自主漫游车来穿越其贫瘠的景观。配备先进光谱仪和钻头的漫游车分析古老的火星岩层。科学家在干涸的河流三角洲和环形山中寻找过去微小生命的存在生物标志迹象。机器人任务的发现为最终的人类载人火星任务铺平了道路。",
    [
      { q: "What target has been explored by autonomous rovers for decades?", options: ["The planet Mars", "The moon", "Venus", "Jupiter"], correct: 0 },
      { q: "What autonomous rover is deployed to traverse Mars' barren landscape?", options: ["Perseverance", "Voyager", "Hubble", "Apollo"], correct: 0 },
      { q: "What scientific instruments do rovers carry to analyze rock strata?", options: ["Sophisticated spectrometers and drills", "Telescopes", "Radars only", "Cameras only"], correct: 0 },
      { q: "Where do scientists seek biosignature evidence of past life?", options: ["Dried river deltas and craters", "High mountains", "Ice caps", "Atmosphere"], correct: 0 },
      { q: "What eventual milestone do robotic Mars discoveries pave the way for?", options: ["Crewed human missions to Mars", "Space tourist flights", "Mining asteroids", "Building moon base"], correct: 0 },
      { q: "What type of ancient life evidence are scientists seeking?", options: ["Microbial life biosignatures", "Plant fossils", "Animal bones", "Civilization artifacts"], correct: 0 }
    ]
  ),
  createPassage(356, 'super_hard', 55, "Deep Sea Bioluminescence", "深海生物发光",
    "Deep ocean environments beyond two hundred meters exist in total perpetual darkness. Organisms inhabiting this high pressure zone evolved bioluminescence through specialized enzymatic reactions. Luciferin proteins react with oxygen catalyzed by luciferase enzymes to emit cold light. Marine animals utilize luminescent flashes for camouflage, defense, and luring prey. Studying bioluminescent chemistry aids scientific innovation in medical imaging and biotechnology.",
    "二百米以外的深海环境处于完全永久的黑暗中。居住在这个高压区里的生物通过专门的酶反应演化出生物发光。荧光素蛋白在荧光素酶催化下与氧气反应发出冷光。海洋动物利用发光闪烁来进行伪装、防御和诱捕猎物。研究生物发光化学有助于医学成像和生物技术方面的科学创新。",
    [
      { q: "Beyond what depth do ocean environments exist in perpetual darkness?", options: ["Beyond two hundred meters", "Fifty meters", "One hundred meters", "Five hundred meters"], correct: 0 },
      { q: "What enzymatic reaction produces bioluminescent light in marine organisms?", options: ["Luciferin reacting with oxygen via luciferase", "Photosynthesis", "Cellular respiration", "Fermentation"], correct: 0 },
      { q: "What type of light energy is emitted by bioluminescent reactions?", options: ["Cold light", "Thermal radiation", "Ultraviolet light", "Infrared heat"], correct: 0 },
      { q: "For what survival purposes do marine animals utilize light flashes?", options: ["Camouflage, defense, luring prey", "Swimming faster", "Communication with birds", "Heating water"], correct: 0 },
      { q: "How does studying bioluminescent chemistry aid human science?", options: ["Innovations in medical imaging and biotechnology", "Building lasers", "Solar panel design", "Lighting cities"], correct: 0 },
      { q: "What key enzyme catalyzes the bioluminescent oxidation reaction?", options: ["Luciferase", "Amylase", "Polymerase", "Protease"], correct: 0 }
    ]
  ),
  createPassage(357, 'super_hard', 56, "The Physics of Aviation Flight", "航空飞行物理学",
    "Modern airplane flight relies on fundamental aerodynamic principles governed by physics. Aircraft wings are engineered with a curved airfoil cross-section that generates lift. As engines push the plane forward, air flows faster over the curved top surface. According to Bernoulli's principle, faster airflow creates lower pressure above the wing, lifting the aircraft. Balancing lift, weight, thrust, and drag enables stable controlled flight across long distances.",
    "现代飞机飞行依赖于受物理学支配的基本空气动力学原理。飞机机翼被设计成弯曲的翼型截面，产生升力。当发动机推动飞机向前时，空气在弯曲的顶表面流动得更快。根据伯努利原理，较快的空气流在机翼上方创造出较小的压力，从而抬升飞机。平衡升力、重力、推力和阻力能够实现跨越长距离的稳定受控飞行。",
    [
      { q: "What physical principles govern modern aircraft flight?", options: ["Aerodynamic principles", "Thermodynamics", "Chemical kinetics", "Quantum mechanics"], correct: 0 },
      { q: "What wing cross-section shape is engineered to generate flight lift?", options: ["Curved airfoil cross-section", "Flat rectangle", "Sharp triangle", "Circle"], correct: 0 },
      { q: "According to Bernoulli's principle, what creates lower pressure above the wing?", options: ["Faster airflow over curved top surface", "Hot air", "Engine exhaust", "Slow airflow below"], correct: 0 },
      { q: "What four physical forces must be balanced during controlled flight?", options: ["Lift, weight, thrust, drag", "Speed, height, mass, gravity", "Power, fuel, wind, friction", "Length, width, height, weight"], correct: 0 },
      { q: "How does lower pressure above the wing affect the aircraft?", options: ["Lifts the aircraft into air", "Pushes aircraft down", "Slows aircraft", "Stops engines"], correct: 0 },
      { q: "What pushes the airplane forward through air to create airflow?", options: ["Aircraft engines", "Rudder", "Flaps", "Tail fin"], correct: 0 }
    ]
  ),
  createPassage(358, 'super_hard', 57, "The Amazon Basin Ecosystem", "亚马逊流域生态系统",
    "The Amazon Basin encompasses the world's largest tropical rainforest and river network. Its vast rainforest canopy acts as a critical global carbon sink, regulating climate. Over one-tenth of all known species on Earth inhabit this rich biodiversity hotspot. Indigenous communities have lived in harmony with the rainforest environment for centuries. Combating deforestation in the Amazon is essential for preserving planetary climate stability.",
    "亚马逊流域包含世界上最大的热带雨林和河流网络。其辽阔的雨林树冠充当着至关重要的全球碳汇，调节着气候。地球上超过十分之一的已知物种居住在这个丰富的生物多样性热点地区。几个世纪以来，土著社区一直与雨林环境和谐相处。在亚马逊打击森林砍伐对于保持地球气候稳定至关重要。",
    [
      { q: "What natural features does the Amazon Basin encompass?", options: ["World's largest tropical rainforest and river network", "Desert and mountains", "Grassy savannas", "Icy tundra"], correct: 0 },
      { q: "What crucial climate function does the Amazon canopy perform?", options: ["Acts as a critical global carbon sink", "Produces rain clouds", "Cools oceans", "Reflects sunlight"], correct: 0 },
      { q: "What fraction of all known Earth species inhabit the Amazon Basin?", options: ["Over one-tenth of all species", "One-half", "One-fourth", "One-hundredth"], correct: 0 },
      { q: "Who has lived in harmony with the Amazon rainforest for centuries?", options: ["Indigenous communities", "Modern miners", "Loggers", "Tourists"], correct: 0 },
      { q: "Why is combating deforestation in the Amazon essential?", options: ["Preserving planetary climate stability", "Increasing farmland", "Building highways", "Mining gold"], correct: 0 },
      { q: "How does the Amazon rainforest help regulate Earth's climate?", options: ["By absorbing atmospheric carbon", "By making wind", "By melting ice", "By shading land"], correct: 0 }
    ]
  ),
  createPassage(359, 'super_hard', 58, "The Architecture of Pyramids", "金字塔的建筑学",
    "The Great Pyramid of Giza stands as a monumental masterpiece of ancient structural engineering. Constructed during the reign of Pharaoh Khufu, it required over two million stone blocks. Ancient Egyptian builders aligned the pyramid's base precisely with true cardinal compass points. Ramps, levers, and massive workforce coordination enabled the placement of granite blocks weighing tons. Today architectural historians continue studying the precise construction techniques of these ancient monuments.",
    "吉萨大金字塔是古代结构工程的巨作。它是在法老夫统治时期建造的，需要二百多万块石块。古埃及建筑工人将金字塔的底部精确地与真正的基准指南针方位对齐。斜坡、杠杆和大规模的劳动力协调使得放置重达几吨的花岗岩石块成为可能。今天，建筑历史学家继续研究这些古代遗迹的精确建造技术。",
    [
      { q: "Which ancient structure stands as a masterpiece of structural engineering?", options: ["The Great Pyramid of Giza", "The Parthenon", "Colosseum", "Stonehenge"], correct: 0 },
      { q: "During whose reign was the Great Pyramid constructed?", options: ["Pharaoh Khufu", "Tutankhamun", "Ramses II", "Cleopatra"], correct: 0 },
      { q: "How many stone blocks were required to construct the Great Pyramid?", options: ["Over two million stone blocks", "One hundred thousand", "Fifty thousand", "Ten million"], correct: 0 },
      { q: "With what did ancient Egyptian builders precisely align the pyramid's base?", options: ["True cardinal compass points", "The moon", "The river flow", "Sunset angle"], correct: 0 },
      { q: "What tools and coordination enabled moving multi-ton granite blocks?", options: ["Ramps, levers, massive workforce coordination", "Cranes and trucks", "Elephants", "Steam engines"], correct: 0 },
      { q: "What aspect of ancient pyramids do architectural historians continue studying?", options: ["Precise construction techniques", "Secret gold rooms", "Alien myths", "Paint colors"], correct: 0 }
    ]
  ),
  createPassage(360, 'super_hard', 59, "The Science of Hurricanes", "台风的科学",
    "Hurricanes are immense thermodynamic storm systems generated over warm tropical ocean waters. Solar heating causes massive sea water evaporation, fueling humid rising air currents. High altitude winds and Earth's Coriolis rotation force the storm into a spinning vortex. The hurricane's central eye remains remarkably calm while surrounding eyewall winds reach extreme speeds. Advanced satellite meteorology allows scientists to model hurricane trajectories and issue life-saving evacuation advisories.",
    "飓风是在温暖的热带海洋水域上产生的巨大的热动力风暴系统。太阳加热引起大量海水蒸发，为潮湿的上升气流提供燃料。高空风和地球的科里奥利旋转迫使风暴形成旋转涡流。飓风的中心眼保持着非凡的平静，而周围的眼墙风速达到了极高速度。先进的卫星气象学允许科学家对飓风轨迹进行建模，并发布救命的疏散建议。",
    [
      { q: "What type of storm systems are hurricanes in thermodynamics?", options: ["Immense thermodynamic storm systems over warm oceans", "Local rain showers", "Cold winter blizzards", "Sandstorms"], correct: 0 },
      { q: "What fuels the humid rising air currents of a hurricane?", options: ["Massive sea water evaporation from solar heating", "Wind from land", "Ice melting", "Volcano smoke"], correct: 0 },
      { q: "What force together with high altitude winds causes the storm to spin?", options: ["Earth's Coriolis rotation", "Gravity", "Ocean tides", "Magnetic fields"], correct: 0 },
      { q: "Which part of the hurricane remains remarkably calm?", options: ["The central eye", "The eyewall", "Outer bands", "Ocean surface"], correct: 0 },
      { q: "How do advanced satellite meteorology systems save lives?", options: ["Model trajectories and issue evacuation advisories", "Stop storms", "Cool water", "Block wind"], correct: 0 },
      { q: "Where do surrounding eyewall winds reach extreme speeds?", options: ["Around the central eye", "In upper atmosphere", "Miles away", "Underwater"], correct: 0 }
    ]
  )
];

const fileContent = `export const readingsG56 = ${JSON.stringify(g56Data, null, 2)};\n`;
fs.writeFileSync('./readings_g56.js', fileContent, 'utf8');
console.log('Successfully generated Grade 5-6 reading passages in readings_g56.js!');
