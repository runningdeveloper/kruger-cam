const tf = require("@tensorflow/tfjs-node");
const cocoSsd = require("@tensorflow-models/coco-ssd");
const fs = require("fs");
const fetch = require("node-fetch");
const sizeOf = require("image-size");
const jsonfile = require("jsonfile");
const resultsFile = "results/data.json";
let model = null;

const webcams = [
  {
    image: "https://celtis.sanparks.org/webcams/addo.jpg",
    url: "https://www.sanparks.org/webcams/cams.php?cam=addo",
    name: "Addo Elephant National Park",
  },
  {
    image: "https://celtis.sanparks.org/webcams/nossob.jpg",
    url: "https://www.sanparks.org/webcams/cams.php?cam=nossob",
    name: "Kgalagadi Transfrontier Park",
  },
  {
    image: "https://celtis.sanparks.org/webcams/orpen.jpg",
    url: "https://www.sanparks.org/webcams/cams.php?cam=orpen",
    name: "Kruger National Park - Orpen",
  },
  {
    image: "https://celtis.sanparks.org/webcams/satara.jpg",
    url: "https://www.sanparks.org/webcams/cams.php?cam=satara",
    name: "Kruger National Park - Satara",
  },
  {
    image: "https://celtis.sanparks.org/webcams/punda.jpg",
    url: "https://www.sanparks.org/webcams/cams.php?cam=punda",
    name: "Kruger National Park - Punda Maria",
  },
];
// from https://github.com/tensorflow/tfjs-models/blob/master/coco-ssd/src/classes.ts
const animals = [
  "cat",
  "dog",
  "horse",
  "sheep",
  "cow",
  "elephant",
  "zebra",
  "giraffe",
  "mouse",
];
const threshold = 0.7;

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

const doImagePrediction = async (image) => {
  const img = tf.node.decodeImage(image);
  const predictions = await model.detect(img);

  if (predictions && predictions.length > 0) {
    console.log("raw predictions", predictions);
    return predictions;
  }

  return null;
};

const filterAnimals = (predictions) =>
  predictions.filter((a) => animals.includes(a.class) && a.score > threshold);

const doPredictionOnWebcam = async (url) => {
  const response = await fetch(`${url}?${Date.now()}`);
  if (!response.ok) {
    console.log("Image download failed");
    return null;
  }

  const buffer = await response.buffer();
  if (sizeOf(buffer).height === 308 && sizeOf(buffer).width === 384) {
    console.log("Webcam error image", url);
    return null;
  }

  const prediction = await doImagePrediction(buffer);
  if (prediction) {
    const anyAnimals = filterAnimals(prediction);

    if (anyAnimals && anyAnimals.length > 0) {
      const imageName = `${Date.now()}.jpg`;
      console.log("got animals", { anyAnimals });
      fs.writeFileSync(`results/${imageName}`, buffer);
      return {
        image: imageName,
        prediction,
      };
    }
  }

  return null;
};

(async function() {
  console.log("Loading model");
  model = await cocoSsd.load();

  const results = [];

  // not putting much redundancy in

  try {
    await asyncForEach(webcams, async (a) => {
      const result = await doPredictionOnWebcam(a.image);
      if (result) {
        results.push({ ...result, url: a.url, name: a.name });
      }
    });
    if (results.length > 0) {
      await jsonfile.writeFile(resultsFile, results);
    }
  } catch (error) {
    console.log("failed!!", { error });
  }
})();
