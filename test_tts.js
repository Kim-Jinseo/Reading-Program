const fetch = require('node-fetch');
async function test() {
  try {
    const res = await fetch('https://reading-program-wine.vercel.app/api/audio/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: "Hello" })
    });
    const text = await res.text();
    console.log(res.status, text.substring(0, 200));
  } catch (e) {
    console.error(e);
  }
}
test();
