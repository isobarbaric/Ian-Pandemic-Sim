
let canvas = document.querySelector('#game')

// resize canvas according to screen size
canvas.width = 0.8*window.innerWidth;
canvas.height = 0.8*window.innerHeight;

let context = canvas.getContext('2d');  

// creating a class for the dots  
class Person {

  static borderWidth = 0

  constructor(id_number, age_group) {
    this.id_number = id_number;
    this.age_group = age_group;

    // 0, 100 are just temporary dummy values
    this.x = generateRandomNumber(0, canvas.width);
    this.y = generateRandomNumber(0, canvas.height);

    // set velocity of Person object
    this.vx = 0, this.vy = 0;

    // change radius as per dot type
    if (age_group === 'child') {
      this.radius = 10;
      this.backgroundColor = '#6cadd8';
    } else if (age_group === 'adult') {
      this.radius = 20;
      this.backgroundColor = '#67d394';
    } else if (age_group === 'senior') {
      this.radius = 17;
      this.backgroundColor = '#bab21a';
    }
    this.borderColor = this.backgroundColor;
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
  }

  update() {
    this.draw();
  }
  
}

id_counter = 1

testPerson = new Person(id_counter, "child")
testPerson.draw()

function generateRandomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

let a = new Person(1, "child")
console.log(a)
