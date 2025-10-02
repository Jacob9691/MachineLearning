function Rocket(dna) {
  this.pos = createVector(width / 2, height - 20);
  this.vel = createVector();
  this.acc = createVector();
  this.completed = false;
  this.crashed = false;
  this.fitness = 0;
  this.dna = dna || new DNA();
  this.geneIndex = 0;

  this.applyForce = function(force) {
    this.acc.add(force);
  };

  this.update = function() {
    let d = dist(this.pos.x, this.pos.y, target.x, target.y);

    if (d < 20) {
      this.completed = true;
      this.pos = target.copy();
    }

    if (this.pos.x > rx && this.pos.x < rx + rw &&
        this.pos.y > ry && this.pos.y < ry + rh) {
      this.crashed = true;
    }
    if (this.pos.x > rx1 && this.pos.x < rx1 + rw &&
        this.pos.y > ry1 && this.pos.y < ry1 + rh) {
      this.crashed = true;
    }

    if (this.pos.x > width || this.pos.x < 0 || this.pos.y > height || this.pos.y < 0) {
      this.crashed = true;
    }

    this.applyForce(this.dna.genes[this.geneIndex]);
    this.geneIndex++;

    if (!this.completed && !this.crashed) {
      this.vel.add(this.acc);
      this.pos.add(this.vel);
      this.acc.mult(0);
      this.vel.limit(4);
    }
  };

  this.show = function() {
    push();
    noStroke();
    fill(200, 200, 255, 150);
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    rectMode(CENTER);
    rect(0, 0, 25, 5);
    pop();
  };

  this.calcFitness = function() {
    let d = dist(this.pos.x, this.pos.y, target.x, target.y);
    this.fitness = map(d, 0, width, width, 0);

    if (this.completed) {
      this.fitness *= 10;
      success++;
    }
    if (this.crashed) {
      this.fitness /= 10;
    }
  };
}