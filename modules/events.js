import { EventEmitter } from "events";

// Create event emitter object
const eventEmitter = new EventEmitter();

// Register events
eventEmitter.on("hello", function () {
  console.log("Greetings from event.");
});
eventEmitter.on("bye", function () {
  console.log("Bye bye from event.");
});

//  Trigger/Emit events
eventEmitter.emit("hello");
