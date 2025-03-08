const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
admin.initializeApp();

const imgbbApiKey = functions.config().imgbb.apikey;
const googleVisionApiKey = functions.config().google_vision.apikey;
const adminPassword = functions.config().admin.password;

exports.uploadImage = functions.https.onRequest(async (req, res) => {
  try {
    if (req.method !== "POST") {
      throw new Error("Invalid request method. Only POST is allowed.");
    }

    const image = req.body;

    const formData = new URLSearchParams();
    formData.append("image", image.image);
    formData.append("key", imgbbApiKey);

    const response = await axios.post("https://api.imgbb.com/1/upload", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (response.data.success) {
      res.json({ imageUrl: response.data.data.url });
    } else {
      throw new Error("ImgBB upload failed");
    }
  } catch (error) {
    console.error("Error in uploadImage:", error);
    res.status(500).json({ error: error.message });
  }
});

exports.submitListing = functions.https.onRequest(async (req, res) => {
  try {
    if (req.method !== "POST") {
      throw new Error("Invalid request method. Only POST is allowed.");
    }

    const listingData = req.body;

    await admin.firestore().collection("listings").add(listingData);

    res.json({ message: "Listing submitted successfully" });
  } catch (error) {
    console.error("Error in submitListing:", error);
    res.status(500).json({ error: error.message });
  }
});

exports.validateAdmin = functions.https.onRequest(async (req, res) => {
  try {
    const password = req.body.password;

    if (password === adminPassword) {
      res.json({ valid: true });
    } else {
      res.json({ valid: false });
    }
  } catch (error) {
    console.error("Error in validateAdmin:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});