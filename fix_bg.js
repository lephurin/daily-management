const Jimp = require('jimp');

Jimp.read('public/dms.png')
  .then(image => {
    // We want to make white (and near white) transparent.
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      
      // If pixel is very close to white
      if (r > 240 && g > 240 && b > 240) {
        this.bitmap.data[idx + 3] = 0; // Make transparent
      }
    });

    image.write('public/dms.png');
    console.log('White background removed from public/dms.png');
  })
  .catch(err => {
    console.error(err);
  });
