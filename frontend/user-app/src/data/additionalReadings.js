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

// Each former three-story theme now has three separately written scenes. The
// scene action includes the setting and a different concrete detail, so a new
// passage is never just the same story with another child's name.
const parseSceneRows = (rows) => rows.map(row => {
  const parts = row.split('|');
  return [0, 1, 2].map(index => ({
    label: parts[index * 4],
    labelZh: parts[index * 4 + 1],
    action: parts[index * 4 + 2],
    actionZh: parts[index * 4 + 3]
  }));
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

const LEVEL_ONE_SCENES = parseSceneRows([
  'Bean Cups|豆种小杯|planted bean seeds in three small cups at the school garden|在学校花园的三个小杯子里种下了豆种|Straight Row|整齐小行|planted bean seeds in a straight row at the school garden|在学校花园种下了一整行豆种|Name Signs|姓名小牌|planted bean seeds beside name signs at the school garden|在学校花园的姓名牌旁种下了豆种',
  'Carrot Tray|胡萝卜盘|fed carrots in a shallow tray at the rabbit pen|在兔子围栏里用浅盘喂了胡萝卜|One at a Time|一根一根喂|fed carrots one at a time at the rabbit pen|在兔子围栏里一根一根地喂了胡萝卜|Water Bowl|水碗旁|fed carrots after filling the water bowl at the rabbit pen|在兔子围栏里装满水碗后喂了胡萝卜',
  'Blue Circles|蓝色圆点|painted a paper kite with blue circles at the classroom table|在教室桌子上给纸风筝画了蓝色圆点|Long Tail|长尾巴|painted a paper kite with a long tail at the classroom table|在教室桌子上给纸风筝画了长尾巴|Bright Corners|明亮四角|painted a paper kite with bright corners at the classroom table|在教室桌子上给纸风筝画了明亮的四个角',
  'Red Apples|红苹果|washed apples in a blue bowl at the outdoor tap|在室外水龙头旁的蓝碗里洗了苹果|Clean Skins|干净果皮|washed apples one by one at the outdoor tap|在室外水龙头旁一个一个地洗了苹果|Fruit Plate|水果盘|washed apples before putting them on a plate at the outdoor tap|在室外水龙头旁洗了苹果后把它们放到盘子里',
  'Round Stones|圆石头|collected smooth stones near the grass on the river path|在河边小路的草旁捡了光滑的小石头|Five Stones|五颗石头|collected smooth stones in groups of five on the river path|在河边小路上按五颗一组捡了光滑的小石头|Striped Stone|条纹石头|collected smooth stones with stripes on the river path|在河边小路上捡了有条纹的光滑小石头',
  'Blue Boats|蓝纸船|folded paper boats from blue paper in the art room|在美术教室里用蓝纸折了纸船|Sharp Corners|尖角纸船|folded paper boats with sharp corners in the art room|在美术教室里折了有尖角的纸船|Tub Race|水盆比赛|folded paper boats for a tub race in the art room|在美术教室里折了要在水盆里比赛的纸船',
  'Yellow Flowers|黄花|watered flowers near the yellow blooms in the flower bed|在花坛里给黄花旁的花浇了水|Morning Drops|早晨水滴|watered flowers before the morning sun in the flower bed|在花坛里太阳出来前给花浇了水|Flower Line|一排花|watered flowers along one side of the flower bed|在花坛的一边给一排花浇了水',
  'Red Cup|红杯子|sorted crayons into a red cup on the class shelf|在班级架子上把蜡笔分进红杯子里|Color Groups|颜色分组|sorted crayons by color on the class shelf|在班级架子上按颜色分好了蜡笔|Full Box|装满盒子|sorted crayons before closing the box on the class shelf|在班级架子上分好蜡笔后关上了盒子',
  'Big Leaves|大树叶|made leaf prints with big leaves on a long desk|在长桌上用大树叶做了树叶拓印|Leaf Shapes|树叶形状|made leaf prints with three leaf shapes on a long desk|在长桌上做了三种树叶形状的拓印|Green Print|绿色拓印|made leaf prints with green paint on a long desk|在长桌上用绿色颜料做了树叶拓印',
  'Seed Cup|鸟食小杯|fed bird seeds from a small cup by the old tree|在老树旁用小杯子喂了鸟食|Quiet Tree|安静的树旁|fed bird seeds quietly by the old tree|在老树旁安静地喂了鸟食|Bird Friends|小鸟朋友|fed bird seeds after seeing two birds by the old tree|在老树旁看到两只小鸟后喂了鸟食',
  'Rice and Fruit|米饭和水果|packed lunch boxes with rice and fruit in the kitchen|在厨房里把米饭和水果装进午餐盒|Napkin Pack|餐巾纸包|packed lunch boxes with a paper napkin in the kitchen|在厨房里把餐巾纸装进午餐盒|Full Lunch Box|装满的饭盒|packed lunch boxes before school in the kitchen|在厨房里上学前装好了午餐盒',
  'Dry Leaves|干树叶|swept the path with dry leaves at the school gate|在学校门口扫了有干树叶的小路|Gate Path|校门小路|swept the path beside the school gate|在学校门口旁扫了小路|Leaf Pile|树叶堆|swept the path into a small leaf pile at the school gate|在学校门口把小路上的树叶扫成了一小堆',
  'Door Map|门口地图|drew a simple map of the class door in the reading corner|在阅读角画了教室门口的简单地图|Red Arrow|红箭头|drew a simple map with a red arrow in the reading corner|在阅读角画了有红箭头的简单地图|Friend Map|朋友的地图|drew a simple map for a friend in the reading corner|在阅读角为朋友画了一张简单地图',
  'Ripe Peaches|熟桃子|picked peaches that were ripe in the small orchard|在小果园里摘了熟桃子|Top Basket|装满篮子|picked peaches for the top of a basket in the small orchard|在小果园里摘了要放在篮子上面的桃子|Soft Peaches|软桃子|picked peaches that felt soft in the small orchard|在小果园里摘了摸起来软的桃子',
  'Clean Corners|干净角落|cleaned desks and their corners in Class Two|在二班擦了课桌和桌角|Chair Line|椅子排队|cleaned desks before lining up chairs in Class Two|在二班擦好课桌后排好了椅子|Wet Cloth|湿布|cleaned desks with a damp cloth in Class Two|在二班用湿布擦了课桌',
  'Orange Pieces|橙子小瓣|shared oranges in small pieces at the lunch table|在午餐桌旁把橙子分成小瓣分享|One Each|每人一个|shared oranges so each friend had one at the lunch table|在午餐桌旁分了橙子，让每个朋友都有一个|Round Plate|圆盘子|shared oranges from a round plate at the lunch table|在午餐桌旁从圆盘里分享了橙子',
  'Five Shells|五个贝壳|counted shells in groups of five on the sandy ground|在沙地上按五个一组数了贝壳|Small Shells|小贝壳|counted small shells on the sandy ground|在沙地上数了小贝壳|Shell Cup|贝壳杯|counted shells from a paper cup on the sandy ground|在沙地上从纸杯里数了贝壳',
  'Door Stars|门口星星|hung paper stars above the class door|在教室门上方挂了纸星星|String Stars|线上的星星|hung paper stars on one long string above the class door|在教室门上方的一根长线上挂了纸星星|Bright Wall|明亮墙面|hung paper stars to make a bright wall by the class door|在教室门旁挂了纸星星，让墙面更明亮',
  'Sunny Jar|阳光玻璃罐|planted onion tops in a glass jar in the sunlight|在阳光下的玻璃罐里种下了葱根|Cotton Roots|棉花根|planted onion tops on cotton wool in a glass jar|在玻璃罐的棉花上种下了葱根|Window Jar|窗边玻璃罐|planted onion tops in a glass jar by the window|在窗边的玻璃罐里种下了葱根',
  'Book Stack|一摞书|carried library books in a neat stack to the class library|把一摞整齐的书搬到班级图书角|Book Band|书带|carried library books with a book band to the class library|用书带把图书馆的书搬到班级图书角|Shelf Order|书架顺序|carried library books to put them in order in the class library|把图书馆的书搬到班级图书角并按顺序放好'
]);

const LEVEL_TWO_SCENES = parseSceneRows([
  'Round Door|圆门鸟屋|built a wooden birdhouse with a round door behind the school|在学校后面做了一个有圆门的木制鸟屋|Tree Branch|树枝鸟屋|built a wooden birdhouse for a low tree branch behind the school|在学校后面为低树枝做了一个木制鸟屋|Dry Roof|干屋顶|built a wooden birdhouse with a dry roof behind the school|在学校后面做了一个有干屋顶的木制鸟屋',
  'Color Labels|彩色标签|labeled library books with color stickers in the reading room|在阅览室里用彩色贴纸给图书馆的书贴了标签|Shelf Labels|书架标签|labeled library books for two shelves in the reading room|在阅览室里给两层书架上的图书馆书贴了标签|Book Groups|图书分组|labeled library books by subject in the reading room|在阅览室里按主题给图书馆的书贴了标签',
  'Rainy Morning|雨天早晨|measured rainwater after a rainy morning beside the classroom|在教室旁的雨天早晨后测量了雨水|Clear Marks|清楚刻度|measured rainwater by the clear marks beside the classroom|在教室旁按清楚的刻度测量了雨水|Notebook Number|本子数字|measured rainwater before writing a number beside the classroom|在教室旁测量雨水后准备写下数字',
  'Red Lanterns|红灯笼|made paper lanterns with red string in the art room|在美术教室里用红绳做了纸灯笼|Window Lanterns|窗边灯笼|made paper lanterns for the window in the art room|在美术教室里做了要挂在窗边的纸灯笼|Folded Sides|折边灯笼|made paper lanterns with folded sides in the art room|在美术教室里做了有折边的纸灯笼',
  'Clear Ring|清脆铃声|repaired a bicycle bell that did not ring at the bike shed|在自行车棚旁修好了不响的自行车铃|Small Screw|小螺丝|repaired a bicycle bell with one small screw at the bike shed|在自行车棚旁用一颗小螺丝修了自行车铃|Bell Test|铃声测试|repaired a bicycle bell before testing its sound at the bike shed|在自行车棚旁修好自行车铃后测试了声音',
  'Soft Soil|松软泥土|planted pumpkin seeds in soft soil in the class garden|在班级菜园的松软泥土里种下了南瓜种子|Marked Row|标记小行|planted pumpkin seeds along a marked row in the class garden|在班级菜园标记好的一行里种下了南瓜种子|Seed Spaces|种子间距|planted pumpkin seeds with spaces between them in the class garden|在班级菜园里隔开距离种下了南瓜种子',
  'Ball Box|球类箱子|organized sports boxes with all the balls at the gym door|在体育馆门口把所有球整理进运动器材箱|List Check|清单检查|organized sports boxes while checking an equipment list at the gym door|在体育馆门口一边看器材清单一边整理运动器材箱|Jump Rope Box|跳绳箱子|organized sports boxes for the jump ropes at the gym door|在体育馆门口整理了放跳绳的运动器材箱',
  'Ant Trail|蚂蚁路线|observed ants walking along the playground wall|在操场墙边观察了排队走的蚂蚁|Food Crumb|食物碎屑|observed ants carrying a food crumb by the playground wall|在操场墙边观察了搬食物碎屑的蚂蚁|Magnifying Glass|放大镜|observed ants through a magnifying glass by the playground wall|在操场墙边用放大镜观察了蚂蚁',
  'Green Onion Noodles|葱花面|cooked vegetable noodles with green onions in the school kitchen|在学校厨房里煮了有葱花的蔬菜面|Warm Bowls|热面碗|cooked vegetable noodles for warm bowls in the school kitchen|在学校厨房里煮了要装进热碗里的蔬菜面|Soup Spoon|汤勺|cooked vegetable noodles with a soup spoon in the school kitchen|在学校厨房里用汤勺煮了蔬菜面',
  'Glove Bags|手套袋|collected litter while wearing gloves at the riverbank|在河岸边戴着手套捡了垃圾|Clean Path|干净小路|collected litter from the path at the riverbank|在河岸边的小路上捡了垃圾|Bin Bags|垃圾桶旁袋子|collected litter before putting bags by the bin at the riverbank|在河岸边捡了垃圾后把袋子放到垃圾桶旁',
  'Hat Box|帽子盒|prepared play costumes with a box of hats in the music room|在音乐教室里用一盒帽子准备了话剧服装|Chair Costumes|椅子服装|prepared play costumes for each chair in the music room|在音乐教室里为每把椅子准备了话剧服装|Blue Cape|蓝斗篷|prepared play costumes with a blue cape in the music room|在音乐教室里用蓝斗篷准备了话剧服装',
  'Clean Bottles|干净瓶子|collected reusable bottles in a large bag at the school gate|在学校门口用大袋子收集了可重复使用的瓶子|Bottle Count|瓶子数量|collected reusable bottles before counting them at the school gate|在学校门口收集了可重复使用的瓶子后数了数量|Bottle Line|瓶子排队|collected reusable bottles in a line at the school gate|在学校门口把可重复使用的瓶子排成一行收集',
  'Coin Test|硬币测试|tested paper bridges with small coins on the science table|在科学桌上用小硬币测试了纸桥|Folded Bridge|折叠纸桥|tested paper bridges with folded sides on the science table|在科学桌上测试了有折边的纸桥|Strong Bridge|结实纸桥|tested paper bridges to find the strongest one on the science table|在科学桌上测试纸桥，找出了最结实的一座',
  'Green Basket|绿色菜篮|chose fresh vegetables for a green basket at the morning market|在早市上为绿色菜篮挑选了新鲜蔬菜|Leafy Vegetables|绿叶菜|chose fresh vegetables with green leaves at the morning market|在早市上挑选了有绿叶的新鲜蔬菜|Home Wash|回家清洗|chose fresh vegetables before washing them at home at the morning market|在早市上挑选新鲜蔬菜，准备回家清洗',
  'Blue Arrow|蓝箭头|painted direction signs with blue arrows on the school path|在学校小路旁给方向牌画了蓝色箭头|Ground Signs|地上方向牌|painted direction signs to stand in the ground on the school path|在学校小路旁给要立在地上的方向牌上色|Clear Words|清楚文字|painted direction signs with clear words on the school path|在学校小路旁给写有清楚文字的方向牌上色',
  'Sunny Chart|晴天图表|recorded the daily weather on a sunny chart by the classroom window|在教室窗边的晴天图表上记录了每天的天气|Cloudy Mark|多云标记|recorded the daily weather with a cloudy mark by the classroom window|在教室窗边用多云标记记录了每天的天气|Week of Weather|一周天气|recorded the daily weather for one week by the classroom window|在教室窗边记录了一周的每天天气',
  'Seed Trays|种子托盘|sorted seed packets into small trays in the garden shed|在花园小棚里把种子包分进小托盘|Bean Packets|豆种包|sorted seed packets with bean seeds in the garden shed|在花园小棚里分好了有豆种的种子包|Flower Packets|花种包|sorted seed packets for flowers in the garden shed|在花园小棚里分好了花种包',
  'Slow Steps|慢舞步|practiced dance steps slowly in the school hall|在学校礼堂里慢慢练习了舞步|Music Count|音乐节拍|practiced dance steps while counting the music in the school hall|在学校礼堂里数着音乐节拍练习了舞步|Final Clap|最后拍手|practiced dance steps before the final clap in the school hall|在学校礼堂里最后拍手前练习了舞步',
  'Crushed Shells|碎蛋壳|crushed eggshells with a wooden spoon on the garden table|在花园桌子上用木勺碾碎了蛋壳|Soil Mix|拌进泥土|crushed eggshells before mixing them into soil on the garden table|在花园桌子上碾碎蛋壳后拌进泥土|Small Pieces|小碎片|crushed eggshells into small pieces on the garden table|在花园桌子上把蛋壳碾成小碎片',
  'Blue Envelope|蓝信封|wrote a letter home in a blue envelope in the quiet corner|在安静角落里写了一封装进蓝信封的家书|Family News|家里的消息|wrote a letter home about family news in the quiet corner|在安静角落里写了一封关于家里消息的信|Mail Box|信箱|wrote a letter home before putting it in the mail box in the quiet corner|在安静角落里写好家书，准备投进信箱'
]);

const LEVEL_THREE_SCENES = parseSceneRows([
  'Tap Poster|水龙头海报|planned water-saving steps at the class meeting for a poster beside the taps|在班会上计划了贴在水龙头旁海报的节水办法|Short Showers|短时间洗澡|planned water-saving steps about short showers at the class meeting|在班会上计划了关于短时间洗澡的节水办法|Full Buckets|接满水桶|planned water-saving steps for full buckets at the class meeting|在班会上计划了把水桶接满的节水办法',
  'Bridge Mark|桥梁标记|mapped village paths and marked the bridge at the community hall|在社区活动室画了村庄小路地图并标出小桥|Safe Turn|安全转弯|mapped village paths with a safe turn at the community hall|在社区活动室画了有安全转弯处的村庄小路地图|Market Route|市场路线|mapped village paths to the market at the community hall|在社区活动室画了去市场的村庄小路地图',
  'Light Hours|光照时间|measured sunlight on the plants for two hours in the greenhouse|在温室里测量了植物两小时的阳光|Sunny Shelf|阳光架子|measured sunlight on the plants on a sunny shelf in the greenhouse|在温室里测量了阳光架子上植物的光照|Morning Light|早晨阳光|measured sunlight on the plants before lunch in the greenhouse|在温室里测量了午饭前植物的阳光',
  'Tape Edges|胶带书边|repaired old book covers with tape edges in the village library|在村图书馆里用胶带修补了旧书皮的边缘|Loose Cover|松书皮|repaired old book covers that were loose in the village library|在村图书馆里修补了松开的旧书皮|Shelf Return|放回书架|repaired old book covers before returning them in the village library|在村图书馆里修补旧书皮后把书放回书架',
  'Bridge Ruler|桥边尺子|recorded the stream level with a ruler by the stone bridge|在石桥边用尺子记录了小溪水位|Rainy Level|雨后水位|recorded the stream level after rain by the stone bridge|在石桥边记录了雨后的小溪水位|Week Notes|一周笔记|recorded the stream level for a week by the stone bridge|在石桥边记录了一周的小溪水位',
  'New Shelf|新书架|organized donated books for a new shelf in the library room|在图书室里整理了要放上新书架的捐赠图书|Paper Labels|纸标签|organized donated books with paper labels in the library room|在图书室里用纸标签整理了捐赠图书|Book List|图书清单|organized donated books before making a list in the library room|在图书室里整理捐赠图书后列了清单',
  'Plastic Arrow|塑料箭头|built a simple wind vane with a plastic arrow on the school roof|在学校屋顶上用塑料箭头做了简单风向标|North Wind|北风|built a simple wind vane to show the north wind on the school roof|在学校屋顶上做了能指向北风的简单风向标|Turning Arrow|转动箭头|built a simple wind vane with a turning arrow on the school roof|在学校屋顶上做了有转动箭头的简单风向标',
  'Ruler Chart|尺子图表|compared two bean plants with a ruler by the classroom window|在教室窗边用尺子比较了两株豆苗|Tall Plant|高豆苗|compared two bean plants to find the taller one by the classroom window|在教室窗边比较两株豆苗，找出了更高的一株|Leaf Count|叶子数量|compared two bean plants by their leaf count by the classroom window|在教室窗边按叶子数量比较了两株豆苗',
  'Visit Questions|参观问题|prepared museum notes with visit questions in the history room|在历史教室里准备了有参观问题的博物馆笔记|Old Tool Notes|旧工具笔记|prepared museum notes about old tools in the history room|在历史教室里准备了关于旧工具的博物馆笔记|Notebook Pages|笔记页|prepared museum notes on two notebook pages in the history room|在历史教室里在两页笔记本上准备了博物馆笔记',
  'Strong Hinge|结实铰链|repaired the greenhouse door with a strong hinge behind the science room|在科学教室后面用结实铰链修好了温室门|Closing Test|关门测试|repaired the greenhouse door before testing it behind the science room|在科学教室后面修好温室门后测试了它|Open Door|打开的门|repaired the greenhouse door that stayed open behind the science room|在科学教室后面修好了总是打开的温室门',
  'Entrance Poster|入口海报|designed a festival poster for the entrance in the art club room|在美术社团教室里设计了入口用的节日海报|Bright Markers|彩色记号笔|designed a festival poster with bright markers in the art club room|在美术社团教室里用彩色记号笔设计了节日海报|Festival Time|节日时间|designed a festival poster with the festival time in the art club room|在美术社团教室里设计了写有节日时间的海报',
  'Paper Bundles|纸捆|sorted recycled paper into paper bundles by the recycling bins|在回收桶旁把回收纸分成几捆|Clean Paper|干净回收纸|sorted clean recycled paper by the recycling bins|在回收桶旁分好了干净的回收纸|Paper Box|纸箱|sorted recycled paper into a paper box by the recycling bins|在回收桶旁把回收纸分进纸箱',
  'Question Sheet|问题单|visited the weather station with a question sheet outside the town|在城外带着问题单参观了气象站|Rain Tool|测雨工具|visited the weather station to see a rain tool outside the town|在城外参观了气象站的测雨工具|Answer Notes|答案笔记|visited the weather station before writing answers outside the town|在城外参观气象站后写下了答案',
  'Tree Guards|树苗保护圈|planted young trees with guards along the school road|在学校路边种下了带保护圈的小树苗|Water Buckets|水桶|planted young trees with water buckets along the school road|在学校路边用水桶种下了小树苗|Tree Line|一排树苗|planted young trees in a line along the school road|在学校路边种下了一排小树苗',
  'Safe Turns|安全转弯|designed a walking route with safe turns by the village square|在村广场旁设计了有安全转弯处的步行路线|Map Fold|折叠地图|designed a walking route on a folded map by the village square|在村广场旁的折叠地图上设计了步行路线|Bridge Walk|过桥路线|designed a walking route over the bridge by the village square|在村广场旁设计了经过小桥的步行路线',
  'Cone Check|标志桶检查|checked sports equipment and found a broken cone in the storage room|在器材室里检查运动器材并发现了坏标志桶|Ball List|球类清单|checked sports equipment with a ball list in the storage room|在器材室里用球类清单检查了运动器材|Rope Count|跳绳数量|checked sports equipment by counting ropes in the storage room|在器材室里通过数跳绳检查了运动器材',
  'Yellow Edges|黄色边缘|marked safe steps with yellow paint on the hill path|在山路上用黄色油漆标出了安全台阶|Dry Paint|干油漆|marked safe steps before waiting for paint to dry on the hill path|在山路上标出安全台阶后等油漆晾干|Steep Steps|陡台阶|marked safe steps on the steep part of the hill path|在山路陡的地方标出了安全台阶',
  'Elder Stories|长辈故事|collected local history stories from elders at the community center|在社区中心向长辈收集了当地历史故事|Recorder Folder|录音文件夹|collected local history stories with a voice recorder at the community center|在社区中心用录音笔收集了当地历史故事|Old Bridge Story|老桥故事|collected local history stories about an old bridge at the community center|在社区中心收集了关于老桥的当地历史故事',
  'Calendar Copy|日历副本|created a reading schedule on a calendar page in the study group|在学习小组里在日历纸上制定了阅读计划|Reader Names|读者姓名|created a reading schedule with reader names in the study group|在学习小组里制定了写有读者姓名的阅读计划|Weekly Pages|每周页|created a reading schedule for weekly pages in the study group|在学习小组里制定了每周阅读页数的阅读计划',
  'Jar Colors|罐中颜色|tested soil samples in small jars in the science garden|在科学花园里用小罐子测试了土壤样本|Dry Soil|干土|tested dry soil samples in the science garden|在科学花园里测试了干的土壤样本|Dark Soil|深色土|tested soil samples to find the darkest one in the science garden|在科学花园里测试土壤样本，找出了颜色最深的一份'
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
  const { who, whoZh, helper, helperZh, time, timeZh, theme, scene, variantIndex } = story;
  if (grade === '1-2') {
    return {
      en: variantIndex === 0
        ? `On ${time}, ${who} ${scene.action}. ${helper} brought ${theme.extra} to help. Before going home, they ${theme.finish}.`
        : variantIndex === 1
          ? `${who} ${scene.action} on ${time}. ${helper} helped with ${theme.extra}. After the work, they ${theme.finish}.`
          : `${time} was busy for ${who}, who ${scene.action}. ${helper} shared ${theme.extra}. At the end, they ${theme.finish}.`,
      zh: variantIndex === 0
        ? `${timeZh}，${whoZh}${scene.actionZh}。${helperZh}带来了${theme.extraZh}帮忙。回家前，他们${theme.finishZh}。`
        : variantIndex === 1
          ? `${timeZh}，${whoZh}${scene.actionZh}。${helperZh}用${theme.extraZh}帮忙。活动结束后，他们${theme.finishZh}。`
          : `${timeZh}，${whoZh}${scene.actionZh}。${helperZh}拿出了${theme.extraZh}。最后，他们${theme.finishZh}。`
    };
  }
  if (grade === '3-4') {
    return {
      en: variantIndex === 0
        ? `On ${time}, ${who} ${scene.action}. ${helper} brought ${theme.extra}. They checked each step together. Before the activity ended, they ${theme.finish}.`
        : variantIndex === 1
          ? `${who} ${scene.action} on ${time}. To help, ${helper} brought ${theme.extra}. The pair took turns with the task. At the end, they ${theme.finish}.`
          : `On ${time}, ${who} ${scene.action}. ${helper} brought ${theme.extra}. They talked about the next step. Before leaving, they ${theme.finish}.`,
      zh: variantIndex === 0
        ? `${timeZh}，${whoZh}${scene.actionZh}。${helperZh}带来了${theme.extraZh}。他们一起检查了每一个步骤。活动结束前，他们${theme.finishZh}。`
        : variantIndex === 1
          ? `${timeZh}，${whoZh}${scene.actionZh}。为了帮忙，${helperZh}带来了${theme.extraZh}。两人轮流完成这项工作。最后，他们${theme.finishZh}。`
          : `${timeZh}，${whoZh}${scene.actionZh}。${helperZh}拿出了${theme.extraZh}。他们商量了下一步。离开前，他们${theme.finishZh}。`
    };
  }
  return {
    en: variantIndex === 0
      ? `On ${time}, ${who} ${scene.action}. ${helper} brought ${theme.extra}, which made the task easier. Before they left, they ${theme.finish}. They planned to check the result again next week.`
      : variantIndex === 1
        ? `${who} ${scene.action} on ${time}. To support the work, ${helper} brought ${theme.extra}. They compared their notes before they ${theme.finish}. The pair planned a follow-up check for next week.`
        : `On ${time}, ${who} ${scene.action}. ${helper} brought ${theme.extra} for the group. Before leaving, they ${theme.finish}. Next week, they will look at the result again.`,
    zh: variantIndex === 0
      ? `${timeZh}，${whoZh}${scene.actionZh}。${helperZh}带来了${theme.extraZh}，让这项工作更容易完成。离开前，他们${theme.finishZh}。他们计划下周再查看一次结果。`
      : variantIndex === 1
        ? `${timeZh}，${whoZh}${scene.actionZh}。为了帮忙，${helperZh}带来了${theme.extraZh}。他们比较了笔记，然后${theme.finishZh}。两人计划下周再检查一次。`
        : `${timeZh}，${whoZh}${scene.actionZh}。${helperZh}把${theme.extraZh}分享给小组。离开前，他们${theme.finishZh}。下周，他们会再看一次结果。`
  };
};

const buildPassages = (grade, idStart, themes, sceneRows) => {
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
    const scene = sceneRows[themeIndex]?.[variantIndex];
    const story = { who, whoZh, helper, helperZh, time, timeZh, theme, scene, variantIndex };
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
      title: { en: `${theme.title}: ${scene.label}${suffix}`, zh: `${theme.titleZh}：${scene.labelZh}${suffixZh}` },
      text,
      questions: facts.slice(0, QUESTION_TOTALS[difficulty]).map(([q, answer, pool], questionIndex) => makeQuestion(q, answer, pool, index * 7 + questionIndex))
    };
  }));
};

