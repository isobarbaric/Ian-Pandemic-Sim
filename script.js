

let canvas, data, content;

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
}

// creating a class for the dots  
class Person {

  static borderWidth = 0;
  static seniorSpeed = 1;
  static adultSpeed = Person.seniorSpeed * 1.5;
  static childSpeed = Person.adultSpeed * 1.5; 
  static steps = [-1, 1]

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
      this.radius = 20;
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
}

let keepGoing = true;
let simulation_button = document.querySelector('#start-btn')
let exit_button = document.querySelector('#stop-btn')
exit_button.addEventListener('click', function() {
  simulation_button.disabled = false;
  keepGoing = false;
  this.disabled = true;
});

function simulate() {
  simulation_button.disabled = true;
  // setting true for turning on after initial click
  simulation_button.addEventListener('click', function() {
    keepGoing = true;
  });
  exit_button.disabled = false;

  id_counter = 1
  let dots = []
  let ages = ['child', 'adult', 'senior']

  for (let i = 0; i < 10; i++) {
    dots.push(new Person(id_counter, ages[i % 3], false));
    dots[i].draw();
    id_counter++;
  }

  let current_infected = new Set();

  // adding infected people
  dots.push(new Person(id_counter, "child", true));
  current_infected.add(id_counter);
  id_counter++;
  data.textContent = "Percentage Infected: " + Math.round(1/dots.length * 100) + "%, Number Infected: 1";

  let updateCanvas = function() {
    requestAnimationFrame(updateCanvas);

    // functionality for abort button
    if (!keepGoing) {      
      return;
    }
      
    context.clearRect(0, 0, canvas.width, canvas.height);

    let collisionOccurred = false;

    // collision detection
    for (let i = 0; i < dots.length; i++) {
      for (let j = 0; j < dots.length; j++) {
        if (i == j) continue;
        if (Person.intersect(dots[i], dots[j])) {
          // don't count situation where both are infected
          if (dots[i].infected && dots[j].infected) {
            continue
          }
          if (dots[i].infected || dots[j].infected) {
            // differentiate between who is being infected, factor probabilities in

            dots[i].backgroundColor = dots[i].borderColor = '#FF6666';
            dots[j].backgroundColor = dots[j].borderColor = '#FF6666';
            dots[i].infected = dots[j].infected = true;
            current_infected.add(dots[i].id_number);
            current_infected.add(dots[j].id_number);
            collisionOccurred = true;
          }
        }
      }
    }

    if (collisionOccurred) {
      // change and personalize to each type of person
      data.textContent = "Percentage Infected: " + Math.round((current_infected.size)/dots.length * 100) + "%, Number Infected: " + current_infected.size;
    }

    dots.forEach((currentPerson) => {
      currentPerson.update();
    });
  }

  updateCanvas();
}