// Asynchronous - Do not wait
// Synchronous - Wait

import fs from "fs";

/*
// Synchronous methods
// 1. Read
const result = fs.readFileSync("data.txt", "utf8");
console.log(result);

const image = fs.readFileSync("user.jpg", "base64");
console.log(image);

// 2. Write
fs.writeFileSync("data.txt", "This file is newly written.");

// 3. Update
fs.appendFileSync("data.txt", "\nThis text is updated without removing existing value.")

// 4. Delete
// unlink - removes only file
// rm - files and folder remove
fs.rmSync("data.txt");
*/

// 2. Asynchronous method
// Read
fs.readFile("data.txt", "utf8", function (error, data) {
  if (error) console.log(error);

  console.log(data);
});

console.log("hello world");

// Write
fs.writeFile("data.txt", "this data is written asynchronously", () => {
  console.log("Data is written");
});

// update
// fs.appendFile();

// Delete
// fs.rm();
