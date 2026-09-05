import { prepareSlides } from './prepareSlides';

test('a browser without WebP encoding produces an accepted JPEG preview', async () => {
  const originalImage = window.Image;
  const originalCreate = document.createElement.bind(document);
  const originalUrl = URL.createObjectURL, originalRevoke = URL.revokeObjectURL;
  const formats = [];
  const canvas = { width: 0, height: 0, getContext: () => ({ fillRect() {}, drawImage() {} }),
    toBlob(callback, type) { formats.push(type); callback(new Blob(['test compressed image'], { type: type === 'image/webp' ? 'image/png' : 'image/jpeg' })); } };
  window.Image = class { width = 100; height = 100; async decode() {} };
  URL.createObjectURL = jest.fn(() => 'blob:test'); URL.revokeObjectURL = jest.fn();
  const create = jest.spyOn(document, 'createElement').mockImplementation(tag => tag === 'canvas' ? canvas : originalCreate(tag));
  try {
    const slides = await prepareSlides([{ name: 'slide.jpg', type: 'image/jpeg', size: 100 }]);
    expect(slides[0].mime).toBe('image/jpeg');
    expect(formats).toEqual(['image/webp', 'image/jpeg']);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test');
  } finally {
    create.mockRestore(); window.Image = originalImage; URL.createObjectURL = originalUrl; URL.revokeObjectURL = originalRevoke;
  }
});
