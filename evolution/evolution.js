// Setup variables
var generations = 100;
var N, ENERGY, SIZE, VELOCITY, SENSE, FOOD_NUM;

const beings = [];
const food = [];
const winners = [];

// Graph data
const population_data = [];
const generation_data = [];
const energy_data = [];
const velocity_data = [];
const size_data = [];

// Context
var livingSpace = document.getElementById("living-space");
var graph = document.getElementById("graph");
var livingSpaceCtx = livingSpace.getContext("2d");

function start(){
  N = Number(document.getElementById("N").value);
  ENERGY = Number(document.getElementById("ENERGY").value);
  SIZE = Number(document.getElementById("SIZE").value);
  VELOCITY = Number(document.getElementById("VELOCITY").value);
  SENSE = Number(document.getElementById("SENSE").value);
  FOOD_NUM = Number(document.getElementById("FOOD").value);

  initialSpawn();
  lifeCycle();
}

async function lifeCycle(){
  for(var gen = 0; gen < generations; gen++){
    generation_data.push(gen);
    population_data.push(beings.length);
    await generation();
    if(winners.length == 0){ // No survivors - END
      break;
    }
    copyArray();
    spawnFood();
    calculateAttributes();
    drawCharts();
  }
}

async function generation(){
  while (true){
    if(beings.length == 0){
      break;
    }

    for (var i = 0; i < beings.length; i++) {
      // Movement of beings
      const max = beings[i].velocity;
      const min = -beings[i].velocity;
      let vx = Math.floor(Math.random() * (max - min + 1)) + min;
      let vy = Math.floor(Math.random() * (max - min + 1)) + min; 
      
      // Move x
      if (beings[i].x + vx < 0 || beings[i].x + vx > livingSpace.width) {
        beings[i].x += -vx;
      } else{
        beings[i].x += vx;
      }
      
      // Move y
      if (beings[i].y + vy < 0 || beings[i].y + vy > livingSpace.height) {
        beings[i].y += -vy;
      } else{
        beings[i].y += vy;
      }

      drawLivingSpace();
      await sleep(50);

      // Lower energy
      beings[i].energy -= (beings[i].velocity + beings[i].size + beings[i].sense)/100;
      
      // If being is out of energy it dies
      if(beings[i].energy <= 0){
        beings.splice(i, 1);
        continue;
      }
            
      // Check if it ate food
      for (var j = 0; j < food.length; j++) {
        if(isAround(beings[i].x, food[j].x) && isAround(beings[i].y, food[j].y)){
          beings[i].food += 1;
          food.splice(j, 1);
        }
      }
      
      // Check if it can eat another being
      let eat = 0;
      for(var k = 0; k < beings.length; k++){
        if(i == k){ // We dont want it to eat itself
          continue;
        }
        if(isAround(beings[i].x, beings[k].x) && isAround(beings[i].y, beings[k].y)){
          if(beings[k].size < beings[i].size*0.8){ // If its 20% or more smaller
            beings[i].food += 1;
            eat = k;
            break;
          }
        }
      }
      if(eat != 0){
        beings.splice(eat, 1);
        continue;
      }

      // Define winners
      if(beings[i].food > 0){
        if(isAround(beings[i].x, 0) || isAround(beings[i].x, livingSpace.width) || isAround(beings[i].y, 0) || isAround(beings[i].y, livingSpace.width)){
          if(beings[i].food > 1){ // Multiplies
            const being = {x:beings[i].x, y:beings[i].y, energy: increaseRandomly(beings[i].full_energy), full_energy: ENERGY, size: increaseRandomly(beings[i].size), velocity: increaseRandomly(beings[i].velocity), sense: increaseRandomly(beings[i].sense), food: 0};
            being.full_energy = being.energy;
            winners.push(being);
          }
          beings[i].energy = beings[i].full_energy; // Restores energy
          beings[i].food = 0;
          winners.push(beings[i]);
          beings.splice(i, 1);
          continue;
        }
      }
    }
  }
  return new Promise((resolve) => {
    resolve();
  });
}

function initialSpawn(){
  spawnBeings();
  spawnFood();
  drawLivingSpace();
}

function spawnBeings(){
  for (var i = 0; i < N; i++) {
    const being = {x:0, y:Math.floor(Math.random() * livingSpace.width), energy: ENERGY, full_energy: ENERGY, size: SIZE, velocity: VELOCITY, sense: SENSE, food: 0};
    beings.push(being);
  }
}

function spawnFood(){
  food.splice(0,food.length)
  for (var i = 0; i < FOOD_NUM; i++) {
    const f = {x:Math.floor(Math.random() * livingSpace.width), y:Math.floor(Math.random() * livingSpace.width)};
    food.push(f);
  }
}

function calculateAttributes(){
  let energy = 0;
  let size = 0;
  let velocity = 0;
  for (var i = 0; i < beings.length; i++) {
    energy += beings[i].energy;
    size += beings[i].size;
    velocity += beings[i].velocity;
  }
  energy_data.push(energy/beings.length);
  size_data.push(size/beings.length);
  velocity_data.push(velocity/beings.length);
}

function drawLivingSpace() {
  // Clear canvas
  livingSpaceCtx.clearRect(0, 0, 400, 400);
  // Draw beings
  for (var i = 0; i < beings.length; i++) {
    var being = beings[i];
    livingSpaceCtx.fillStyle = "#000000"; // black
    livingSpaceCtx.beginPath();
    livingSpaceCtx.arc(being.x, being.y, 3, 0, 2 * Math.PI);
    livingSpaceCtx.fill();
  }
  
  // Draw food
  for (var i = 0; i < food.length; i++) {
    var f = food[i];
    livingSpaceCtx.fillStyle = "#c82124"; // red
    livingSpaceCtx.beginPath();
    livingSpaceCtx.arc(f.x, f.y, 3, 0, 2 * Math.PI);
    livingSpaceCtx.fill();
  }
}

function drawCharts(){

  new Chart("populationChart", {
    type: "line",
    data: {
      labels: generation_data,
      datasets: [{
        label: "Population",
        backgroundColor: "rgba(0,0,0,1.0)",
        borderColor: "rgba(0,0,0,0.1)",
        data: population_data
      }]
    },
    options:{
      title: {
        display: true,
        text: "Population growth"
      },
    }
  });

  new Chart("attributesChart", {
    type: "line",
    data: {
      labels: generation_data,
      datasets: [{
        label: "Energy",
        data: energy_data,
        borderColor: "red",
        fill: false
      },{
        label: "Velocity",
        data: velocity_data,
        borderColor: "green",
        fill: false
      },{
        label: "Size",
        data: size_data,
        borderColor: "blue",
        fill: false
      }]
    },
    options: {
      title: {
        display: true,
        text: "Attributes growth"
      }
    }
  });

}

function copyArray(){
  beings.splice(0,beings.length);
  for(var i = 0; i < winners.length; i++){
    beings.push(winners[i]);
  }
  winners.splice(0,winners.length);
}

function isAround(num, aroundNum) {
  return Math.abs(num - aroundNum) <= 5;
}

function increaseRandomly(value) {
  if (Math.random() < 0.5) { // 50% chance to increase
    const randomIncrease = Math.floor(Math.random() * 41) - 20; // generate random number between -20 and 20
    value += randomIncrease;
  }
  return value;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function clearAll(){
  window.location.reload();
}