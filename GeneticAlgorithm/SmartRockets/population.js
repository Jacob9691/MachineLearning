function Population() {
  this.rockets = [];
  this.popsize = 50;
  this.matingPool = [];

  for (let i = 0; i < this.popsize; i++) {
    this.rockets[i] = new Rocket();
  }

  this.evaluate = function() {
    let maxfit = 0;
    this.rockets.forEach(r => {
      r.calcFitness();
      if (r.fitness > maxfit) maxfit = r.fitness;
    });

    this.matingPool = [];
    this.rockets.forEach(r => {
      let fitnessNorm = map(r.fitness, 0, maxfit, 0, 1);
      let n = fitnessNorm * 100;
      for (let j = 0; j < n; j++) {
        this.matingPool.push(r);
      }
    });
  };

  this.selection = function() {
    let newRockets = [];
    for (let i = 0; i < this.rockets.length; i++) {
      let parentA = random(this.matingPool).dna;
      let parentB = random(this.matingPool).dna;
      let childDNA = parentA.crossover(parentB);
      childDNA.mutation();
      newRockets[i] = new Rocket(childDNA);
    }
    this.rockets = newRockets;
  };

  this.run = function() {
    this.rockets.forEach(r => {
      r.update();
      r.show();
    });
  };
}
