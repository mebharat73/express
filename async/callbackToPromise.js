import fs from "fs";

const cbToPromise = new Promise((resolve, reject) => {
  fs.readFile("data1.txt", "utf8", (error, data) => {
    if (error) return reject(error);

    resolve(data);
  });
});

cbToPromise
  .then((data) => console.log(data))
  .catch((error) => console.log(error));
