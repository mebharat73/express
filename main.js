/**
 * 1. Variables
 * Memory element
 * Data storage
 *
 * var (don't use), let, const
 */

// Variable can be declared only once, value can be set only once
const name = "Ram";

// Value can be set multiple times
let age = 20;
age = 40;
age = 60;

/**
 * 2. Conditional statements
 * if - else
 * switch
 */

if (age < 50) {
  // code
} else if (age > 10) {
  // code
} else {
  // code
}

const day = "Sunday";

switch (name) {
  case "Sunday":
    // code
    break;

  case "Monday":
    // code
    break;

  default:
    break;
}

/**
 * 3. Loop
 * Run the code repeatedly
 */

// For loop
for (let i = 0; i < 10; i++) {
  //   console.log(i);
}

// While loop
let i = 0;

while (i < 10) {
  //   console.log(i);
  i = i + 2;
}

// Array - List
// Array's position starts from Zero 0
const myArray = [90, "hello", true, "Sam"];
const marks = [40, 20, 53, 65, 98, 40, 20];
console.log(marks[5]);

// Object - Collection of data
const student = {
  name: "Hari",
  class: 10,
  age: 18,
  address: "Itahari",
  phone: 987654320,
};

console.log(student["phone"]);
console.log(student.class);

// Function
function square(a) {
  console.log(a * a);
}

square(5);
square(8);

function sum(a, b) {
  return a + b;
}

// Arrow function
const sumX = (a, b) => a + b;
const result = sum(5, 23);
console.log(result);
