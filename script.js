
let canvas = document.querySelector('#game')

// resize canvas according to screen size
canvas.width = 0.8*window.innerWidth;
canvas.height = 0.8*window.innerHeight;

// dynamically size window whenever necessary
window.addEventListener('resize', function(){
  canvas.width = 0.8*window.innerWidth;
  canvas.height = 0.8*window.innerHeight; 
});

let context = canvas.getContext('2d');  

let generateRandomInt = function(min, max) {
  return Math.trunc(Math.random() * (max - min) + min);
}

// creating a class for the dots  
class Person {

  static borderWidth = 0;
  static seniorSpeed = 2;
  static adultSpeed = Person.seniorSpeed * 1.5;
  static childSpeed = Person.adultSpeed * 1.5; 
  static steps = [-1, 1]

  constructor(id_number, age_group) {
    this.id_number = id_number;
    this.age_group = age_group;

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
    this.borderColor = this.backgroundColor;

    // 0, 100 are just temporary dummy values
    this.x = generateRandomInt(this.radius+1, canvas.width-this.radius-1);
    this.y = generateRandomInt(this.radius+1, canvas.height-this.radius-1);

    // set step size of Person object, different speed according to type of person
    // this.stepX = this.speed;
    // this.stepY = this.speed;
    // console.log(generateRandomInt(0, 2))
    // console.log(Person.steps[generateRandomInt(0, 2)] * this.speed)
    this.stepX = Person.steps[generateRandomInt(0, 2)] * this.speed;
    this.stepY = Person.steps[generateRandomInt(0, 2)] * this.speed;
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
  
}

id_counter = 1

let dots = []
let ages = ['child', 'adult', 'senior']

for (let i = 0; i < 40; i++) {
  dots.push(new Person(id_counter, ages[i % 3]));
  dots[i].draw();
  id_counter++;
}

// add infected dot(s)

// add validation for spawn area, to make sure don't spawn out of the screen 

let updateCanvas = function() {
  requestAnimationFrame(updateCanvas);
  context.clearRect(0, 0, canvas.width, canvas.height);
  dots.forEach((currentPerson) => {
    // console.log(currentPerson.id_number);
    currentPerson.update();
  });
}

updateCanvas();

