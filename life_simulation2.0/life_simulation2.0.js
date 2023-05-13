// Setup variables
var GENERATIONS = 100;
var N, TERRAIN, HUNGER, THIRST, SIZE, VELOCITY, SENSE, FOOD_NUM, PLANTS_NUM;

// Arrays
const beings = [];
const survivors = [];
const death_row = [];
const food = [];
const plants = [];
const lakes = [];

// Graph data
const population_data = [];
const generation_data = [];
const age_data = [];
const velocity_data = [];
const size_data = [];

// Context
var livingSpace = document.getElementById("living-space");
var graph = document.getElementById("graph");
var livingSpaceCtx = livingSpace.getContext("2d");

function start() {
  N = 20//Number(document.getElementById("N").value);
  HUNGER = 100//Number(document.getElementById("HUNGER").value);
  THIRST = 100//Number(document.getElementById("THIRST").value);
  SIZE = 50//Number(document.getElementById("SIZE").value);
  VELOCITY = 30//Number(document.getElementById("VELOCITY").value);
  SENSE = 100//Number(document.getElementById("SENSE").value);
  FOOD_NUM = 30//Number(document.getElementById("FOOD").value);
  PLANTS_NUM = 10//Number(document.getElementById("PLANTS").value);
  TERRAIN = 1//Number(document.getElementById("TERRAIN").value);

  drawLandscape();
  spawnFood();
  spawnPlants();
  spawnBeings();

  lifeCycle();
}

async function lifeCycle() {
  for (var gen = 0; gen < GENERATIONS; gen++) {
    console.log("GEN: " + gen);
    generation_data.push(gen);
    population_data.push(beings.length);
    await generation(); // Wait untill generation is finished
    if (beings.length == 0) { // If no survivors => END
      break;
    }
    defineSurvivors();
    spawnFood();
    spawnPlants();
    calculateAttributes();
    drawCharts();
  }
  saveData();
}

async function generation() {
  for (var year = 0; year < 30; year++) { // One year
    if (beings.length == 0) {
      break;
    }
    for (var i = 0; i < beings.length; i++) {
      moveBeing(beings[i], i);
      drawLivingSpace();
      await sleep(20);

      lowerNutrients(beings[i]);
      eatFood(beings[i]);
      drinkWater(beings[i]);

      eatAnother(beings[i], i);
      reproduce(beings[i]);

      // If being is out of water it dies
      if (beings[i].thirst <= 0) {
        death_row.push(i);
        console.log("OUT OF WATER");
        continue;
      }
    }
    removeDeadBeings();
  }
  console.log("YEAR");
  // Increase age
  for (var i = 0; i < beings.length; i++) {
    beings[i].age += 1;
    if (beings[i].age < 10) { // If its too old, it dies.
      survivors.push(beings[i]);
      continue;
    }
  }
  return new Promise((resolve) => {
    resolve();
  });
}

function moveBeing(being, i) {
  const maxVelocity = being.velocity;
  const minVelocity = -being.velocity;
  let vx = Math.floor(Math.random() * (maxVelocity - minVelocity + 1)) + minVelocity;
  let vy = Math.floor(Math.random() * (maxVelocity - minVelocity + 1)) + minVelocity;

  if (being.habitat == "ground") { // Moves only on the ground
    if (being.x + vx < 0 || being.x + vx > livingSpace.width || !isInLake(being.x + vx, being.y + vy)) {
      being.x += -vx;
    } else {
      being.x += vx;
    }

    if (being.y + vy < 0 || being.y + vy > livingSpace.height || !isInLake(being.x + vx, being.y + vy)) {
      being.y += -vy;
    } else {
      being.y += vy;
    }
  } else if (being.habitat == "water") { // Moves only in water
    while (isInLake(being.x + vx, being.y + vy)) {
      vx = Math.floor(Math.random() * (maxVelocity - minVelocity + 1)) + minVelocity;
      vy = Math.floor(Math.random() * (maxVelocity - minVelocity + 1)) + minVelocity;
    }
    being.x += vx;
    being.y += vy;
  } else if (being.habitat == "air") { // Moves every where
    being.energy -= 10;
    if (being.grounded == true) { // Replenish energy and can fly again
      being.grounded = false;
      being.energy = 100;
    }
    if (being.energy <= 0) { // Must rest
      being.grounded = true;
      if (!isInLake(being.x, being.y)) { // Drowns
        death_row.push(i);
      }
      if (isInForest(being.x, being.y)) { // Invincible in forrest
        being.grounded = false;
        being.energy = 100;
      }
    }

    if (being.x + vx < 0 || being.x + vx > livingSpace.width) {
      being.x += -vx;
    } else {
      being.x += vx;
    }

    if (being.y + vy < 0 || being.y + vy > livingSpace.height) {
      being.y += -vy;
    } else {
      being.y += vy;
    }
  }
}

