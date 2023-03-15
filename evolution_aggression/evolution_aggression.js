// Setup variables
var generations = 100;
var N, FOOD_NUM;

const beings = [];
const food = [];
const winners = [];

// Graph data
const population_data = [];
const generation_data = [];
const aggressive_data = [];
const peacefull_data = [];


// Context
var livingSpace = document.getElementById("living-space");
var livingSpaceCtx = livingSpace.getContext("2d");

function start() {
    N = 11//Number(document.getElementById("N").value);
    FOOD_NUM = 10//Number(document.getElementById("FOOD").value);

    initialSpawn();
    lifeCycle();
}

async function lifeCycle() {
    for (var gen = 0; gen < generations; gen++) {
        generation_data.push(gen);
        population_data.push(beings.length);
        await generation();
        if (winners.length == 0) { // No survivors - END
            console.log("END")
            break;
        }
        copyArray();
        relocateBeings();
        spawnFood();
        calculateData();
        drawCharts();
    }
}

async function generation() {
    let food_options = FOOD_NUM * 2;
    let food_counter = 0;
    for (var i = 0; i < beings.length; i += 2) {
        if (food_options == 0) { // No more food
            break;
        }
        // Group food and beings
        food[food_counter].being1 = beings[i];
        beings[i].x = food[food_counter].x;
        beings[i].y = food[food_counter].y;

        if (i + 1 < beings.length) {
            food[food_counter].being2 = beings[i + 1];
            beings[i + 1].x = food[food_counter].x;
            beings[i + 1].y = food[food_counter].y;
        }
        food_counter++;

        drawLivingSpace();
        await sleep(1000);
    }

    // Situations
    for (var i = 0; i < food.length; i++) {
        // Empty food
        if (food[i].being1 == null) {
            console.log("Empty");
            continue;
        }
        // Only one being - survives and replicates
        if (food[i].being1 != null && food[i].being2 == null) {
            winners.push(food[i].being1);
            winners.push(food[i].being1);
            console.log("Lone being");
            continue;
        }
        // 2 peacefull - both survive but do not replicate
        if (food[i].being1.type == "peacefull" && food[i].being2.type == "peacefull") {
            winners.push(food[i].being1);
            winners.push(food[i].being2);
            console.log("2 peacefull");
            continue;
        }
        // 2 aggressive - both die
        if (food[i].being1.type == "aggressive" && food[i].being2.type == "aggressive") {
            console.log("2 aggressive");
            continue;
        }
        // 1 aggressive, 1 peacefull
        if ((food[i].being1.type == "peacefull" && food[i].being2.type == "aggressive") || (food[i].being1.type == "aggressive" && food[i].being2.type == "peacefull")) {
            if (food[i].being1.type == "aggressive") {
                winners.push(food[i].being1); // Agressive survives
                if (Math.random() < 0.5) { // Aggressive replicates
                    winners.push(food[i].being1);
                }
                if (Math.random() < 0.5) { // Peacefull survives
                    winners.push(food[i].being2);
                }
            } else {
                winners.push(food[i].being2); // Agressive survives
                if (Math.random() < 0.5) { // Aggressive replicates
                    winners.push(food[i].being2);
                }
                if (Math.random() < 0.5) { // Peacefull survives
                    winners.push(food[i].being1);
                }
            }
            console.log("1 aggressive, 1 peacefull");
            continue;
        }
    }

    return new Promise((resolve) => {
        resolve();
    });
}

function initialSpawn() {
    spawnBeings();
    spawnFood();
    drawLivingSpace();
}

function relocateBeings() {
    for (var i = 0; i < beings.length; i++) {
        beings[i].x = 0;
        beings[i].y = Math.floor(Math.random() * livingSpace.width);
    }
}

function spawnBeings() {
    for (var i = 0; i < N; i++) {
        let being_type;
        if (Math.random() < 0.5) {
            being_type = "aggressive"
        } else {
            being_type = "peacefull"
        }
        const being = { x: 0, y: Math.floor(Math.random() * livingSpace.width), type: being_type, food: 0 };
        beings.push(being);
    }
}

function spawnFood() {
    food.splice(0, food.length)
    for (var i = 0; i < FOOD_NUM; i++) {
        const f = { x: Math.floor(Math.random() * livingSpace.width), y: Math.floor(Math.random() * livingSpace.width), places: 2, being1: null, being2: null };
        food.push(f);
    }
}

function calculateData() {
    let agg = 0;
    let pea = 0;
    for (var i = 0; i < beings.length; i++) {
        if (beings[i].type == "aggressive") {
            agg++;
        } else {
            pea++;
        }
    }
    aggressive_data.push(agg);
    peacefull_data.push(pea);
}

function drawLivingSpace() {
    // Clear canvas
    livingSpaceCtx.clearRect(0, 0, 400, 400);

    // Draw food
    for (var i = 0; i < food.length; i++) {
        var f = food[i];
        livingSpaceCtx.fillStyle = "#c82124"; // red
        livingSpaceCtx.beginPath();
        livingSpaceCtx.arc(f.x, f.y, 4, 0, 2 * Math.PI);
        livingSpaceCtx.fill();
    }

    // Draw beings
    for (var i = 0; i < beings.length; i++) {
        var being = beings[i];
        livingSpaceCtx.fillStyle = "#000000"; // black
        livingSpaceCtx.beginPath();
        livingSpaceCtx.arc(being.x, being.y, 3, 0, 2 * Math.PI);
        livingSpaceCtx.fill();
    }
}

function drawCharts() {

    new Chart("populationChart", {
        type: "line",
        data: {
            labels: generation_data,
            datasets: [{
                label: "Aggressive",
                data: aggressive_data,
                borderColor: "red",
                fill: false
            }, {
                label: "Peacefull",
                data: peacefull_data,
                borderColor: "green",
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

function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

function copyArray() {
    beings.splice(0, beings.length);
    for (var i = 0; i < winners.length; i++) {
        beings.push(winners[i]);
    }
    winners.splice(0, winners.length);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function clearAll() {
    window.location.reload();
}