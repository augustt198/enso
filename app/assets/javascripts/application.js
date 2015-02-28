// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or any plugin's vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/sstephenson/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery_ujs
//= require turbolinks
//= require_tree .

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

function randomColor() {
  return '#' + (function co(lor){   return (lor +=
  [0,1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f'][Math.floor(Math.random()*16)])
  && (lor.length == 6) ?  lor : co(lor); })('');
}

function initArcAttr(paper) {
  // setup arc attr
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

$(document).ready(function() {
  /*
  var paper = Raphael(350, 0, 1000, 1000);
  initArcAttr(paper);

  var circle = paper.circle(300, 300, 30);
  circle.attr("fill", "#eee");

  var text = paper.text(300, 300, "hello");

  var radius = 30;
  for (var i = 0; i < 10; i++) {
    radius += 20;

    var arc = paper.path().attr({
      "stroke": "#f00",
      "stroke-width": 20,
      arc: [300, 300, 0, 100, radius]
    });

    // percentage
    var amount = parseInt(Math.random() * 100);
    arc.animate({
      arc: [300, 300, amount, 100, radius]
      }, 1000, "bounce"
    );
  }
  */
});


function sampleData() {
  return {
    "name": "Enso",
    "sects": [
      {
        "name": "School",
        "size": 60,
        "sects": [
          {
            "name": "Chemistry",
            "size": 50,
            "sects": []
          },
          {
            "name": "DE",
            "size": 25,
            "sects": [
              {
                "name": "HW1",
                "size": 75,
                "sects": []
              },
              {
                "name": "HW2",
                "size": 25,
                "sects": []
              }
            ]
          },
          {
            "name": "Math",
            "size": 25,
            "sects": []
          }
        ]
      },
      {
        "name": "Personal",
        "size": 40,
        "sects": []
      }
    ]
  };
}

function latoify(text) {
  text.attr({
    "font-family": "Lato"
  });
}

function rot(elem, deg) {
  elem.transform("r" + deg);
}

function rotAbout(elem, deg, cx, cy) {
  elem.transform("r" + deg + "," + cx + "," + cy);
}

function displayData(paper, data, cx, cy) {
  var circle = paper.circle(cx, cy, 50);
  circle.attr("fill", "#000");

  var text = paper.text(cx, cy, data.name);
  text.attr({
    "font-size": "30px",
    "color": "#ff0000"
  });
  text.attr("fill", "#ffffff");
  latoify(text);

  var rotation = 0;
  var radius = 70;

  for (var i = 0; i < data.sects.length; i++) {
    var sect  = data.sects[i];
    
    displaySectors(paper, sect.sects, cx, cy, rotation, sect.size, radius + 39);

    var color = randomColor();
    var arc = paper.path().attr({
      "stroke": color,
      "stroke-width": 40,
      arc: [300, 300, 0, 100, radius]
    });

    rotAbout(arc, rotation, 300, 300);

    arc.animate({
      arc: [300, 300, sect.size, 100, radius]
      }, 1000, "bounce"
    );

    arc.mouseover(function() {
      this.animate(
        {stroke: colorLuminance(this.attr("stroke"), -.25)}, 100
      );
    });

    arc.mouseout(function() {
      this.animate(
      {stroke: colorLuminance(this.attr("stroke"), .25)}, 100)
    });

    // size% of 360
    rotation += (sect.size / 100) * 360;
  }
}

function displaySectors(paper, sects, cx, cy, rot, size, radius) {
  for (var i = 0; i < sects.length; i++) {
    var sect = sects[i];

    var color = randomColor();
    var arc = paper.path().attr({
      "stroke": color,
      "stroke-width": 40,
      arc: [300, 300, 0, 100, radius]
    });

    rotAbout(arc, rot, 300, 300);

    var size2 = (sect.size / 100) * size;

    displaySectors(paper, sect.sects, cx, cy, rot, size2, radius + 39);

    arc.animate({
        arc: [300, 300, size2, 100, radius]
      }, 1000, "bounce"
    );

      arc.mouseover(function() {
      this.animate(
        {stroke: colorLuminance(this.attr("stroke"), -.25)}, 100
      );
    });

    arc.mouseout(function() {
      this.animate(
      {stroke: colorLuminance(this.attr("stroke"), .25)}, 100)
    });


    rot += (size2 / 100) * 360;

  }
}

$(document).ready(function() {
  var paper = Raphael(350, 75, 500, 500);
  initArcAttr(paper);

  displayData(paper, sampleData(), 300, 300);

  var radius = 30;
  /*
  for (var i = 0; i < 5; i++) {
    // < 40 to avoid white spaces
    radius += 39;

    var arc = paper.path().attr({
      "stroke": randomColor(),
      "stroke-width": 40,
      arc: [300, 300, 5, 100, radius]
    });

    var deg = parseInt(Math.random() * 360);
    arc.transform("r" + deg + ",300,300");

    // percentage
    var amount = parseInt(Math.random() * 100);
    arc.animate({
      arc: [300, 300, amount, 100, radius]
      }, 1000, "bounce"
    );
  }
  */

});
