// Reading-review layer: keeps the authored packs compact while ensuring the
// learner-facing text, translations, and question stems follow the curriculum rules.

const textOverrides = {
  151: {
    en: "Farmer Dan picks red apples on his apple farm each autumn. He puts the apples in big wooden boxes. Then he drives a green tractor to sell them at the market.",
    zh: "农夫丹每年秋天都在苹果园里摘红苹果。他把苹果放进大木箱里。然后，他开着绿色拖拉机去市场卖苹果。"
  },
  152: {
    en: "A big sea turtle swims in the warm blue sea. It uses its long flippers to swim past colorful coral. Later, it rests on the sand under the bright sun.",
    zh: "一只大海龟在温暖的蓝色大海里游泳。它用长长的鳍游过彩色的珊瑚。后来，它在明亮的太阳下躺在沙滩上休息。"
  },
  153: {
    en: "Dark clouds fill the sky on a cool Monday morning. Maya puts on her yellow raincoat and yellow boots. She splashes in clear puddles on her way to school.",
    zh: "一个凉爽的星期一早上，乌云布满天空。玛雅穿上黄色雨衣和黄色雨靴。她去学校的路上在清水坑里踩水。"
  },
  154: {
    en: "Students meet in the school hall for the yearly music show. Clara plays a song on her violin for the people there. Everyone claps when she finishes her song.",
    zh: "学生们在学校礼堂参加每年的音乐表演。克拉拉为大家拉小提琴。她演奏完后，大家都鼓掌。"
  },
  155: {
    en: "David and his dad put up a green tent by a clear forest stream. They make a small fire to cook sausages for dinner. At night, they look at bright stars in the sky.",
    zh: "大卫和爸爸在清澈的森林小溪边搭起绿色帐篷。他们生了小火，做香肠当晚饭。晚上，他们看天上的亮星星。"
  },
  156: {
    en: "A silver dolphin jumps high out of the shining sea. It does two flips and splashes back into the water. People on a tour boat clap and cheer.",
    zh: "一只银色海豚从闪亮的大海里高高跳起。它翻了两次身，又落回水里。游船上的人拍手欢呼。"
  },
  157: {
    en: "Farmers work under the autumn sun to cut wheat. Big yellow machines cut the dry wheat in the field. By evening, the barns are full of grain.",
    zh: "农民在秋天的阳光下收割小麦。黄色的大机器在田里割干小麦。到了晚上，谷仓里装满了粮食。"
  },
  158: {
    en: "The city library has many books on neat wooden shelves. Children sit at round tables to do schoolwork quietly. Library workers help people find books.",
    zh: "城市图书馆的整齐木书架上有很多书。孩子们坐在圆桌旁安静地做作业。图书管理员帮助大家找书。"
  },
  159: {
    en: "An artist puts soft gray clay on a turning wheel. She uses wet hands to make it into a round vase. After the hot oven, the vase turns blue.",
    zh: "一位艺术家把软软的灰色泥放在转盘上。她用湿手把它做成圆花瓶。放进热窑后，花瓶变成蓝色。"
  },
  160: {
    en: "Leo looks through his telescope on a clear summer night. He sees holes on the bright moon. He watches a shooting star move across the sky.",
    zh: "一个晴朗的夏夜，利奥用望远镜看天空。他看见明亮月亮上的坑。他看着一颗流星划过天空。"
  },
  201: {
    en: "Class Three students planted a small garden behind their school. They grew red tomatoes and green peas there. Everyone watered the vegetables after lunch.",
    zh: "三年级的学生在学校后面种了一个小菜园。他们在那里种了红番茄和青豌豆。每个人午饭后都给蔬菜浇水。"
  },
  202: {
    en: "Leo went to his uncle's farm with cows in the spring holiday. He fed the young cows warm milk from bottles. He watched fresh milk go into big metal buckets.",
    zh: "春假时，利奥去了叔叔的奶牛场。他用奶瓶里的温牛奶喂小牛。他看着新鲜牛奶装进大金属桶里。"
  },
  203: {
    en: "Sam and his father made a wooden birdhouse on Saturday afternoon. They painted the outside light blue and put on a small round roof. Then they hung it high on a thick tree branch.",
    zh: "星期六下午，山姆和爸爸做了一个木鸟屋。他们把外面刷成浅蓝色，还装上一个小圆屋顶。然后他们把它高高挂在粗树枝上。"
  },
  204: {
    en: "Honeybees fly across green fields to find sweet flower food. They do a special dance to tell other bees where to go. Their home stays full of honey when they work together.",
    zh: "蜜蜂飞过绿色田野去找甜甜的花蜜。它们跳特别的舞，告诉别的蜜蜂该去哪里。它们一起干活，蜂房里就有很多蜂蜜。"
  },
  205: {
    en: "Maya played by the sea on a hot summer afternoon. She put smooth, colorful shells in a yellow bucket. Before she left, she made a big sandcastle with a red flag.",
    zh: "炎热的夏日下午，玛雅在海边玩。她把光滑、彩色的贝壳放进黄色桶里。离开前，她做了一个插着红旗的大沙堡。"
  },
  206: {
    en: "Ben joined a new swimming class at the town center. His teacher showed him how to kick his legs and float on his back. In the third week, Ben swam safely across the shallow pool.",
    zh: "本在镇活动中心参加了初学游泳班。老师教他踢腿和仰面漂浮。到了第三周，本能安全地游过浅水池。"
  },
  207: {
    en: "Dolphins are smart animals that live together in warm sea water. They use clicks and whistles to talk under the water. Sometimes they jump high to play near boats.",
    zh: "海豚是聪明的动物，它们一起生活在温暖的海水里。它们用咔哒声和口哨声在水下说话。有时它们在船边高高跳起玩耍。"
  },
  208: {
    en: "Emma goes to the library near her home every Friday afternoon. She borrows storybooks about magic castles and old rainforest animals. The quiet place helps her read without noise.",
    zh: "艾玛每个星期五下午都去家附近的图书馆。她借关于魔法城堡和古老雨林动物的故事书。安静的地方让她能不受噪声打扰地阅读。"
  },
  209: {
    en: "Grandma and Lucy made a warm apple pie for dessert. They peeled red apples and mixed them with cinnamon. The house smelled very good while the pie baked in the oven.",
    zh: "奶奶和露西做了一个热苹果派当甜点。她们削了红苹果，还拌上肉桂粉。苹果派在烤箱里烤时，屋里闻起来很香。"
  },
  210: {
    en: "Oliver put his small telescope on the grass behind his house. At midnight, he looked at holes on the bright moon. He also saw shooting stars flash across the sky.",
    zh: "奥利弗把小望远镜放在房子后面的草地上。半夜，他看明亮月亮上的坑。他还看见流星闪过天空。"
  },
  211: {
    en: "Tom washed three sweet oranges and cut them in half. He squeezed the juice into a clean glass with ice. He drank the cold juice after his long bike ride.",
    zh: "汤姆洗了三个甜橙子，并把它们切成两半。他把果汁挤进装有冰的干净玻璃杯里。骑了很久的自行车后，他喝了冰果汁。"
  },
  212: {
    en: "Cool autumn wind blew colorful leaves off old trees in the park. Children used red and yellow leaves to make art. Then they jumped into a soft pile of leaves.",
    zh: "凉凉的秋风把彩色叶子从公园的老树上吹下来。孩子们用红叶和黄叶做手工。然后，他们跳进软软的一堆叶子里。"
  },
  213: {
    en: "Mia found a tiny gray kitten under a wooden bench. She took it home and gave it a small dish of milk. The happy kitten made a soft sound and slept in her lap.",
    zh: "米娅在一张木长凳下发现一只小灰猫。她把小猫带回家，给它一小碟牛奶。开心的小猫轻轻地叫着，在她腿上睡着了。"
  },
  214: {
    en: "David and his dad put up a green tent by a quiet river. At dusk, they cooked sweet marshmallows over a small fire. At night, they listened to crickets in the forest.",
    zh: "大卫和爸爸在安静的河边搭起绿色帐篷。黄昏时，他们在小火上烤甜棉花糖。晚上，他们听森林里的蟋蟀叫。"
  },
  215: {
    en: "Giant pandas live in cool bamboo forests in the mountains. They eat green bamboo for most of the day. Their thick black-and-white fur keeps them warm in winter.",
    zh: "大熊猫生活在山上的凉爽竹林里。它们一天大部分时间都在吃绿竹子。黑白相间的厚毛让它们冬天保持温暖。"
  },
  216: {
    en: "The yellow city bus goes down Main Street every fifteen minutes. Passengers tap plastic cards and sit by the clean windows. The driver tells everyone about the next stops.",
    zh: "黄色城市公交车每十五分钟经过主街。乘客刷塑料卡，然后坐在干净的窗边。司机告诉大家下一站。"
  },
  217: {
    en: "Heavy white snow covered the whole yard on a cold January morning. Toby and his sister made a tall snowman with an orange carrot. They put a warm red scarf around the snowman's neck.",
    zh: "一月一个寒冷的早晨，厚厚的白雪盖住了整个院子。托比和姐姐用一根橙色胡萝卜做了一个高雪人。他们把暖和的红围巾围在雪人脖子上。"
  },
  218: {
    en: "The school bakery sells warm rolls every morning before the first class. Students wait quietly to buy honey bread and oat cookies. The money buys new storybooks for the school library.",
    zh: "学校面包店每天早上第一节课前卖热面包卷。学生们安静排队买蜂蜜面包和燕麦饼干。卖的钱用来给学校图书馆买新故事书。"
  },
  219: {
    en: "Class Four went to the city aquarium to learn about sea animals. They watched colorful fish swim in clear blue tanks. The guide told them how sea turtles keep their eggs safe on sandy beaches.",
    zh: "四年级去了城市水族馆，学习海洋动物。他们看彩色鱼在清澈的蓝色水箱里游。导游告诉他们海龟怎样在沙滩上保护自己的蛋。"
  },
  220: {
    en: "Sarah and her family put a red checked blanket on the grass. They ate turkey sandwiches, sweet grapes, and drank cold apple juice under a tree. After eating, they played frisbee near the pond.",
    zh: "莎拉和家人在草地上铺了一条红格子毯子。他们在树下吃火鸡三明治和甜葡萄，还喝冰苹果汁。吃完后，他们在池塘边玩飞盘。"
  },
  221: {
    en: "Alex made a small toy robot with colorful blocks that snap together. The robot can roll on the wooden floor and flash yellow lights. Alex presses a red button to make it turn in circles.",
    zh: "亚历克斯用彩色拼插积木做了一个小玩具机器人。机器人能在木地板上滚动，还会闪黄灯。亚历克斯按红按钮，让它转圈。"
  },
  222: {
    en: "A tall white lighthouse stands on a rocky cliff by the sea. Its strong light helps ships stay away from sharp rocks at night. The keeper checks the big light bulb every evening at sunset.",
    zh: "一座高高的白灯塔立在海边的岩石悬崖上。夜里，它的强光帮助船远离尖石头。看守人每天傍晚日落时检查大灯泡。"
  },
  223: {
    en: "Soft rain fell on the dry green grass all morning. Flowers opened their colorful petals to catch the fresh rain. Soon, a bright rainbow appeared in the clear blue sky.",
    zh: "整个上午，细雨落在干干的绿草上。花儿打开彩色花瓣接新鲜雨水。很快，明亮的彩虹出现在清蓝的天空中。"
  },
  224: {
    en: "Grandpa made a small wooden toy train for Jack's eighth birthday. It has three dark red cars joined by tiny metal hooks. Jack rolls the train on a smooth track in his bedroom.",
    zh: "爷爷为杰克八岁生日做了一列小木玩具火车。它有三节深红色车厢，用小金属钩连在一起。杰克在卧室的平滑轨道上推火车。"
  },
  225: {
    en: "Mom made round golden pancakes for Sunday breakfast. She put sweet yellow honey and fresh strawberry slices on top. Everyone ate two pancakes before going to the park.",
    zh: "妈妈做了圆圆的金黄色煎饼当星期天早餐。她在上面放甜黄蜂蜜和新鲜草莓片。大家去公园前都吃了两张煎饼。"
  },
  226: {
    en: "The fire station is in the middle of our small town. Three firefighters wear yellow suits and red helmets every day. When the alarm rings, they drive a big fire truck to help people. They work to keep the town safe.",
    zh: "消防站在我们小镇的中间。三名消防员每天穿黄色衣服和红色头盔。警报响起时，他们开大消防车去帮助大家。他们让小镇更安全。"
  },
  227: {
    en: "Lucas got a bright red bike for his eighth birthday. His older brother helped him on the park path. At first, Lucas felt scared and unsteady as he held the handlebars. After much practice, he could ride by himself.",
    zh: "卢卡斯八岁生日时得到一辆亮红色自行车。哥哥在公园小路上帮助他。开始时，他握着车把，觉得害怕又不稳。练习很多次后，他能自己骑车了。"
  },
  228: {
    en: "Students met in the gym for the yearly science show. Ella made a volcano with paper and brown clay. When she mixed vinegar and baking soda, red foam came out. Everyone cheered, and her project got a blue prize ribbon.",
    zh: "学生们在体育馆参加每年的科学展。艾拉用纸和棕色泥做了一座火山。她把醋和小苏打混在一起时，红泡沫冒了出来。大家都欢呼，她的作品得了蓝色奖带。"
  },
  229: {
    en: "Sea turtles spend almost all their lives in the ocean. At night, mother turtles crawl onto sandy beaches to lay round eggs. They cover the nest with sand to keep the eggs safe from other animals. Weeks later, baby turtles come out and run to the sea.",
    zh: "海龟几乎一辈子都生活在海里。晚上，海龟妈妈爬上沙滩下圆圆的蛋。它们用沙子盖住窝，保护蛋不被别的动物吃掉。几周后，小海龟出来，跑向大海。"
  },
  230: {
    en: "Class Three took a yellow school bus to the zoo. They saw two giant pandas eating bamboo leaves in the shade. Later, they watched a trainer feed fish to seals in a pool. Before going home, everyone bought animal bookmarks at the gift shop.",
    zh: "三年级的学生坐黄色校车去了动物园。他们看见两只大熊猫在阴凉处吃竹叶。后来，他们看训练员在池子里喂海豹吃鱼。回家前，大家在礼品店买了动物书签。"
  },
  231: {
    en: "Autumn is the time to pick apples in local apple farms. Farmers pick many crisp red apples from tall trees every day. They put the apples neatly in strong wooden boxes. Soon, trucks take the boxes to markets in the nearby city.",
    zh: "秋天是当地苹果园摘苹果的时候。农民每天从高树上摘很多脆红苹果。他们把苹果整齐地放进结实的木箱。很快，卡车把箱子运到附近城市的市场。"
  },
  232: {
    en: "Mom mixed flour, warm water, and yeast in a big bowl. She worked the soft dough on a wooden board until it was smooth. After it grew bigger in a warm place, she baked it in the oven. The bread had a crisp outside and a soft middle.",
    zh: "妈妈把面粉、温水和酵母放在大碗里混合。她在木板上揉软面团，直到它变光滑。面团在暖和的地方变大后，她把它放进烤箱烤。面包外面脆，里面软。"
  },
  233: {
    en: "Little penguins live in groups by the cold coast of Antarctica. They swim very fast in icy water to catch small fish. Their thick, oily feathers keep water out and keep heat in. At night, they stand close together to stay warm in the cold wind.",
    zh: "小企鹅成群生活在南极洲寒冷的海边。它们在冰水里游得很快，去抓小鱼。厚厚的油羽毛不让水进去，也把热留在身体里。晚上，它们挤在一起，在冷风中保持温暖。"
  },
  234: {
    en: "Jack and his family put up a green tent by a mountain stream. In the afternoon, they walked on trails among pine trees. At sunset, they cooked fresh soup over a warm fire. After dark, they pointed at bright stars in the sky.",
    zh: "杰克和家人在山间小溪边搭起绿色帐篷。下午，他们在松树中间的小路上走路。日落时，他们在暖火上煮新鲜汤。天黑后，他们指着天上的亮星星。"
  },
  235: {
    en: "A honeybee home has many worker bees and one queen. Worker bees get sweet flower food from fields. They bring it back to the hive and make honey. Bees also help plants grow by carrying pollen from flower to flower.",
    zh: "一个蜂巢里有很多工蜂和一只蜂王。工蜂从田野的花朵上采甜花蜜。它们把花蜜带回蜂巢做成蜂蜜。蜜蜂还把花粉从一朵花带到另一朵花，帮助植物生长。"
  },
  236: {
    en: "Our city park is a green place in the town center. Families come on weekends to eat under tall maple trees. Children play on swings, slides, and climbing frames. A walking path goes around a quiet pond with ducks.",
    zh: "我们的城市公园是镇中心的一片绿色地方。家庭周末来高高的枫树下吃东西。孩子们玩秋千、滑梯和攀爬架。一条步道绕着有鸭子的安静池塘。"
  },
  237: {
    en: "Big ships stop at the ocean harbor every morning. Giant cranes lift heavy metal boxes off the ships. Harbor workers guide trucks that carry the goods to nearby storehouses. Seagulls fly over the blue water looking for fish pieces.",
    zh: "每天早上，大船停在海港。巨大的吊车把重金属箱从船上吊下来。港口工人指挥卡车把货物运到附近仓库。海鸥在蓝水上飞，寻找小鱼块。"
  },
  238: {
    en: "An artist puts soft gray clay on a turning wheel. She uses wet fingers to make the clay into a smooth bowl. After it dries, the bowl is baked in a very hot oven. At last, she paints colorful patterns on the bowl.",
    zh: "一位艺术家把软灰泥放在转盘上。她用湿手指把泥做成光滑的碗。碗变干后，放进很热的窑里烤。最后，她在碗上画彩色图案。"
  },
  239: {
    en: "Our solar system has the sun and eight planets that go around it. Earth is the third planet from the sun and has oceans of water. Mars is called the red planet because red iron dust covers its ground. Scientists send space robots to study faraway planets.",
    zh: "我们的太阳系有太阳和八颗绕着它转的行星。地球是离太阳第三近的行星，有很多海水。火星因为地面有红色铁尘，所以叫红色星球。科学家派太空机器人研究远处的行星。"
  },
  240: {
    en: "The city library has many books in neat rows on shelves. Children come after school to do homework and read storybooks. Library workers help students find books for class work. Reading clubs meet every Saturday morning to share favorite stories.",
    zh: "城市图书馆的书整齐地排在书架上。孩子们放学后到这里做作业和读故事书。图书管理员帮助学生找上课要用的书。读书小组每个星期六早上见面，分享喜欢的故事。"
  },
  241: {
    en: "Deserts are dry places with very little rain all year. Camels can walk a long way there without water. Their wide, flat feet stop them from sinking in soft sand. Many desert plants keep water in thick stems to live in the hot sun.",
    zh: "沙漠是一年里很少下雨的干燥地方。骆驼在那里可以走很远，不喝水。它们宽平的脚不让它们陷进软沙里。很多沙漠植物把水存进粗茎里，在热太阳下生长。"
  },
  242: {
    en: "Doctor James Naismith made basketball in December 1891. He put two peach baskets on a gym balcony for the first goals. Players threw a soccer ball into the baskets to get points. Today, basketball is a popular game played by many people around the world.",
    zh: "詹姆斯·奈史密斯医生在1891年12月发明了篮球。他把两个桃子篮放在体育馆阳台上，当作最早的球篮。球员把足球扔进篮子得分。今天，篮球是世界上很多人玩的热门运动。"
  },
  243: {
    en: "Paper was first made in ancient China about two thousand years ago. An official named Cai Lun mixed tree bark, hemp, old rags, and water. He mashed the mix and pressed it flat to make sheets. Paper let people write books and keep records more easily.",
    zh: "大约两千年前，纸最早在中国古代做出来。一位叫蔡伦的官员把树皮、麻、旧布和水混在一起。他把这些东西捣碎，压成平纸。纸让人们更容易写书和记录事情。"
  },
  244: {
    en: "Coral reefs are colorful homes under the sea made by tiny coral animals. Sea turtles, clownfish, and crabs live there. The bright coral gives small fish a place to hide and food to eat. Keeping coral reefs safe helps ocean animals live well.",
    zh: "珊瑚礁是小珊瑚动物在海底做成的彩色家园。海龟、小丑鱼和螃蟹住在那里。明亮的珊瑚给小鱼藏身的地方和食物。保护珊瑚礁能让海洋动物好好生活。"
  },
  245: {
    en: "Honeybees help flowers, fruit trees, and vegetables grow. One hive can have more than fifty thousand bees. Worker bees fly far each day to get pollen and sweet flower food. Without bees, many crops and fruits could not grow.",
    zh: "蜜蜂帮助花、果树和蔬菜生长。一个蜂巢里可以有五万多只蜜蜂。工蜂每天飞很远去采花粉和甜花蜜。没有蜜蜂，很多庄稼和水果就不能生长。"
  },
  246: {
    en: "Wind is clean energy that will not run out. Big wind turbines stand on windy hills to catch moving air. When the blades turn, machines make electricity. Clean wind power can run homes and schools without making the air dirty.",
    zh: "风是一种用不完的清洁能源。大风力发电机立在有风的山上，接住流动的空气。叶片转动时，机器发电。清洁风电能给家和学校供电，不让空气变脏。"
  },
  247: {
    en: "James Watt made the steam engine better long ago. It used hot steam from boiling water to move heavy parts and turn iron wheels. Steam engines ran early trains and factory machines. This new machine helped towns and factories grow fast.",
    zh: "很久以前，詹姆斯·瓦特改进了蒸汽机。它用开水的热蒸汽推动重部件，带动铁轮子转。蒸汽机带动早期火车和工厂机器。这个新机器让城镇和工厂很快发展。"
  },
  248: {
    en: "Solar panels catch sunlight and turn it into electricity. Dark silicon cells on the panels take in sun rays on sunny days. A machine changes the electricity so home tools can use it. Solar power can save money and help keep Earth clean.",
    zh: "太阳能板接住阳光，把它变成电。板上的深色硅电池在晴天吸收太阳光。一台机器改变电流，让家里的电器能用。太阳能可以省钱，也帮助地球保持干净。"
  },
  249: {
    en: "The rainforest canopy is the top layer made by tall tree branches. Most rainforest animals live high in this leafy layer. Toucans, monkeys, and tree frogs find fruit and hiding places there. Sunlight is bright at the top, but the forest floor is dark.",
    zh: "雨林树冠是高树枝形成的顶层。大部分雨林动物住在这片高高的树叶里。巨嘴鸟、猴子和树蛙在那里找水果和藏身处。上面阳光很亮，森林地面却很暗。"
  },
  250: {
    en: "Ancient Egyptians built pyramids as tombs for kings. Skilled workers moved many heavy limestone blocks to make them. The Great Pyramid of Giza was the tallest building made by people for many years. Today, visitors come from all over the world to see these stone buildings.",
    zh: "古埃及人建金字塔，给国王当坟墓。熟练工人搬来很多重石灰石块建造它们。吉萨大金字塔很多年都是人造的最高建筑。今天，世界各地的游客来参观这些石头建筑。"
  },
  251: {
    en: "The deep ocean is cold, dark, and far below the sea surface. Sunlight cannot reach there, so sea animals live in darkness. Many deep-sea fish have glowing parts to catch food. Anglerfish and giant squid can live with the strong water pressure. Scientists use robot submarines to study this underwater world.",
    zh: "深海又冷又黑，在海面很深的下面。阳光到不了那里，所以海洋动物住在黑暗中。许多深海鱼有会发光的部分，用来找食物。琵琶鱼和大鱿鱼能在很强的水压下生活。科学家用机器人潜水艇研究这个水下世界。"
  },
  252: {
    en: "The Great Wall of China is a famous old building. It goes for thousands of miles over mountains and northern deserts. Ancient soldiers built watchtowers on the wall to guard the country and send smoke signals. Many travelers visit places such as Badaling to walk on the old stones. The wall is still a proud sign of Chinese history and building skill.",
    zh: "中国长城是世界上很有名的古建筑。它越过高山和北方沙漠，延伸几千英里。古代士兵在长城上修了烽火台，保护国家、传递烟火信号。很多游客去八达岭等地方走在古老的石头上。长城今天仍是中国历史和建造本领的骄傲象征。"
  },
  253: {
    en: "Bi Sheng made movable-type printing in China in the eleventh century. He carved Chinese characters on small clay blocks and baked them hard. Later, Johannes Gutenberg made a metal printing press in Germany. Books could then be made faster and more cheaply than writing by hand. This helped more people read and learn around the world.",
    zh: "毕昇在11世纪的中国发明了活字印刷。他把汉字刻在小泥块上，再把它们烧硬。后来，约翰内斯·古腾堡在德国做了金属印刷机。书可以比手写得更快、更便宜。这帮助世界上更多人读书和学习。"
  },
  254: {
    en: "Green plants make their food in a process called photosynthesis. Plant roots take water and minerals from the soil. Green leaves take a gas called carbon dioxide from the air and catch sunlight. Sunlight changes the water and gas into sugar and oxygen. This gives people and animals oxygen to breathe.",
    zh: "绿色植物用一个叫光合作用的过程做自己的食物。植物的根从泥土里吸收水和矿物质。绿叶从空气里吸收一种叫二氧化碳的气体，还接住阳光。阳光把水和气体变成糖和氧气。这给人和动物呼吸用的氧气。"
  },
  255: {
    en: "Mars is the fourth planet from the sun. Scientists send robot cars, such as Perseverance, to study its dry, rocky ground. These robots take clear photos and drill rocks to check them. They look for old signs of water life in dry lakebeds. Future space trips hope to send people to Mars.",
    zh: "火星是离太阳第四近的行星。科学家派“毅力号”等机器人车研究它干燥、多石的地面。这些机器人拍清楚的照片，还钻开石头检查。它们在干涸湖床找过去有水中生命的痕迹。未来的太空旅行希望把人送到火星。"
  },
  256: {
    en: "Clean energy comes from natural things that can be used again and again. Solar panels use sunlight to make electricity. Wind turbines use moving air, and dams use flowing water to make electricity. Homes and cities can use this clean power. Clean energy makes less dirty air and helps the world stay safe.",
    zh: "清洁能源来自可以一直再用的自然事物。太阳能板用阳光发电。风力发电机用流动的空气，水坝用流动的水发电。家和城市都能用这种清洁电。清洁能源让脏空气变少，帮助保护世界。"
  },
  257: {
    en: "Honeybees help wild plants and farm crops grow. One worker bee can visit more than one thousand flowers in a day to get nectar. Pollen sticks to its fuzzy body and moves from flower to flower. This helps plants make seeds, nuts, and fruit. Protecting bees helps us have enough food.",
    zh: "蜜蜂帮助野生植物和农田作物生长。一只工蜂一天可以去一千多朵花上采花蜜。花粉粘在它毛茸茸的身体上，被带到别的花上。这帮助植物结种子、坚果和水果。保护蜜蜂能帮助我们有足够的食物。"
  },
  258: {
    en: "People dreamed of flying like birds for thousands of years. In 1903, Orville and Wilbur Wright made the first airplane with a motor. Their plane flew for twelve seconds over the sandy hills of Kitty Hawk. Today, jet planes carry hundreds of people over oceans in a few hours. Modern planes connect people and places around the world.",
    zh: "几千年来，人们梦想像鸟一样飞翔。1903年，奥维尔和威尔伯·莱特做了第一架有发动机的飞机。他们的飞机在基蒂霍克的沙丘上飞了12秒。今天，喷气式飞机几个小时就能载几百人飞过大洋。现代飞机连接了世界各地的人和地方。"
  },
  259: {
    title: { en: "Animals That Glow", zh: "会发光的动物" },
    en: "Some living things make light in dark places. In the ocean, changes inside animals can make blue or green light. Tiny plankton glow when waves hit the shore at night. Deep-sea jellyfish flash light to scare hungry animals away. Scientists study this light to make new medical tools and colors.",
    zh: "有些活的东西会在黑暗处发光。在海洋里，动物身体里的变化能发出蓝光或绿光。晚上，海浪打到岸边时，小浮游生物会发亮。深海水母闪光，吓走饥饿的动物。科学家研究这种光，做新的医疗工具和颜色。"
  },
  260: {
    en: "Great inventions change daily life for people. Thomas Edison made a useful electric light bulb in 1879. Alexander Graham Bell made the first telephone to send voices on wires. Modern inventors make smart computers and clean-energy tools to solve problems. Curiosity and hard work help people make new things.",
    zh: "伟大的发明会改变人们的日常生活。托马斯·爱迪生在1879年做出实用的电灯泡。亚历山大·格雷厄姆·贝尔做了第一部电话，让声音在线里传送。现在的发明家做智能电脑和清洁能源工具来解决问题。好奇心和努力帮助人们做出新东西。"
  },
  301: {
    en: "Mars is the fourth planet from the sun. It looks red because red iron dust covers its rocky ground. Scientists use robot cameras to take clear pictures of its mountains.",
    zh: "火星是离太阳第四近的行星。它看起来是红色的，因为红色铁尘盖着多石的地面。科学家用机器人相机拍它的山的清楚照片。"
  },
  302: {
    en: "Deep-sea fish live in dark water far below the sea surface. Many make soft blue light to find food. Their big eyes help them see in the dark sea.",
    zh: "深海鱼生活在海面下很深的黑水里。很多深海鱼会发出柔和的蓝光找食物。它们的大眼睛帮助它们在黑暗的大海里看东西。"
  },
  303: {
    en: "Solar panels turn sunlight into electricity for homes. They work best on warm, sunny days with clear skies. Solar power helps keep the air clean.",
    zh: "太阳能板把阳光变成家里用的电。它们在温暖、晴朗、天空清楚的日子里工作最好。太阳能帮助保持空气干净。"
  },
  304: {
    en: "Thousands of worker bees live in one large hive. Each morning, they fly to flowers for sweet nectar. Then they bring the nectar home to make honey.",
    zh: "几千只工蜂住在一个大蜂巢里。每天早上，它们飞到花上采甜花蜜。然后，它们把花蜜带回家做蜂蜜。"
  },
  305: {
    en: "Tall wind turbines stand on open hills with strong wind. Their large white blades turn as the wind moves past. The turning blades help make clean electricity for towns.",
    zh: "高高的风力发电机立在风很大的空旷山上。风吹过时，它们的大白叶片转动。转动的叶片帮助城镇发出清洁的电。"
  },
  306: {
    en: "People in ancient Egypt built pyramids with heavy stone blocks. Thousands of workers moved the giant stones over dry sand. Today, people from many countries visit these old buildings.",
    zh: "古埃及人用重石块建造金字塔。几千名工人把大石头搬过干沙地。今天，很多国家的人来参观这些古老建筑。"
  },
  307: {
    en: "The rainforest canopy is the top layer of tall tree branches. Colorful parrots and monkeys live high in the leaves. They find sweet fruit and fresh water in the trees.",
    zh: "雨林树冠是高树枝的顶层。彩色鹦鹉和猴子住在高高的树叶里。它们在树上找甜水果和干净的水。"
  },
  308: {
    en: "The Great Wall of China is a famous building from long ago. It goes over high mountains and wide valleys for thousands of miles. Ancient soldiers built watchtowers on it to protect their country.",
    zh: "中国长城是很久以前建造的著名建筑。它越过高山和宽阔山谷，延伸几千英里。古代士兵在上面修烽火台保护国家。"
  },
  309: {
    en: "Paper was first made in ancient China with tree bark and water. Workers mashed the materials into wet pulp and pressed it into thin sheets. Today, machines make paper quickly so people can write and learn.",
    zh: "纸最早在中国古代用树皮和水做成。工人把材料捣成湿纸浆，再压成薄纸。今天，机器很快造出纸，让人们写字和学习。"
  },
  310: {
    en: "Electric bicycles have small batteries that run a quiet motor. Riders can pedal up steep hills without getting too tired. They are a clean way to travel around cities.",
    zh: "电动自行车有小电池，带动安静的马达。骑车人爬陡坡时踩踏板，不会太累。它们是城市里干净的出行方法。"
  },
  311: {
    en: "Coral reefs are colorful homes in the sea made by tiny living animals. Many bright fish find food and safe places among the coral. Clean sea water helps keep these ocean homes safe.",
    zh: "珊瑚礁是小动物在海里做成的彩色家园。很多彩色鱼在珊瑚中找食物和安全的地方。干净的海水帮助保护这些海洋家园。"
  },
  312: {
    en: "Astronauts ride rockets to space to do science work. They live in a space station that goes around Earth. From the window, they see our blue planet in black space.",
    zh: "宇航员坐火箭去太空做科学工作。他们住在绕着地球转的空间站里。从窗户看出去，他们看见黑色太空里的蓝色地球。"
  },
  313: {
    en: "The first trains used steam engines that burned coal to heat water. Today, many fast trains use electricity and run quietly. They carry people and heavy goods between cities.",
    zh: "最早的火车用烧煤加热水的蒸汽机。今天，很多快速火车用电，安静地行驶。它们在城市之间运送人和重货物。"
  },
  314: {
    en: "Dolphins are sea animals that use whistles and clicks under water. They swim together in groups to catch small fish. Sometimes they jump high from the blue water.",
    zh: "海豚是用口哨声和咔哒声在水下交流的海洋动物。它们成群游泳，抓小鱼。有时它们从蓝色水里高高跳起。"
  },
  315: {
    en: "Wind starts when the sun heats parts of Earth in different ways. Warm air goes up, and cooler air moves in. We can use this moving air to make clean power for cities.",
    zh: "太阳用不同方式晒热地球各处时，风就产生了。热空气上升，凉空气移动过来。我们能用这种流动的空气给城市发清洁的电。"
  },
  316: {
    en: "Giant sequoias are some of the biggest and oldest trees on Earth. Their thick red-brown bark keeps small insects and fire from hurting them. Some have grown in California for thousands of years.",
    zh: "巨杉是地球上最大、最老的一些树。厚厚的红棕树皮保护它们，不让小虫和火伤害它们。有些巨杉在美国加州生长了几千年。"
  },
  317: {
    en: "Suspension bridges use strong steel cables to hold heavy roads over rivers. The cables go between tall towers fixed in the ground. Engineers make the bridges move safely in strong wind.",
    zh: "悬索桥用结实的钢缆把重的道路撑在河上。钢缆连在固定在地上的高塔之间。工程师让桥在大风中能安全地晃动。"
  },
  318: {
    en: "The Arctic fox has thick white fur like winter snow. Its warm fur helps it hide and stay warm in very cold weather. In summer, its fur turns brown like rocks and dirt.",
    zh: "北极狐有像冬雪一样厚的白毛。暖和的毛帮助它躲起来，也让它在很冷的天气里保持温暖。夏天，它的毛变成像石头和泥土一样的棕色。"
  },
  319: {
    en: "Thomas Edison made a long-lasting electric light bulb in 1879. Before that, people used candles and oil lamps at night. Today, electric bulbs light homes, schools, and streets around the world.",
    zh: "托马斯·爱迪生在1879年做出耐用的电灯泡。在那以前，人们夜里用蜡烛和油灯。今天，电灯泡照亮世界各地的家、学校和街道。"
  },
  320: {
    en: "Water dams use flowing river water to make clean electricity. Water rushes through big pipes and turns heavy wheels. This power gives electricity to many nearby homes without burning coal.",
    zh: "水坝用流动的河水发清洁的电。水冲过大管子，带动重轮子转。这种电给附近很多家供电，不需要烧煤。"
  },
  321: {
    en: "Camels are strong animals that live in hot, dry deserts. They keep fat in their humps for energy when food is hard to find. Their wide, soft feet help them walk on sand without sinking.",
    zh: "骆驼是生活在炎热干燥沙漠里的强壮动物。食物难找时，它们把脂肪存进驼峰当能量。它们宽而软的脚帮助它们走在沙上不下陷。"
  },
  322: {
    en: "The Great Barrier Reef is a very large coral reef near Australia. It is so big and colorful that people can see it from space. Keeping it safe helps many kinds of sea animals live there.",
    zh: "大堡礁是澳大利亚附近非常大的珊瑚礁。它又大又彩色，人们从太空也能看见它。保护它能帮助很多种海洋动物在那里生活。"
  },
  323: {
    en: "Telescopes help people look far into space and find new stars. Glass lenses and mirrors make dim things look bright and clear. Space telescopes, such as Hubble, take pictures of faraway galaxies.",
    zh: "望远镜帮助人们看很远的太空，找到新星星。玻璃镜片和镜子让暗暗的东西看起来亮又清楚。哈勃等太空望远镜拍远处星系的照片。"
  },
  324: {
    en: "When a worker bee finds flowers, it flies back to the hive. It does a figure-eight dance to show other bees the way. This helps the bees find food quickly.",
    zh: "工蜂找到花后，飞回蜂巢。它跳一个8字舞，告诉别的蜜蜂方向。这帮助蜜蜂很快找到食物。"
  },
  325: {
    en: "Monarch butterflies fly from Canada to Mexico every autumn. They travel in large orange groups to get away from the very cold north. After resting in warm mountain forests, they fly north again in spring.",
    zh: "帝王蝶每年秋天从加拿大飞到墨西哥。它们成大群橙色蝴蝶飞走，躲开北方的严寒。它们在温暖山林休息后，春天又飞回北方。"
  },
  326: {
    en: "Alexander Graham Bell made the first useful telephone in 1876. He found a way to change a human voice into electric signals on copper wires. His first telephone words were for his helper, Thomas Watson. This new invention let people talk from far away.",
    zh: "亚历山大·格雷厄姆·贝尔在1876年做出第一部好用的电话。他找到方法，把人的声音变成在铜线上走的电信号。他第一次打电话是对助手托马斯·沃森说话。这项新发明让远处的人能说话。"
  },
  327: {
    en: "Wind is clean energy that will not run out. Big wind turbines stand on open, windy land to catch moving air. Wind turns their large white blades, and machines inside make electricity. This power gives many homes electricity without making dirty smoke.",
    zh: "风是一种用不完的清洁能源。大风力发电机立在有风的空旷地方，接住流动的空气。风吹动大白叶片，里面的机器发电。这种电给很多家供电，不会冒脏烟。"
  },
  328: {
    en: "Coral reefs are sea homes made by tiny coral animals. They cover less than one percent of the sea floor but are home to one in four sea animals. Bright coral gives fish, turtles, and crabs food and safe places. Keeping dirty things out of the sea helps keep coral reefs safe.",
    zh: "珊瑚礁是小珊瑚动物做成的海洋家园。它们不到海底的百分之一，却养活每四只海洋动物中的一只。明亮的珊瑚给鱼、海龟和螃蟹食物和安全地方。不让脏东西进海里，能保护珊瑚礁。"
  },
  329: {
    en: "A volcano is an opening in Earth where hot melted rock comes out. Deep under the ground, heat makes this liquid rock, called magma. When too much pressure builds, magma bursts out as lava. Over time, cool lava makes a steep mountain around the opening.",
    zh: "火山是地球上热熔岩会出来的开口。地底很深处，热让岩石变成液体，叫岩浆。压力太大时，岩浆冲出来，变成熔岩。时间久了，冷熔岩在开口周围形成陡山。"
  },
  330: {
    en: "Steam trains changed travel long ago. Workers burned coal to heat water in a large tank. The hot steam pushed heavy parts and turned the train wheels. Trains linked faraway towns and carried goods faster.",
    zh: "很久以前，蒸汽火车改变了出行。工人烧煤，在大水箱里加热水。热蒸汽推动重部件，带动火车轮子转。火车连接远处城镇，更快运送货物。"
  },
  331: {
    en: "Honeybees live together in busy groups called colonies. Each colony has one queen, many female workers, and male bees. Workers make wax rooms to keep honey and care for baby bees. Their work moving pollen helps people grow food.",
    zh: "蜜蜂住在叫作蜂群的忙碌大家庭里。每个蜂群有一只蜂王、很多雌工蜂和雄蜂。工蜂做蜡房存蜂蜜，也照顾小蜜蜂。它们带花粉的工作帮助人们种食物。"
  },
  332: {
    en: "Photosynthesis is how green plants make food. Leaves take in sunlight and carbon dioxide from the air. Roots pull water and minerals up from the soil. The plant uses them to make sugar for growing and lets out oxygen.",
    zh: "光合作用是绿色植物做食物的方法。叶子吸收阳光和空气里的二氧化碳。根从泥土里吸上水和矿物质。植物用这些做出供生长用的糖，并放出氧气。"
  },
  333: {
    en: "The deep ocean starts about two hundred meters below the bright sea surface. Sunlight cannot reach there, so it is very dark. Animals there live in freezing water with strong water pressure. Some fish make their own light to find food and a partner.",
    zh: "深海从明亮海面下大约两百米开始。阳光到不了那里，所以那里很黑。那里的动物生活在冰冷、有很强水压的水里。有些鱼自己发光，找食物和伙伴。"
  },
  334: {
    en: "Bi Sheng made movable clay type printing in China in the eleventh century. He carved Chinese characters on small clay blocks and baked them hard. Hundreds of years later, Johannes Gutenberg made a metal printing press in Germany. Printing made books cheaper and helped knowledge travel around the world.",
    zh: "毕昇在11世纪的中国发明了活字泥版印刷。他把汉字刻在小泥块上，再把它们烧硬。几百年后，约翰内斯·古腾堡在德国做了金属印刷机。印刷让书更便宜，也让知识传到世界各地。"
  },
  335: {
    en: "Giant sequoias are huge trees in the foggy Sierra Nevada mountains. They can live for more than three thousand years and grow as tall as very tall buildings. Their thick bark keeps fire and wood-rotting fungi from hurting them. These old trees also hold much carbon in the forest.",
    zh: "巨杉是生长在雾蒙蒙的内华达山脉里的大树。它们能活三千多年，长得像很高的楼一样高。厚树皮保护它们，不让火和让木头腐烂的真菌伤害它们。这些老树也把很多碳留在森林里。"
  },
  336: {
    en: "Robot rovers travel over the dry, rocky ground of Mars. Scientists on Earth control the wheeled robots with radio signals. The rovers have clear cameras, laser tools, and drills to check Martian soil. They look for old clues that water once ran on Mars.",
    zh: "机器人探测车在火星干燥、多石的地面上行走。地球上的科学家用无线电信号控制这些有轮子的机器人。探测车有清楚的相机、激光工具和钻头，检查火星泥土。它们寻找火星过去有水流过的线索。"
  },
  337: {
    en: "Electric cars use batteries instead of gasoline for power. Electric motors turn the wheels quietly and do not make dirty smoke from a tailpipe. Charging places on highways help cars travel far. More electric cars can make city air cleaner and streets quieter.",
    zh: "电动汽车用电池，不用汽油来提供动力。电动马达安静地带动轮子，不从车尾冒脏烟。公路上的充电站帮助汽车走得远。更多电动汽车能让城市空气更干净，街道更安静。"
  },
  338: {
    en: "Hurricanes are huge spinning storms that start over warm ocean water. Warm water makes wet air rise and brings strong wind. A calm place called the eye is in the middle of the storm. Weather workers use satellites to follow storms and warn towns by the sea.",
    zh: "飓风是在温暖海水上形成的巨大旋转风暴。温水让湿空气上升，带来强风。风暴中间有一块平静地方，叫风眼。气象工作人员用卫星跟踪风暴，提醒海边城镇。"
  },
  339: {
    en: "The Amazon rainforest is the largest tropical forest on Earth. It is in nine countries in South America and makes much of the world's oxygen. Millions of different plants and animals live under its thick tree top. Keeping the Amazon safe helps the world’s air and weather.",
    zh: "亚马孙雨林是地球上最大的热带森林。它在南美洲九个国家，制造世界上很多氧气。几百万种不同的植物和动物住在厚树冠下面。保护亚马孙有助于世界的空气和天气。"
  },
  340: {
    en: "The Hubble Space Telescope went into space around Earth in 1990. High above Earth, it takes very clear pictures of deep space. Hubble helped people learn the age of the universe. Its photos of colorful clouds and galaxies still help scientists.",
    zh: "哈勃太空望远镜在1990年进入绕地球的太空。在地球高处，它拍很深太空的清楚照片。哈勃帮助人们了解宇宙的年龄。它拍的彩色星云和星系照片还在帮助科学家。"
  },
  341: {
    en: "Wind power uses the energy of moving air. The sun heats land and ocean water in different ways, making air pressure different. Air moves from high pressure to low pressure and turns wind-turbine blades. A generator changes this movement into electricity without dirty smoke.",
    zh: "风力发电用流动空气的能量。太阳用不同方式晒热土地和海水，形成不同的气压。空气从高气压处流向低气压处，带动风机叶片转。一台发电机把这种运动变成电，不会冒脏烟。"
  },
  342: {
    en: "Ocean tides are the sea rising and falling each day. The moon and the sun pull on the ocean water. High tides happen on shores when the moon is in the right place. Some power stations use this moving water to make electricity.",
    zh: "海潮是海水每天上升和下降。月亮和太阳拉着海水。月亮在合适位置时，海边会有高潮。一些发电站用这种流动的水发电。"
  },
  343: {
    title: { en: "Animals That Glow", zh: "会发光的动物" },
    en: "Some living things can make light. Fireflies flash their lights on warm summer nights to find a mate. Deep-sea anglerfish use a glowing part to catch food in the dark. Scientists study this cold light to make better medical pictures.",
    zh: "有些活的东西会发光。萤火虫在温暖夏夜闪光，寻找伙伴。深海琵琶鱼用会发光的部分在黑暗中抓食物。科学家研究这种冷光，做更好的医疗图片。"
  },
  344: {
    en: "People dreamed of flying like birds for many years. In 1903, the Wright brothers made the first airplane with a motor. Their plane flew for twelve seconds over the sandy hills of Kitty Hawk. Today, jet planes carry hundreds of people over oceans in hours.",
    zh: "很多年来，人们梦想像鸟一样飞。1903年，莱特兄弟做出第一架有发动机的飞机。他们的飞机在基蒂霍克的沙丘上飞了12秒。今天，喷气式飞机几个小时就能载几百人飞过大洋。"
  },
  345: {
    en: "Rainbows happen when sunlight goes through drops of water in the air. The light bends and splits into many colors inside each drop. It bounces inside the drop and goes back to our eyes. Then we see a colorful arch in the sky after rain.",
    zh: "阳光穿过空气里的水滴时会有彩虹。光在每滴水里弯曲，分成很多颜色。它在水滴里反弹，再回到我们的眼睛。雨后，我们就看见天空中彩色的弧。"
  },
  346: {
    en: "Antarctica is the coldest, driest, and windiest continent on Earth. Thick ice covers almost all of its land. Even in this hard place, emperor penguins and Weddell seals live near the sea. Countries agree to keep Antarctica for peaceful science work.",
    zh: "南极洲是地球上最冷、最干、风最大的一块大陆。厚冰盖住了几乎所有土地。即使在这样艰难的地方，帝企鹅和威德尔海豹也住在海边。各国同意把南极洲留给和平的科学工作。"
  },
  347: {
    en: "Our solar system began about 4.6 billion years ago from gas and dust. A huge cloud of gas and dust spun and fell together. Most of it went to the middle and became our sun. The dust left over hit together for a long time and made the planets.",
    zh: "我们的太阳系大约在46亿年前由气体和尘土开始。一个巨大的气体和尘土云旋转着聚到一起。大部分到了中间，变成我们的太阳。剩下的尘土很久以来互相碰撞，形成行星。"
  },
  348: {
    en: "Cai Lun made paper in China around the year 105. He mixed mulberry bark, hemp fibers, old fishing nets, and water. He mashed the mix, spread it on bamboo screens, and dried it. This cheap, strong paper helped people keep records and learn to read.",
    zh: "蔡伦在大约公元105年的中国造纸。他把桑树皮、麻纤维、旧渔网和水混在一起。他把混合物捣碎，铺在竹帘上，再晒干。这种便宜又结实的纸帮助人们记事和学读书。"
  },
  349: {
    en: "Desert plants have special ways to live in very hot, dry places. Cacti have thick, waxy stems to keep water and sharp spines instead of leaves. Their wide, shallow roots catch rainwater before it dries up. These parts help cacti live in dry deserts.",
    zh: "沙漠植物有特别方法在很热、很干的地方生活。仙人掌有厚厚、滑滑的茎存水，用尖刺代替叶子。它们又宽又浅的根在雨水干掉前吸收它。这些部分帮助仙人掌生活在干沙漠里。"
  },
  350: {
    en: "Hurricanes are strong spinning storms that form over warm ocean water. Wet air from the sea makes the wind blow very fast. A calm, round place called the eye forms in the middle. Satellites follow the storm so people can leave early if they need to.",
    zh: "飓风是在温暖海水上形成的强大旋转风暴。海上的湿空气让风吹得很快。中间会形成一个平静的圆地方，叫风眼。卫星跟踪风暴，这样人们需要时能早点离开。"
  },
  351: {
    en: "Renewable energy uses natural things that do not run out. Solar panels use sunlight, wind turbines use moving air, and water stations use flowing water to make electricity. These machines make clean power for people. Homes and schools can use this power. Using clean power can make less dirty air and slow climate change.",
    zh: "可再生能源使用不会用完的自然事物。太阳能板用阳光，风力发电机用流动的空气，水电站用流动的水发电。这些机器给人们发清洁的电。家和学校都能用这种电。使用清洁电能减少脏空气，也能减慢气候变化。"
  },
  352: {
    en: "The Great Barrier Reef near Australia is the largest living reef on Earth. It is made of many small coral reefs built by tiny coral animals. This colorful sea home has more than 1,500 kinds of fish, sea turtles, and whales. Tiny algae live with coral and make food from sunlight. Keeping the water safe from warming and acid helps protect the reef.",
    zh: "澳大利亚附近的大堡礁是地球上最大的活珊瑚礁。它由小珊瑚动物建成的很多小珊瑚礁组成。这个彩色海洋家园有1500多种鱼、海龟和鲸。小藻类和珊瑚住在一起，用阳光做食物。保护海水不变热、不变酸，能保护珊瑚礁。"
  },
  353: {
    en: "Bi Sheng started movable-type printing in China in the eleventh century. He made hard clay blocks with single Chinese characters. In the 1440s, Johannes Gutenberg made a metal printing press in Europe. Printing made many copies of books quickly and helped more people read and learn. It became an important part of modern education.",
    zh: "毕昇在11世纪的中国开始活字印刷。他做了刻有单个汉字的硬泥块。在15世纪40年代，约翰内斯·古腾堡在欧洲做了金属印刷机。印刷能很快印很多本书，帮助更多人阅读和学习。它成为现代教育的重要部分。"
  },
  354: {
    en: "Photosynthesis is how green plants make food. A green part in leaves catches energy from sunlight. Roots pull water and minerals from the soil. Sunlight helps the plant change water and carbon dioxide into sugar and oxygen. This process gives food to plants and oxygen to the air.",
    zh: "光合作用是绿色植物做食物的方法。叶子里的绿色部分接住阳光的能量。根从泥土里吸上水和矿物质。阳光帮助植物把水和二氧化碳变成糖和氧气。这个过程给植物食物，也给空气氧气。"
  },
  355: {
    en: "For many years, people have sent robot machines to Mars. Space groups send rovers, such as Perseverance, to move over its dry land. The rovers have cameras and drills to study old Martian rocks. Scientists look for signs that tiny life once lived in old river and lake places. What the robots find may help people travel to Mars one day.",
    zh: "很多年来，人们把机器人机器送到火星。太空机构派“毅力号”等探测车在干燥地面上走。探测车有相机和钻头，研究古老的火星岩石。科学家寻找小生命曾住在古河流和湖泊地方的痕迹。机器人发现的东西也许会帮助人们有一天去火星。"
  },
  356: {
    title: { en: "Deep-Sea Light", zh: "深海的光" },
    en: "Deep ocean water below two hundred meters is always very dark. Animals there can make their own light. Special parts inside their bodies mix with oxygen to make this cool light. Sea animals use the light to hide, stay safe, or catch food. Scientists study this light to make new medical tools.",
    zh: "海面下两百米以下的深海总是很黑。那里的动物会发出自己的光。它们身体里的特别部分和氧气混合，做出这种冷光。海洋动物用光来躲藏、保护自己或抓食物。科学家研究这种光，做新的医疗工具。"
  },
  357: {
    en: "Airplanes fly because of how air moves around their wings. The curved wings make air move faster over the top. This makes the air push less on top and helps lift the airplane. Engines push the plane forward, and the wings, weight, and air push must stay balanced. This balance helps a plane fly safely for a long way.",
    zh: "飞机能飞是因为空气在机翼周围移动。弯曲的机翼让空气在上面流得更快。这让上面的空气推得更少，帮助飞机升起。发动机把飞机向前推，机翼、重量和空气的力量要保持平衡。这种平衡帮助飞机安全飞很远。"
  },
  358: {
    en: "The Amazon Basin has the world's largest tropical forest and river system. Its many trees take carbon from the air and help control weather. More than one in ten known kinds of plants and animals live there. Native people have lived with the forest for hundreds of years. Stopping people from cutting down the forest helps keep its plants, animals, and climate safe.",
    zh: "亚马孙盆地有世界最大的热带森林和河流系统。它的很多树从空气里吸收碳，帮助控制天气。已知植物和动物中，每十种有一种以上住在那里。当地原住民和森林一起生活了几百年。不让人们砍树，能保护那里的植物、动物和气候。"
  },
  359: {
    en: "The Great Pyramid of Giza is a huge old pyramid in Egypt. It was built for Pharaoh Khufu with more than two million stone blocks. Builders lined up its base with north, south, east, and west. They used ramps, levers, and many workers to put the heavy granite blocks in place. Today, people still study how they built this great building.",
    zh: "吉萨大金字塔是埃及一座巨大的古金字塔。它是为法老胡夫用两百多万块石头建造的。建造者把它的底边对准东、南、西、北。他们用斜坡、杠杆和很多工人，把重花岗岩石块放到位置上。今天，人们还在研究他们怎样建成这座大建筑。"
  },
  360: {
    en: "Hurricanes are very large storms that start over warm tropical ocean water. The sun heats the sea, making water go into the air and feed the storm. Earth’s turning and high winds make the storm spin. The middle eye is calm, but the wind around it is very strong. Satellites help scientists follow the storm and warn people to leave safely.",
    zh: "飓风是在温暖热带海水上形成的很大风暴。太阳晒热大海，让水进入空气，给风暴力量。地球转动和高空大风让风暴旋转。中间的风眼很平静，但周围的风很强。卫星帮助科学家跟踪风暴，提醒人们安全离开。"
  }
};

