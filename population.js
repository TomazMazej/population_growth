// Setup variables
var num_cycles = 100;
var N, R, S, K;
const data = [];

// Context
var livingSpace = document.getElementById("living-space");
var graph = document.getElementById("graph");
var livingSpaceCtx = livingSpace.getContext("2d");
var graphCtx = graph.getContext("2d");

function start(){
  N = Number(document.getElementById("N").value);
  R = Number(document.getElementById("R").value);
  S = Number(document.getElementById("S").value);
  K = Number(document.getElementById("K").value);  
  calculatePopulation();
}

async function calculatePopulation() {
  for (var cycle = 0; cycle < num_cycles; cycle++) {
    data.push({ x: cycle, y: N });
    delta = (R - S - K * N) * N;
    N = N + delta;
    drawPopulation();
    drawGraph(data);
    await sleep(50);
  }
}

function drawPopulation() {
  // Draw random points in the living-space
  var num_population = data[data.length - 1]
  for (var i = 0; i < num_population.y; i++) {
    var x = Math.floor(Math.random() * livingSpace.width);
    var y = Math.floor(Math.random() * livingSpace.height);
    livingSpaceCtx.beginPath();
    livingSpaceCtx.arc(x, y, 3, 0, 2 * Math.PI);
    livingSpaceCtx.fill();
  }
}

function drawGraph() {
  graphCtx.clearRect(0, 0, 400, 400);
  var space = 40;

  // Set up the x-axis and y-axis
  var xAxis = space;
  var yAxis = graph.height - space;

  // Find the maximum x and y values in the data array
  var maxX = 0;
  var maxY = 0;
  for (var i = 0; i < data.length; i++) {
    if (data[i].x > maxX) {
      maxX = data[i].x;
    }
    if (data[i].y > maxY) {
      maxY = data[i].y;
    }
  }

  // Set up the scale factor for the graph
  var scaleFactorX = graph.width / (maxX + space);
  var scaleFactorY = graph.width / (maxY + space);

  // Draw the x-axis
  graphCtx.beginPath();
  graphCtx.moveTo(space, yAxis);
  graphCtx.lineTo(graph.width, yAxis);

  // Draw x-axis label        
  graphCtx.font = "12px Arial";
  graphCtx.textAlign = "center";
  for (var i = 0; i < data.length; i++) {
    var x = data[i].x * scaleFactorX;
    var y = yAxis + 15;
    if (i % 20 == 0 || i == data.length-1)
      graphCtx.fillText(i, x + space, y);
  }

  // Draw the y-axis
  graphCtx.moveTo(xAxis, 0);
  graphCtx.lineTo(xAxis, graph.height - space);
  graphCtx.stroke();

  // Draw y-axis label  
  graphCtx.textAlign = "right";
  graphCtx.textBaseline = "middle";
  for (var i = 0; i <= data.length - 1; i++) {
    var x = xAxis;
    var y = (yAxis - data[i].y * scaleFactorY);
    if (i % 20 == 0 || i == data.length-1)
      graphCtx.fillText(Math.round(data[i].y * 100) / 100, x, y);
  }

  // Draw the data on the graph
  for (var i = 0; i < data.length; i++) {
    var x = data[i].x * scaleFactorX + space;
    var y = yAxis - data[i].y * scaleFactorY;
    graphCtx.beginPath();
    graphCtx.arc(x, y, 3, 0, 2 * Math.PI);
    graphCtx.fill();
  }

  // Draw lines between adjacent points
  for (var i = 0; i < data.length - 1; i++) {
    var x1 = data[i].x * scaleFactorX + space;
    var y1 = yAxis - data[i].y * scaleFactorY;
    var x2 = data[i + 1].x * scaleFactorX + space;
    var y2 = yAxis - data[i + 1].y * scaleFactorY;
    graphCtx.beginPath();
    graphCtx.moveTo(x1, y1);
    graphCtx.lineTo(x2, y2);
    graphCtx.stroke();
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function clearAll(){
  window.location.reload();
}