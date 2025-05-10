// ES-5/6

// 1. Destructuring
const user = {
  name: "Ram",
  age: 20,
  phone: 987465120,
};

console.log(user.name, user.age, user.phone);

const { name, age, phone } = user;

console.log(name, age, phone);

const marks = [20, 50, 60];

const [science, english, computer] = marks;

console.log(science, computer, english);

// Template literals
const details = "Hello my name is " + name + " and i am " + age + " years old";

console.log(details);

const tDetails = `Hello my name is ${name} and I am ${age} years old`;

console.log(tDetails)

// Spread operator (Object/Array) // Copy the data
// ...
const student = {
  name: "Hari",
  class: 10,
};

const result = {
  science: 90,
  math: 50,
  english: 80,
};

const finalResult = { ...student, ...result };
console.log(finalResult);

console.log("================================================================");

// Higher order array methods
const numbers = [90, 52, 5641, 62, 8, 352, 32, 856, 86, 561];

for (let i = 0; i < numbers.length; i++) {
  console.log(numbers[i] + 5);
}

console.log(
  "MAP ================================================================"
);

// 1. Map
// [x,x,x] => [y,y,y]
numbers.map((num) => console.log(num + 5));

// 2. Filter
// [x,y,x] => [x,x]
const filteredNumber = numbers.filter((num) => num > 100);
console.log(filteredNumber);

// 3. Sort - asc, desc
const sortedNumber = numbers.sort((a, b) => b - a);
console.log(sortedNumber);