const questionOverrides = {
  151: [
    { q: 'Who picks the red apples?', options: ['Farmer Dan', 'Farmer Lee', 'Tim', 'Maya'], correct: 0 },
    { q: 'When does Farmer Dan pick apples?', options: ['In autumn', 'In winter', 'In spring', 'At night'], correct: 0 },
    { q: 'What color are the apples?', options: ['Red', 'Blue', 'Green', 'Purple'], correct: 0 },
    { q: 'Where does he put the apples?', options: ['In big wooden boxes', 'In a glass cup', 'Under the bed', 'In a school bag'], correct: 0 },
    { q: 'What does Farmer Dan drive?', options: ['A green tractor', 'A yellow bus', 'A red bike', 'A blue boat'], correct: 0 },
    { q: 'Where does he sell the apples?', options: ['At the market', 'At the zoo', 'At the school', 'At the beach'], correct: 0 }
  ],
  152: [
    { q: 'What animal swims in the sea?', options: ['A sea turtle', 'A brown dog', 'A small bird', 'A farm cow'], correct: 0 },
    { q: 'Where does the turtle swim?', options: ['In the warm blue sea', 'In a school room', 'On a city road', 'In a tree'], correct: 0 },
    { q: 'What does the turtle use to swim?', options: ['Its long flippers', 'Its red wings', 'Its small hands', 'Its black boots'], correct: 0 },
    { q: 'What does the turtle swim past?', options: ['Colorful coral', 'A yellow bus', 'A tall house', 'A snowman'], correct: 0 },
    { q: 'Where does the turtle rest?', options: ['On the sand', 'On a chair', 'In a box', 'On a roof'], correct: 0 },
    { q: 'When does the turtle rest?', options: ['Later', 'Before breakfast', 'Every winter', 'At school'], correct: 0 }
  ],
  153: [
    { q: 'What fills the sky?', options: ['Dark clouds', 'Bright stars', 'Green leaves', 'White birds'], correct: 0 },
    { q: 'When is the rainy morning?', options: ['Monday morning', 'Friday night', 'Sunday noon', 'Saturday evening'], correct: 0 },
    { q: 'What color is Maya’s raincoat?', options: ['Yellow', 'Blue', 'Black', 'Pink'], correct: 0 },
    { q: 'What does Maya wear on her feet?', options: ['Yellow boots', 'Red shoes', 'Green socks', 'White slippers'], correct: 0 },
    { q: 'Where does Maya splash?', options: ['In clear puddles', 'In the library', 'On a bus', 'In the garden'], correct: 0 },
    { q: 'Where is Maya going?', options: ['To school', 'To the farm', 'To the market', 'To the zoo'], correct: 0 }
  ],
  154: [
    { q: 'Who meets for the music show?', options: ['Students', 'Farmers', 'Drivers', 'Doctors'], correct: 0 },
    { q: 'Where do the students meet?', options: ['In the school hall', 'On the beach', 'At the farm', 'In a shop'], correct: 0 },
    { q: 'What does Clara play?', options: ['A violin', 'A drum', 'A flute', 'A guitar'], correct: 0 },
    { q: 'Who listens to Clara?', options: ['The people there', 'Only her cat', 'The bus driver', 'The fish'], correct: 0 },
    { q: 'What do people do when Clara finishes?', options: ['They clap', 'They run home', 'They sleep', 'They swim'], correct: 0 },
    { q: 'When do people clap?', options: ['When Clara finishes', 'Before school', 'At breakfast', 'In the morning rain'], correct: 0 }
  ],
  155: [
    { q: 'Who goes camping?', options: ['David and his dad', 'Maya and her mom', 'Two teachers', 'The firefighters'], correct: 0 },
    { q: 'What color is the tent?', options: ['Green', 'Yellow', 'Purple', 'Black'], correct: 0 },
    { q: 'Where do they put up the tent?', options: ['By a forest stream', 'In the classroom', 'On a bus', 'At the market'], correct: 0 },
    { q: 'What do they cook for dinner?', options: ['Sausages', 'Fish', 'Rice', 'Cake'], correct: 0 },
    { q: 'When do they look at stars?', options: ['At night', 'At lunch', 'In the morning', 'After school'], correct: 0 },
    { q: 'What do they see in the sky?', options: ['Bright stars', 'Red apples', 'Small fish', 'Green grass'], correct: 0 }
  ],
  156: [
    { q: 'What animal jumps out of the sea?', options: ['A silver dolphin', 'A white rabbit', 'A brown bear', 'A yellow duck'], correct: 0 },
    { q: 'What does the dolphin do before it falls back?', options: ['Two flips', 'A long sleep', 'A big meal', 'A song'], correct: 0 },
    { q: 'Where does the dolphin splash back?', options: ['Into the water', 'Into a tree', 'Into a house', 'Into the sand'], correct: 0 },
    { q: 'Who is on the tour boat?', options: ['People', 'Penguins', 'Cows', 'Turtles'], correct: 0 },
    { q: 'What do the people do?', options: ['Clap and cheer', 'Read books', 'Cook dinner', 'Plant seeds'], correct: 0 },
    { q: 'Where are the people watching?', options: ['On a tour boat', 'At school', 'In a library', 'On a farm'], correct: 0 }
  ],
  157: [
    { q: 'Who cuts the wheat?', options: ['Farmers', 'Students', 'Singers', 'Doctors'], correct: 0 },
    { q: 'When do farmers cut wheat?', options: ['In autumn', 'In spring', 'In winter', 'At night'], correct: 0 },
    { q: 'What color are the big machines?', options: ['Yellow', 'Blue', 'Red', 'White'], correct: 0 },
    { q: 'What do the machines cut?', options: ['Dry wheat', 'Green apples', 'Small fish', 'White snow'], correct: 0 },
    { q: 'When are the barns full?', options: ['By evening', 'At breakfast', 'Before school', 'At midnight'], correct: 0 },
    { q: 'What fills the barns?', options: ['Grain', 'Water', 'Books', 'Toys'], correct: 0 }
  ],
  158: [
    { q: 'Where are the books?', options: ['On wooden shelves', 'Under the pond', 'On a bus', 'In a tent'], correct: 0 },
    { q: 'Who sits at round tables?', options: ['Children', 'Fish', 'Birds', 'Drivers'], correct: 0 },
    { q: 'What do children do at the tables?', options: ['Schoolwork', 'Swimming', 'Cooking', 'Flying'], correct: 0 },
    { q: 'Where do children do schoolwork?', options: ['At the library', 'At the zoo', 'On a train', 'At the beach'], correct: 0 },
    { q: 'Who helps people find books?', options: ['Library workers', 'Bus drivers', 'Farmers', 'Singers'], correct: 0 },
    { q: 'What does the library have?', options: ['Many books', 'Many cars', 'Many boats', 'Many cows'], correct: 0 }
  ],
  159: [
    { q: 'Who makes the vase?', options: ['An artist', 'A farmer', 'A doctor', 'A driver'], correct: 0 },
    { q: 'What does the artist put on the wheel?', options: ['Gray clay', 'Red sand', 'White snow', 'Green leaves'], correct: 0 },
    { q: 'What does she use to shape the clay?', options: ['Wet hands', 'A red pen', 'A blue book', 'A yellow cup'], correct: 0 },
    { q: 'What does the clay become?', options: ['A round vase', 'A small fish', 'A green bike', 'A red ball'], correct: 0 },
    { q: 'Where does the vase go after it is made?', options: ['Into a hot oven', 'Into the pond', 'Into a school bag', 'Into a tree'], correct: 0 },
    { q: 'What color does the vase turn?', options: ['Blue', 'Black', 'Pink', 'Orange'], correct: 0 }
  ],
  160: [
    { q: 'Who looks through a telescope?', options: ['Leo', 'Clara', 'David', 'Maya'], correct: 0 },
    { q: 'When does Leo use the telescope?', options: ['On a summer night', 'At lunch', 'In winter rain', 'Before school'], correct: 0 },
    { q: 'What does Leo see on the moon?', options: ['Holes', 'Trees', 'Houses', 'Flowers'], correct: 0 },
    { q: 'What color is the moon?', options: ['Bright', 'Green', 'Red', 'Purple'], correct: 0 },
    { q: 'What does Leo watch move in the sky?', options: ['A shooting star', 'A school bus', 'A white cat', 'A red apple'], correct: 0 },
    { q: 'Where does the shooting star move?', options: ['Across the sky', 'Under the bed', 'Into the pond', 'On the road'], correct: 0 }
  ],
  251: [
    { q: 'Where is the deep ocean?', options: ['Far below the sea surface', 'Above the clouds', 'On a green hill', 'Inside a house'], correct: 0 },
    { q: 'What cannot reach the deep ocean?', options: ['Sunlight', 'Rain', 'Wind', 'Snow'], correct: 0 },
    { q: 'What do many deep-sea fish have?', options: ['Glowing parts', 'Long wings', 'Red boots', 'Wooden shells'], correct: 0 },
    { q: 'What animals can live with strong water pressure?', options: ['Anglerfish and giant squid', 'Cats and dogs', 'Cows and sheep', 'Hens and ducks'], correct: 0 },
    { q: 'What do scientists use under the sea?', options: ['Robot submarines', 'School buses', 'Toy trains', 'Kites'], correct: 0 },
    { q: 'What do scientists study there?', options: ['The underwater world', 'A city park', 'A school room', 'A farm'], correct: 0 }
  ],
  259: [
    { q: 'What can some living things make?', options: ['Light', 'Cars', 'Books', 'Shoes'], correct: 0 },
    { q: 'What colors can ocean animals make?', options: ['Blue or green', 'Red or black', 'Pink or brown', 'White or gray'], correct: 0 },
    { q: 'When do tiny plankton glow?', options: ['When waves hit the shore at night', 'At school in the morning', 'In a dry field', 'Under a tree'], correct: 0 },
    { q: 'What do jellyfish use light to do?', options: ['Scare hungry animals away', 'Grow flowers', 'Build nests', 'Drive boats'], correct: 0 },
    { q: 'Who studies this light?', options: ['Scientists', 'Bus drivers', 'Bakers', 'Farmers'], correct: 0 },
    { q: 'What do scientists make with the light?', options: ['Medical tools and colors', 'Sandcastles and flags', 'Kites and balls', 'Tents and fires'], correct: 0 }
  ],
  343: [
    { q: 'What can some living things make?', options: ['Light', 'Buses', 'Houses', 'Shoes'], correct: 0 },
    { q: 'When do fireflies flash their lights?', options: ['On warm summer nights', 'On cold winter mornings', 'At lunchtime', 'After school'], correct: 0 },
    { q: 'What do anglerfish use to catch food?', options: ['A glowing part', 'A wooden net', 'A red flag', 'A long rope'], correct: 0 },
    { q: 'Who studies this cold light?', options: ['Scientists', 'Farmers', 'Singers', 'Drivers'], correct: 0 },
    { q: 'What do scientists make with this light?', options: ['Better medical pictures', 'Bigger school bags', 'Faster bicycles', 'Warm jackets'], correct: 0 }
  ],
  356: [
    { q: 'Where is deep ocean water very dark?', options: ['Below two hundred meters', 'On a sunny beach', 'In a school yard', 'On a mountain top'], correct: 0 },
    { q: 'What can deep-sea animals make?', options: ['Their own light', 'New trees', 'Big houses', 'Warm clothes'], correct: 0 },
    { q: 'What mixes with oxygen to make the cool light?', options: ['Special body parts', 'Red apples', 'Yellow flowers', 'White snow'], correct: 0 },
    { q: 'What do sea animals use the light to do?', options: ['Hide, stay safe, or catch food', 'Read books at school', 'Build a road', 'Cook dinner'], correct: 0 },
    { q: 'Who studies the deep-sea light?', options: ['Scientists', 'Students', 'Drivers', 'Farmers'], correct: 0 },
    { q: 'What do scientists make with this light?', options: ['New medical tools', 'Toy cars', 'Fruit cakes', 'Wooden chairs'], correct: 0 }
  ]
};

