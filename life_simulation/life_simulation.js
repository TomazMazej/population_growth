// Setup variables
var generations = 100;
var N, TERRAIN, HUNGER, THIRST, SIZE, VELOCITY, SENSE, FOOD_NUM;

const beings = [];
const food = [];
const lakes = [];

// Graph data
const population_data = [];
const generation_data = [];

// Context
var livingSpace = document.getElementById("living-space");
var graph = document.getElementById("graph");
var livingSpaceCtx = livingSpace.getContext("2d");

function start() {
    N = 10//Number(document.getElementById("N").value);
    HUNGER = 100//Number(document.getElementById("HUNGER").value);
    THIRST = 100//Number(document.getElementById("THIRST").value);
    SIZE = 30//Number(document.getElementById("SIZE").value);
    VELOCITY = 50//Number(document.getElementById("VELOCITY").value);
    SENSE = 0///Number(document.getElementById("SENSE").value);
    FOOD_NUM = 50//Number(document.getElementById("FOOD").value);
    TERRAIN = 4//Number(document.getElementById("TERRAIN").value);

    drawLandscape();
    spawnFood();
    spawnBeings();

    lifeCycle();
}

async function lifeCycle() {
    for (var gen = 0; gen < generations; gen++) {
        generation_data.push(gen);
        population_data.push(beings.length);
        await generation();
        if (beings.length == 0) { // No survivors - END
            break;
        }
        //spawnFood();
        //calculateAttributes();
        //drawCharts();
    }
}

async function generation() {
}

function drawLivingSpace() {
    livingSpaceCtx.clearRect(0, 0, 400, 400);
    drawLandscape();
    drawFood();
    drawBeings();
  }

function drawLandscape() {
    livingSpaceCtx.fillStyle = '#34b7eb';
    livingSpace.style.backgroundColor = '#90d16f';
    if (TERRAIN == 1) {
        let lake = { centerX: livingSpace.width / 2, centerY: livingSpace.height / 2, radiusX: 100, radiusY: 50 }
        livingSpaceCtx.beginPath();
        livingSpaceCtx.ellipse(lake.centerX, lake.centerY, lake.radiusX, lake.radiusY, 0, 0, 2 * Math.PI);
        livingSpaceCtx.fill();
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
        while (!isNotInLake(beingX, beingY)) {
            beingX = Math.floor(Math.random() * livingSpace.width);
            beingY = Math.floor(Math.random() * livingSpace.height);
        }
        const being = { x: beingX, y: beingY, hunger: HUNGER, thirst: THIRST, age: 0, size: SIZE, velocity: VELOCITY, sense: SENSE, gender: setGender(), type: setType() };
        beings.push(being);
    }
    drawBeings();
}

function drawBeings() {
    for (var i = 0; i < beings.length; i++) {
        var being = beings[i];
        livingSpaceCtx.fillStyle = "#087a04"; // dark green
        if (being.type == "predator") {
            livingSpaceCtx.fillStyle = "#eb0e3e"; // black
        }
        livingSpaceCtx.beginPath();
        livingSpaceCtx.arc(being.x, being.y, 3, 0, 2 * Math.PI);
        livingSpaceCtx.fill();
    }
}

function spawnFood() {
    food.splice(0, food.length)
    for (var i = 0; i < FOOD_NUM; i++) {
        let foodX = Math.floor(Math.random() * livingSpace.width);
        let foodY = Math.floor(Math.random() * livingSpace.height);
        while (!isNotInLake(foodX, foodY)) {
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
        livingSpaceCtx.fillStyle = "#5e340e"; // brown
        livingSpaceCtx.beginPath();
        livingSpaceCtx.arc(f.x, f.y, 3, 0, 2 * Math.PI);
        livingSpaceCtx.fill();
    }
}

function isNotInLake(pointX, pointY) {
    for (var i = 0; i < lakes.length; i++) {
        const deltaX = (pointX - lakes[i].centerX) / lakes[i].radiusX;
        const deltaY = (pointY - lakes[i].centerY) / lakes[i].radiusY;

        if ((deltaX ** 2 + deltaY ** 2) <= 1) {
            return false;
        }
    }
    return true;
}

function setGender() {
    if (Math.random() < 0.5) {
        return "male";
    }
    return "female";
}

function setType() {
    if (Math.random() < 0.8) {
        return "prey";
    }
    return "predator";
}

function copyArray() {
    beings.splice(0, beings.length);
    for (var i = 0; i < winners.length; i++) {
        beings.push(winners[i]);
    }
    winners.splice(0, winners.length);
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