function lowerNutrients(being) {
  if (being.habitat == "ground" || being.habitat == "air") {
    if (being.hunger <= 0) {
      being.thirst -= (being.velocity) / 50;
    } else {
      being.hunger -= (being.size) / 50;
      being.thirst -= (being.velocity) / 100;
    }
  } else if (being.habitat == "water") {
    if (isOnLakeEdge(being.x, being.y)) {
      being.thirst -= (being.velocity) / 50;
    }
    being.hunger -= (being.size) / 50;
  }
}

function eatFood(being) {
  for (var j = 0; j < food.length; j++) {
    if (being.habitat == "ground" || being.habitat == "air") {
      if (isAround(being.x, food[j].x) && isAround(being.y, food[j].y)) {
        being.hunger = HUNGER;
        food.splice(j, 1);
        console.log("EAT");
      }
    }
  }

  for (var j = 0; j < plants.length; j++) {
    if (being.habitat == "water") {
      if (isAround(being.x, plants[j].x) && isAround(being.y, plants[j].y)) {
        being.hunger = HUNGER;
        plants.splice(j, 1);
        console.log("EAT PLANT");
      }
    }
  }
}

function drinkWater(being) {
  for (var j = 0; j < beings.length; j++) {
    if (being.habitat == "ground" || being.habitat == "air") {
      if (isOnLakeEdge(being.x, being.y)) {
        being.thirst = THIRST;
        console.log("DRINK WATER");
      }
    } else if (being.habitat == "water") {
      if (!isInLake(being.x, being.y)) {
        being.thirst = THIRST;
        console.log("DRINK WATER");
      }
    }

  }
}

function eatAnother(being, i) {
  for (var k = 0; k < beings.length; k++) {
    if (i == k) { // We dont want it to eat itself
      continue;
    }
    if (being.habitat == "ground") {
      if (isAround(being.x, beings[k].x) && isAround(being.y, beings[k].y) && beings[k].grounded) {
        if (being.type == "predator" && beings[k].type == "prey") {
          being.hunger = HUNGER;
          death_row.push(k);
          console.log("KILL");
          break;
        }
        if (being.type == "prey" && beings[k].type == "predator") {
          beings[k].hunger = HUNGER;
          death_row.push(i);
          console.log("KILL");
          break;
        }
      }
    }
    if (being.habitat == "air") {
      if (isAround(being.x, beings[k].x) && isAround(being.y, beings[k].y) && beings[k].habitat != "air" && beings[k].grounded && beings[k].age < 5) {
        being.hunger = HUNGER;
        death_row.push(k);
        console.log("KILL");
        break;
      }
    }
  }
}

function reproduce(being) {
  for (var k = 0; k < beings.length; k++) {
    if (isAround(being.x, beings[k].x) && isAround(being.y, beings[k].y)) {
      if (being.habitat == "ground" && beings[k].habitat == "ground") {
        if ((being.type == beings[k].type) && ((being.gender == "male" && beings[k].gender == "female") || (being.gender == "female" && beings[k].gender == "male"))) {
          makeChild(being, beings[k], being.habitat);
          console.log("REPRODUCE");
          break;
        }
      }
      else if (being.habitat == "water" && beings[k].habitat == "water") {
        if ((!isOnLakeEdge(being.x, being.y)) && ((being.gender == "male" && beings[k].gender == "female") || (being.gender == "female" && beings[k].gender == "male"))) {
          for (var i = 0; i < 5; i++) {
            makeChild(being, beings[k], being.habitat);
          }
          console.log("REPRODUCE");
          break;
        }
      } else if (being.habitat == "air" && beings[k].habitat == "air") {
        if ((isInForest(being.x, being.y)) && ((being.gender == "male" && beings[k].gender == "female") || (being.gender == "female" && beings[k].gender == "male"))) {
          makeChild(being, beings[k], being.habitat);
          console.log("REPRODUCE");
          break;
        }
      }
    }
  }
}

