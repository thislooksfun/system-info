"use strict";

const {execSync}     = require("child_process");
const {readFileSync} = require("fs");

function splitTemp(c) {
  let f = (1.8 * c) + 32;
  return {c: c, f: f}
}

function gpuTemp() {
  let res = execSync("vcgencmd measure_temp | cut -c 6- | rev | cut -c 3- | rev", {"encoding": "utf-8"}).trim();
  return splitTemp(parseFloat(res));
}

function cpuTemp() {
  let res = readFileSync("/sys/class/thermal/thermal_zone0/temp", "utf-8");
  return splitTemp(parseFloat(res)/1000);
}

module.exports = function temp() {
  return {cpu: cpuTemp(), gpu: gpuTemp()}
}