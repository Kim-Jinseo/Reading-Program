const QUESTION_TOTALS = { easy: 3, medium: 4, hard: 5, super_hard: 6 };

const FIELDS = ['title', 'titleZh', 'who', 'whoZh', 'when', 'whenZh', 'action', 'actionZh', 'object', 'objectZh', 'place', 'placeZh', 'ending', 'endingZh'];
const parseStory = row => Object.fromEntries(row.split('|').map((value, index) => [FIELDS[index], value]));

// Each row is a separate scene with its own action, place, object, and ending.
// There are no name-or-time variations of the same passage in this bank.
const STORY_ROWS = {
  '1-2': [
    'Morning Tea|早晨泡茶|Ailin|艾琳|Monday morning|星期一早上|made tea|泡了茶|a blue cup|一个蓝色杯子|the kitchen|厨房|put it on the table|把它放在桌上',
    'A Loose Button|松开的纽扣|Bo|波波|Tuesday afternoon|星期二下午|sewed a button|缝好了一个纽扣|a short thread|一小段线|the sewing corner|缝纫角|showed his shirt to Mom|把他的衬衫给妈妈看',
    'Sandcastle Flag|沙堡小旗|Mei|美美|Saturday morning|星期六早上|made a sandcastle|堆了一个沙堡|a red flag|一面红旗|the sand pit|沙坑|put the flag on top|把旗子插在顶上',
    'Chicken Feed|喂小鸡|Jun|军军|Wednesday morning|星期三早上|fed the chickens|喂了小鸡|corn seeds|玉米粒|the small farm|小农场|closed the pen gate|关上了围栏门',
    'New Shoe Laces|新鞋带|Lan|兰兰|Thursday afternoon|星期四下午|tied her shoe laces|系好了鞋带|two yellow laces|两根黄鞋带|the front step|门前台阶|walked to school|走去学校',
    'Window Plant|窗边植物|Tao|涛涛|Friday morning|星期五早上|watered a plant|给一株植物浇水|a small can|一个小水壶|the classroom window|教室窗边|wiped the wet floor|擦干了湿地板',
    'Paper Crown|纸皇冠|Nina|妮娜|Sunday afternoon|星期日下午|made a paper crown|做了一个纸皇冠|gold paper|金色纸|the art table|美术桌|wore it in the mirror|在镜子前戴上它',
    'Milk Carton Bird|牛奶盒小鸟|Kai|凯凯|Monday afternoon|星期一下午|made a bird feeder|做了一个鸟食盒|an empty milk carton|一个空牛奶盒|the class garden|班级花园|hung it on a branch|把它挂在树枝上',
    'Door Sign|门牌|Rui|瑞瑞|Tuesday morning|星期二早上|painted a door sign|画了一块门牌|blue paint|蓝色颜料|the school gate|学校大门|waited for it to dry|等它晾干',
    'Dragon Drawing|小龙画|Sara|莎莎|Wednesday afternoon|星期三下午|drew a dragon|画了一条龙|green crayons|绿色蜡笔|the reading corner|阅读角|gave the drawing to her teacher|把画送给老师',
    'Moon Calendar|月亮日历|Wei|伟伟|Thursday morning|星期四早上|marked the moon day|标出了月亮的日子|a wall calendar|一本挂历|his bedroom|他的卧室|looked at the sky that night|那天晚上看了天空',
    'Tidy Blocks|整理积木|Lina|丽娜|Friday afternoon|星期五下午|sorted the blocks|整理了积木|a big box|一个大盒子|the play room|游戏室|put the lid on the box|盖上了盒盖',
    'Rain Boots|雨靴|Ming|明明|Saturday afternoon|星期六下午|washed his rain boots|洗了雨靴|a wet cloth|一块湿布|the back door|后门边|left them by the wall|把它们放在墙边',
    'Snack Bowl|点心碗|Yue|月月|Sunday morning|星期日早上|mixed a snack|拌了一份点心|a small bowl|一个小碗|the kitchen table|厨房餐桌|shared it with her brother|和弟弟一起分享',
    'Cat Bed|猫窝|Qiang|强强|Monday morning|星期一早上|made a cat bed|做了一个猫窝|an old towel|一条旧毛巾|the sunny porch|阳光门廊|called the cat inside|叫猫进来',
    'Puddle Bridge|水坑小桥|Xia|夏夏|Tuesday afternoon|星期二下午|laid flat stones|摆好了平石头|three smooth stones|三块光滑的石头|the muddy path|泥泞小路|walked over the puddle|走过了水坑',
    'Bell String|铃铛线|Hao|浩浩|Wednesday morning|星期三早上|fixed a bell string|修好了铃铛线|a long string|一根长线|the class door|教室门上|rang the bell once|摇响了一次铃铛',
    'Orange Slices|橙子片|Fang|芳芳|Thursday afternoon|星期四下午|cut oranges|切了橙子|a round plate|一个圆盘子|the lunch table|午餐桌边|gave one slice to each friend|给每个朋友一片',
    'Toy Box|玩具箱|Chen|晨晨|Friday morning|星期五早上|painted a toy box|给玩具箱上色|a paint brush|一支画笔|the porch|门廊|put the toys inside|把玩具放进去',
    'Bird Nest Watch|看鸟窝|Lele|乐乐|Saturday morning|星期六早上|looked at a bird nest|看了一个鸟窝|a pair of small eyes|一双小眼睛|the old tree|老树旁|walked away quietly|安静地走开了',
    'Soap Bubbles|肥皂泡泡|Peng|鹏鹏|Sunday afternoon|星期日下午|blew bubbles|吹泡泡|a soap ring|一个泡泡圈|the yard|院子|watched them fly away|看着它们飞走',
    'Birthday Card|生日卡片|Ying|莹莹|Monday afternoon|星期一下午|made a birthday card|做了一张生日卡|pink paper|粉色纸|the craft room|手工室|wrote a kind note inside|在里面写了一句祝福',
    'Bamboo Basket|竹篮子|Dong|东东|Tuesday morning|星期二早上|carried pears|搬了梨|a bamboo basket|一个竹篮子|the fruit stall|水果摊|put the basket by the door|把篮子放在门边',
    'Book Cover|书皮|Xue|雪雪|Wednesday afternoon|星期三下午|covered a book|包好了书皮|clear paper|透明书皮纸|the study desk|学习桌|wrote her name on it|在上面写了名字',
    'Yarn Ball|毛线球|An|安安|Thursday morning|星期四早上|rolled yarn|卷好了毛线|a ball of red yarn|一团红毛线|the sofa|沙发旁|put it in a basket|把它放进篮子里',
    'Garden Gate|花园门|Xiao|小小|Friday afternoon|星期五下午|opened the garden gate|打开了花园门|a silver key|一把银色钥匙|the school garden|学校花园|gave the key back to the teacher|把钥匙还给老师',
    'Rice Bowl|米饭碗|Guo|果果|Saturday afternoon|星期六下午|filled rice bowls|盛好了米饭碗|a wooden spoon|一把木勺|the dining room|饭厅|set the bowls on the mat|把碗放在餐垫上',
    'Paper Mask|纸面具|Fei|飞飞|Sunday morning|星期日早上|made a tiger mask|做了一个老虎面具|orange paper|橙色纸|the art room|美术教室|held it over his face|把它举在脸前',
    'Flower Pot|花盆|Jia|佳佳|Monday morning|星期一早上|painted a flower pot|给花盆上色|a tiny sponge|一块小海绵|the balcony|阳台|put a seed in the pot|把一粒种子放进花盆',
    'Clean Spoon|干净勺子|Bin|彬彬|Tuesday afternoon|星期二下午|washed spoons|洗了勺子|warm water|温水|the kitchen sink|厨房水槽|placed them on a towel|把它们放在毛巾上',
    'Chalk Picture|粉笔画|Na|娜娜|Wednesday morning|星期三早上|drew a sun|画了一个太阳|yellow chalk|黄色粉笔|the playground wall|操场墙边|washed her hands|洗了手',
    'Beanbag Toss|沙包投掷|Zhi|志志|Thursday afternoon|星期四下午|threw beanbags|扔了沙包|a hoop|一个圈|the school field|学校操场|counted his points|数了分数',
    'Lunch Cloth|午餐布|Lin|琳琳|Friday morning|星期五早上|folded a lunch cloth|叠好了午餐布|a clean cloth|一块干净布|the lunch room|午餐室|put it in her bag|把它放进书包',
    'Duck Pond|鸭子池塘|Yu|雨雨|Saturday morning|星期六早上|fed ducks|喂了鸭子|small grains|小谷粒|the duck pond|鸭子池塘|watched the ducks swim|看着鸭子游泳',
    'Straw Hat|草帽|Shan|珊珊|Sunday afternoon|星期日下午|cleaned a straw hat|清理了草帽|a soft brush|一把软刷子|the farm shed|农场小棚|hung it on a hook|把它挂在钩子上',
    'Window Curtain|窗帘|Didi|迪迪|Monday afternoon|星期一下午|tied a curtain|系好了窗帘|a blue ribbon|一条蓝丝带|the music room|音乐教室|let the light come in|让阳光照进来',
    'Tiny Boat|小船|Ke|可可|Tuesday morning|星期二早上|floated a paper boat|放了一只纸船|a water tub|一个水盆|the class porch|教室门廊|picked the boat up|把纸船捡起来',
    'Squirrel Nuts|松鼠坚果|Yuan|圆圆|Wednesday afternoon|星期三下午|put nuts down|放下坚果|a paper cup|一个纸杯|the pine tree|松树旁|waited for a squirrel|等一只松鼠来',
    'Laundry Line|晾衣绳|Hong|红红|Thursday morning|星期四早上|hung socks|晾了袜子|two clips|两个夹子|the back yard|后院|took them in before rain|下雨前收了回来',
    'Pencil Case|铅笔盒|Lei|磊磊|Friday afternoon|星期五下午|cleaned a pencil case|清理了铅笔盒|a small cloth|一块小布|the class desk|课桌上|put the pencils back|把铅笔放回去',
    'Drum Beat|鼓声|Ting|婷婷|Saturday afternoon|星期六下午|played a drum|敲了鼓|two drum sticks|两根鼓槌|the school hall|学校礼堂|stopped when the song ended|歌曲结束时停下来',
    'Ice Cubes|冰块|Mao|毛毛|Sunday morning|星期日早上|made ice cubes|做了冰块|an ice tray|一个冰格|the kitchen|厨房|put them in juice|把它们放进果汁里',
    'Fruit Stand|水果摊|Duo|朵朵|Monday morning|星期一早上|picked bananas|挑了香蕉|a cloth bag|一个布袋|the market|市场|gave the bag to her father|把袋子交给爸爸',
    'Red Scarf|红领巾|Song|松松|Tuesday afternoon|星期二下午|washed a red scarf|洗了红领巾|soap water|肥皂水|the wash room|洗衣房|hung it by the window|把它晾在窗边',
    'Water Cup|水杯|Bei|贝贝|Wednesday morning|星期三早上|filled a water cup|装满了水杯|cool water|凉水|the school tap|学校水龙头|took it to class|把它带到教室',
    'Picture Frame|相框|Lulu|露露|Thursday afternoon|星期四下午|made a picture frame|做了一个相框|four ice-cream sticks|四根冰棍棒|the craft table|手工桌|put a family photo in it|把一张家庭照片放进去',
    'Clay Bowl|泥碗|Zhen|真真|Friday morning|星期五早上|shaped a clay bowl|捏了一个泥碗|wet clay|湿泥|the art room|美术教室|left it on the shelf|把它放在架子上',
    'Kite Tail|风筝尾巴|Han|涵涵|Saturday morning|星期六早上|fixed a kite tail|修好了风筝尾巴|long strips of paper|长纸条|the school yard|学校院子|ran with the kite|拿着风筝跑起来',
    'Egg Carton|鸡蛋盒|Lu|露露|Sunday afternoon|星期日下午|sorted eggs|分好了鸡蛋|an egg carton|一个鸡蛋盒|the farm kitchen|农场厨房|put the carton in a cool place|把盒子放在凉快的地方',
    'Market List|购物单|Yi|依依|Monday afternoon|星期一下午|wrote a market list|写了一张购物单|a small notebook|一个小本子|the living room|客厅|gave it to her aunt|把它交给阿姨',
    'Leaf House|树叶小屋|Nuo|诺诺|Tuesday morning|星期二早上|made a leaf house|做了一个树叶小屋|dry leaves|干树叶|the garden path|花园小路|took a photo of it|给它拍了一张照片',
    'Night Light|夜灯|Wen|文文|Wednesday afternoon|星期三下午|checked a night light|检查了夜灯|a new battery|一节新电池|the bedroom|卧室|turned it on at bedtime|睡觉时打开它',
    'Bread Bag|面包袋|Qin|琴琴|Thursday morning|星期四早上|packed bread|装好了面包|a paper bag|一个纸袋|the bakery|面包店|took it home for breakfast|把它带回家当早餐',
    'Cow Brush|刷奶牛|Ning|宁宁|Friday afternoon|星期五下午|brushed a cow|给一头牛刷毛|a wide brush|一把宽刷子|the barn|牛棚|put the brush away|把刷子收起来',
    'Bus Ticket|公交车票|Jing|晶晶|Saturday afternoon|星期六下午|held a bus ticket|拿着一张公交车票|a small ticket|一张小票|the bus stop|公交车站|got on the blue bus|上了蓝色公交车',
    'Snow Footprints|雪地脚印|Yun|芸芸|Sunday morning|星期日早上|followed footprints|跟着脚印走|warm boots|暖和的靴子|the snowy path|雪地小路|went back inside|回到屋里',
    'Lemon Tree|柠檬树|Min|敏敏|Monday morning|星期一早上|picked lemons|摘了柠檬|a little basket|一个小篮子|the lemon tree|柠檬树下|washed the lemons at home|回家洗了柠檬',
    'Plate Stack|盘子堆|Xing|星星|Tuesday afternoon|星期二下午|stacked plates|叠好了盘子|a dry towel|一块干毛巾|the kitchen shelf|厨房架子|counted the plates twice|数了两遍盘子',
    'Lamp Switch|台灯开关|Ao|奥奥|Wednesday morning|星期三早上|turned off a lamp|关掉了一盏灯|his small hand|他的小手|the study room|书房|opened the curtain|拉开了窗帘',
    'Garden Path|花园小路|Xin|欣欣|Thursday afternoon|星期四下午|swept a path|扫了一条小路|a straw broom|一把扫帚|the garden|花园|made a leaf pile|堆起一小堆叶子'
  ],
  '3-4': [
    'Bird Count|数小鸟|Ming|明明|Monday morning|星期一早上|counted sparrows|数了麻雀|a check sheet|一张记录表|the school gate|学校大门|wrote the number in a notebook|把数字写进笔记本',
    'Rain Gauge|雨量计|Lan|兰兰|Tuesday afternoon|星期二下午|measured rainwater|测量了雨水|a clear rain gauge|一个透明雨量计|beside the classroom|教室旁|shared the number with her class|把数字告诉班里同学',
    'Library Labels|图书标签|Bo|波波|Wednesday morning|星期三早上|labeled library books|给图书馆的书贴标签|colored stickers|彩色贴纸|the reading room|阅览室|placed the books on shelves|把书放到书架上',
    'Paper Bridge|纸桥|Mei|美美|Thursday afternoon|星期四下午|tested a paper bridge|测试了一座纸桥|five small coins|五枚小硬币|the science table|科学桌|wrote down the strongest design|记下最结实的设计',
    'Garden Map|花园地图|Jun|军军|Friday morning|星期五早上|drew a garden map|画了一张花园地图|a ruler|一把尺子|the class garden|班级花园|marked the bean rows|标出了豆子行',
    'Bike Bell|自行车铃|Rui|瑞瑞|Saturday morning|星期六早上|repaired a bike bell|修好了自行车铃|a small screwdriver|一把小螺丝刀|the bike shed|自行车棚|tested the clear sound|试了试清脆的铃声',
    'Seed Packets|种子包|Tao|涛涛|Sunday afternoon|星期日下午|sorted seed packets|整理了种子包|three paper trays|三个纸盘|the garden shed|花园小棚|put each kind in a tray|把每种种子放进一个盘子',
    'Weather Chart|天气图表|Nina|妮娜|Monday afternoon|星期一下午|recorded the weather|记录了天气|a weather chart|一张天气图表|the classroom window|教室窗边|showed the chart to her teacher|把图表给老师看',
    'Noodle Lunch|面条午餐|Kai|凯凯|Tuesday morning|星期二早上|cooked vegetable noodles|煮了蔬菜面|green onions|葱花|the school kitchen|学校厨房|served the noodles in bowls|把面条盛进碗里',
    'Clean Riverbank|清洁河岸|Lina|丽娜|Wednesday afternoon|星期三下午|collected litter|捡起了垃圾|large gloves|一副大手套|the riverbank|河岸边|put the bags by the bin|把垃圾袋放在垃圾桶边',
    'Class Costumes|班级服装|Wei|伟伟|Thursday morning|星期四早上|prepared play costumes|准备了话剧服装|a box of hats|一盒帽子|the music room|音乐教室|placed each costume on a chair|把每套服装放在椅子上',
    'Ant Trail|蚂蚁路线|Sara|莎莎|Friday afternoon|星期五下午|watched ants|观察了蚂蚁|a magnifying glass|一个放大镜|the playground wall|操场墙边|drew the ant trail|画下了蚂蚁路线',
    'Birdhouse Door|鸟屋小门|Yue|月月|Saturday afternoon|星期六下午|fixed a birdhouse door|修好了鸟屋小门|a small hinge|一个小铰链|behind the school|学校后面|watched a bird look inside|看见一只鸟往里面看',
    'Pumpkin Row|南瓜行|Qiang|强强|Sunday morning|星期日早上|planted pumpkin seeds|种下了南瓜种子|soft soil|松软的土|the class garden|班级菜园|marked the row with a stick|用小棍标出了那一行',
    'Sports Boxes|器材箱|Xia|夏夏|Monday morning|星期一早上|organized sports boxes|整理了运动器材箱|an equipment list|一张器材清单|the gym door|体育馆门口|put the balls in one box|把球放进一个箱子',
    'Fresh Vegetables|新鲜蔬菜|Hao|浩浩|Tuesday afternoon|星期二下午|chose vegetables|挑选了蔬菜|a cloth bag|一个布袋|the morning market|早市|washed them at home|回家洗了蔬菜',
    'Direction Signs|方向牌|Fang|芳芳|Wednesday morning|星期三早上|painted direction signs|画好了方向牌|blue paint|蓝色颜料|the school path|学校小路|stood the signs in the ground|把牌子立在地上',
    'Dance Steps|舞步练习|Chen|晨晨|Thursday afternoon|星期四下午|practiced dance steps|练习了舞步|a music player|一个音乐播放器|the school hall|学校礼堂|clapped at the end|最后拍了拍手',
    'Eggshell Soil|蛋壳土|Lele|乐乐|Friday morning|星期五早上|crushed eggshells|碾碎了蛋壳|a wooden spoon|一把木勺|the garden table|花园桌子|mixed them into the soil|把它们拌进土里',
    'Letter Home|写信回家|Peng|鹏鹏|Saturday morning|星期六早上|wrote a letter home|写了一封家书|a blue envelope|一个蓝色信封|the quiet corner|安静角落|put the letter in the mail box|把信投进邮筒',
    'Window Herbs|窗边香草|Ying|莹莹|Sunday afternoon|星期日下午|trimmed mint leaves|剪下了薄荷叶|small scissors|一把小剪刀|the classroom window|教室窗边|put the leaves in a cup|把叶子放进杯子里',
    'Lost Glove|丢失的手套|Dong|东东|Monday afternoon|星期一下午|looked for a glove|寻找一只手套|a flashlight|一把手电筒|the coat room|衣帽间|found it under a bench|在长凳下找到了它',
    'Water Bottle List|水瓶清单|Xue|雪雪|Tuesday morning|星期二早上|counted water bottles|数了水瓶|a pencil list|一张铅笔清单|the school gate|学校大门|gave the list to the monitor|把清单交给班长',
    'Clay Cups|泥杯子|An|安安|Wednesday afternoon|星期三下午|shaped clay cups|捏了泥杯子|wet clay|湿泥|the art room|美术教室|left them on the drying shelf|把它们放在晾干架上',
    'Path Stones|小路石头|Xiao|小小|Thursday morning|星期四早上|moved path stones|搬动了小路石头|a wheelbarrow|一辆独轮车|the village path|村庄小路|made a clear walking line|留出了一条清楚的步行线',
    'Soup Recipe|汤的食谱|Guo|果果|Friday afternoon|星期五下午|copied a soup recipe|抄写了一份汤的食谱|a recipe card|一张食谱卡|the kitchen table|厨房餐桌|read it to her father|读给爸爸听',
    'Sun Shadow|太阳影子|Fei|飞飞|Saturday afternoon|星期六下午|measured a shadow|测量了影子|a long ruler|一把长尺子|the school yard|学校院子|compared it at noon|在中午作了比较',
    'Book Return|还书|Jia|佳佳|Sunday morning|星期日早上|returned story books|归还了故事书|a library card|一张借书卡|the village library|村图书馆|chose one new book|选了一本新书',
    'Broken Pot|破花盆|Bin|彬彬|Monday morning|星期一早上|repaired a flower pot|修好了花盆|strong tape|结实的胶带|the balcony|阳台|put a plant back inside|把植物放回里面',
    'Bean Sprouts|豆芽|Na|娜娜|Tuesday afternoon|星期二下午|checked bean sprouts|查看了豆芽|a small ruler|一把小尺子|the class shelf|班级架子|wrote their height on paper|把它们的高度写在纸上',
    'Village Flag|村旗|Zhi|志志|Wednesday morning|星期三早上|sewed a village flag|缝了一面村旗|red cloth|红布|the community room|社区活动室|hung it by the door|把它挂在门边',
    'Music Notes|音乐笔记|Lin|琳琳|Thursday afternoon|星期四下午|copied music notes|抄写了音符|a note sheet|一张音符纸|the piano room|钢琴室|played the short tune|弹奏了短曲子',
    'Recycling Bin|回收箱|Yu|雨雨|Friday morning|星期五早上|sorted paper cups|整理了纸杯|a large bag|一个大袋子|the recycling bin|回收箱边|tied the bag closed|把袋子扎好',
    'Farm Eggs|农场鸡蛋|Shan|珊珊|Saturday morning|星期六早上|checked farm eggs|检查了农场鸡蛋|a small stamp|一个小印章|the farm kitchen|农场厨房|put a mark on each box|在每个盒子上做了记号',
    'Story Circle|故事圈|Didi|迪迪|Sunday afternoon|星期日下午|read a folk story|读了一个民间故事|a picture book|一本图画书|the reading circle|阅读圈|asked a friend a question|问了朋友一个问题',
    'Pond Leaves|池塘树叶|Ke|可可|Monday afternoon|星期一下午|skimmed pond leaves|捞走了池塘树叶|a small net|一个小网|the school pond|学校池塘|put the leaves in a compost box|把叶子放进堆肥箱',
    'Class Clock|教室时钟|Yuan|圆圆|Tuesday morning|星期二早上|set the class clock|调好了教室时钟|a tiny key|一把小钥匙|the classroom wall|教室墙上|checked it after lunch|午饭后查看了它',
    'Wool Scarf|羊毛围巾|Hong|红红|Wednesday afternoon|星期三下午|folded wool scarves|叠好了羊毛围巾|a basket|一个篮子|the winter drive|冬衣收集处|gave them to the teacher|把它们交给老师',
    'Morning Radio|早间广播|Lei|磊磊|Thursday morning|星期四早上|read a weather note|读了一条天气提示|a microphone|一个麦克风|the school office|学校办公室|ended with a greeting|用问候语结束了广播',
    'Fruit Jam|水果酱|Ting|婷婷|Friday afternoon|星期五下午|stirred fruit jam|搅拌了水果酱|a wooden spoon|一把木勺|the farm kitchen|农场厨房|filled two clean jars|装满了两个干净的罐子',
    'Map Symbols|地图符号|Mao|毛毛|Saturday afternoon|星期六下午|added map symbols|添加了地图符号|colored pencils|彩色铅笔|the study table|学习桌|circled the bridge|圈出了小桥',
    'Wooden Shelf|木架子|Duo|朵朵|Sunday morning|星期日早上|cleaned a wooden shelf|擦干净木架子|a damp cloth|一块湿布|the library room|图书室|put the books back in order|按顺序放回了书',
    'Car Wash|洗车|Song|松松|Monday morning|星期一早上|washed a farm cart|清洗了农场小车|a bucket of water|一桶水|the barn yard|牛棚院子|parked it under a roof|把它停在屋檐下',
    'Moon Notes|月亮笔记|Bei|贝贝|Tuesday afternoon|星期二下午|drew moon shapes|画了月亮形状|a black notebook|一本黑色笔记本|the front porch|前门廊|showed the page to Grandpa|把那一页给爷爷看',
    'Plant Name Tags|植物名牌|Lulu|露露|Wednesday morning|星期三早上|made plant name tags|做了植物名牌|wooden sticks|木棍|the herb bed|香草花坛|pushed them into the soil|把它们插进土里',
    'Bread Delivery|面包配送|Zhen|真真|Thursday afternoon|星期四下午|carried bread rolls|搬运了面包卷|a covered tray|一个带盖托盘|the school bakery|学校面包房|placed them on the lunch table|把它们放到午餐桌上',
    'Wind Sock|风向袋|Han|涵涵|Friday morning|星期五早上|made a wind sock|做了一个风向袋|a paper tube|一个纸筒|the science room|科学教室|watched it move outside|在外面看它飘动',
    'Safe Crossing|安全过路|Lu|露露|Saturday morning|星期六早上|painted crossing lines|画好了过路线|white paint|白色油漆|the village road|村庄道路|waited for the paint to dry|等油漆晾干',
    'Garden Tomatoes|花园番茄|Yi|依依|Sunday afternoon|星期日下午|picked ripe tomatoes|摘了成熟番茄|a woven basket|一个编织篮|the school garden|学校花园|took them to the kitchen|把它们带到厨房',
    'Picture Wall|照片墙|Nuo|诺诺|Monday afternoon|星期一下午|arranged class pictures|摆好了班级照片|sticky tape|双面胶|the hall wall|走廊墙上|stood back to look at them|退后看了看它们',
    'Clean Mats|清洁垫子|Wen|文文|Tuesday morning|星期二早上|shook floor mats|拍打了地垫|a clothes line|一根晾衣绳|the back yard|后院|brought them inside at noon|中午把它们拿进来',
    'Corner Garden|角落花园|Qin|琴琴|Wednesday afternoon|星期三下午|cleared weeds|清除了杂草|garden gloves|园艺手套|the corner garden|角落花园|planted a flower seed|种下一粒花种子',
    'Village Notice|村庄通知|Ning|宁宁|Thursday morning|星期四早上|wrote a village notice|写了一张村庄通知|a large marker|一支粗记号笔|the community board|社区公告栏|pinned it near the top|把它钉在上方',
    'Fish Bowl|鱼缸|Jing|晶晶|Friday afternoon|星期五下午|cleaned a fish bowl|清理了鱼缸|a small net|一个小网|the class shelf|班级架子|put the fish back gently|轻轻把鱼放回去',
    'Bus Route|公交路线|Yun|芸芸|Saturday afternoon|星期六下午|followed a bus route|查看了一条公交路线|a folded map|一张折叠地图|the bus stop|公交车站|circled the right stop|圈出了正确的站点',
    'Seedling Shade|幼苗遮阳|Min|敏敏|Sunday morning|星期日早上|made seedling shade|做了幼苗遮阳棚|a piece of cloth|一块布|the garden row|花园的一行|checked it at noon|在中午查看了它',
    'Plate Pattern|盘子图案|Xing|星星|Monday morning|星期一早上|painted plate patterns|画了盘子图案|a thin brush|一支细画笔|the art table|美术桌|put the plates on a shelf|把盘子放在架子上',
    'Lost Key|丢失的钥匙|Ao|奥奥|Tuesday afternoon|星期二下午|found a lost key|找到了丢失的钥匙|a paper note|一张纸条|the school path|学校小路|gave it to the office|把它交给办公室',
    'Reading Lamp|阅读灯|Xin|欣欣|Wednesday morning|星期三早上|changed a reading lamp|换好了阅读灯|a new bulb|一个新灯泡|the library desk|图书馆桌子|turned the lamp on|打开了灯',
    'Village Clock|村庄时钟|Qiaoqiao|乔乔|Thursday afternoon|星期四下午|repaired a village clock|修好了村庄时钟|a tiny wrench|一把小扳手|the town square|镇广场|set the hands to the right time|把指针调到正确时间'
  ],
  '5-6': [
    'Water-Saving Poster|节水海报|Ming|明明|Monday morning|星期一早上|planned water-saving steps|计划了节水办法|a large poster|一张大海报|the class meeting|班会|put the poster beside the taps|把海报贴在水龙头旁',
    'Village Path Map|村庄小路地图|Lan|兰兰|Tuesday afternoon|星期二下午|mapped village paths|画出了村庄小路地图|a ruler and pencil|尺子和铅笔|the community hall|社区活动室|marked the bridge on the map|在地图上标出了小桥',
    'Sunlight Check|阳光观察|Bo|波波|Wednesday morning|星期三早上|measured plant sunlight|测量了植物的阳光|a small timer|一个小计时器|the greenhouse|温室|recorded the hours of light|记录了光照时间',
    'Book Repair|修补书皮|Mei|美美|Thursday afternoon|星期四下午|repaired book covers|修补了书皮|clear tape|透明胶带|the village library|村图书馆|returned the books to the shelf|把书放回书架',
    'Stream Notes|小溪记录|Jun|军军|Friday morning|星期五早上|recorded stream levels|记录了小溪水位|a measuring stick|一根量尺|the stone bridge|石桥边|compared the number with last week|与上周的数字作了比较',
    'Donated Books|捐赠图书|Rui|瑞瑞|Saturday morning|星期六早上|organized donated books|整理了捐赠图书|paper labels|纸质标签|the library room|图书室|made a list of the new books|列出了新书清单',
    'Wind Vane|风向标|Tao|涛涛|Sunday afternoon|星期日下午|built a wind vane|制作了一个风向标|a plastic arrow|一个塑料箭头|the school roof|学校屋顶|watched which way it turned|观察它转向哪里',
    'Bean Plant Chart|豆苗图表|Nina|妮娜|Monday afternoon|星期一下午|compared bean plants|比较了豆苗|a short ruler|一把短尺子|the classroom window|教室窗边|wrote the heights in a chart|把高度写进图表',
    'Museum Notes|博物馆笔记|Kai|凯凯|Tuesday morning|星期二早上|prepared museum notes|准备了博物馆笔记|a notebook|一本笔记本|the history room|历史教室|read them before the visit|参观前读了笔记',
    'Greenhouse Door|温室门|Lina|丽娜|Wednesday afternoon|星期三下午|repaired a greenhouse door|修好了温室门|a strong hinge|一个结实的铰链|behind the science room|科学教室后面|checked that it closed well|检查门是否关好',
    'Festival Poster|节日海报|Wei|伟伟|Thursday morning|星期四早上|designed a festival poster|设计了一张节日海报|bright markers|彩色记号笔|the art club room|美术社团教室|hung it by the entrance|把它挂在入口旁',
    'Recycled Paper|回收纸|Sara|莎莎|Friday afternoon|星期五下午|sorted recycled paper|整理了回收纸|a paper box|一个纸箱|the recycling bins|回收箱旁|tied the paper into bundles|把纸扎成几捆',
    'Weather Station|气象站参观|Yue|月月|Saturday afternoon|星期六下午|visited a weather station|参观了气象站|a question sheet|一张问题单|outside the town|城外|wrote down the answers|写下了答案',
    'Young Trees|小树苗|Qiang|强强|Sunday morning|星期日早上|planted young trees|种下了小树苗|a bucket of water|一桶水|the school road|学校路边|placed a guard around each tree|给每棵树围上保护圈',
    'Walking Route|步行路线|Xia|夏夏|Monday morning|星期一早上|designed a walking route|设计了一条步行路线|a folded map|一张折叠地图|the village square|村广场旁|marked the safest turns|标出了最安全的转弯处',
    'Sports Check|器材检查|Hao|浩浩|Tuesday afternoon|星期二下午|checked sports equipment|检查了运动器材|a checklist|一张检查表|the storage room|器材室|put a broken cone aside|把坏标志桶放到一边',
    'Safe Steps|安全台阶|Fang|芳芳|Wednesday morning|星期三早上|marked safe steps|标出了安全台阶|yellow paint|黄色油漆|the hill path|山路|waited for the paint to dry|等油漆晾干',
    'History Stories|历史故事|Chen|晨晨|Thursday afternoon|星期四下午|collected history stories|收集了历史故事|a voice recorder|一个录音笔|the community center|社区中心|saved the stories in a folder|把故事保存在文件夹里',
    'Reading Plan|阅读计划|Lele|乐乐|Friday morning|星期五早上|created a reading plan|制定了阅读计划|a calendar page|一张日历纸|the study group|学习小组|gave each reader a copy|给每位读者一份',
    'Soil Samples|土壤样本|Peng|鹏鹏|Saturday morning|星期六早上|tested soil samples|测试了土壤样本|small jars|小罐子|the science garden|科学花园|wrote the colors in a notebook|把颜色写在笔记本里',
    'Bird Migration|鸟类迁徙|Ying|莹莹|Sunday afternoon|星期日下午|tracked migrating birds|记录了迁徙鸟类|binoculars|双筒望远镜|the field edge|田边|circled their direction on a map|在地图上圈出它们的方向',
    'Solar Oven|太阳能烤箱|Dong|东东|Monday afternoon|星期一下午|built a solar oven|制作了一个太阳能烤箱|foil paper|锡纸|the science yard|科学院子|checked the warm box at noon|中午检查了温热的盒子',
    'Rain Barrel|雨水桶|Xue|雪雪|Tuesday morning|星期二早上|checked a rain barrel|检查了雨水桶|a measuring cup|一个量杯|the garden shed|花园小棚|used the water for seedlings|用雨水浇幼苗',
    'Local Recipe|当地食谱|An|安安|Wednesday afternoon|星期三下午|recorded a local recipe|记录了一份当地食谱|a recipe card|一张食谱卡|her grandmother’s kitchen|奶奶的厨房|shared the card with the class|和班级分享了卡片',
    'Bridge Model|桥梁模型|Xiao|小小|Thursday morning|星期四早上|built a bridge model|搭建了桥梁模型|wooden sticks|木棍|the engineering table|工程桌|tested it with small weights|用小重物测试了它',
    'Clean Energy List|清洁能源清单|Guo|果果|Friday afternoon|星期五下午|made an energy list|列了一张能源清单|a blue folder|一个蓝色文件夹|the school office|学校办公室|gave it to the principal|把它交给校长',
    'Tree Ring Study|树轮观察|Fei|飞飞|Saturday afternoon|星期六下午|studied tree rings|观察了树木年轮|a hand lens|一个放大镜|the nature table|自然观察桌|drew the rings carefully|仔细画下年轮',
    'Water Filter|净水器|Jia|佳佳|Sunday morning|星期日早上|made a water filter|做了一个净水器|sand and stones|沙子和石头|the science room|科学教室|poured clear water through it|把清水倒过它',
    'Village Interview|村庄采访|Bin|彬彬|Monday morning|星期一早上|interviewed a farmer|采访了一位农民|a list of questions|一张问题清单|the rice field|稻田|wrote the farmer’s answers|写下农民的回答',
    'Compost Box|堆肥箱|Na|娜娜|Tuesday afternoon|星期二下午|started a compost box|开始使用一个堆肥箱|dry leaves|干树叶|the back garden|后花园|added fruit peels after lunch|午饭后放进果皮',
    'Cloud Journal|云朵日记|Zhi|志志|Wednesday morning|星期三早上|kept a cloud journal|记录了云朵日记|a weather notebook|一本天气笔记本|the school field|学校操场|named the clouds he saw|写下了看到的云名',
    'Book Exchange|图书交换|Lin|琳琳|Thursday afternoon|星期四下午|organized a book exchange|组织了一次图书交换|a sign-up sheet|一张报名表|the reading hall|阅览大厅|put each book on a table|把每本书放在桌上',
    'Water Wheel|水车|Yu|雨雨|Friday morning|星期五早上|made a water wheel|做了一个水车|plastic spoons|塑料勺子|the stream bank|小溪岸边|watched it turn in the flow|看着它在水流中转动',
    'Plant Survey|植物调查|Shan|珊珊|Saturday morning|星期六早上|surveyed wild plants|调查了野生植物|a field guide|一本野外指南|the hillside|山坡|listed three new plant names|列出三个新植物名字',
    'Garden Fence|花园围栏|Didi|迪迪|Sunday afternoon|星期日下午|repaired a garden fence|修好了花园围栏|wire ties|铁丝扎带|the vegetable patch|菜地|checked the fence after rain|雨后检查了围栏',
    'Star Map|星图|Ke|可可|Monday afternoon|星期一下午|used a star map|使用了一张星图|a red flashlight|一把红色手电筒|the school yard|学校院子|found the North Star|找到了北极星',
    'Soil Path|土路修整|Yuan|圆圆|Tuesday morning|星期二早上|leveled a soil path|平整了一条土路|a garden rake|一把园艺耙|the orchard|果园|walked along the smooth path|沿着平整小路走了一遍',
    'Class Newsletter|班级简报|Hong|红红|Wednesday afternoon|星期三下午|edited a class newsletter|编辑了班级简报|a laptop|一台笔记本电脑|the media room|媒体室|printed copies for the class|为班级打印了副本',
    'Seed Bank|种子库|Lei|磊磊|Thursday morning|星期四早上|cataloged seed jars|编目了种子罐|small labels|小标签|the garden store|花园储藏室|arranged the jars by month|按月份摆好了罐子',
    'Community Garden|社区花园|Ting|婷婷|Friday afternoon|星期五下午|planned garden beds|规划了花坛|a grid paper|一张方格纸|the community garden|社区花园|showed the plan to neighbors|把计划给邻居看',
    'River Sketch|河流速写|Mao|毛毛|Saturday afternoon|星期六下午|sketched the riverbank|画了河岸速写|a drawing pad|一本画板|the old bridge|老桥边|labeled the rocks and trees|标出了石头和树木',
    'Solar Lamp|太阳能灯|Duo|朵朵|Sunday morning|星期日早上|tested a solar lamp|测试了一盏太阳能灯|a small panel|一块小面板|the school path|学校小路|checked its light after sunset|日落后检查了灯光',
    'Bee Garden|蜜蜂花园|Song|松松|Monday morning|星期一早上|planted bee flowers|种下了蜜蜂喜欢的花|a seed packet|一包种子|the flower bed|花坛|placed a water dish nearby|在旁边放了水盘',
    'Traffic Count|交通计数|Bei|贝贝|Tuesday afternoon|星期二下午|counted bicycles|数了自行车|a tally sheet|一张统计表|the village crossing|村庄路口|reported the total to the class|把总数报告给班级',
    'Weather Flag|天气旗|Lulu|露露|Wednesday morning|星期三早上|raised a weather flag|升起了一面天气旗|a strong rope|一根结实的绳子|the school pole|学校旗杆|changed it when rain began|下雨时换了旗子',
    'Food Donation|食物捐赠|Zhen|真真|Thursday afternoon|星期四下午|packed food donations|打包了食物捐赠物|cardboard boxes|纸箱|the community room|社区活动室|loaded the boxes onto a cart|把箱子装上小车',
    'Bamboo Measure|竹子测量|Han|涵涵|Friday morning|星期五早上|measured bamboo shoots|测量了竹笋|a tape measure|一把卷尺|the bamboo grove|竹林|compared the tallest shoot|比较了最高的竹笋',
    'Story Archive|故事档案|Lu|露露|Saturday morning|星期六早上|filed old stories|归档了旧故事|a folder box|一个文件盒|the history corner|历史角|wrote the dates on the covers|在封面上写了日期',
    'Water Test|水质测试|Yi|依依|Sunday afternoon|星期日下午|tested pond water|测试了池塘水|test strips|试纸条|the school pond|学校池塘|recorded the color change|记录了颜色变化',
    'Windmill Blades|风车叶片|Nuo|诺诺|Monday afternoon|星期一下午|cut windmill blades|剪下了风车叶片|thick card|硬卡纸|the craft room|手工室|attached them to a wooden stick|把它们装到木棍上',
    'Footpath Signs|步道标志|Wen|文文|Tuesday morning|星期二早上|installed footpath signs|安装了步道标志|metal posts|金属杆|the hill trail|山间小路|checked that each sign faced forward|检查每块牌子是否朝前',
    'Family Tree|家谱树|Qin|琴琴|Wednesday afternoon|星期三下午|made a family tree|制作了一张家谱树|colored cards|彩色卡片|the study room|书房|asked her aunt for one more name|向阿姨问了一个名字',
    'Rainy-Day Plan|雨天计划|Ning|宁宁|Thursday morning|星期四早上|prepared a rainy-day plan|准备了雨天计划|an activity list|一张活动清单|the school hall|学校礼堂|put games into labeled boxes|把游戏放进贴好标签的盒子',
    'Orchard Notes|果园笔记|Jing|晶晶|Friday afternoon|星期五下午|recorded apple trees|记录了苹果树|a clipboard|一个写字夹|the orchard row|果园的一行|marked the trees with ripe fruit|标记了结有成熟果实的树',
    'Model Village|村庄模型|Yun|芸芸|Saturday afternoon|星期六下午|built a village model|搭建了村庄模型|small blocks|小积木|the project table|项目桌|placed the school beside the road|把学校放在道路旁',
    'Clean-Air Board|清洁空气板|Min|敏敏|Sunday morning|星期日早上|updated an air board|更新了空气板|a color chart|一张颜色图表|the school entrance|学校入口|pointed out the day’s color|指出当天的颜色',
    'Library Survey|图书馆调查|Xing|星星|Monday morning|星期一早上|surveyed library readers|调查了图书馆读者|short question cards|简短问题卡|the library door|图书馆门口|counted the finished cards|数了完成的卡片',
    'Bird Shelter|鸟类遮棚|Ao|奥奥|Tuesday afternoon|星期二下午|made a bird shelter|做了一个鸟类遮棚|wooden boards|木板|the school garden|学校花园|placed straw inside the shelter|把稻草放进遮棚',
    'Stream Cleanup|小溪清理|Xin|欣欣|Wednesday morning|星期三早上|cleared stream branches|清理了小溪树枝|work gloves|工作手套|the shallow stream|浅溪|carried the branches to a pile|把树枝搬到一堆',
    'Forest Trail|森林小路|Qiaoqiao|乔乔|Thursday afternoon|星期四下午|marked a forest trail|标出了森林小路|wooden arrows|木头箭头|the forest edge|森林边缘|checked the arrows after the walk|走完后检查了箭头'
  ]
};

