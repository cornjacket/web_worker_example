
self.addEventListener('message', function(e) {
  console.log("running worker2");
  self.postMessage("back to you");
      
}, false);