export const ADDITIONAL_READINGS_BY_GRADE = {
  '1-2': buildPassages('1-2', 1001, LEVEL_ONE_THEMES, LEVEL_ONE_SCENES),
  '3-4': buildPassages('3-4', 2001, LEVEL_TWO_THEMES, LEVEL_TWO_SCENES),
  '5-6': buildPassages('5-6', 3001, LEVEL_THREE_THEMES, LEVEL_THREE_SCENES)
};

export const validateAdditionalReadings = () => {
  const errors = [];
  Object.entries(ADDITIONAL_READINGS_BY_GRADE).forEach(([grade, passages]) => {
    const expected = { easy: 25, medium: 15, hard: 10, super_hard: 10 };
    const expectedSentenceCount = grade === '1-2' ? 3 : 4;
    const seenTexts = new Set();
    const seenTitles = new Set();
    const seenIds = new Set();
    passages.forEach((passage, index) => {
      if (passage.dayIndex !== index + 60) errors.push(`${grade}: incorrect day index for ${passage.id}`);
      if (seenIds.has(passage.id)) errors.push(`${grade}: duplicate id ${passage.id}`);
      seenIds.add(passage.id);
      if (!passage.title?.en || !passage.title?.zh || !passage.text?.en || !passage.text?.zh) errors.push(`${grade}: missing bilingual text for ${passage.id}`);
      if (seenTitles.has(passage.title.en)) errors.push(`${grade}: duplicate title for ${passage.id}`);
      seenTitles.add(passage.title.en);
      const sentenceCount = (passage.text.en.match(/[.!?](?=\s|$)/g) || []).length;
      if (sentenceCount !== expectedSentenceCount) errors.push(`${grade}: incorrect English sentence count for ${passage.id}`);
      if (!/[\u4e00-\u9fff]/.test(passage.text.zh)) errors.push(`${grade}: missing Chinese translation for ${passage.id}`);
      if (seenTexts.has(passage.text.en)) errors.push(`${grade}: duplicate English passage ${passage.id}`);
      seenTexts.add(passage.text.en);
      if (passage.questions.length !== QUESTION_TOTALS[passage.difficulty]) errors.push(`${grade}: incorrect question count for ${passage.id}`);
      passage.questions.forEach(question => {
        if (!/^(Who|What|Where|When)\b/.test(question.q)) errors.push(`${grade}: non-factual question in ${passage.id}`);
        const correctAnswer = question.options[question.correct];
        if (question.options.length !== 4 || new Set(question.options).size !== 4 || correctAnswer === undefined) errors.push(`${grade}: invalid answer choices in ${passage.id}`);
        else if (!passage.text.en.includes(correctAnswer)) errors.push(`${grade}: answer is not supported by the passage for ${passage.id}`);
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
