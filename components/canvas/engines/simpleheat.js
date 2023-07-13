if (typeof module !== 'undefined') module.exports = simpleheat;

function simpleheat(ctx, canvasResolution) {
  if (!(this instanceof simpleheat)) return new simpleheat(ctx, canvasResolution);

  // this._canvas = canvas = typeof canvas === 'string' ? document.getElementById(canvas) : canvas;

  this._ctx = ctx;
  this._canvasResolution = canvasResolution;
  this._width = canvasResolution.w;
  this._height = canvasResolution.h;

  this._max = 1;
  this._data = [];
}

simpleheat.prototype = {

  defaultRadius: 25,

  defaultGradient: {
    0.4: 'blue',
    0.6: 'cyan',
    0.7: 'lime',
    0.8: 'yellow',
    1.0: 'red',
  },

  data(data) {
    this._data = data;
    return this;
  },

  max(max) {
    this._max = max;
    return this;
  },

  add(point) {
    this._data.push(point);
    return this;
  },

  clear() {
    this._data = [];
    return this;
  },

  radius(r, blur) {
    blur = blur === undefined ? 15 : blur;

    // create a grayscale blurred circle image that we'll use for drawing points
    const circle = this._circle = this._createCanvas();
    const ctx = circle.getContext('2d');
    const r2 = this._r = r + blur;

    circle.width = circle.height = r2 * 2;

    ctx.shadowOffsetX = ctx.shadowOffsetY = r2 * 2;
    ctx.shadowBlur = blur;
    ctx.shadowColor = 'black';

    ctx.beginPath();
    ctx.arc(-r2, -r2, r, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();

    return this;
  },

  resize() {
    this._width = this._canvasResolution.w;
    this._height = this._canvasResolution.h;
  },

  gradient(grad) {
    // create a 256x1 gradient that we'll use to turn a grayscale heatmap into a colored one
    const canvas = this._createCanvas();
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);

    canvas.width = 1;
    canvas.height = 256;

    for (const i in grad) {
      gradient.addColorStop(+i, grad[i]);
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1, 256);

    this._grad = ctx.getImageData(0, 0, 1, 256).data;

    return this;
  },

  draw(minOpacity) {
    if (!this._circle) this.radius(this.defaultRadius);
    if (!this._grad) this.gradient(this.defaultGradient);

    const ctx = this._ctx;

    ctx.clearRect(0, 0, this._width, this._height);

    // draw a grayscale heatmap by putting a blurred circle at each data point
    for (var i = 0, len = this._data.length, p; i < len; i++) {
      p = this._data[i];
      ctx.globalAlpha = Math.min(Math.max(p[2] / this._max, minOpacity === undefined ? 0.05 : minOpacity), 1);
      ctx.drawImage(this._circle, p[0] - this._r, p[1] - this._r);
    }

    // colorize the heatmap, using opacity value of each pixel to get the right color from our gradient
    const colored = ctx.getImageData(0, 0, this._width, this._height);
    this._colorize(colored.data, this._grad);
    ctx.putImageData(colored, 0, 0);

    return this;
  },

  _colorize(pixels, gradient) {
    for (var i = 0, len = pixels.length, j; i < len; i += 4) {
      j = pixels[i + 3] * 4; // get gradient color from opacity value

      if (j) {
        pixels[i] = gradient[j];
        pixels[i + 1] = gradient[j + 1];
        pixels[i + 2] = gradient[j + 2];
      }
    }
  },

  _createCanvas() {
    if (typeof document !== 'undefined') {
      return document.createElement('canvas');
    }
    // create a new canvas instance in node.js
    // the canvas class needs to have a default constructor without any parameter
    return new this._canvas.constructor();
  },
};
