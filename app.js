const express = require("express");
require("dotenv").config();

const placeRoutes = require('./routes/places');

const app = express();
const port = 3000;

app.use(express.json());
app.use("/api/place", placeRoutes);

app.listen(port, () => {
  console.log(`Sunucu http://localhost:${port} adresinde çalışıyor.`);
});
