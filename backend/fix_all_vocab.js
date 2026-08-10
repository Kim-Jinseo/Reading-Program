import fs from 'fs';
import { pinyin } from 'pinyin-pro';
import { fetchDictDef, MANUAL_DICT, delay } from './vocab_helpers.js';

const frontendPath = '../frontend/user-app/src/data/curriculum.json';
const backendPath = './curriculum.json';

const curriculum = JSON.parse(fs.readFileSync(frontendPath, 'utf8'));

// Common Chinese words to use as distractors when replacing "翻译" in options
const DISTRACTORS = [
  "苹果", "快乐", "帮助", "学校", "很多", "学习", "世界", "太阳", 
  "准备", "简单", "重要", "经常", "朋友", "寻找", "发现", "明白",
  "开始", "保护", "分享", "安全", "安静", "勇敢", "聪明", "故事",
  "动物", "家庭", "音乐", "希望", "相信", "选择", "决定", "成功"
];

let changedCount = 0;
let fixedFanyiCount = 0;
let totalChecked = 0;

async function run() {
  console.log('Starting full vocabulary audit and fix across all 1500 words...');

  for (const grade in curriculum) {
    const vocabList = curriculum[grade].vocab || [];
    console.log(`Processing Grade ${grade} (${vocabList.length} words)...`);

    for (let i = 0; i < vocabList.length; i++) {
      totalChecked++;
      const item = vocabList[i];
      const word = item.word.trim();
      const rawDef = (item.def || '').trim();
      const rawAns = (item.answer || '').trim();

      const isFanyi = rawDef.includes('翻译') || rawAns === '翻译' || item.options.includes('翻译');

      // Determine correct Chinese definition
      let correctZh = '';
      const lowerWord = word.toLowerCase();

      if (MANUAL_DICT[lowerWord]) {
        correctZh = MANUAL_DICT[lowerWord];
      } else if (isFanyi || !rawDef || !/[\u4e00-\u9fa5]/.test(rawDef)) {
        // Fetch from dictionary API
        const dictRes = await fetchDictDef(word);
        if (dictRes) {
          correctZh = dictRes;
        } else {
          // Fallback cleanup of word
          correctZh = word;
        }
        await delay(100); // Be nice to dict API
      } else {
        // Keep existing Chinese definition (strip any existing pinyin)
        const match = rawDef.match(/^([^\(（]+)/);
        correctZh = match ? match[1].trim() : rawDef.trim();
      }

      // Generate pinyin using pinyin-pro
      const py = pinyin(correctZh);
      const newDef = `${correctZh} (${py})`;
      const newAns = correctZh;

      let itemChanged = false;

      if (item.def !== newDef || item.answer !== newAns || isFanyi) {
        if (isFanyi) fixedFanyiCount++;
        itemChanged = true;
        item.def = newDef;
        item.answer = newAns;
      }

      // Fix options
      let newOptions = [...(item.options || [])];
      
      // Remove "翻译" or old wrong answers that equal "翻译"
      newOptions = newOptions.map(opt => (opt === '翻译' || opt.includes('翻译')) ? '' : opt);

      // Ensure newAns is in options
      if (!newOptions.includes(newAns)) {
        // Place newAns where an empty string was, or replace first slot
        const emptyIdx = newOptions.findIndex(o => !o);
        if (emptyIdx !== -1) {
          newOptions[emptyIdx] = newAns;
        } else {
          newOptions[0] = newAns;
        }
        itemChanged = true;
      }

      // Fill any remaining empty or duplicate slots with valid distractors
      let distractorIdx = 0;
      for (let j = 0; j < newOptions.length; j++) {
        if (!newOptions[j] || newOptions.filter(o => o === newOptions[j]).length > 1) {
          while (distractorIdx < DISTRACTORS.length && (DISTRACTORS[distractorIdx] === newAns || newOptions.includes(DISTRACTORS[distractorIdx]))) {
            distractorIdx++;
          }
          newOptions[j] = DISTRACTORS[distractorIdx] || "其他";
          distractorIdx++;
          itemChanged = true;
        }
      }

      item.options = newOptions;

      if (itemChanged) {
        changedCount++;
        if (changedCount <= 50 || isFanyi) {
          console.log(`[Fixed Grade ${grade} #${item.id}] "${word}" -> def: "${item.def}", ans: "${item.answer}"`);
        }
      }
    }
  }

  console.log(`\nAudit finished!`);
  console.log(`Total words checked: ${totalChecked}`);
  console.log(`Fixed '翻译' placeholders: ${fixedFanyiCount}`);
  console.log(`Total entries updated: ${changedCount}`);

  // Write updated data to both frontend and backend curriculum files
  fs.writeFileSync(frontendPath, JSON.stringify(curriculum, null, 2), 'utf8');
  fs.writeFileSync(backendPath, JSON.stringify(curriculum, null, 2), 'utf8');

  console.log(`Saved updated curriculum to ${frontendPath} and ${backendPath}`);
}

run().catch(console.error);