const questionTextOverrides = {
  103: { 2: 'What does Lily drink water to do?' },
  129: { 3: 'What do goldfish swim up to do?' },
  148: { 4: 'What does Jenny do in the chair?' },
  204: { 0: 'What do honeybees travel across fields to find?' },
  207: { 2: 'What do dolphins do near passing boats?' },
  219: { 0: 'What did Class Four go to the aquarium to learn about?' },
  223: { 1: 'What do flowers open their petals to catch?' },
  229: { 2: 'What do turtles protect with sand?' },
  233: { 1: 'What do penguins swim fast to catch?' },
  239: { 2: 'What makes Mars look red?' },
  241: { 1: 'What can camels do without drinking water?' },
  243: { 4: 'What did paper help people do?' },
  244: { 3: 'What do coral reefs help keep safe?' },
  245: { 3: 'What distance do worker bees fly for food?' },
  250: { 0: 'What were ancient pyramids built for?' },
  251: { 1: 'Where does sunlight not reach?' },
  252: { 2: 'What do watchtowers help soldiers do?' },
  253: { 3: 'What did printing help people do?' },
  254: { 4: 'What does photosynthesis give people and animals?' },
  257: { 4: 'What do honeybees help people have?' },
  259: { 3: 'What do jellyfish use light flashes to do?', 4: 'What do scientists make with this light?' },
  301: { 1: 'What covers the ground of Mars?' },
  302: { 2: 'What do large eyes help deep-sea fish do?' },
  304: { 1: 'What do worker bees collect from flowers?' },
  306: { 2: 'What do visitors come to see?' },
  308: { 2: 'What do ancient soldiers use watchtowers to do?' },
  309: { 2: 'What do modern machines make?' },
  310: { 2: 'What do electric bicycles help keep clean?' },
  314: { 2: 'What do dolphins do to show their speed?' },
  317: { 2: 'What do engineers make bridges do in strong wind?' },
  322: { 1: 'What makes the reef easy to see from space?', 2: 'What does protecting the reef help do?' },
  325: { 1: 'Where do monarch butterflies fly in autumn?' },
  328: { 3: 'What does dirty sea water hurt?' },
  333: { 0: 'Where does the deep ocean begin?', 1: 'What cannot reach the deep ocean?', 3: 'What do some deep-sea fish make?' },
  335: { 1: 'What age can giant sequoias reach?' },
  339: { 3: 'What does the Amazon help control?' },
  340: { 1: 'Where does Hubble take pictures from?' },
  343: { 1: 'What do fireflies use their lights to do?' },
  349: { 0: 'What weather do desert plants live in?', 4: 'What do cactus parts help them do?' },
  350: { 4: 'What do satellites help people do?' },
  352: { 3: 'What do tiny algae make for coral?', 4: 'What does keeping the reef safe help do?' },
  353: { 5: 'What did printing help more people get?' },
  354: { 4: 'What does photosynthesis give the air?' },
  356: { 0: 'Where is deep ocean water always dark?', 3: 'What do sea animals use their light to do?' },
  357: { 2: 'What moves faster over the top of a wing?' },
  358: { 4: 'What does stopping tree cutting help protect?' },
  359: { 1: 'Who was the Great Pyramid built for?', 3: 'What directions did builders use for the pyramid base?' }
};

