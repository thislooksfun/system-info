"use strict";

const {execSync} = require("child_process");

module.exports = function memUsage() {
    let res = execSync("free -m | awk '{ if (/^Mem/) { print ($2 - $7) \" \" $2 } }'", {"encoding": "utf-8"}).trim();
    let [a, t] = res.split(" ").map(Number);
    return {total: t, available: a, percentageUsed: a/t};
}