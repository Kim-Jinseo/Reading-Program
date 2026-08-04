import fs from 'fs';

// A simple dictionary for common difficult words
const custom = {
  "beautiful": "boo-ti-ful",
  "apple": "ap-pul",
  "hello": "hel-low",
  "blue": "bloo",
  "dog": "dawg",
  "cat": "kat",
  "red": "red",
  "run": "run"
};

function generatePhoneticLocal(phrase) {
  return phrase.split(' ').map(word => {
    let clean = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
    if (custom[clean]) return custom[clean];
    
    // Naive rule: hyphenate vowels
    let phon = clean.replace(/([aeiouy]+)/g, "-$1-").replace(/--/g, "-").replace(/^-|-$/g, "");
    return phon || clean;
  }).join(' ');
}

async function run() {
  const data = JSON.parse(fs.readFileSync('curriculum.json', 'utf-8'));
  
  let count = 0;
  for (const grade in data) {
    if (data[grade].speaking) {
       for (const item of data[grade].speaking) {
         item.enPhonetic = generatePhoneticLocal(item.en);
         count++;
       }
    }
  }

  console.log(`Successfully generated phonetics for ${count} sentences using local rules.`);
  fs.writeFileSync('curriculum.json', JSON.stringify(data, null, 2));
}

run();