// These rewrites keep questions natural after converting the original how/why
// prompts to the required concrete question words.
Object.assign(questionTextOverrides, {
  103: { ...questionTextOverrides[103], 0: 'What is the sun like today?' },
  105: { 2: 'What is Ben like when he runs on the playground?' },
  107: { 1: 'What does the apple taste like?' },
  110: { 1: 'What is Max like when he barks?' },
  114: { 2: 'What does Anna use to water the flowers?' },
  117: { 0: 'What is the water in the stream like?', 2: 'What are the fish like when they swim?' },
  122: { 0: 'What does the rabbit do on the grass?' },
  124: { 2: 'What is the star like?' },
  126: { 2: 'What are Lily and Dan like when they laugh?', 3: 'Where do Lily and Dan swing?' },
  128: { 1: 'What does Oliver do to the banana?' },
  132: { 0: 'What is the turtle like when it walks?' },
  133: { 0: 'What is the wind like?', 3: 'What are the children like when they run?' },
  137: { 3: 'What is the cat like when it purrs?' },
  139: { 3: 'What does the bread smell like?' },
  140: { 2: 'What is the street like?' },
  141: { 4: 'What do the students do when they see giraffes?' },
  142: { 4: 'What is Mr Green like with passengers?' },
  144: { 2: 'What is Sally like while she cleans?' },
  150: { 4: 'What does the kitchen smell like?' },
  202: { 0: 'What farm does Leo visit?', 1: 'What does Leo use to feed the calves?' },
  208: { 2: 'What does the quiet library help Emma do?' },
  216: { 1: 'What do passengers use to pay for the ride?' },
  218: { 2: 'What does the school buy with the raised money?' },
  223: { ...questionTextOverrides[223], 0: 'What is the rain like?' },
  227: { 2: 'What is Lucas like at first?' },
  231: { 1: 'What do farmers use to store the apples?' },
  233: { ...questionTextOverrides[233], 2: 'What do oily feathers do for penguins?' },
  235: { 3: 'What do honeybees do for plants?' },
  238: { 1: 'What does the artist use to shape the clay?' },
  240: { 0: 'Where does the library keep its books?' },
  241: { ...questionTextOverrides[241], 2: 'What do camels’ wide feet do?' },
  242: { 4: 'What is basketball like today?' },
  243: { ...questionTextOverrides[243], 3: 'What did Cai Lun do to make paper sheets?' },
  249: { 4: 'What is the forest floor like?' },
  256: { 3: 'What do dams use to make electricity?' },
  258: { 4: 'What does modern aviation connect?' },
  260: { 4: 'What do great inventions do for people’s lives?' },
  303: { 2: 'What does solar energy do for the air?' },
  310: { 1: 'What do electric bikes help riders do on steep hills?' },
  311: { 2: 'What can people do to protect coral reefs?' },
  312: { 0: 'What do astronauts ride to space?' },
  313: { 1: 'What do modern trains use to run?' },
  315: { 2: 'What can moving air make for cities?' },
  321: { 2: 'What do wide feet do for camels?' },
  323: { 0: 'What do telescopes help astronomers do?' },
  326: { 2: 'What does the telephone change a voice into?' },
  329: { 3: 'What makes a volcanic mountain?' },
  334: { 3: 'What did printing do for books?' },
  336: { 1: 'What do scientists use to control rovers?' },
  337: { 3: 'What does electric transport make better in cities?' },
  338: { 3: 'What do weather workers use to follow storms?' },
  341: { 2: 'What makes wind-turbine blades turn?' },
  343: { 0: 'What do living things make in dark places?', 2: 'What do anglerfish use to catch food?', 4: 'What do scientists use bioluminescence for?' },
  344: { 4: 'What do jet planes carry over oceans?' },
  346: { 3: 'What do countries keep Antarctica for?' },
  347: { 3: 'What did dust make over a long time?' },
  349: { ...questionTextOverrides[349], 2: 'What do shallow roots do for cacti?' },
  350: { 3: 'What do weather workers use to warn people?' },
  351: { 2: 'What do wind turbines use to make electricity?' },
  353: { 4: 'What did printing do for books?' },
  356: { ...questionTextOverrides[356], 4: 'What do scientists make with this light?' },
  357: { 4: 'What does lower pressure help a plane do?' },
  358: { 5: 'What does the Amazon forest help control?' },
  360: { 4: 'What do satellites help people do?' }
});