function makeChild(parent1, parent2, parentHabitat) {
  let inheritedSize, inheritedVelocity;
  // Inherit size
  if (Math.random() < 0.5) {
    inheritedSize = parent1.size;
  } else {
    inheritedSize = parent2.size;
  }
  // Inherit velocity
  if (Math.random() < 0.5) {
    inheritedVelocity = parent1.size;
  } else {
    inheritedVelocity = parent2.size;
  }
  const being = { x: parent1.x + 6, y: parent1.y, hunger: HUNGER, thirst: THIRST, age: 0, size: increaseRandomly(inheritedSize), velocity: increaseRandomly(inheritedVelocity), sense: SENSE, gender: setGender(), type: parent1.type, habitat: parent1.habitat, energy: 100, grounded: true };
  if (parentHabitat == "water") {
    if (Math.random() < 0.5) {
      beings.push(being);
    }
  } else {
    beings.push(being);
  }
}

function removeDeadBeings() {
  for (var d = 0; d < death_row.length; d++) {
    beings.splice(death_row[d], 1);
  }
  death_row.splice(0, death_row.length);
}

function drawLivingSpace() {
  livingSpaceCtx.clearRect(0, 0, 400, 400);
  drawLandscape();
  drawFood();
  drawPlants();
  drawBeings();
}

function drawLandscape() {
  livingSpaceCtx.fillStyle = '#34b7eb'; // Lake color
  livingSpace.style.backgroundColor = '#90d16f'; // Terrain color
  if (TERRAIN == 1) {
    let lake = { centerX: livingSpace.width / 2, centerY: livingSpace.height / 2, radiusX: 100, radiusY: 50 }
    livingSpaceCtx.beginPath();
    livingSpaceCtx.ellipse(lake.centerX, lake.centerY, lake.radiusX, lake.radiusY, 0, 0, 2 * Math.PI);
    livingSpaceCtx.fill();
    livingSpaceCtx.fillStyle = '#008000'; // Dark green
    livingSpaceCtx.fillRect(0, 0, livingSpace.width, 100);
    livingSpaceCtx.stroke();
    lakes.push(lake);
  }
  if (TERRAIN == 2) {
    let lake1 = { centerX: livingSpace.width / 4, centerY: livingSpace.height / 4, radiusX: 50, radiusY: 25 }
    let lake2 = { centerX: livingSpace.width / 4, centerY: livingSpace.height - 80, radiusX: 50, radiusY: 25 }
    let lake3 = { centerX: livingSpace.width - 80, centerY: livingSpace.height / 4, radiusX: 50, radiusY: 25 }
    let lake4 = { centerX: livingSpace.width - 80, centerY: livingSpace.height - 80, radiusX: 50, radiusY: 25 }

    lakes.push(lake1);
    lakes.push(lake2);
    lakes.push(lake3);
    lakes.push(lake4);

    for (var i = 0; i < lakes.length; i++) {
      livingSpaceCtx.beginPath();
      livingSpaceCtx.ellipse(lakes[i].centerX, lakes[i].centerY, lakes[i].radiusX, lakes[i].radiusY, 0, 0, 2 * Math.PI);
      livingSpaceCtx.fill();
      livingSpaceCtx.stroke();
    }
  }
  if (TERRAIN == 3) {
    let lake = { centerX: livingSpace.width, centerY: livingSpace.height, radiusX: 200, radiusY: 200 }
    lakes.push(lake);

    livingSpaceCtx.beginPath();
    livingSpaceCtx.ellipse(lake.centerX, lake.centerY, lake.radiusX, lake.radiusY, 0, 0, 2 * Math.PI);
    livingSpaceCtx.fill();
    livingSpaceCtx.stroke();
  }
  if (TERRAIN == 4) {
    let lake1 = { centerX: livingSpace.width, centerY: livingSpace.height, radiusX: 100, radiusY: 100 }
    let lake2 = { centerX: 0, centerY: 0, radiusX: 100, radiusY: 100 }
    let lake3 = { centerX: 0, centerY: livingSpace.height, radiusX: 100, radiusY: 100 }
    let lake4 = { centerX: livingSpace.width, centerY: 0, radiusX: 100, radiusY: 100 }

    lakes.push(lake1);
    lakes.push(lake2);
    lakes.push(lake3);
    lakes.push(lake4);

    for (var i = 0; i < lakes.length; i++) {
      livingSpaceCtx.beginPath();
      livingSpaceCtx.ellipse(lakes[i].centerX, lakes[i].centerY, lakes[i].radiusX, lakes[i].radiusY, 0, 0, 2 * Math.PI);
      livingSpaceCtx.fill();
      livingSpaceCtx.stroke();
    }
  }
}

