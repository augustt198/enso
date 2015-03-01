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

var elementTree = {};
var currentCircle;
var currentText;

var elemMap = {};
var dataMap = {};
document.history = [];
var previousSectors;
var previousName;

function animateCircle(paper, str, radius, cx, cy) {
  currentCircle = paper.circle(cx, cy, 0);
  currentCircle.attr("fill", "#000");

  currentText = paper.text(cx, cy, str);
  currentText.attr({
    "font-size": 0,
    "fill": "#ffffff",
    "font-family": "Lato"
  });

  currentCircle.animate({
    r: radius
  }, 500);
  currentText.animate({
    "font-size": 25
  }, 500);

  var clickFunc = function(e) {
    circClickFunc(paper, cx, cy);
  };

  currentCircle.click(clickFunc);
  currentText.click(clickFunc);
}

function drawTree(paper, data, cx, cy, rotation, size, radius, parent) {
  rotation = rotation || 0;
  size     = size || 100;
  radius   = radius || 70;
  parent   = parent || elementTree;

  data.forEach(function(sector) {

    console.log("drawing sector: " + sector.name);
    console.log(sector);

    console.log("size = " + size);

    var myTree = {};
    parent[sector.name] = myTree;

  
    var mySize = (sector.size / 100) * size;
    drawTree(paper, sector.sects, cx, cy, rotation, mySize, radius + 39, myTree);

    var arc = paper.path().attr({
      "stroke": randomColor(),
      "stroke-width": 40,
      arc: [300, 300, 0, 100, radius]
    });

    rotAbout(arc, rotation, 300, 300);
    myTree['_elem'] = arc;
    sector['_elem'] = arc;
    elemMap[arc.id] = sector;

    arc.animate({
      arc: [300, 300, mySize, 100, radius]
    }, 750);

    arc.click(function(e) {
      arcClickFunc(e, paper, cx, cy, this.id, data);
      previousSectors = data;

      document.history.push({
        "name": sector.name,
        "sects": sector.sects
      });
    });

    arc.mouseover(function() {
      this.animate({'stroke-width': 50}, 100);
      var str = elemMap[this.id].name;
      appendPath(str);
    });

    arc.mouseout(function() {
      this.animate({'stroke-width': 40}, 100);
      removePath();
    });

    rotation += (mySize / 100) * 360;
  });
}

function recalculateSizes(paper, data, cx, cy, rotation, size, radius) {
  rotation = rotation || 0;
  size     = size || 100;
  radius   = radius || 70;

  data.forEach(function(sector) {
    var mySize = (sector.size / 100) * size;
    recalculateSizes(paper, sector.sects, cx, cy, rotation, mySize, radius + 39);

    var elem = sector['_elem'];
    var prev_arc = elem.attr('arc');
    var anim = Raphael.animation({
      arc: [prev_arc[0], prev_arc[1], mySize, prev_arc[3], radius],
      transform: "r" + rotation + "," + cx + "," + cy
    }, 400);
    elem.animate(anim.delay(300));
    rotation += (mySize / 100) * 360;
  });
}

function arcClickFunc(event, paper, cx, cy, id) {
  var sector = elemMap[id];
  console.log('clicked:');

  //minimizeAllSects(paper);
  //drawTree(paper, sector.sects, cx, cy);


  appendPath(sector.name);

  var subtree = collectSubtreeNodes(sector);

  paper.forEach(function(elem) {
    if (subtree.indexOf(elemMap[elem.id]) < 1) {
      elem.animate({
        opacity : 0
      }, 250, function () {
        this.hide()
      });
    }
  });


  var data = subtree[0].sects;
  recalculateSizes(paper, data, cx, cy);
  animateCircle(paper, sector.name, 50, cx, cy);
}

function collectSubtreeNodes(node, arr) {
  arr = arr || [];
  arr.push(node);
  for (var i = 0; i < node.sects.length; i++) {
    collectSubtreeNodes(node.sects[i], arr);
  }

  return arr;
}

function circClickFunc(paper, cx, cy) {
  if (document.history.length > 1) {
    document.history.pop();
    prev = document.history[document.history.length - 1];

    minimizeAllSects(paper);

    drawTree(paper, prev.sects, cx, cy);
    animateCircle(paper, prev.name, 50, cx, cy);
    removePath();
  }
}

function minimizeAllSects(paper) {
  paper.forEach(function (sect) {
    if (sect.attr('arc')) {
      var arc = sect.attr('arc');
      sect.animate({
        arc: [arc[0], arc[1], 0, arc[3], arc[4]]
      }, 250);
    }
  });
}

function displayData(paper, data, cx, cy) {
  animateCircle(paper, data.name, 50, cx, cy);

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

    arc.click(function() {
      zoomIn(paper, sect, cx, cy)
    });

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

function zoomIn(paper, sector, cx, cy) {
  var circle = paper.circle(cx, cy, 0);
  circle.attr("fill", "#000");

  circle.animate({r: 50}, 500);

  var text = paper.text(cx, cy, sector.name);
  text.attr({
    "font-size": "0",
    "color": "#ff0000"
  });
  text.attr("fill", "#ffffff");
  latoify(text);
  text.animate({'font-size': 25}, 500);

  paper.forEach(function(e) {
    if (e.attr('arc')) {
      arc = e.attr('arc');
      e.animate({
        arc: [arc[0], arc[1], arc[2], arc[3], arc[4] - 39]
      }, 500);
    }
  });
}

function setPath(str) {
  $('#path').html(str);
}

function appendPath(str) {
  $('#path').append("<span> / " + str + "</span>");
}

function removePath(str) {
  var children = $('#path').children();
  var last = children[children.length - 1];
  last.remove();
}

function ghostAppend(str) {
  var html = '<span class="grayed"> / ' + str + '</span>'
  $('#path').append(html);
}


$(document).ready(function() {
  var paper = Raphael(350, 75, 500, 500);
  initArcAttr(paper);

  //displayData(paper, sampleData(), 300, 300);
  var data = sampleData();

  previousSectors = data.sects;

  drawTree(paper, data.sects, 300, 300);
  animateCircle(paper, data.name, 50, 300, 300);

  setPath(data.name);
  console.log(data);

  document.history.push({
    "name": data.name,
    "sects": data.sects
  });

  var radius = 30;
});

