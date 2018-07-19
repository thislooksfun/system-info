"use strict";

const cpu = require("./cpu");
const mem = require("./mem");
const temperature = require("./temperature");

module.exports = {
  cpuData:     cpu,
  memoryUsage: mem,
  temperature: temperature,
  
  stop: cpu.stop,
}