const fs = require('fs');
const text = fs.readFileSync('C:\\Users\\joshe\\.gemini\\antigravity\\brain\\b63de11f-710a-4c83-93a7-3c0d3179d2c5\\.system_generated\\steps\\956\\content.md', 'utf8');
const urls = text.match(/https:\/\/[^\s\"\'\<\>]+/g) || [];
const uniqueUrls = [...new Set(urls)].filter(u => u.includes('v4/chat/completions') || u.includes('api.z.ai'));
console.log('URLs found:', uniqueUrls);

const models = text.match(/glm-[a-zA-Z0-9\.\-]+/gi) || [];
const uniqueModels = [...new Set(models)];
console.log('Models found:', uniqueModels);
