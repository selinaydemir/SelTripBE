const axios = require("axios");
const { haversineDistance } = require("../utils/functions");
const { v4: uuidv4 } = require("uuid");

// Getting place photo by place name
const getPlacePhoto = async (req, res) => {
  const { placeName } = req.query;
  if (!placeName) {
    return res.status(400).json({ error: "Yer ismi gerekli." });
  }
  try {
    const mapsUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      placeName
    )}&key=${process.env.MAPS_API_KEY}`;

    const mapsResponse = await axios.get(mapsUrl);
    const results = mapsResponse.data.results;

    if (!results.length || !results[0].photos?.length) {
      return res.status(404).json({ error: "Fotoğraf referansı bulunamadı." });
    }

    const photoReference = results[0].photos[0].photo_reference;
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1280&photo_reference=${photoReference}&key=${process.env.MAPS_API_KEY}`;

    const imageResponse = await axios.get(photoUrl, {
      responseType: "arraybuffer",
    });
    const base64Image = Buffer.from(imageResponse.data, "binary").toString(
      "base64"
    );

    const formData = new URLSearchParams();
    formData.append("image", base64Image);

    const uploadResponse = await axios.post(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_KEY}`,
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return res.status(200).json({
      message: "Yükleme başarılı",
      imageUrl: uploadResponse.data.data.url,
    });
  } catch (error) {
    console.error(
      "GET_AND_UPLOAD_ERROR:",
      error?.response?.data || error.message
    );
    return res.status(500).json({ error: "Fotoğraf yüklenemedi." });
  }
};

// Getting place photo by reference
const getPlacePhotoByRef = async (req, res) => {
  const ref = req.query.ref;
  const key = process.env.MAPS_API_KEY;
  if (!ref) {
    return res.status(400).json({ error: "Photo reference is required!" });
  }
  const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${ref}&key=${key}`;
  try {
    const response = await axios.get(url, {
      responseType: "stream",
    });
    res.setHeader("Content-Type", response.headers["content-type"]);
    response.data.pipe(res);
  } catch (error) {
    console.error("Photo fetch error:", error.message);
    res.status(500).json({ error: "Failed to fetch photo" });
  }
};

// Ortak yer verisi işleme fonksiyonu
const processPlaces = (places, lat, lng) => {
  return places
    .map((place) => {
      const placeLocation = place.geometry?.location;
      place.distance = placeLocation
        ? haversineDistance(
            { lat, lng },
            { lat: placeLocation.lat, lng: placeLocation.lng }
          )
        : Infinity;
      return place;
    })
    .sort((a, b) => a.distance - b.distance)
    .map((place) => ({
      id: uuidv4(),
      name: place.name,
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      photoReference: place.photos?.[0]?.photo_reference || null,
      rating: place.rating,
      distance: place.distance,
    }));
};

// Restoranlar, kafeler, pastaneler, yemek teslim noktaları (otel hariç)
const getNearbyRestaurants= async (req, res) => {
  const { lat, lng, radius = 20000 } = req.body;
  if (!lat || !lng) {
    return res
      .status(400)
      .json({ error: "lat ve lng parametreleri gereklidir" });
  }

  const types = [
    "restaurant",
    "cafe",
    "bakery",
    "meal_takeaway",
    "meal_delivery",
  ];
  const allResults = [];

  for (const type of types) {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${process.env.MAPS_API_KEY}`;
    try {
      const response = await axios.get(url);
      allResults.push(...response.data.results);
    } catch (err) {
      console.error(`Fetch error for type '${type}':`, err.message);
    }
  }

  // Tekilleştir ve otelleri filtrele
  const uniquePlacesMap = new Map();
  allResults.forEach((place) => {
    if (!uniquePlacesMap.has(place.place_id)) {
      uniquePlacesMap.set(place.place_id, place);
    }
  });

  const filtered = Array.from(uniquePlacesMap.values()).filter(
    (place) => !(place.types || []).includes("lodging")
  );

  const result = processPlaces(filtered, lat, lng);
  res.json(result);
};

// Turistik yerler
const getTouristicPlaces = async (req, res) => {
  const { lat, lng, radius = 20000 } = req.body;
  if (!lat || !lng) {
    return res
      .status(400)
      .json({ error: "lat ve lng parametreleri gereklidir" });
  }

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=tourist_attraction&key=${process.env.MAPS_API_KEY}`;
  try {
    const response = await axios.get(url);
    const result = processPlaces(response.data.results || [], lat, lng);
    res.json(result);
  } catch (err) {
    console.error("Touristic fetch error:", err.message);
    res.status(500).json({ error: "Veri alınamadı" });
  }
};

// Oteller
const getNearbyHotels = async (req, res) => {
  const { lat, lng, radius = 20000 } = req.body;
  if (!lat || !lng) {
    return res
      .status(400)
      .json({ error: "lat ve lng parametreleri gereklidir" });
  }

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=lodging&key=${process.env.MAPS_API_KEY}`;
  try {
    const response = await axios.get(url);
    const result = processPlaces(response.data.results || [], lat, lng);
    res.json(result);
  } catch (err) {
    console.error("Hotel fetch error:", err.message);
    res.status(500).json({ error: "Veri alınamadı" });
  }
};



module.exports = {
  getPlacePhoto,
  getPlacePhotoByRef,
  getNearbyRestaurants,
  getNearbyHotels,
  getTouristicPlaces,
};
