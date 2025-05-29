const express = require("express");
const router = express.Router();

const {
  getPlacePhoto,
  getNearbyRestaurants,
  getNearbyHotels,
  getTouristicPlaces,
  getPlacePhotoByRef,
} = require("../controllers/placesController"); 

router.get("/place-photo", getPlacePhoto);

router.get("/photo", getPlacePhotoByRef)

router.post("/touristic-places", getTouristicPlaces);

router.post("/nearby-hotels", getNearbyHotels);

router.post("/nearby-restaurants", getNearbyRestaurants);

module.exports = router;
