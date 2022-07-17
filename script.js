
// global variables
let canvas, data, content;
let stopwatch = document.querySelector('.stopwatch')
let infection_table = document.querySelector('.outline')
let simulation_button = document.querySelector('#start-btn')
let json_button = document.querySelector('#json-btn')

function init() {
  canvas = document.querySelector('#game')
  data = document.querySelector('.info')

  // resize canvas according to screen size
  canvas.width = 0.5*window.innerWidth;
  canvas.height = 0.5*window.innerHeight;

  // dynamically size window whenever necess  ary
  window.addEventListener('resize', function(){
    canvas.width = 0.5*window.innerWidth;
    canvas.height = 0.5*window.innerHeight; 
  });

  context = canvas.getContext('2d');  

  json_button.disabled = true;

  context.fillStyle = 'black'
  context.textBaseline = 'middle'; 
  context.textAlign = "center";

  context.font = "2em Nunito Sans, sans-serif";
  context.fillText("Get Started!", canvas.width/2, canvas.height/2-40);

  context.font = "1em Nunito Sans, sans-serif";
  context.fillText("Select criteria from the two selectors below to choose input conditions.", canvas.width/2, canvas.height/2);
  context.fillText("To better understand the simulation, you can visit the section labeled 'Key' details each type of dot.", canvas.width/2, canvas.height/2+20);
  context.fillText("Once you have chosen the desired inputs, press the 'Start Simulation' button to start the simulation.", canvas.width/2, canvas.height/2 + 40);
}

// creating a class for the Person.dots  
class Person {
  static borderWidth = 0;
  static seniorSpeed = 0.7;
  static adultSpeed = Person.seniorSpeed * 1.2;
  static childSpeed = Person.adultSpeed * 1.2; 
  static steps = [-1, 1]
  static id_counter = 1
  static dots = []
  static ages = ['child', 'adult', 'senior']
  static current_infected = new Set();
  
  constructor(id_number, age_group, infected) {
    this.id_number = id_number;
    this.age_group = age_group;
    this.infected = infected;

    // change radius as per dot type
    if (age_group === 'child') {
      this.radius = 10;
      this.backgroundColor = '#6cadd8';
      this.speed = Person.childSpeed;
    } else if (age_group === 'adult') {
      this.radius = 25;
      this.backgroundColor = '#67d394';
      this.speed = Person.adultSpeed;
    } else if (age_group === 'senior') {
      this.radius = 17;
      this.backgroundColor = '#bab21a';
      this.speed = Person.seniorSpeed;
    }

    if (this.infected) {
      this.backgroundColor = '#FF6666';
    }

    this.borderColor = this.backgroundColor;

    // add validation for spawn area, to make sure don't spawn out of the screen 
    this.x = Person.generateRandomInt(this.radius+1, canvas.width-this.radius-1);
    this.y = Person.generateRandomInt(this.radius+1, canvas.height-this.radius-1);

    // set step size of Person object, different speed according to type of person
    this.stepX = Person.steps[Person.generateRandomInt(0, 2)] * this.speed;
    this.stepY = Person.steps[Person.generateRandomInt(0, 2)] * this.speed;
  }

  draw() {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    context.fillStyle = this.backgroundColor;
    context.fill();
    context.lineWidth = Person.borderWidth;
    // can change the border color as per dot maybe
    context.strokeStyle = this.borderColor;
    context.stroke();
    context.closePath();
  }

  update() {
    this.draw();

    // collision detection
    if (this.x + this.radius > canvas.width) {
      this.stepX *= -1;
    }
    if (this.x - this.radius < 0) {
      this.stepX *= -1;
    }

    if (this.y + this.radius > canvas.height) {
      this.stepY *= -1;
    }
    if (this.y - this.radius < 0) {
      this.stepY *= -1;
    }

    this.x += this.stepX;
    this.y += this.stepY;
  }
  
  static intersect(a, b) {
    let distance = Math.sqrt(((a.x-b.x) ** 2) + ((a.y-b.y) ** 2));
    return distance <= a.radius + b.radius;
  }
  
  static generateRandomInt(min, max) {
    return Math.trunc(Math.random() * (max - min) + min);
  } 

  static addPerson(age_group, infected) {
    Person.id_counter++;
    Person.dots.push(new Person(Person.id_counter, age_group, infected));
  }

