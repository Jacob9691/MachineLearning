"use strict";

tf.setBackend('cpu').then(() => {
    console.log('TF.js backend set to CPU');
});

function runGeneticAlgorithm() {
    // Read input values from HTML each time
    const TargetString = document.getElementById('targetString').value;
    const Genes = document.getElementById('genes').value;
    const PopulationSize = parseInt(document.getElementById('populationSize').value);
    const MutationChance = parseFloat(document.getElementById('mutationChance').value);
    const MaxGenerations = parseInt(document.getElementById('maxGenerations').value);
    const NumberOfParticipants = parseInt(document.getElementById('numberOfParticipants').value);
    const ElitismCount = parseInt(document.getElementById('elitismCount').value);

    // Reset output
    document.getElementById('output').textContent = '';

    const Population = [];

    let TargetGenome = [];

    function encodeStringToGenome(str) {
        const genome = [];
        for (let i = 0; i < str.length; i++) {
            const char = str[i];
            const index = Genes.indexOf(char);
            const normalizedValue = index / (Genes.length - 1);
            genome.push(normalizedValue);
        }
        return genome;
    }

    function decodeGenomeToString(genome) {
        let str = "";
        for (let i = 0; i < genome.length; i++) {
            const index = Math.round(genome[i] * (Genes.length - 1));
            str += Genes[index];
        }
        return str;
    }

    TargetGenome = encodeStringToGenome(TargetString);

    function getRandomGene() {
        return Math.random();
    }

    function createRandomIndividual() {
        let Chromosome = [];

        for (let i = 0; i < TargetGenome.length; i++) {
            Chromosome.push(getRandomGene());
        }

        const Individual = {
            "Chromosome": Chromosome,
            "FitnessScore": null
        };

        return Individual;
    }

    function createRandomPopulation() {
        Population.length = 0;
        for (let i = 0; i < PopulationSize; i++) {
            Population.push(createRandomIndividual());
        }
    }

    function assignFitnessScores() {
        Population.forEach(individual => {
            let fitness = 0;
            for (let i = 0; i < TargetGenome.length; i++) {
                const targetIndex = Math.round(TargetGenome[i] * (Genes.length - 1));
                const individualIndex = Math.round(individual.Chromosome[i] * (Genes.length - 1));

                if (targetIndex === individualIndex) {
                    fitness++;
                }
            }
            individual.FitnessScore = fitness;
        });
        Population.sort((a, b) => b.FitnessScore - a.FitnessScore);
    }

    function isTargetReached() {
        const decoded = decodeGenomeToString(Population[0].Chromosome);
        return decoded === TargetString;
    }

    function parentSelection() {
        const NewGeneration = [];

        Population.sort((a, b) => b.FitnessScore - a.FitnessScore);
        for (let elite = 0; elite < ElitismCount; elite++) {
            const eliteChild = Population[elite];
            NewGeneration.push(eliteChild);
        }

        for (let i = ElitismCount; i < PopulationSize; i++) {
            const ParentA = tournamentSelection();
            const ParentB = tournamentSelection();
            const Child = recombination(ParentA, ParentB);
            NewGeneration.push(Child);
        }
        Population.length = 0;
        Population.push(...NewGeneration);
    }

    function recombination(parentA, parentB) {
        const CrossoverPoint = Math.floor(Math.random() * TargetGenome.length);
        let childGenome = [];
        for (let geneIndex = 0; geneIndex < TargetGenome.length; geneIndex++) {
            const useMutation = Math.random() < MutationChance;
            if (useMutation) {
                childGenome.push(getRandomGene());
            } else {
                childGenome.push((geneIndex < CrossoverPoint)
                    ? parentA.Chromosome[geneIndex]
                    : parentB.Chromosome[geneIndex]);
            }
        }
        return {
            "Chromosome": childGenome,
            "FitnessScore": null
        };
    }

    function tournamentSelection() {
        const Participants = [];
        for (let i = 0; i < NumberOfParticipants; i++) {
            const RandomIndex = Math.floor(Math.random() * Population.length);
            Participants.push(Population[RandomIndex]);
        }
        Participants.sort((a, b) => b.FitnessScore - a.FitnessScore);
        return Participants[0];
    }

    // --- Run the algorithm ---
    createRandomPopulation();
    assignFitnessScores();

    let generation = 1;
    logOutput(`\n--- Generation ${generation} ---`);
    console.log(`${generation} Best Genome: ${Population[0].Chromosome} (Fitness: ${Population[0].FitnessScore})`);
    logOutput(`Best: ${decodeGenomeToString(Population[0].Chromosome)} (Fitness: ${Population[0].FitnessScore})`);

    while (!isTargetReached() && generation < MaxGenerations) {
        parentSelection();
        assignFitnessScores();
        generation++;
        logOutput(`\n--- Generation ${generation} ---`);
        console.log(`${generation} Best Genome: ${Population[0].Chromosome} (Fitness: ${Population[0].FitnessScore})`);
        logOutput(`Best: ${decodeGenomeToString(Population[0].Chromosome)} (Fitness: ${Population[0].FitnessScore})`);
    }

    if (isTargetReached()) {
        logOutput(`\nTarget reached at generation ${generation}!`);
    } else {
        logOutput(`\nMax generations reached without finding the exact match.`);
    }

    function logOutput(message) {
        const outputDiv = document.getElementById('output');
        outputDiv.textContent += message + '\n';
    }
}
