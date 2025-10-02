"use strict";

var population;
var lifeSpan = 400;
var count = lifeSpan;
var target;
var maxForce = 0.4;

var generation = 1;
var success = 0;

var rx = 20;
var rw = 300;
var ry = 200;
var rh = 10;

var rx1 = 280;
var ry1 = 400;

function setup() {
  let canvas = createCanvas(600, 600);
  canvas.parent("#canvas");
  population = new Population();
  target = createVector(width / 2, 70);
}

function draw() {
  drawBackground();
  population.run();

  count--;
  if (count === 0) {
    success = 0;
    population.evaluate();
    population.selection();
    generation++;
    count = lifeSpan;
  }

  drawTarget();
  drawObstacles();
  drawLifeBar();
  drawHUD();
}

// --- Styling helpers ---
function drawBackground() {
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(color(10, 10, 30), color(0, 0, 0), inter);
    stroke(c);
    line(0, y, width, y);
  }
}

function drawTarget() {
  noFill();
  strokeWeight(2);
  stroke(255, 200, 0);
  ellipse(target.x, target.y, 80 + sin(frameCount * 0.1) * 10);
  stroke(255);
  ellipse(target.x, target.y, 40 + cos(frameCount * 0.1) * 5);
  stroke(100, 200, 255);
  ellipse(target.x, target.y, 20);
}

function drawObstacles() {
  noStroke();
  fill(255, 60, 60, 180);
  rect(rx, ry, rw, rh, 5);
  rect(rx1, ry1, rw, rh, 5);
}

function drawLifeBar() {
  noStroke();
  let fuel = map(count, 0, lifeSpan, 0, width);
  fill(255, 120, 0);
  rect(0, height - 15, fuel, 10, 5);
}

function drawHUD() {
  fill(255);
  textSize(16);
  textAlign(LEFT);
  text(`Successful Rockets: ${success}`, 10, 25);
  text(`Generation: ${generation}`, 10, 45);
}
