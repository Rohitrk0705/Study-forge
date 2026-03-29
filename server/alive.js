const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Alive");
});

app.listen(7000);

console.log("Started");
setInterval(() => {}, 1000);