Object.assign(questionTextOverrides, {
  310: { ...questionTextOverrides[310], 2: 'What do electric bicycles help keep clean?' },
  350: { ...questionTextOverrides[350], 4: 'What do satellites help people do?' },
  353: { ...questionTextOverrides[353], 5: 'What did printing help more people get?' },
  357: { ...questionTextOverrides[357], 2: 'What moves faster over the top of a wing?' },
  358: { ...questionTextOverrides[358], 4: 'What does stopping tree cutting help protect?' }
});

Object.assign(questionTextOverrides, {
  246: { 0: 'What kind of energy is wind?' },
  254: { 0: 'What do green plants make?' },
  256: { 2: 'What do wind turbines use to make electricity?' },
  327: { 0: 'What kind of energy is wind?' },
  341: { 0: 'What does wind power use?' },
  342: { 1: 'What pulls ocean water?' },
  347: { 4: 'What pulls the dust to the middle?' },
  351: { 2: 'What do wind turbines use to make electricity?', 3: 'What does flowing water do at a dam?' },
  354: { 1: 'What part of a leaf catches sunlight?' },
  357: { ...questionTextOverrides[357], 0: 'What helps an airplane fly?' },
  360: { ...questionTextOverrides[360], 0: 'What are hurricanes?', 1: 'What does the hot sun make sea water do?' }
});

