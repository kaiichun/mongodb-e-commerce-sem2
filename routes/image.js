const express = require("express");
const router = express.Router();
const multer = require("multer");

// setup storage
const storage = multer.diskStorage({
  destination: function (request, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (request, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/", upload.single("image"), async (request, response) => {
  try {
    // send back the image url
    const image_url = request.file.path;
    response.status(200).send({ image_url: image_url });
  } catch (error) {
    response.status(400).send({ message: error._message });
  }
});

module.exports = router;
