// Callback

// 1. Function used as a parameter
// Higher order function

// 2. Async task completion -> function call

import fs from "fs";

fs.readFile("data.txt", "utf8", (error, data) => {
  if (error) return console.log(error);

  console.log(data);
});

// callback hell
/**
 * 1. get users
 * 2. get posts of that users
 * 3. get comments of that posts
 */

fs.readFile("users.json", "utf8", (error, data) => {
  if (error) return console.log(error);

  console.log(data);

  fs.readFile("posts.json", "utf-8", (perror, pdata) => {
    if (perror) return console.log(perror);

    console.log(pdata);

    fs.readFile("comments.json", "utf-8", (cerror, cdata) => {
      if (cerror) return console.log(cerror);

      console.log(cdata);
    });
  });
});
