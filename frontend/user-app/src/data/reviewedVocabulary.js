// Reviewed vocabulary is kept separate from the imported source list so every
// correction also updates the answer and its answer choices consistently.

const rowsToMap = (rows) => Object.fromEntries(rows.map(row => {
  const [id, word, def] = row.split('|');
  return [Number(id), { word, def }];
}));

const LEVEL_THREE_UPGRADES = rowsToMap([
  '2002|achieve|达到；取得',
  '2011|adapt|适应',
  '2012|advantage|优点；优势',
  '2015|appreciate|欣赏；感激',
  '2016|attract|吸引',
  '2017|audience|观众',
  '2024|average|平均的；平均数',
  '2026|behavior|行为',
  '2027|border|边界',
  '2033|brave|勇敢的',
  '2034|calculate|计算',
  '2038|conservation|保护；节约',
  '2050|pleasant|令人愉快的',
  '2051|careful|仔细的',
  '2053|cheerful|快乐的',
  '2054|central|中心的；中央的',
  '2056|communication|沟通；交流',
  '2057|choice|选择',
  '2059|collect|收集',
  '2060|participate|参加',
  '2064|combine|合并；结合',
  '2065|comfortable|舒服的',
  '2066|connect|连接',
  '2067|consider|考虑',
  '2071|contact|联系',
  '2072|convenient|方便的',
  '2075|cultural|文化的',
  '2078|crowded|拥挤的',
  '2079|custom|习惯；风俗',
  '2081|damage|损坏；损害',
  '2085|decision|决定',
  '2086|depend|依靠；取决于',
  '2088|destination|目的地',
  '2091|discovery|发现',
  '2093|difference|不同；差异',
  '2100|develop|发展；开发',
  '2103|display|展示；显示',
  '2108|lesson|课程',
  '2111|education|教育',
  '2114|elderly|年长的',
  '2115|emotion|情绪',
  '2116|enormous|巨大的',
  '2117|equal|相等的；平等的',
  '2119|national|国家的',
  '2120|experience|经历；经验',
  '2126|expression|表达；表情',
  '2127|familiar|熟悉的',
  '2132|flexible|灵活的',
  '2133|foreign|外国的',
  '2135|generous|慷慨的',
  '2138|guidance|指导',
  '2139|grateful|感激的',
  '2141|health|健康',
  '2143|history|历史',
  '2144|identify|识别；确认',
  '2145|importance|重要性',
  '2146|influence|影响',
  '2151|message|信息',
  '2152|international|国际的',
  '2153|introduce|介绍',
  '2154|investigate|调查；研究',
  '2155|language|语言',
  '2159|local|当地的',
  '2160|manage|管理；设法完成',
  '2161|motivate|激励',
  '2162|patient|有耐心的',
  '2165|neighbor|邻居',
  '2167|nervous|紧张的',
  '2169|result|结果',
  '2173|ordinary|普通的',
  '2174|outdoor|户外的',
  '2175|passenger|乘客',
  '2177|peaceful|安静的；和平的',
  '2178|performance|表演；表现',
  '2179|planet|行星',
  '2180|protective|保护性的',
  '2181|population|人口',
  '2182|positive|积极的；正面的',
  '2186|possible|可能的',
  '2187|prefer|更喜欢',
  '2189|prevent|阻止；防止',
  '2190|previous|之前的',
  '2193|process|过程',
  '2194|project|项目',
  '2197|proper|合适的；正确的',
  '2199|public|公共的',
  '2200|helpful|有帮助的',
  '2201|quality|质量；品质',
  '2210|quickly|迅速地',
  '2211|remember|记住',
  '2214|friendly|友好的',
  '2215|reduce|减少',
  '2216|region|地区',
  '2223|reliable|可靠的',
  '2224|relationship|关系',
  '2225|research|研究',
  '2228|respond|回答；回应',
  '2231|review|复习；评论',
  '2232|route|路线',
  '2234|rural|农村的',
  '2235|secure|安全的；稳固的',
  '2236|schedule|日程；时间表',
  '2238|section|部分',
  '2239|select|选择',
  '2240|serious|严肃的；严重的',
  '2245|shelter|遮蔽物；避难处',
  '2248|signal|信号',
  '2251|similar|相似的',
  '2252|answer|回答；答案',
  '2254|source|来源',
  '2256|simple|简单的',
  '2261|social|社会的；社交的',
  '2262|stream|小溪',
  '2263|strength|力量',
  '2264|structure|结构',
  '2266|style|风格',
  '2270|succeed|成功',
  '2271|suitable|合适的',
  '2279|supply|供应；物资',
  '2280|support|支持；帮助',
  '2281|symbol|符号',
  '2284|thoughtful|体贴的；认真思考的',
  '2285|translate|翻译',
  '2288|unique|独特的',
  '2289|useful|有用的',
  '2290|valley|山谷',
  '2291|variety|多样性；种类',
  '2297|visitor|参观者',
  '2298|waste|浪费；废物',
  '2299|whole|整个的；全部的',
  '2300|wise|明智的',
  '2319|universe|宇宙',
  '2320|easier|更容易的',
  '2357|efficient|高效的',
  '2361|explore|探索',
  '2362|unusual|不寻常的',
  '2363|scientific|科学的',
  '2367|navigation|导航',
  '2368|creature|生物',
  '2372|altitude|高度',
  '2373|urban|城市的',
  '2377|popular|受欢迎的',
  '2378|thought|想法',
  '2380|maintain|保持；维护',
  '2382|summary|总结',
  '2383|vehicle|车辆',
  '2384|perform|表演；执行',
  '2386|operate|运行；操作',
  '2387|confident|自信的',
  '2389|melody|旋律',
  '2393|pause|暂停',
  '2398|forecast|预报',
  '2399|concern|担心；关心',
  '2402|become|变得；成为',
  '2412|sequence|顺序',
  '2413|renewable|可再生的',
  '2414|landscape|风景',
  '2415|sunset|日落',
  '2417|absence|缺席',
  '2418|mainly|主要地',
  '2421|photography|摄影',
  '2428|intelligent|聪明的',
  '2429|continue|继续',
  '2432|solar|太阳的',
  '2433|space|太空',
  '2436|agriculture|农业',
  '2437|drama|戏剧',
  '2438|attitude|态度',
  '2452|slope|斜坡',
  '2454|growth|增长；生长',
  '2456|metal|金属',
  '2464|position|位置；职位',
  '2477|design|设计；图案',
  '2479|worker|工人',
  '2480|practice|练习'
]);