const difficultyAt = index => index < 25 ? 'easy' : index < 40 ? 'medium' : index < 50 ? 'hard' : 'super_hard';
const shuffledOptions = (answer, pool, seed) => {
  const source = [...new Set(pool.filter(item => item !== answer))];
  const distractors = [0, 1, 2].map(offset => source[(seed + offset * 17) % source.length]);
  const options = [...distractors];
  options.splice((seed * 3 + 1) % 4, 0, answer);
  return options;
};

const makeText = (grade, story, index) => {
  const { who, whoZh, when, whenZh, action, actionZh, object, objectZh, place, placeZh, ending, endingZh } = story;
  const style = index % 6;
  const isVeryHard = difficultyAt(index) === 'super_hard';
  if (grade === '1-2') {
    const en = [
      `On ${when}, ${who} ${action} at ${place}. ${who} used ${object}. At the end, ${who} ${ending}.`,
      `${who} went to ${place} on ${when}. There, ${who} ${action} with ${object}. Before home, ${who} ${ending}.`,
      `It was ${when}. At ${place}, ${who} ${action}. ${who} used ${object} and then ${ending}.`,
      `At ${place} on ${when}, ${who} ${action}. ${who} had ${object} to help. Later, ${who} ${ending}.`,
      `On ${when}, ${who} took ${object} to ${place}. ${who} ${action}. After that, ${who} ${ending}.`,
      `${who} was at ${place} on ${when}. ${who} ${action} using ${object}. In the end, ${who} ${ending}.`
    ][style];
    const zh = [
      `${whenZh}，${whoZh}在${placeZh}${actionZh}。${whoZh}用了${objectZh}。最后，${whoZh}${endingZh}。`,
      `${whenZh}，${whoZh}去了${placeZh}。在那里，${whoZh}用${objectZh}${actionZh}。回家前，${whoZh}${endingZh}。`,
      `那是${whenZh}。${whoZh}在${placeZh}${actionZh}。${whoZh}用了${objectZh}，然后${endingZh}。`,
      `${whenZh}，${whoZh}在${placeZh}${actionZh}。${whoZh}带了${objectZh}来帮忙。后来，${whoZh}${endingZh}。`,
      `${whenZh}，${whoZh}把${objectZh}带到${placeZh}。${whoZh}${actionZh}。之后，${whoZh}${endingZh}。`,
      `${whenZh}，${whoZh}在${placeZh}。${whoZh}用${objectZh}${actionZh}。最后，${whoZh}${endingZh}。`
    ][style];
    return { en, zh };
  }
  const sentenceSets = grade === '3-4'
    ? [
        [`On ${when}, ${who} ${action} at ${place}.`, `${who} used ${object} for the task.`, `The work needed careful hands.`, `Before leaving, ${who} ${ending}.`],
        [`${who} arrived at ${place} on ${when}.`, `Using ${object}, ${who} ${action}.`, `A classmate watched the work.`, `At the end, ${who} ${ending}.`],
        [`It was ${when} when ${who} went to ${place}.`, `${who} ${action} with ${object}.`, `The job took a short time.`, `Afterward, ${who} ${ending}.`],
        [`At ${place}, ${who} began work on ${when}.`, `${who} ${action} and used ${object}.`, `Everything was kept in order.`, `Later, ${who} ${ending}.`],
        [`On ${when}, ${who} took ${object} to ${place}.`, `There, ${who} ${action}.`, `The task was easy to follow.`, `In the end, ${who} ${ending}.`],
        [`${who} worked at ${place} on ${when}.`, `${who} used ${object} while ${action}.`, `The work was checked once.`, `Before home, ${who} ${ending}.`]
      ]
    : [
        [`On ${when}, ${who} ${action} at ${place}.`, `${who} used ${object} to complete the work.`, `The task was recorded carefully.`, `Before leaving, ${who} ${ending}.`],
        [`${who} arrived at ${place} on ${when} with ${object}.`, `There, ${who} ${action}.`, `The result was checked closely.`, `At the end, ${who} ${ending}.`],
        [`It was ${when} when ${who} went to ${place}.`, `${who} ${action} using ${object}.`, `The work gave useful information.`, `Afterward, ${who} ${ending}.`],
        [`At ${place} on ${when}, ${who} started a task.`, `${who} ${action} with ${object}.`, `Each step was completed in order.`, `Later, ${who} ${ending}.`],
        [`On ${when}, ${who} brought ${object} to ${place}.`, `${who} ${action}.`, `The group could see the result clearly.`, `In the end, ${who} ${ending}.`],
        [`${who} worked at ${place} on ${when}.`, `Using ${object}, ${who} ${action}.`, `The notes were saved for later.`, `Before home, ${who} ${ending}.`]
      ];
  const en = sentenceSets[style].join(' ');
  const zh = [
    `${whenZh}，${whoZh}在${placeZh}${actionZh}。${whoZh}用${objectZh}完成这项工作。这个过程需要细心。离开前，${whoZh}${endingZh}。`,
    `${whenZh}，${whoZh}带着${objectZh}来到${placeZh}。在那里，${whoZh}${actionZh}。一位同学在旁边观看。最后，${whoZh}${endingZh}。`,
    `${whenZh}，${whoZh}去了${placeZh}。${whoZh}用${objectZh}${actionZh}。这项工作花了一些时间。之后，${whoZh}${endingZh}。`,
    `${whenZh}，${whoZh}在${placeZh}开始工作。${whoZh}${actionZh}，还用了${objectZh}。东西都被放得整整齐齐。后来，${whoZh}${endingZh}。`,
    `${whenZh}，${whoZh}把${objectZh}带到${placeZh}。在那里，${whoZh}${actionZh}。任务的步骤很清楚。最后，${whoZh}${endingZh}。`,
    `${whenZh}，${whoZh}在${placeZh}工作。${whoZh}用${objectZh}${actionZh}。完成后又检查了一次。回家前，${whoZh}${endingZh}。`
  ][style];
  if (!isVeryHard) return { en, zh };

  if (grade === '3-4') {
    return {
      en: `${en} A classmate wrote a short note about the work.`,
      zh: `${zh}一位同学写了一条关于这项工作的短笔记。`
    };
  }

  return {
    en: `${en} A classmate asked ${who} one simple question. ${who} gave a short answer before leaving.`,
    zh: `${zh}一位同学问了${whoZh}一个简单的问题。离开前，${whoZh}给出了一个简短的回答。`
  };
};