  static reset() {
    Person.id_counter = 1
    Person.dots = []
    Person.current_infected = new Set();  
  }

}

// to be called when given invalid input, 

function secondsElapsedTime(start_time, end_time, rounded) {
  var timeDiff = end_time - start_time; 
  timeDiff /= 1000;
  if (rounded) return Math.round(timeDiff);
  return timeDiff;
} 

function validateInput(sender) {
  let min = sender.min;
  let max = sender.max;
  let value = parseInt(sender.value);
  if (value > max) {
    sender.value = max;
  } else if (value < min) {
    sender.value = min;
  }
}

function addInfected() {
  let totalInfected = 0;
  // adding children
  for (let i = 0; i < parseInt(document.getElementById('child_in').value); i++, totalInfected++) {
    Person.addPerson("child", true);
    Person.current_infected.add(Person.dots.at(-1).id_number);
  }
  // adding adults
  for (let i = 0; i < parseInt(document.getElementById('adult_in').value); i++, totalInfected++) {
    Person.addPerson("adult", true);
    Person.current_infected.add(Person.dots.at(-1).id_number);
  }
  // adding seniors
  for (let i = 0; i < parseInt(document.getElementById('senior_in').value); i++, totalInfected++) {
    Person.addPerson("senior", true);
    Person.current_infected.add(Person.dots.at(-1).id_number);
  }
  return totalInfected;
}

function addUninfected() {
  let totalUninfected = 0;
  // adding children
  for (let i = 0; i < parseInt(document.getElementById('child_un').value); i++, totalUninfected++)
    Person.addPerson("child", false);
  // adding adults
  for (let i = 0; i < parseInt(document.getElementById('adult_un').value); i++, totalUninfected++)
    Person.addPerson("adult", false);
  // adding seniors
  for (let i = 0; i < parseInt(document.getElementById('senior_un').value); i++, totalUninfected++)
    Person.addPerson("senior", false);  
  return totalUninfected;
}

// takem from StackOverflow
function tableToJson(table) { 
  var data = [];
  for (var i=1; i<table.rows.length; i++) { 
      var tableRow = table.rows[i]; 
      var rowData = []; 
      for (var j=0; j<tableRow.cells.length; j++) { 
          rowData.push(tableRow.cells[j].innerHTML);; 
      } 
      data.push(rowData); 
  } 
  return data; 
}

// taken from Stack Overflow
function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function downloadData() {
  let data_table = document.getElementsByTagName('table')[0]
  let json_data = JSON.stringify(Object.assign({}, tableToJson(data_table)));
  console.log(json_data);
  // e.preventDefault();
  download("data.json", json_data);
}

function lenModifier(a) {
  if (a.toString().length == 1) a = '0' + a.toString()
  return a
}

function timeFormatter(time) {
  let minutes = parseInt(parseInt(time)/60);
  console.log(minutes);
  let remainderSeconds = parseInt(time) % 60;
  console.log(remainderSeconds);
  return lenModifier(minutes) + ":" + lenModifier(remainderSeconds);
}

