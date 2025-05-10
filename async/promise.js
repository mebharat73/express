// resolve - success
// reject - failure

import fs from "fs/promises";

fs.readFile("data1.txt", "utf8")
  .then((data) => {
    console.log(data);
  })
  .catch((error) => {
    console.log(error);
  })
  .finally(() => {
    console.log("This is final code");
  });

fs.readFile("users.json", "utf8")
  .then((data) => {
    console.log(data);

    return fs.readFile("posts.json", "utf8");
  })
  .then((data) => {
    console.log(data);

    return fs.readFile("comments.json", "utf8");
  })
  .then((data) => {
    console.log(data);
  })
  .catch((error) => {
    console.log(error);
  });