const optionOverrides = {
  246: { 0: { options: ['Clean energy', 'Coal power', 'Gasoline power', 'Dirty smoke'], correct: 0 } },
  254: { 0: { options: ['Food', 'Shoes', 'Books', 'Toys'], correct: 0 } },
  256: { 2: { options: ['Moving air', 'Hot fire', 'Coal', 'Rain'], correct: 0 } },
  312: { 0: { options: ['Rockets', 'Airplanes', 'Hot-air balloons', 'Submarines'], correct: 0 } },
  327: { 0: { options: ['Clean energy', 'Coal power', 'Gasoline power', 'Dirty smoke'], correct: 0 } },
  340: { 1: { options: ['High above Earth', 'Inside a school', 'Under the sea', 'On a farm'], correct: 0 } },
  341: { 0: { options: ['Moving air', 'Hot water', 'Coal', 'Oil'], correct: 0 } },
  342: { 1: { options: ['The moon and sun', 'Strong wind', 'Hot water', 'Big ships'], correct: 0 } },
  347: { 4: { options: ['Gravity', 'Wind', 'Rain', 'Fire'], correct: 0 } },
  351: {
    2: { options: ['Moving air', 'Sunlight', 'Coal', 'Hot sand'], correct: 0 },
    3: { options: ['It turns turbines', 'It makes wind', 'It grows trees', 'It makes snow'], correct: 0 }
  },
  352: {
    3: { options: ['Food', 'Sand', 'Rocks', 'Boats'], correct: 0 },
    4: { options: ['Protect sea animals', 'Make more ships', 'Create islands', 'Help fishing boats'], correct: 0 }
  },
  354: {
    1: { options: ['The green part', 'The roots', 'The flower', 'The stem'], correct: 0 },
    4: { options: ['Oxygen', 'Rain', 'Soil', 'Wind'], correct: 0 }
  },
  357: { 0: { options: ['Moving air around wings', 'Heavy wheels', 'Warm seats', 'Bright lights'], correct: 0 } },
  358: { 5: { options: ['Weather', 'Snow', 'Traffic', 'School time'], correct: 0 } },
  360: {
    0: { options: ['Very large storms', 'Small rain showers', 'Snowstorms', 'Sandstorms'], correct: 0 },
    1: { options: ['It goes into the air', 'It turns to ice', 'It becomes sand', 'It stops moving'], correct: 0 }
  }
};