function simulate() {
  Person.reset();

  var music = new Audio('sounds/dr-mario-nes-fever.mp3');
  music.loop=true;
  music.play();

  let start_time = new Date();
  json_button.disabled = true;

  stopwatch.textContent = timeFormatter(secondsElapsedTime(start_time, new Date(), false)) + " elapsed";
  let stopwatch_unit = setInterval(function() {
    let time_gone = timeFormatter(secondsElapsedTime(start_time, new Date(), true));
    stopwatch.textContent = time_gone + " elapsed";
  }, 1000);

  infection_table.innerHTML = `<table>
    <thead>
        <tr>
            <th>Person ID</th>
            <th>Person Type</th>
            <th>Time</th>
        </tr>
    </thead>
    <tbody class='content-area'>
    </tbody>
  </table>`

  simulation_button.disabled = true;

  addUninfected();
  let totalInfected = addInfected();

  if (totalInfected == 0) {
    alert("Please select a non-zero number of infected people.");
    return;
  }

  data.textContent = "Percentage Infected: " + Math.round(totalInfected/Person.dots.length * 100) + "%, Number Infected: 1";

  let totalInfectionOpportunities = 0;

  let table_contents = document.querySelector('.content-area');
  let progress_bar = document.getElementById('progress');

  let updateCanvas = function() {
    // stop simulating once all of the people are infected
    if (Person.current_infected.size != Person.dots.length) {
      requestAnimationFrame(updateCanvas);
    } else {
      // dim canvas once and set text on it saying "all infected"
      // canvas.opacity = 0.5;
      console.log(totalInfected + "/" + totalInfectionOpportunities);
      simulation_button.disabled = false;
      json_button.disabled = false;
      stopwatch.textContent = secondsElapsedTime(start_time, new Date(), false) + " elapsed";
      clearInterval(stopwatch_unit);
      context.fillStyle = "rgba(255, 255, 200, 0.8)";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.font = "2em Nunito Sans, sans-serif";
      context.fillStyle = 'black'
      context.textBaseline = 'middle'; 
      context.textAlign = "center";
      context.fillText("Everyone was infected... Simulation complete!", canvas.width/2, canvas.height/2);
      music.pause();
      var b = new Audio('sounds/short-scream.mp3');
      b.play();
      return
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    let collisionOccurred = false;
    // collision detection
    for (let i = 0; i < Person.dots.length; i++) {
      for (let j = 0; j < Person.dots.length; j++) {
        if (i == j) continue;
        if (Number(Person.dots[i].infected) + Number(Person.dots[j].infected) == 0) {
          continue
        }
        if (Number(Person.dots[i].infected) + Number(Person.dots[j].infected) == 2) {
          continue
        }
        if (Person.intersect(Person.dots[i], Person.dots[j])) {
          collisionOccurred = true;

          // don't count situation where both are infected
          if (Number(Person.dots[i].infected) + Number(Person.dots[j].infected) == 1) {
            let infection_spread = false;
            let other_ind = i + j;
            if (Person.dots[i].infected) other_ind -= i;
            else other_ind -= j;

            let person_type = Person.dots[other_ind].age_group;
            
            if (person_type == 'child') {
              // child has 1/3 probability of being infected
              if (Math.round((Math.random()*3)+1) == 3) infection_spread = true
            } else if (person_type === 'adult') { 
              // adult has 1/2 probability of being infected
              if (Math.round((Math.random()*2)+1) == 1) infection_spread = true
            } else if (person_type === 'senior') { 
              // senior has 2/3 probability of being infected
              if (Math.round((Math.random()*3)+1) >= 2) infection_spread = true
            } 

            totalInfectionOpportunities++;
        
            Person.dots[i].stepX *= -1;
            Person.dots[i].stepY *= -1;
            
            if (infection_spread == true) {
              var audio = new Audio('sounds/cough1.mp3');
              audio.play();
            }
            if (!infection_spread) {
              var audio = new Audio('sounds/game-blip.mp3');
              audio.play();
              continue
            }

            table_contents.innerHTML += "\n<tr><td>" + other_ind + "</td><td>" + Person.dots[other_ind].age_group + "</td><td>" + secondsElapsedTime(start_time, new Date(), false) + "</td></tr>";

            totalInfected++;

            // progress_bar.innerHTML = Math.round((current_infected.size)/Person.dots.length * 100) + "%";

            Person.dots[i].backgroundColor = Person.dots[i].borderColor = '#FF6666';
            Person.dots[j].backgroundColor = Person.dots[j].borderColor = '#FF6666';
            Person.dots[i].infected = Person.dots[j].infected = true;
            Person.current_infected.add(Person.dots[i].id_number);
            Person.current_infected.add(Person.dots[j].id_number);
          }
        }
      }
    }

    if (collisionOccurred) {
      // change and personalize to each type of person
      data.textContent = "Percentage Infected: " + Math.round((Person.current_infected.size)/Person.dots.length * 100) + "%, Number Infected: " + Person.current_infected.size;
    }

    Person.dots.forEach((currentPerson) => {
      currentPerson.update();
    });

  }

  updateCanvas();
}

function loadChild() {
  var popup = document.getElementById("child");
  popup.classList.toggle("show");
}

function loadAdult() {
  var popup = document.getElementById("adult");
  popup.classList.toggle("show");
}

function loadSenior() {
  var popup = document.getElementById("senior");
  popup.classList.toggle("show");
}