// Corrections for incomplete, inaccurate, or confusing Chinese glosses found
// during a full review of the existing Level 1 and Level 2 lists.
const DEFINITION_CORRECTIONS = {
  '1-2': rowsToMap([
    '4|were|是、在（be 的过去式）', '8|been|是；曾经（be 的过去分词）',
    '31|well|好地；健康的', '34|most|最多；大多数', '52|off|离开；关掉',
    '65|foot|脚；英尺', '112|end|结束；末尾', '113|found|找到（find 的过去式）',
    '128|second|第二；秒', '131|left|左边；离开（leave 的过去式）',
    '145|called|叫作；打电话（call 的过去式）', '148|set|放置；一套',
    '156|looking|看；正在看', '157|chicken|鸡；鸡肉', '164|times|次数；时间',
    '178|point|点；指向', '192|seen|看见（see 的过去分词）',
    '203|took|拿；带走（take 的过去式）', '221|says|说；表示',
    '224|open|打开；开放的', '236|following|接下来的；跟随的',
    '238|makes|制作；使', '245|kind|种类；友善的', '257|means|意味着',
    '260|able|能；能够的', '267|thanks|谢谢；感谢', '276|given|给；给定的',
    '283|single|单个的', '286|coming|到来；即将来的', '300|known|知道的；著名的',
    '323|needs|需要', '332|close|关闭；靠近', '336|looks|看起来；看',
    '360|either|任一的；也（用于否定句）', '370|taken|拿走；带走（过去分词）',
    '373|deal|交易；处理', '392|act|行动；表演', '394|asked|询问（ask 的过去式）',
    '417|works|工作；作品', '443|march|三月；行进', '450|clear|清楚的；清理',
    '452|gets|得到；变得', '460|cost|花费；成本', '461|cut|切；剪',
    '462|field|田地；场地', '463|held|拿着；举行（hold 的过去式）',
    '469|seems|似乎；看起来', '470|thinking|思考；想法',
    '481|points|点；分数', '484|wave|波浪；挥手', '486|shows|展示；节目',
    '496|land|土地；着陆'
  ]),
  '3-4': rowsToMap([
    '1001|site|地点；网站', '1003|account|账户；说明', '1012|similar|相似的',
    '1013|total|总数；全部的', '1060|present|礼物；现在；展示',
    '1103|worth|值得；价值', '1169|upon|在……上；一……就',
    '1185|property|财产；所有物', '1249|race|比赛；赛跑', '1252|sign|标志；符号',
    '1276|ones|一个；那些（代词）', '1285|voice|声音；嗓音',
    '1286|whose|谁的', '1328|cases|情况；案例', '1341|seeing|看；正在看',
    '1385|provided|提供；供给（过去式）', '1455|sort|分类；种类',
    '1462|feet|脚（foot 的复数）', '1465|link|链接；联系'
  ]),
  '5-6': rowsToMap([
    '2022|designed|设计；设计了（过去式）', '2334|exchange|交换；交流',
    '2405|cent|分（钱币单位）', '2451|hearing|听力；听觉',
    '2475|becoming|变得；正在成为', '2494|served|服务；供应（过去式）',
    '2499|renew|更新；续期'
  ])
};

const createChoices = (answer, definitions, index) => {
  const choices = [answer];
  for (let offset = 1; choices.length < 4 && offset < definitions.length; offset += 1) {
    const candidate = definitions[(index + offset * 37) % definitions.length];
    if (!choices.includes(candidate)) choices.push(candidate);
  }
  const answerIndex = index % 4;
  const distractors = choices.slice(1);
  return [...distractors.slice(0, answerIndex), answer, ...distractors.slice(answerIndex)];
};

export const reviewVocabulary = (gradeKey, vocabulary = []) => {
  const replacements = gradeKey === '5-6' ? LEVEL_THREE_UPGRADES : {};
  const corrections = DEFINITION_CORRECTIONS[gradeKey] || {};
  const reviewed = vocabulary.map(item => {
    const update = replacements[item.id] || corrections[item.id];
    const word = update?.word || item.word;
    const def = update?.def || item.def;
    return { ...item, word, def, answer: def };
  });
  const definitions = [...new Set(reviewed.map(item => item.def))];
  const words = reviewed.map(item => item.word.toLowerCase());

  if (reviewed.length !== 500 || new Set(words).size !== reviewed.length || reviewed.some(item => !/^[a-z]+$/i.test(item.word) || !/[\u4e00-\u9fff]/.test(item.def))) {
    throw new Error(`Vocabulary review failed for ${gradeKey}.`);
  }

  return reviewed.map((item, index) => ({
    ...item,
    options: createChoices(item.def, definitions, index)
  }));
};
