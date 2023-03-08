// Setup variables
var generations = 100;
var N, ENERGY, SIZE, VELOCITY, SENSE, FOOD_NUM;

const beings = [];
const food = [];
const winners = [];

// Context
var livingSpace = document.getElementById("living-space");
var graph = document.getElementById("graph");
var livingSpaceCtx = livingSpace.getContext("2d");
var graphCtx = graph.getContext("2d");

function start(){
  N = 1; //Number(document.getElementById("N").value);
  ENERGY = 10000;
  SIZE = 30;
  VELOCITY = 50;
  SENSE = 0;
  FOOD_NUM = 50; 

  initialSpawn();
  lifeCycle();
}

async function lifeCycle(){
  for(var gen = 0; gen < generations; gen++){
    console.log("GEN:" + gen);
    await generation();
    if(winners.length == 0){ // No survivors
      console.log("END");
      break;
    }
    copyArray();
    spawnFood();
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
      beings[i].energy -= beings[i].velocity + beings[i].size + beings[i].sense;
      
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
          console.log("FOOD");
        }
      }

      // Define winners
      if(beings[i].food > 0){
        if(isAround(beings[i].x, 0) || isAround(beings[i].x, livingSpace.width) || isAround(beings[i].y, 0) || isAround(beings[i].y, livingSpace.width)){
          beings[i].energy = ENERGY; // Restores energy
          winners.push(beings[i]);
          if(beings[i].food > 1){ // Multiplies
            const being = {x:beings[i].x, y:beings[i].y, energy: ENERGY, size: SIZE, velocity: VELOCITY, sense: SENSE, food: 0};
            winners.push(being);
          }
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
    const being = {x:0, y:Math.floor(Math.random() * livingSpace.width), energy: ENERGY, size: SIZE, velocity: VELOCITY, sense: SENSE, food: 0};
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function clearAll(){
  window.location.reload();
}