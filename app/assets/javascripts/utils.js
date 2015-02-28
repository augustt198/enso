// change color brightness
function colorLuminance(hex, lum) {
  // validate hex string
  hex = String(hex).replace(/[^0-9a-f]/gi, '');
  if (hex.length < 6) {
    hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  }
  lum = lum || 0;

  // convert to decimal and change luminosity
  var rgb = "#", c, i;
  for (i = 0; i < 3; i++) {
    c = parseInt(hex.substr(i*2,2), 16);
    c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
    rgb += ("00"+c).substr(c.length);
  }

  return rgb;
}

// create a random color
function randomColor() {
  return '#' + (function co(lor){   return (lor +=
  [0,1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f'][Math.floor(Math.random()*16)])
  && (lor.length == 6) ?  lor : co(lor); })('');
}

// setup arc attr
function initArcAttr(paper) {
  paper.customAttributes.arc = function (xloc, yloc, value, total, r) {
      var alpha = 360 / total * value,
          a = (90 - alpha) * Math.PI / 180,
          x = xloc + r * Math.cos(a),
          y = yloc - r * Math.sin(a),
          path;
      if (total == value) {
          path = [
              ["M", xloc, yloc - r],
              ["A", r, r, 0, 1, 1, xloc - 0.01, yloc - r]
          ];
      } else {
          path = [
              ["M", xloc, yloc - r],
              ["A", r, r, 0, +(alpha > 180), 1, x, y]
          ];
      }
      return {
          path: path
      };
  };
}

// rotate
function rot(elem, deg) {
  elem.transform("r" + deg);
}

// rotate about a point (cx, cy)
function rotAbout(elem, deg, cx, cy) {
  elem.transform("r" + deg + "," + cx + "," + cy);
}
