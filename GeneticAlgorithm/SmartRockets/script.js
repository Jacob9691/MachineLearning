"use strict";

document.getElementById('startButton').addEventListener('click', () => {
    // Read values from inputs
    const lifeSpan = parseInt(document.getElementById('lifeSpan').value);
    const maxForce = parseFloat(document.getElementById('maxForce').value);
    const populationSize = parseInt(document.getElementById('populationSize').value);
    const mutationRate = parseFloat(document.getElementById('mutationRate').value);
    const elitismCount = parseInt(document.getElementById('elitism').value);
    const tournamentSize = parseInt(document.getElementById('tournamentSize').value);

    // Clear previous canvas
    document.getElementById('canvas').innerHTML = "";

    // Start p5 instance
    new p5((p) => {
        let generation = 1;
        let success = 0;
        let count = lifeSpan;

        let population = [];
        let target;

        const rx = 20, ry = 200, rw = 300, rh = 10;
        const rx1 = 280, ry1 = 400;

        p.setup = function() {
            const canvas = p.createCanvas(600, 600);
            canvas.parent("canvas");
            target = p.createVector(p.width / 2, 70);
            createPopulation();
        };

        p.draw = function() {
            drawBackground();
            drawObstacles();
            runPopulation();

            count--;
            if (count === 0) {
                success = 0; // reset per generation
                evaluatePopulation();
                selection();
                generation++;
                count = lifeSpan;
            }

            drawTarget();
            drawHUD();
            drawLifeBar();
        };

        function createPopulation() {
            population = [];
            for (let i = 0; i < populationSize; i++) {
                population.push(createRocket());
            }
        }

        function createRocket(dna) {
            return {
                pos: p.createVector(p.width/2, p.height-20),
                vel: p.createVector(),
                acc: p.createVector(),
                dna: dna || createDNA(),
                completed: false,
                crashed: false,
                fitness: 0
            };
        }

        function createDNA() {
            return Array.from({ length: lifeSpan }, () => {
                const v = p.createVector(p.random(-1, 1), p.random(-1, 1));
                v.setMag(maxForce);
                return v;
            });
        }

        function runPopulation() {
            population.forEach(r => {
                updateRocket(r);
                drawRocket(r);
            });
        }

        function updateRocket(r) {
            const d = p.dist(r.pos.x, r.pos.y, target.x, target.y);
            if (d < 20 && !r.completed) {
                r.completed = true;
                r.pos = target.copy();
                success++;
            }

            if (!r.completed && !r.crashed) {
                const geneIndex = lifeSpan - count; // current gene

                if (geneIndex < r.dna.length) {
                    r.acc.add(r.dna[geneIndex]); // apply force
                }

                r.vel.add(r.acc);
                r.pos.add(r.vel);
                r.acc.mult(0);
                r.vel.limit(4);

                // boundaries
                if (r.pos.x < 0 || r.pos.x > p.width || r.pos.y < 0 || r.pos.y > p.height) {
                    r.crashed = true;
                }

                // obstacle collision
                if ((r.pos.x > rx && r.pos.x < rx+rw && r.pos.y > ry && r.pos.y < ry+rh) ||
                    (r.pos.x > rx1 && r.pos.x < rx1+rw && r.pos.y > ry1 && r.pos.y < ry1+rh)) {
                    r.crashed = true;
                }
            }
        }

        function evaluatePopulation() {
            let maxfit = 0;
            population.forEach(r => {
                const d = p.dist(r.pos.x, r.pos.y, target.x, target.y);
                r.fitness = p.map(d, 0, p.width, p.width, 0);
                if (r.completed) r.fitness *= 10;
                if (r.crashed) r.fitness /= 10;
                if (r.fitness > maxfit) maxfit = r.fitness;
            });
            population.forEach(r => r.fitness /= maxfit);
        }

        function selection() {
            const matingPool = [];

            // Sort population by fitness (descending)
            population.sort((a, b) => b.fitness - a.fitness);

            // Elitism: carry the top N rockets
            const newPopulation = [];
            for (let elite = 0; elite < elitismCount; elite++) {
                const eliteDNA = population[elite].dna.slice(); // copy genes
                newPopulation.push(createRocket(eliteDNA));
            }

            // Generate the rest of the population
            for (let i = elitismCount; i < populationSize; i++) {
                const parentA = tournamentSelection();
                const parentB = tournamentSelection();
                const childDNA = crossover(parentA, parentB);
                mutate(childDNA);
                newPopulation[i] = createRocket(childDNA);
            }

            population = newPopulation;
        }

        function tournamentSelection() {
            const Participants = [];
            for (let i = 0; i < tournamentSize; i++) {
                const RandomIndex = Math.floor(Math.random() * population.length);
                Participants.push(population[RandomIndex]);
            }
            Participants.sort((a, b) => b.fitness - a.fitness);
            return Participants[0].dna;
        }

        function crossover(a, b) {
            const mid = Math.floor(p.random(a.length));
            return a.map((gene, i) => i > mid ? a[i]: b[i]);
        }

        function mutate(genes) {
            for(let i = 0 ; i < genes.length; i++){
                if(p.random(1) < mutationRate){
                    genes[i] = p.createVector(p.random(-1, 1), p.random(-1, 1));
                    genes[i].setMag(maxForce);
                }
            }
        }

        // -----------------
        // Drawing functions
        // -----------------
        function drawRocket(r) {
            p.push();
            p.noStroke();
            p.fill(200, 200, 255, 150);
            p.translate(r.pos.x, r.pos.y);
            p.rotate(r.vel.heading());
            p.rectMode(p.CENTER);
            p.rect(0, 0, 25, 5);
            p.pop();
        }

        function drawTarget() {
            p.noFill();
            p.strokeWeight(2);
            p.stroke(255, 200, 0);
            p.ellipse(target.x, target.y, 80 + Math.sin(p.frameCount * 0.1) * 10);
            p.stroke(255);
            p.ellipse(target.x, target.y, 40 + Math.cos(p.frameCount * 0.1) * 5);
            p.stroke(100, 200, 255);
            p.ellipse(target.x, target.y, 20);
        }

        function drawObstacles() {
            p.noStroke();
            p.fill(255, 0, 0);
            p.rect(rx, ry, rw, rh);
            p.rect(rx1, ry1, rw, rh);
        }

        function drawBackground() {
            for(let y = 0; y < p.height; y++){
                let inter = p.map(y, 0, p.height, 0,1);
                let c = p.lerpColor(p.color(10, 10, 30), p.color(0, 0, 0), inter);
                p.stroke(c);
                p.line(0, y, p.width, y);
            }
        }

        function drawHUD() {
            p.fill(255);
            p.textSize(16);
            p.textAlign(p.LEFT);
            p.text(`Successful Rockets: ${success}`, 10, 25);
            p.text(`Generation: ${generation}`, 10, 45);
        }

        function drawLifeBar() {
            p.noStroke();
            const fuel = p.map(count, 0, lifeSpan, 0, p.width);
            p.fill(255, 120, 0);
            p.rect(0, p.height-15, fuel, 10,    5);
        }
    });
});