Object.assign(questionOverrides, {
  341: [
    { q: 'What does wind power use?', options: ['Moving air', 'Hot water', 'Coal', 'Oil'], correct: 0 },
    { q: 'What makes air pressure different?', options: ['The sun heating land and water', 'The moon moving', 'Big ships', 'Rain falling'], correct: 0 },
    { q: 'Where does air move?', options: ['From high pressure to low pressure', 'From low pressure to high pressure', 'Only in circles', 'Only straight up'], correct: 0 },
    { q: 'What does a generator make?', options: ['Electricity', 'Food', 'Water', 'Sand'], correct: 0 },
    { q: 'What does wind power not make?', options: ['Dirty smoke', 'Clean electricity', 'Moving blades', 'Power for homes'], correct: 0 }
  ],
  347: [
    { q: 'When did our solar system begin?', options: ['4.6 billion years ago', 'One thousand years ago', 'One hundred years ago', 'Ten years ago'], correct: 0 },
    { q: 'What was the solar system made from first?', options: ['Gas and dust', 'Water and ice', 'Trees and soil', 'Rocks and sand'], correct: 0 },
    { q: 'What did the middle become?', options: ['The sun', 'The moon', 'Earth', 'Mars'], correct: 0 },
    { q: 'What made the planets?', options: ['Dust hitting together', 'Rain falling', 'Wind blowing', 'Ice melting'], correct: 0 },
    { q: 'What pulls dust to the middle?', options: ['Gravity', 'Wind', 'Rain', 'Fire'], correct: 0 }
  ],
  354: [
    { q: 'What do green plants make?', options: ['Food', 'Shoes', 'Books', 'Toys'], correct: 0 },
    { q: 'What part of a leaf catches sunlight?', options: ['The green part', 'The roots', 'The flower', 'The stem'], correct: 0 },
    { q: 'What do roots take from the soil?', options: ['Water and minerals', 'Clouds and rain', 'Birds and bugs', 'Stones and sand'], correct: 0 },
    { q: 'What does sunlight help the plant make?', options: ['Sugar and oxygen', 'Snow and ice', 'Sand and rocks', 'Smoke and dust'], correct: 0 },
    { q: 'What does the plant give the air?', options: ['Oxygen', 'Rain', 'Soil', 'Wind'], correct: 0 },
    { q: 'What gas does the plant take from the air?', options: ['Carbon dioxide', 'Oxygen', 'Steam', 'Smoke'], correct: 0 }
  ],
  355: [
    { q: 'What planet do robot rovers visit?', options: ['Mars', 'The moon', 'Venus', 'Jupiter'], correct: 0 },
    { q: 'What rover is named in the text?', options: ['Perseverance', 'Voyager', 'Hubble', 'Apollo'], correct: 0 },
    { q: 'What do rovers have to study rocks?', options: ['Cameras and drills', 'Kites and balls', 'Books and pens', 'Buses and bikes'], correct: 0 },
    { q: 'What do rovers study on Mars?', options: ['Old rocks', 'Tall trees', 'Deep oceans', 'Green grass'], correct: 0 },
    { q: 'What signs do scientists look for?', options: ['Tiny life from long ago', 'New school buildings', 'Big city roads', 'Fresh snow'], correct: 0 },
    { q: 'What may robots help people do one day?', options: ['Travel to Mars', 'Move the moon', 'Stop the sun', 'Make an ocean'], correct: 0 }
  ]
});

Object.assign(questionTextOverrides, {
  226: { 3: 'What do firefighters do?' },
  228: { 3: 'What did Ella win?' },
  234: { 3: 'What do they look at after dark?' },
  237: { 2: 'Who guides the trucks?' },
  245: { 0: 'What do honeybees help?' },
  255: { 1: 'What robot car is named in the text?' },
  256: { ...questionTextOverrides[256], 0: 'What is clean energy?' },
  257: { 0: 'What do honeybees help grow?', 4: 'What do honeybees help people have?' },
  310: { ...questionTextOverrides[310], 0: 'What runs the motor on an electric bike?' },
  321: { 0: 'Where do camels live?' },
  323: { ...questionTextOverrides[323], 0: 'What do telescopes help people see?' },
  328: { ...questionTextOverrides[328], 3: 'What does dirty sea water hurt?' },
  331: { 3: 'What does bee pollination help people do?' },
  333: { 2: 'What is the deep ocean like?' },
  336: { 2: 'What tools do Mars rovers use?' },
  337: { 0: 'What runs an electric car?' },
  338: { 1: 'What makes wet air rise in a hurricane?' },
  342: { ...questionTextOverrides[342], 0: 'What do ocean tides do?', 3: 'What do tide power stations use?', 4: 'What is tide movement like?' },
  345: { 3: 'What shape is a rainbow?' },
  348: { 3: 'What did paper help people do?' },
  349: { ...questionTextOverrides[349], 2: 'What do shallow roots do for cacti?' },
  350: { ...questionTextOverrides[350], 1: 'What makes hurricane winds strong?' },
  351: { ...questionTextOverrides[351], 5: 'What do solar panels make?' },
  352: { ...questionTextOverrides[352], 5: 'What can hurt the Great Barrier Reef?' },
  353: { ...questionTextOverrides[353], 3: 'What did printing help more people do?', 4: 'What did printing do for books?' },
  358: { ...questionTextOverrides[358], 3: 'Who has lived in the Amazon for many years?' },
  359: { ...questionTextOverrides[359], 1: 'Who was the Great Pyramid built for?', 4: 'What did builders use to move stone blocks?', 5: 'What do people study about the pyramids?' },
  360: { ...questionTextOverrides[360], 4: 'What do satellites help people do?' }
});

Object.assign(optionOverrides, {
  226: { 3: { options: ['Keep the town safe', 'Paint houses', 'Clean streets', 'Build roads'], correct: 0 } },
  228: { 3: { options: ['A blue ribbon', 'A gold medal', 'A cup', 'A paper note'], correct: 0 } },
  234: { 3: { options: ['Bright stars', 'Moonlight', 'Fireflies', 'Forest animals'], correct: 0 } },
  237: { 2: { options: ['Port workers', 'Captains', 'Sailors', 'Police'], correct: 0 } },
  245: { 0: { options: ['Plants grow', 'Rain fall', 'Soil dig', 'Leaves clean'], correct: 0 } },
  255: { 1: { options: ['Perseverance', 'Curiosity', 'Spirit', 'Voyager'], correct: 0 } },
  256: { ...optionOverrides[256], 0: { options: ['Energy that does not run out', 'Energy from coal', 'Energy that makes smoke', 'Energy used one time'], correct: 0 } },
  257: {
    0: { options: ['Plants and crops', 'Roads and cars', 'Houses and shops', 'Rivers and lakes'], correct: 0 },
    4: { options: ['Enough food', 'More rain', 'Cleaner parks', 'Less wind'], correct: 0 }
  },
  310: { ...optionOverrides[310], 0: { options: ['Small batteries', 'Gasoline', 'Sunlight', 'Wind'], correct: 0 } },
  321: { 0: { options: ['Hot, dry deserts', 'Cold mountains', 'Rainforests', 'Wet fields'], correct: 0 } },
  323: { ...optionOverrides[323], 0: { options: ['Faraway stars', 'Tomorrow’s weather', 'City roads', 'The deep sea'], correct: 0 } },
  328: { ...optionOverrides[328], 3: { options: ['Coral reefs', 'Big ships', 'Sandy beaches', 'Clouds'], correct: 0 } },
  331: { 3: { options: ['Grow food', 'Clean water', 'Cool cities', 'Stop weeds'], correct: 0 } },
  333: { 2: { options: ['Cold and very dark', 'Hot and sunny', 'Warm and dry', 'Bright and noisy'], correct: 0 } },
  336: { 2: { options: ['Cameras and drills', 'Kites and balls', 'Books and pens', 'Buses and bikes'], correct: 0 } },
  337: { 0: { options: ['Batteries', 'Gasoline', 'Steam', 'Coal'], correct: 0 } },
  338: { 1: { options: ['Warm water', 'Cold snow', 'Dry sand', 'Mountain air'], correct: 0 } },
  342: {
    ...optionOverrides[342],
    0: { options: ['They rise and fall', 'They shake the ground', 'They make big waves', 'They stop ships'], correct: 0 },
    3: { options: ['Moving water', 'Sunlight', 'Strong wind', 'Hot sand'], correct: 0 },
    4: { options: ['The same each day', 'Random', 'Very loud', 'Very slow'], correct: 0 }
  },
  345: { 3: { options: ['A colorful arch', 'A straight line', 'A square', 'A spiral'], correct: 0 } },
  348: { 3: { options: ['Write and keep records', 'Make clothes', 'Build houses', 'Stop writing'], correct: 0 } },
  349: { ...optionOverrides[349], 2: { options: ['Catch rain quickly', 'Grow in deep mud', 'Reach deep water', 'Store food'], correct: 0 } },
  350: { ...optionOverrides[350], 1: { options: ['Warm wet air', 'Cold air', 'Volcano heat', 'Ocean tides'], correct: 0 } },
  351: { ...optionOverrides[351], 5: { options: ['Electricity', 'Snow', 'Sand', 'Wind'], correct: 0 } },
  352: { ...optionOverrides[352], 5: { options: ['Warmer, sour water', 'Rain', 'Tides', 'Sand'], correct: 0 } },
  353: {
    ...optionOverrides[353],
    3: { options: ['Read and learn', 'Stop writing', 'Build roads', 'Make rain'], correct: 0 },
    4: { options: ['Made more books', 'Stopped books', 'Made books cost more', 'Closed schools'], correct: 0 }
  },
  358: { ...optionOverrides[358], 3: { options: ['Native people', 'Miners', 'Loggers', 'Tourists'], correct: 0 } },
  359: {
    ...optionOverrides[359],
    1: { options: ['A king named Khufu', 'A king named Ramses', 'A queen named Cleopatra', 'A farmer named Dan'], correct: 0 },
    4: { options: ['Ramps, levers, and workers', 'Cranes and trucks', 'Elephants', 'Steam engines'], correct: 0 },
    5: { options: ['How they were built', 'Where gold is hidden', 'Stories about aliens', 'Paint colors'], correct: 0 }
  },
  360: { ...optionOverrides[360], 4: { options: ['Warn people to leave', 'Stop storms', 'Cool water', 'Block wind'], correct: 0 } }
});

Object.assign(questionTextOverrides, {
  341: { 0: 'What does wind power use?', 1: 'What makes air pressure different?', 2: 'Where does air move?', 3: 'What does a generator make?', 4: 'What does wind power not make?' },
  343: { ...questionTextOverrides[343], 4: 'What do scientists use this light for?' },
  347: { 0: 'When did our solar system begin?', 1: 'What was the solar system made from first?', 2: 'What did the middle become?', 3: 'What made the planets?', 4: 'What pulls dust to the middle?' },
  354: { 0: 'What do green plants make?', 1: 'What part of a leaf catches sunlight?', 2: 'What do roots take from the soil?', 3: 'What does sunlight help the plant make?', 4: 'What does the plant give the air?', 5: 'What gas does the plant take from the air?' },
  355: { 0: 'What planet do robot rovers visit?', 1: 'What rover is named in the text?', 2: 'What do rovers have to study rocks?', 3: 'What do rovers study on Mars?', 4: 'What signs do scientists look for?', 5: 'What may robots help people do one day?' }
});

Object.assign(questionTextOverrides, {
  256: { ...questionTextOverrides[256], 1: 'What do solar panels use to make electricity?', 5: 'What do dams use to make electricity?' },
  331: { ...questionTextOverrides[331], 1: 'What does each honeybee group have?' },
  335: { ...questionTextOverrides[335], 2: 'What helps protect giant sequoias?' },
  339: { ...questionTextOverrides[339], 3: 'What does the Amazon help?' },
  347: { ...questionTextOverrides[347], 4: 'What happened to the gas and dust cloud?' },
  351: { ...questionTextOverrides[351], 1: 'What do solar panels use to make electricity?' }
});

