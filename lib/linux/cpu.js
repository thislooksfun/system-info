"use strict";

const cp = require("child_process");
const fs = require("fs");
const CB = require("circular-buffer");

var processes = [];

const interval = 1; // The interval between captures, in seconds

let u = (function() {
  var skip = 1; // Skip the first two header messages
  var line = '';
  var history = new CB(10*60 / interval); // Store the last 10 minutes of data
  
  var user_index = -1;
  var system_index = -1;
  var idle_index = -1;
  function process_line(l) {
    let parts = l.trim().split(" ").filter((a) => a.length > 0);
    if (parts.length == 0) { return; }
    if (skip > 0) {
      skip--;
      return;
    }
    
    if (Number.isNaN(parseFloat(parts[2]))) {
      for (var i = 1; i < parts.length; i++) {
        switch (parts[i]) {
          case "%user":
            user_index = i;
            break;
          case "%system":
            system_index = i;
            break;
          case "%idle":
            idle_index = i;
            break;
        }
      }
      return;
    }
    
    history.push({user: parts[user_index]/100, system: parts[system_index]/100, idle: parts[idle_index]/100})
  }

  let sar_u = cp.spawn("sar", ["-u", interval]);
  processes.push(sar_u);
  sar_u.stdout.on('data', (data) => {
    line += `${data}`;
    while (line.indexOf("\n") != -1) {
      let [l, ...tmp] = line.split("\n");
      process_line(l);
      line = tmp.join("\n");
    }
  });

  return function() {
    return history.toarray();
  }
})();


let p = (function() {
  var skip = 1; // Skip the first two header messages
  var line = '';
  var cores = [];  // Stores the 'immediate' value (avg over last second) of each core

  var cpu_index = -1;
  var idle_index = -1;
  function process_line(l) {
    let parts = l.trim().split(" ").filter((a) => a.length > 0);
    if (parts.length == 0) { return; }
    if (skip > 0) {
      skip--;
      return;
    }

    if (Number.isNaN(parseFloat(parts[2]))) {
      for (var i = 1; i < parts.length; i++) {
        switch (parts[i]) {
          case "CPU":
            cpu_index = i;
            break;
          case "%idle":
            idle_index = i;
            break;
        }
      }
      return;
    }

    if (parts[cpu_index] === "all") { return; }
    cores[parseInt(parts[cpu_index])] = 1-parseFloat(parts[idle_index])/100;
  }

  let sar_p = cp.spawn("sar", ["-P", "ALL", interval]);
  processes.push(sar_p);
  sar_p.stdout.on('data', (data) => {
    line += `${data}`;
    while (line.indexOf("\n") != -1) {
      let [l, ...tmp] = line.split("\n");
      process_line(l);
      line = tmp.join("\n");
    }
  });

  return function() {
    return cores
  }
})();

module.exports = function() {
  return {history: u(), cores: p()}
}

module.exports.stop = function() {
  for (let proc of processes) {
    proc.kill();
  }
  processes = [];
}