
// global letiables
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
  context.fillText("To better understand the simulation, you can visit the section labeled 'Key', which details each type of dot.", canvas.width/2, canvas.height/2+20);
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

  static infected_child = 0;
  static infected_adult = 0;
  static infected_senior = 0;
  static uninfected_child = 0;
  static uninfected_adult = 0;
  static uninfected_senior = 0;

  static totalChildInfected = 0;
  static totalChildOpportunities = 0;

  static totalAdultInfected = 0;
  static totalAdultOpportunities = 0;

  static totalSeniorInfected = 0;
  static totalSeniorOpportunities = 0;
    
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

    this.x = Person.generateRandomInt(this.radius+1, canvas.width-this.radius-1);
    this.y = Person.generateRandomInt(this.radius+1, canvas.height-this.radius-1);

    this.stepX = Person.steps[Person.generateRandomInt(0, 2)] * this.speed;
    this.stepY = Person.steps[Person.generateRandomInt(0, 2)] * this.speed;
  }

  draw() {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    context.fillStyle = this.backgroundColor;
    context.fill();
    context.lineWidth = Person.borderWidth;
    context.strokeStyle = this.borderColor;
    context.stroke();
    context.closePath();
  }

  update() {
    this.draw();

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
    Person.infected_child = 0;
    Person.infected_adult = 0;
    Person.infected_senior = 0;
    Person.uninfected_child = 0;
    Person.uninfected_adult = 0;
    Person.uninfected_senior = 0;  
    Person.totalChildInfected = 0;
    Person.totalChildOpportunities = 0;
    Person.totalAdultInfected = 0;
    Person.totalAdultOpportunities = 0;
    Person.totalSeniorInfected = 0;
    Person.totalSeniorOpportunities = 0;  
  }

}

function secondsElapsedTime(start_time, end_time, rounded) {
  let timeDiff = end_time - start_time; 
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
  Person.infected_child = parseInt(document.getElementById('child_in').value);
  for (let i = 0; i < Person.infected_child; i++, totalInfected++) {
    Person.addPerson("child", true);
    Person.current_infected.add(Person.dots.at(-1).id_number);
  }
  // adding adults
  Person.infected_adult = parseInt(document.getElementById('adult_in').value);
  for (let i = 0; i < Person.infected_adult; i++, totalInfected++) {
    Person.addPerson("adult", true);
    Person.current_infected.add(Person.dots.at(-1).id_number);
  }
  // adding seniors
  Person.infected_senior = parseInt(document.getElementById('senior_in').value);
  for (let i = 0; i < Person.infected_senior; i++, totalInfected++) {
    Person.addPerson("senior", true);
    Person.current_infected.add(Person.dots.at(-1).id_number);
  }
  return totalInfected;
}

function addUninfected() {
  let totalUninfected = 0;
  // adding children
  Person.uninfected_child = parseInt(document.getElementById('child_un').value);
  for (let i = 0; i < Person.uninfected_child; i++, totalUninfected++)
    Person.addPerson("child", false);
  // adding adults
  Person.uninfected_adult = parseInt(document.getElementById('adult_un').value)
  for (let i = 0; i < Person.uninfected_adult; i++, totalUninfected++)
    Person.addPerson("adult", false);
  // adding seniors
  Person.uninfected_senior = parseInt(document.getElementById('senior_un').value)
  for (let i = 0; i < Person.uninfected_senior; i++, totalUninfected++)
    Person.addPerson("senior", false);  
  return totalUninfected;
}

// takem from StackOverflow
function tableToJson(table) { 
  let data = [];
  for (let i=1; i<table.rows.length; i++) { 
      let tableRow = table.rows[i]; 
      let rowData = []; 
      for (let j=0; j<tableRow.cells.length; j++) { 
          rowData.push(tableRow.cells[j].innerHTML);; 
      } 
      data.push(rowData); 
  } 
  return data; 
}