Object.assign(optionOverrides, {
  139: { 2: { options: ['Wooden', 'Metal', 'Plastic', 'Glass'], correct: 0 } },
  154: { 4: { options: ['Everyone claps', 'Everyone runs', 'Everyone sleeps', 'Everyone swims'], correct: 0 } },
  205: { 0: { options: ['By the sea', 'In a city', 'On a farm', 'In a school'], correct: 0 } },
  209: { 2: { options: ['Very good', 'Very bad', 'Like smoke', 'Like fish'], correct: 0 } },
  210: { 1: { options: ['Holes on the moon', 'Trees on the moon', 'Houses on the moon', 'Flowers on the moon'], correct: 0 } },
  212: { 1: { options: ['Art', 'Food', 'Music', 'Games'], correct: 0 } },
  223: { 0: { options: ['Soft rain', 'Hard snow', 'Hot wind', 'Bright sun'], correct: 0 } },
  227: { 2: { options: ['Scared and unsteady', 'Happy and fast', 'Sleepy and quiet', 'Angry and loud'], correct: 0 } },
  228: {
    0: { options: ['In the gym', 'On a bus', 'At a farm', 'In a shop'], correct: 0 },
    3: { options: ['A blue ribbon', 'A gold medal', 'A cup', 'A paper note'], correct: 0 }
  },
  229: { 3: { options: ['Run to the sea', 'Climb a tree', 'Sleep in sand', 'Fly away'], correct: 0 } },
  240: { 2: { options: ['Library workers', 'Bus drivers', 'Farmers', 'Singers'], correct: 0 } },
  244: { 4: { options: ['Colorful sea homes', 'Dry deserts', 'Snowy fields', 'City roads'], correct: 0 } },
  245: { ...optionOverrides[245], 3: { options: ['Far each day', 'Only at night', 'Around one tree', 'Only in winter'], correct: 0 } },
  247: {
    1: { options: ['Long ago', 'Yesterday', 'Next week', 'Tomorrow'], correct: 0 },
    4: { options: ['Towns and factories grew fast', 'Trains stopped', 'Roads disappeared', 'People stopped working'], correct: 0 }
  },
  248: { ...optionOverrides[248], 2: { options: ['Changes electricity for homes', 'Makes food', 'Makes rain', 'Makes wind'], correct: 0 } },
  249: { 1: { options: ['Most animals', 'No animals', 'Only birds', 'Only fish'], correct: 0 }, 3: { options: ['Fruit and hiding places', 'Houses and roads', 'Snow and ice', 'Boats and nets'], correct: 0 } },
  253: { ...optionOverrides[253], 4: { options: ['More people read and learn', 'People stopped reading', 'Books cost more', 'Schools closed'], correct: 0 } },
  256: {
    ...optionOverrides[256],
    1: { options: ['Sunlight', 'Coal', 'Rain', 'Oil'], correct: 0 },
    4: { options: ['Less dirty air', 'More snow', 'More noise', 'Less water'], correct: 0 },
    5: { options: ['Flowing water', 'Hot sand', 'Coal smoke', 'Tree leaves'], correct: 0 }
  },
  322: { ...optionOverrides[322], 1: { options: ['Very big and colorful', 'Very small and gray', 'Very dark and cold', 'Very old and dry'], correct: 0 } },
  325: { ...optionOverrides[325], 1: { options: ['Get away from the cold north', 'Find more rain', 'Build a nest', 'Look for food'], correct: 0 } },
  330: { 0: { options: ['Long ago', 'Yesterday', 'Next week', 'Tomorrow'], correct: 0 } },
  331: { ...optionOverrides[331], 1: { options: ['One queen', 'One dog', 'One horse', 'One cat'], correct: 0 } },
  335: { ...optionOverrides[335], 2: { options: ['Thick bark', 'Thin leaves', 'Small roots', 'Blue flowers'], correct: 0 } },
  339: { ...optionOverrides[339], 3: { options: ['The world’s air and weather', 'City traffic', 'School time', 'Ocean waves'], correct: 0 } },
  342: { ...optionOverrides[342], 0: { options: ['Rising and falling', 'Shaking the ground', 'Making big waves', 'Stopping ships'], correct: 0 } },
  346: { 1: { options: ['Almost all land', 'A little land', 'No land', 'Half the land'], correct: 0 }, 3: { options: ['Peaceful science work', 'Big sports games', 'New city roads', 'Fishing trips'], correct: 0 } },
  347: { ...optionOverrides[347], 4: { options: ['It spun and fell together', 'It turned into ice', 'It grew trees', 'It made rain'], correct: 0 } },
  349: { ...optionOverrides[349], 0: { options: ['Live in hot, dry places', 'Live in ice', 'Live under water', 'Live in cities'], correct: 0 } },
  350: { ...optionOverrides[350], 3: { options: ['Satellites', 'Cars', 'Kites', 'Boats'], correct: 0 } },
  351: { ...optionOverrides[351], 1: { options: ['Sunlight', 'Coal', 'Rain', 'Oil'], correct: 0 } },
  353: { ...optionOverrides[353], 3: { options: ['More people read and learn', 'People stopped reading', 'Books cost more', 'Schools closed'], correct: 0 } },
  357: { ...optionOverrides[357], 4: { options: ['Helps lift the airplane', 'Makes it stop', 'Makes it heavier', 'Makes it smaller'], correct: 0 } },
  358: { ...optionOverrides[358], 2: { options: ['More than one in ten kinds', 'Only one kind', 'No kinds', 'Half of all kinds'], correct: 0 } },
  359: { ...optionOverrides[359], 3: { options: ['North, south, east, and west', 'Only north', 'Only east', 'Only south'], correct: 0 } },
  360: { ...optionOverrides[360], 1: { options: ['Water goes into the air', 'Water turns to ice', 'Water becomes sand', 'Water stops moving'], correct: 0 }, 3: { options: ['The middle eye', 'The outer wind', 'The rain cloud', 'The sea floor'], correct: 0 } }
});

function simpleQuestionStem(question) {
  const source = question.trim().replace(/\?$/, '');
  if (/^(Who|What|Where|When)\b/i.test(source)) return `${source}?`;

  const whoseMatch = source.match(/^Whose\s+(.+?)\s+did\s+(.+?)\s+visit$/i);
  if (whoseMatch) {
    return `Who has the ${whoseMatch[1]} that ${whoseMatch[2]} visited?`;
  }
  if (/^Whose\b/i.test(source)) {
    return `Who is named in this question: ${source.slice(6)}?`;
  }
  if (/^Which\b/i.test(source)) {
    return `What${source.slice(5)}?`;
  }
  const acrossMatch = source.match(/^Across what terrain does (.+?) stretch$/i);
  if (acrossMatch) {
    return `What land does ${acrossMatch[1]} cross?`;
  }
  if (/^How many\b/i.test(source)) {
    return `What number of${source.slice(8)}?`;
  }
  if (/^How often\b/i.test(source)) {
    return `When${source.slice(9)}?`;
  }
  const howStateMatch = source.match(/^How\s+(is|are|was|were)\s+(.+)$/i);
  if (howStateMatch) {
    const [, be, detail] = howStateMatch;
    if (/^(.+?) heated inside (.+)$/i.test(detail)) {
      const heated = detail.match(/^(.+?) heated inside (.+)$/i);
      return `What heated ${heated[1]} inside ${heated[2]}?`;
    }
    if (/^(.+?) dried into (.+)$/i.test(detail)) {
      const dried = detail.match(/^(.+?) dried into (.+)$/i);
      return `What did people do to make ${dried[2]}?`;
    }
    const cleanDetail = detail.replace(/ described$/i, '');
    const todayMatch = cleanDetail.match(/^(.+?)\s+(today|at first)$/i);
    return todayMatch ? `What ${be.toLowerCase()} ${todayMatch[1]} like ${todayMatch[2]}?` : `What ${be.toLowerCase()} ${cleanDetail} like?`;
  }
  const howLongMatch = source.match(/^How long did (.+?) last$/i);
  if (howLongMatch) {
    return `What was the time of ${howLongMatch[1]}?`;
  }
  const howFarMatch = source.match(/^How far do (.+?) travel$/i);
  if (howFarMatch) {
    return `What distance do ${howFarMatch[1]} travel?`;
  }
  const howHighMatch = source.match(/^How high do (.+?) (.+)$/i);
  if (howHighMatch) {
    return `What height do ${howHighMatch[1]} ${howHighMatch[2]}?`;
  }
  const howOldMatch = source.match(/^How old (.+)$/i);
  if (howOldMatch) {
    return `What age is ${howOldMatch[1]}?`;
  }
  const howDidTravelMatch = source.match(/^How did (.+?) travel (.+)$/i);
  if (howDidTravelMatch) {
    return `What did ${howDidTravelMatch[1]} use to travel ${howDidTravelMatch[2]}?`;
  }
  const howDidSmellMatch = source.match(/^How did (.+?) smell(.*)$/i);
  if (howDidSmellMatch) {
    return `What did ${howDidSmellMatch[1]} smell like${howDidSmellMatch[2]}?`;
  }
  const howDidFeelMatch = source.match(/^How did (.+?) feel(.*)$/i);
  if (howDidFeelMatch) {
    return `What was ${howDidFeelMatch[1]} like${howDidFeelMatch[2]}?`;
  }
  const howDidFallMatch = source.match(/^How did (.+?) fall(.*)$/i);
  if (howDidFallMatch) {
    return `What was ${howDidFallMatch[1]} like${howDidFallMatch[2]}?`;
  }
  const howDidImpactMatch = source.match(/^How did (.+?) affect (.+)$/i);
  if (howDidImpactMatch) {
    return `What did ${howDidImpactMatch[1]} do for ${howDidImpactMatch[2]}?`;
  }
  const howDidMethodMatch = source.match(/^How did (.+?) (feed|pay|make|build|move|process|shape|store|travel) (.+)$/i);
  if (howDidMethodMatch) {
    return `What did ${howDidMethodMatch[1]} use to ${howDidMethodMatch[2]} ${howDidMethodMatch[3]}?`;
  }
  if (/^How did\b/i.test(source)) {
    return `What did ${source.slice(8)} use?`;
  }
  const howDoesHelpMatch = source.match(/^How does (.+?) help (.+)$/i);
  if (howDoesHelpMatch) {
    return `What does ${howDoesHelpMatch[1]} do for ${howDoesHelpMatch[2]}?`;
  }
  const howDoesSmellMatch = source.match(/^How does (.+?) smell(.*)$/i);
  if (howDoesSmellMatch) {
    return `What does ${howDoesSmellMatch[1]} smell like${howDoesSmellMatch[2]}?`;
  }
  const howDoesActionMatch = source.match(/^How does (.+?) (bark|purr|run|walk|swim|leap|work|smell|look|react)\b(.*)$/i);
  if (howDoesActionMatch) {
    const actionWords = {
      bark: 'barking', purr: 'purring', run: 'running', walk: 'walking',
      swim: 'swimming', leap: 'leaping', work: 'working', smell: 'smelling',
      look: 'looking', react: 'reacting'
    };
    return `What is ${howDoesActionMatch[1]} like while ${actionWords[howDoesActionMatch[2].toLowerCase()]}${howDoesActionMatch[3]}?`;
  }
  const howDoesMatch = source.match(/^How does (.+)$/i);
  if (howDoesMatch) {
    return `What does ${howDoesMatch[1]} do?`;
  }
  const howDoTalkMatch = source.match(/^How do (.+?) (communicate|talk) (.+)$/i);
  if (howDoTalkMatch) {
    return `What do ${howDoTalkMatch[1]} use to ${howDoTalkMatch[2]} ${howDoTalkMatch[3]}?`;
  }
  const howDoHelpMatch = source.match(/^How do (.+?) help (.+)$/i);
  if (howDoHelpMatch) {
    return `What do ${howDoHelpMatch[1]} do for ${howDoHelpMatch[2]}?`;
  }
  const howDoUseMatch = source.match(/^How do (.+?) (pay|control|track|store) (.+)$/i);
  if (howDoUseMatch) {
    return `What do ${howDoUseMatch[1]} use to ${howDoUseMatch[2]} ${howDoUseMatch[3]}?`;
  }
  const howDoActionMatch = source.match(/^How do (.+?) (laugh|run|swim|work|move|pay|help|fly|travel|react)\b(.*)$/i);
  if (howDoActionMatch) {
    return `What are ${howDoActionMatch[1]} like when they ${howDoActionMatch[2]}${howDoActionMatch[3]}?`;
  }
  if (/^How do\b/i.test(source)) {
    return `What do ${source.slice(7)}?`;
  }
  if (/^How can\b/i.test(source)) {
    const canMatch = source.match(/^How can (.+?) (.+)$/i);
    return canMatch ? `What can ${canMatch[1]} do to ${canMatch[2]}?` : `What can ${source.slice(8)} do?`;
  }
  if (/^Why\b/i.test(source)) {
    const reasonDetail = source.slice(4).replace(/^(do|does|did|is|are|was|were)\s+/i, '');
    const subjectMatch = reasonDetail.match(/^(.+?)\s+(?:travel|drink|leap|visit|cover|swim|help|protect|build|make|look|live|grow|use|need|matter|important|known|vital|essential|crucial|famous|called|described|better|able|can|could|would|happen|happens|happened)\b/i);
    return subjectMatch ? `What does the passage say about ${subjectMatch[1]}?` : 'What is the reason?';
  }
  return `What is the answer in the passage?`;
}

export function reviewReadingPack(passages) {
  return passages.map((passage) => {
    const override = textOverrides[passage.id];
    return {
      ...passage,
      ...(override?.title ? { title: { ...passage.title, ...override.title } } : {}),
      ...(override ? { text: { en: override.en, zh: override.zh } } : {}),
      questions: (questionOverrides[passage.id] || passage.questions).map((question, index) => ({
        ...question,
        ...(optionOverrides[passage.id]?.[index] || {}),
        q: questionTextOverrides[passage.id]?.[index] || simpleQuestionStem(question.q)
      }))
    };
  });
}
