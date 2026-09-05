import { blobBase64 } from './shared';
async function compress(canvas, alt) {
  let blob;
  for (const quality of [0.84, 0.7, 0.55, 0.4]) {
    blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
    // Unsupported canvas encoders silently return PNG, which has no useful
    // quality control here. Fall back to JPEG for browsers without WebP export.
    if (blob?.type !== 'image/webp')
      blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (blob && !['image/webp', 'image/jpeg'].includes(blob.type))
      throw Error('This browser cannot create compressed previews. Please upload from another browser.');
    if (blob && blob.size <= 600000) break;
  }
  if (!blob || blob.size > 600000) throw Error('This slide is too large. Export smaller slide images and try again.');
  return { data: await blobBase64(blob), mime: blob.type, bytes: blob.size, alt };
}
export async function prepareSlides(files, onProgress = () => {}) {
  if (!files.length) throw Error('Choose a PDF or slide images.');
  if (files.some((f) => f.size > 60000000))
    throw Error('Each source file must be under 60 MB. Export a smaller PDF or images.');
  const pdf = files.length === 1 && (/\.pdf$/i.test(files[0].name) || files[0].type === 'application/pdf');
  const output = [];
  if (pdf) {
    const pdfjs = await import('pdfjs-dist/webpack.mjs');
    const task = pdfjs.getDocument({
      data: new Uint8Array(await files[0].arrayBuffer()),
      isEvalSupported: false,
      disableAutoFetch: true,
      disableStream: true,
    });
    let document;
    try {
      document = await task.promise;
      if (document.numPages > 40)
        throw Error('Use at most 40 slides per lesson. Remove teacher notes and repeated reward slides.');
      for (let n = 1; n <= document.numPages; n++) {
        onProgress(n, document.numPages);
        const page = await document.getPage(n);
        const base = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: Math.min(1440 / base.width, 1440 / base.height, 2) });
        const canvas = documentCanvas(viewport.width, viewport.height);
        try {
          await page.render({ canvasContext: canvas.getContext('2d'), viewport, background: 'white' }).promise;
          output.push(await compress(canvas, `Slide ${n}`));
        } finally {
          canvas.width = 0;
          canvas.height = 0;
          page.cleanup();
        }
      }
    } finally {
      await task.destroy();
    }
  } else {
    if (files.length > 40 || files.some((f) => !['image/jpeg', 'image/png', 'image/webp'].includes(f.type)))
      throw Error('Choose one PDF, or up to 40 JPEG, PNG or WebP slide images. Export PowerPoint to PDF first.');
    for (let n = 0; n < files.length; n++) {
      onProgress(n + 1, files.length);
      const url = URL.createObjectURL(files[n]);
      const image = new Image();
      try {
        image.src = url;
        await image.decode();
        const scale = Math.min(1, 1440 / image.width, 1440 / image.height);
        const canvas = documentCanvas(image.width * scale, image.height * scale);
        try {
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          output.push(await compress(canvas, files[n].name.slice(0, 200)));
        } finally {
          canvas.width = 0;
          canvas.height = 0;
        }
      } finally {
        URL.revokeObjectURL(url);
      }
    }
  }
  return output;
}
function documentCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas;
}