// taken from Stack Overflow
function download(filename, text) {
  let element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

// convert json to array
function JSONToArray(json_string) {
  let current_obj = JSON.parse(json_string);
  let converted = [];
  for(let i in current_obj)
    converted.push(current_obj[i]);
    
  return converted;
}

function downloadData() {
  let data_table = document.getElementsByTagName('table')[0];
  let json_array = JSON.stringify(tableToJson(data_table));
  let json_data = {};
  json_array = JSONToArray(json_array);
  json_data['infection-log'] = {};
  for (let i = 0; i < json_array.length; i++) {
    json_data['infection-log'][i] = {};
    json_data['infection-log'][i]['id'] = json_array[i][0]
    json_data['infection-log'][i]['type'] = json_array[i][1]
    json_data['infection-log'][i]['time'] = json_array[i][2]
  }
  json_data['input'] = {};
  json_data['input']['infected'] = {
    "child": Person.infected_child,
    "adult": Person.infected_adult,
    "senior": Person.infected_senior
  }
  json_data['input']['uninfected'] = {
    "child": Person.uninfected_child,
    "adult": Person.uninfected_adult,
    "senior": Person.uninfected_senior
  }
  json_data['infection-rate'] = {}
  let total_infected = Person.totalChildInfected + Person.totalAdultInfected + Person.totalSeniorInfected
  let total_opportunities = Person.totalChildOpportunities + Person.totalAdultOpportunities + Person.totalSeniorOpportunities
  console.assert(total_infected <= total_opportunities);
  json_data['infection-rate']['cumulative'] = total_infected/total_opportunities * 100
  json_data['infection-rate']['child'] = Person.totalChildInfected/Person.totalChildOpportunities * 100
  json_data['infection-rate']['adult'] = Person.totalAdultInfected/Person.totalAdultOpportunities * 100
  json_data['infection-rate']['senior'] = Person.totalSeniorInfected/Person.totalSeniorOpportunities * 100
  console.log(json_data);
  download("data.json", JSON.stringify(json_data, null, 4));
}

function lenModifier(a) {
  if (a.toString().length == 1) a = '0' + a.toString()
  return a
}

function timeFormatter(time) {
  let minutes = parseInt(parseInt(time)/60);
  let remainderSeconds = parseInt(time) % 60;
  return lenModifier(minutes) + ":" + lenModifier(remainderSeconds);
}

function getChildProbability() {
  let quan = Math.random();
  if (quan <= 0.33) 
    return true;  
  else if (quan <= 0.66) 
    return false; 
  return false;
}

function getAdultProbability() {
  return Math.random() <= 0.5;
}

function getSeniorProbability() {
  let quan = Math.random();
  if (quan <= 0.33) 
    return true;  
  else if (quan <= 0.66) 
    return true; 
  return false;
}

function simulate() {
  Person.reset();

  let music = new Audio('sounds/dr-mario-nes-fever.mp3');
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
  let total_infected = addInfected();

  // console.log(Person.child_infected.size, Person.adult_infected.size, Person.senior_infected.size);

  if (total_infected == 0) {
    alert("Please select a non-zero number of infected people.");
    return;
  }

  data.textContent = "Percentage Infected: " + Math.round(total_infected/Person.dots.length * 100) + "%, Number Infected: 1";

  let table_contents = document.querySelector('.content-area');
  let progress_bar = document.getElementById('progress');

  let updateCanvas = function() {
    if (Person.current_infected.size != Person.dots.length) {
      requestAnimationFrame(updateCanvas);
    } else {
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
      context.fillText("Everyone was infected...simulation complete", canvas.width/2, canvas.height/2);
      music.pause();
      let b = new Audio('sounds/short-scream.mp3');
      b.play();
      return
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    // collision detection
    let collisionOccurred = false;
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
              if (getChildProbability()) infection_spread = true
            } else if (person_type === 'adult') { 
              // adult has 1/2 probability of being infected
              if (getAdultProbability()) infection_spread = true
            } else if (person_type === 'senior') { 
              // senior has 2/3 probability of being infected
              if (getSeniorProbability()) infection_spread = true
            } 

            Person.totalInfectionOpportunities++;
            if (person_type == 'child') {
              Person.totalChildOpportunities++;
            } else if (person_type == 'adult') {
              Person.totalAdultOpportunities++;
            } else {
              Person.totalSeniorOpportunities++;
            }

            Person.dots[i].stepX *= -1;
            Person.dots[i].stepY *= -1;
            
            if (infection_spread == true) {
              let audio = new Audio('sounds/cough1.mp3');
              audio.play();
            }
            if (!infection_spread) {
              let audio = new Audio('sounds/game-blip.mp3');
              audio.play();
              continue
            }

            table_contents.innerHTML += "\n<tr><td>" + other_ind + "</td><td>" + Person.dots[other_ind].age_group + "</td><td>" + secondsElapsedTime(start_time, new Date(), false) + "</td></tr>";

            if (person_type == 'child') {
              Person.totalChildInfected++;
            } else if (person_type == 'adult') {
              Person.totalAdultInfected++;
            } else {
              Person.totalSeniorInfected++;
            }

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
  let popup = document.getElementById("child");
  popup.classList.toggle("show");
}

function loadAdult() {
  let popup = document.getElementById("adult");
  popup.classList.toggle("show");
}

function loadSenior() {
  let popup = document.getElementById("senior");
  popup.classList.toggle("show");
}

