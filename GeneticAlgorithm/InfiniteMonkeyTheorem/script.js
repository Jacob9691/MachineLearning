"use strict";

function runGeneticAlgorithm() {
    // Read input values from HTML each time
    const TargetString = document.getElementById('targetString').value;
    const Genes = document.getElementById('genes').value;
    const PopulationSize = parseInt(document.getElementById('populationSize').value);
    const MutationChance = parseFloat(document.getElementById('mutationChance').value);
    const MaxGenerations = parseInt(document.getElementById('maxGenerations').value);
    const NumberOfParticipants = parseInt(document.getElementById('numberOfParticipants').value);

    // Reset output
    document.getElementById('output').textContent = '';

    const Population = [];

    function getRandomCharacter() {
        const RandomGeneIndex = Math.floor(Math.random() * Genes.length);
        return Genes[RandomGeneIndex];
    }

    function createRandomIndividual() {
        let Chromosome = "";
        for (let i = 0; i < TargetString.length; i++) {
            Chromosome += getRandomCharacter();
        }
        return {
            "Chromosome": Chromosome,
            "FitnessScore": null
        };
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
            for (let charIndex = 0; charIndex < TargetString.length; charIndex++) {
                if (individual.Chromosome[charIndex] === TargetString[charIndex]) {
                    fitness++;
                }
            }
            individual.FitnessScore = fitness;
        });
        Population.sort((a, b) => b.FitnessScore - a.FitnessScore);
    }

    function isTargetReached() {
        return Population[0].Chromosome === TargetString;
    }

    function parentSelection() {
        const NewGeneration = [];
        while (NewGeneration.length < PopulationSize) {
            const ParentA = tournamentSelection();
            const ParentB = tournamentSelection();
            const Child = recombination(ParentA, ParentB);
            NewGeneration.push(Child);
        }
        Population.length = 0;
        Population.push(...NewGeneration);
    }

    function recombination(parentA, parentB) {
        const CrossoverPoint = Math.floor(Math.random() * TargetString.length);
        let childString = "";
        for (let geneIndex = 0; geneIndex < TargetString.length; geneIndex++) {
            const useMutation = Math.random() < MutationChance;
            if (useMutation) {
                childString += getRandomCharacter();
            } else {
                childString += (geneIndex < CrossoverPoint)
                    ? parentA.Chromosome[geneIndex]
                    : parentB.Chromosome[geneIndex];
            }
        }
        return {
            "Chromosome": childString,
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
    logOutput(`Best: ${Population[0].Chromosome} (Fitness: ${Population[0].FitnessScore})`);

    while (!isTargetReached() && generation < MaxGenerations) {
        parentSelection();
        assignFitnessScores();
        generation++;
        logOutput(`\n--- Generation ${generation} ---`);
        logOutput(`Best: ${Population[0].Chromosome} (Fitness: ${Population[0].FitnessScore})`);
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