function spawnBeings() {
  for (var i = 0; i < N; i++) {
    let beingX = Math.floor(Math.random() * livingSpace.width);
    let beingY = Math.floor(Math.random() * livingSpace.height);

    const randomNum = Math.floor(Math.random() * 101);
    if (randomNum < 40) { // Ground being
      while (!isInLake(beingX, beingY)) {
        beingX = Math.floor(Math.random() * livingSpace.width);
        beingY = Math.floor(Math.random() * livingSpace.height);
      }
      const being = { x: beingX, y: beingY, hunger: HUNGER, thirst: THIRST, age: 0, size: SIZE, velocity: VELOCITY, sense: SENSE, gender: setGender(), type: setType(), habitat: "ground", energy: 100, grounded: true };
      beings.push(being);
    } else if (randomNum > 40 && randomNum < 60) { // Water being
      while (isInLake(beingX, beingY)) {
        beingX = Math.floor(Math.random() * livingSpace.width);
        beingY = Math.floor(Math.random() * livingSpace.height);
      }
      const being = { x: beingX, y: beingY, hunger: HUNGER, thirst: THIRST, age: 0, size: SIZE, velocity: VELOCITY, sense: SENSE, gender: setGender(), type: "prey", habitat: "water", energy: 100, grounded: false };
      beings.push(being);
    } else { // Air being
      while (!isInLake(beingX, beingY)) {
        beingX = Math.floor(Math.random() * livingSpace.width);
        beingY = Math.floor(Math.random() * livingSpace.height);
      }
      const being = { x: beingX, y: beingY, hunger: HUNGER, thirst: THIRST, age: 0, size: SIZE, velocity: VELOCITY, sense: SENSE, gender: setGender(), type: "prey", habitat: "air", energy: 100, grounded: false };
      beings.push(being);
    }
  }
  drawBeings();
}

function drawBeings() {
  for (var i = 0; i < beings.length; i++) {
    var being = beings[i];
    if (being.habitat == "ground") {
      livingSpaceCtx.fillStyle = "#5e340e"; // Dark green
      if (being.type == "predator") {
        livingSpaceCtx.fillStyle = "#eb0e3e"; // Red
      }
    } else if (being.habitat == "water") {
      livingSpaceCtx.fillStyle = "#00008b"; // Dark blue
    } else {
      livingSpaceCtx.fillStyle = "#ffffff"; // White
    }
    livingSpaceCtx.beginPath();
    livingSpaceCtx.arc(being.x, being.y, 3, 0, 2 * Math.PI);
    livingSpaceCtx.fill();
  }
}

function spawnFood() {
  food.splice(0, food.length);
  for (var i = 0; i < FOOD_NUM; i++) {
    let foodX = Math.floor(Math.random() * livingSpace.width);
    let foodY = Math.floor(Math.random() * livingSpace.height);
    while (!isInLake(foodX, foodY)) {
      foodX = Math.floor(Math.random() * livingSpace.width);
      foodY = Math.floor(Math.random() * livingSpace.height);
    }
    food.push({ x: foodX, y: foodY });
  }
  drawFood();
}

