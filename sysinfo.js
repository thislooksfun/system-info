"use strict";

var valid = true;

function wrap(fn) {
  if (!valid) {
    throw new Error("Attempting to get sysinfo after invalidation.");
  }
  return fn();
}


// TODO: Detect system
let pkg = require("./lib/linux");


module.exports = {
  memoryUsage: wrap.bind(null, pkg.memoryUsage),
  temperature: wrap.bind(null, pkg.temperature),
  cpuData:     wrap.bind(null, pkg.cpuData),
  
  stop: function() {
    pkg.stop();
    valid = false;
  },
}