const buildPassages = (grade, idStart) => {
  const stories = STORY_ROWS[grade].map(parseStory);
  const pools = {
    who: stories.map(story => story.who), action: stories.map(story => story.action), place: stories.map(story => story.place),
    when: stories.map(story => story.when), object: stories.map(story => story.object), ending: stories.map(story => story.ending)
  };
  return stories.map((story, index) => {
    const difficulty = difficultyAt(index);
    const standardQuestions = [
      [`Who ${story.action}?`, story.who, pools.who],
      [`What did ${story.who} do?`, story.action, pools.action],
      [`Where did ${story.who} do this?`, story.place, pools.place],
      [`When did ${story.who} do this?`, story.when, pools.when],
      [`What did ${story.who} use?`, story.object, pools.object],
      [`What did ${story.who} do at the end?`, story.ending, pools.ending]
    ];
    const questionsForPassage = difficulty !== 'super_hard' || grade === '1-2'
      ? standardQuestions.slice(0, QUESTION_TOTALS[difficulty])
      : grade === '3-4'
        ? [
          ['Who wrote a short note about the work?', 'A classmate', ['A classmate', 'A teacher', 'A parent', 'A farmer']],
          ...standardQuestions.slice(1)
        ]
        : [
          [`Who asked ${story.who} a question?`, 'A classmate', ['A classmate', 'A teacher', 'A parent', 'A farmer']],
          ...standardQuestions.slice(1, 5),
          [`What did ${story.who} give before leaving?`, 'a short answer', ['a short answer', 'a song', 'a map', 'a lunch box']]
        ];
    const questions = questionsForPassage.map(([q, answer, pool], questionIndex) => {
      const options = shuffledOptions(answer, pool, index * 7 + questionIndex);
      return { q, options, correct: options.indexOf(answer) };
    });
    return {
      id: idStart + index,
      dayIndex: 60 + index,
      difficulty,
      title: { en: story.title, zh: story.titleZh },
      text: makeText(grade, story, index),
      questions,
      scenarioKey: `${story.action}|${story.place}|${story.object}|${story.ending}`
    };
  });
};