function drawFood() {
  for (var i = 0; i < food.length; i++) {
    var f = food[i];
    livingSpaceCtx.fillStyle = "#808000"; // Yellow
    livingSpaceCtx.beginPath();
    livingSpaceCtx.arc(f.x, f.y, 3, 0, 2 * Math.PI);
    livingSpaceCtx.fill();
  }
}

function spawnPlants() {
  plants.splice(0, plants.length);
  for (var i = 0; i < PLANTS_NUM; i++) {
    let plantX = Math.floor(Math.random() * livingSpace.width);
    let plantY = Math.floor(Math.random() * livingSpace.height);
    while (isInLake(plantX, plantY)) {
      plantX = Math.floor(Math.random() * livingSpace.width);
      plantY = Math.floor(Math.random() * livingSpace.height);
    }
    plants.push({ x: plantX, y: plantY });
  }
  drawPlants();
}

function drawPlants() {
  for (var i = 0; i < plants.length; i++) {
    var p = plants[i];
    livingSpaceCtx.fillStyle = "#90EE90"; // Light green
    livingSpaceCtx.beginPath();
    livingSpaceCtx.arc(p.x, p.y, 3, 0, 2 * Math.PI);
    livingSpaceCtx.fill();
  }
}

function drawCharts() {
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
    options: {
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
        label: "Age",
        data: age_data,
        borderColor: "brown",
        fill: false
      }, {
        label: "Velocity",
        data: velocity_data,
        borderColor: "green",
        fill: false
      }, {
        label: "Size",
        data: size_data,
        borderColor: "yellow",
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

function calculateAttributes() {
  let age = 0;
  let size = 0;
  let velocity = 0;

  for (var i = 0; i < beings.length; i++) {
    age += beings[i].age;
    size += beings[i].size;
    velocity += beings[i].velocity;
  }
  age_data.push(age / beings.length);
  size_data.push(size / beings.length);
  velocity_data.push(velocity / beings.length);
}

function isInLake(pointX, pointY) {
  for (var i = 0; i < lakes.length; i++) {
    const deltaX = (pointX - lakes[i].centerX) / lakes[i].radiusX;
    const deltaY = (pointY - lakes[i].centerY) / lakes[i].radiusY;

    if ((deltaX ** 2 + deltaY ** 2) <= 1) {
      return false;
    }
  }
  return true;
}

function isInForest(pointX, pointY) {
  if (pointX >= 0 && pointX <= livingSpace.width && pointY >= 0 && pointY <= 100) {
    return true;
  }
  return false;
}

function isOnLakeEdge(pointX, pointY) {
  for (var i = 0; i < lakes.length; i++) {
    let distance = Math.sqrt(Math.pow(pointX - lakes[i].centerX, 2) / Math.pow(lakes[i].radiusX, 2) + Math.pow(pointY - lakes[i].centerY, 2) / Math.pow(lakes[i].radiusY, 2));
    if (Math.abs(distance - 1) < 0.5) {
      return true;
    }
  }
  return false;
}

function setGender() {
  if (Math.random() < 0.5) {
    return "male";
  }
  return "female";
}

function setType() {
  if (Math.random() < 0.7) {
    return "prey";
  }
  return "predator";
}

function defineSurvivors() {
  beings.splice(0, beings.length);
  for (var i = 0; i < survivors.length; i++) {
    beings.push(survivors[i]);
  }
  survivors.splice(0, survivors.length);
}

function increaseRandomly(value) {
  if (Math.random() < 0.5) { // 50% chance to increase
    const randominVelocitycrease = Math.floor(Math.random() * 41) - 20; // Generate random number between -20 and 20
    value += randominVelocitycrease;
  }
  return value;
}

function isAround(num, aroundNum) {
  return Math.abs(num - aroundNum) <= 5;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function clearAll() {
  window.location.reload();
}

function saveData() {

  var data = {
    population: population_data,
    age: age_data,
    velocity: velocity_data,
    size: size_data,
  }
  var jsonData = JSON.stringify(data);

  var a = document.createElement("a");
  var file = new Blob([jsonData], { type: 'text/plain' });
  a.href = URL.createObjectURL(file);
  a.download = 'jsonData.txt';
  a.click();
}