const express = require("express");
require("dotenv").config();

const placeRoutes = require('./routes/places');
const userRoutes = require('./routes/user')

const app = express();
const port = 3000;

app.use(express.json());
app.use("/api/place", placeRoutes);
app.use("/api/user", userRoutes);

app.listen(port, () => {
  console.log(`Sunucu http://localhost:${port} adresinde çalışıyor.`);
});