export const ADDITIONAL_READINGS_BY_GRADE = {
  '1-2': buildPassages('1-2', 1001),
  '3-4': buildPassages('3-4', 2001),
  '5-6': buildPassages('5-6', 3001)
};

export const validateAdditionalReadings = () => {
  const errors = [];
  Object.entries(ADDITIONAL_READINGS_BY_GRADE).forEach(([grade, passages]) => {
    const expected = { easy: 25, medium: 15, hard: 10, super_hard: 10 };
    const seen = { ids: new Set(), titles: new Set(), texts: new Set(), scenarios: new Set() };
    passages.forEach((passage, index) => {
      if (passage.dayIndex !== index + 60) errors.push(`${grade}: incorrect day index for ${passage.id}`);
      if (seen.ids.has(passage.id)) errors.push(`${grade}: duplicate id ${passage.id}`);
      seen.ids.add(passage.id);
      if (seen.titles.has(passage.title.en)) errors.push(`${grade}: duplicate title for ${passage.id}`);
      seen.titles.add(passage.title.en);
      if (seen.texts.has(passage.text.en)) errors.push(`${grade}: duplicate passage for ${passage.id}`);
      seen.texts.add(passage.text.en);
      if (seen.scenarios.has(passage.scenarioKey)) errors.push(`${grade}: repeated scenario for ${passage.id}`);
      seen.scenarios.add(passage.scenarioKey);
      const expectedSentenceCount = grade === '1-2' ? 3 : passage.difficulty === 'super_hard' ? (grade === '3-4' ? 5 : 6) : 4;
      const sentenceCount = (passage.text.en.match(/[.!?](?=\s|$)/g) || []).length;
      if (sentenceCount !== expectedSentenceCount) errors.push(`${grade}: incorrect sentence count for ${passage.id}`);
      const chineseSentenceCount = (passage.text.zh.match(/。/g) || []).length;
      if (chineseSentenceCount !== expectedSentenceCount) errors.push(`${grade}: incorrect Chinese sentence count for ${passage.id}`);
      if (passage.questions.length !== QUESTION_TOTALS[passage.difficulty]) errors.push(`${grade}: incorrect question count for ${passage.id}`);
      passage.questions.forEach(question => {
        const answer = question.options[question.correct];
        if (!/^(Who|What|Where|When)\b/.test(question.q)) errors.push(`${grade}: question must be factual for ${passage.id}`);
        if (question.options.length !== 4 || new Set(question.options).size !== 4) errors.push(`${grade}: invalid choices for ${passage.id}`);
        if (!passage.text.en.includes(answer)) errors.push(`${grade}: answer is not in passage for ${passage.id}`);
      });
    });
    if (passages.length !== 60) errors.push(`${grade}: expected 60 passages`);
    Object.entries(expected).forEach(([difficulty, count]) => {
      if (passages.filter(passage => passage.difficulty === difficulty).length !== count) errors.push(`${grade}: incorrect ${difficulty} count`);
    });
  });
  if (errors.length) throw new Error(`Additional reading validation failed:\n${errors.join('\n')}`);
  return true;
};

validateAdditionalReadings();
