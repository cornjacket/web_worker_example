// Note that these examples do not terminate the worker

"use strict"

console.log("app is up")

///////////////////
// first implementation

var worker1 = new Worker('respond.js');

// Setup an event listener that will handle messages received from the worker.
worker1.addEventListener('message', function(e) {
  // Log the workers message.
  console.log(e.data);
}, false);

worker1.postMessage('Hello World');

//////////////////
// second implementation, which checks for availability of Web Worker API and uses onmessage method


if (window.Worker) {
    var worker2 = new Worker("respond2.js");
    //Responding to the message sent back from the worker
    worker2.onmessage = function(e) {
      console.log('Message received from worker '+ e.data);
    };

    worker2.postMessage('Hello World 2');

  }