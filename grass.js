"use strict";

console.clear();
var log = console.log.bind(console);

class Grass {
  constructor(path, offset, width, height, minHeight, maxHeight, maxAngle, startAngle) {
    this.path = path;
    this.width = random(4, 8);
    this.height = random(150, maxHeight);
    this.maxAngle = random(10, maxAngle);
    this.angle = Math.random() * randomSign() * startAngle * Math.PI / 180;
    var offsetX = 1.5; // Start position

    var sx = offset / 2 + random(width - offset);
    var sy = height; // Curvature

    var csx = sx - offsetX;
    var csy = sy - this.height / (Math.random() < 0.5 ? 1 : 2); // Parallel point

    var psx = csx;
    var psy = csy;
    var dx = sx + this.width;
    var dy = sy;
    this.coords = [sx, sy, csx, csy, psx, psy, dx, dy];
    this.growing = false;
    this.morphed = false;
    this.start = 0;
    this.elapsed = 0;
    this.height_ = this.height;
    this.height = random(200, Math.min(500, this.height));
    var ambient = 0.85;
    var color = [Math.floor(random(16, 48) * ambient), Math.floor(random(100, 255) * ambient), Math.floor(random(16, 48) * ambient)];
    var w = this.width / 2;
    var d = `M${sx},${sy + 2},h${w},h${w}z`;
    TweenLite.set(path, {
      fill: `rgb(${color})`,
      attr: {
        d
      }
    });
  }

  rise() {
    this.morphed = true;
    this.growing = false;
    this.elapsed = now() - this.start;
    TweenLite.to(this, random(2.5, 3.5), {
      height: this.height_,
      ease: Power1.easeInOut
    });
  }

  morph(morphSVG) {
    var time = random(1.5, 3.5);
    var delay = random(0.5, 4.5);
    this.growing = true;
    TweenLite.to(this.path, time, {
      morphSVG,
      delay,
      onComplete: () => this.rise()
    });
  }

  update(time) {
    if (this.growing) return;
    time -= this.elapsed;
    var coords = this.coords;
    var tip = Math.sin(time * 0.0007);
    var th = this.angle + Math.PI / 2 + tip * Math.PI / 180 * (this.maxAngle * Math.cos(time * 0.0002));
    var px = coords[0] + this.width + this.height * Math.cos(th);
    var py = coords[1] - this.height * Math.sin(th);
    var d = `M${coords[0]},${coords[1]}`;
    d += `C${coords[0]},${coords[1]},${coords[2]},${coords[3]},${px},${py}`;
    d += `C${px},${py},${coords[4]},${coords[5]},${coords[6]},${coords[7]}z`;

    if (!this.morphed) {
      this.morph(d);
      this.start = now();
    } else {
      this.path.setAttribute("d", d);
    }
  }

  destroy() {
    TweenLite.killTweensOf(this);
    TweenLite.killTweensOf(this.path);
    this.path.parentElement.removeChild(this.path);
  }

}

var xmlns = "http://www.w3.org/2000/svg";
var perf = window.performance;
var now = perf ? perf.now.bind(perf) : Date.now;
var stage = document.querySelector("#stage");
var riseUp = document.querySelector("#rise");
var start = now();
var blades = [];
var offset = 400;
var width = 1200;
var height = 600;
var total = 40;
var minHeight = 125;
var maxHeight = height * 0.8;
var maxAngle = 20;
var startAngle = 40;
TweenLite.set(stage, {
  width,
  height
});
riseUp.addEventListener("click", init);
TweenLite.ticker.addEventListener("tick", render);
init();

function init() {
  blades.forEach(blade => blade.destroy());
  blades = [];

  for (var i = 0; i < total; i++) {
    var path = createSVG("path", stage);
    blades[i] = new Grass(path, offset, width, height, minHeight, maxHeight, maxAngle, startAngle);
  }
}

function render() {
  var elapsed = now() - start;
  if (!blades.length) return;

  for (var i = 0; i < total; i++) {
    blades[i].update(elapsed);
  }
}

function createSVG(type, parent) {
  var node = document.createElementNS(xmlns, type);
  parent && parent.appendChild(node);
  return node;
}

function random(min, max) {
  if (max == null) {
    max = min;
    min = 0;
  }

  return min + Math.random() * (max - min);
}

function randomSign() {
  return Math.random() < 0.5 ? 1 : -1;
}

//camomyle - sleep herbal
//mag+ - magnesium

//black coffee //creatine adds water weight

//lionsmane mushroom chinatown