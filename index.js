const tf = require("@tensorflow/tfjs-node");
const cocoSsd = require("@tensorflow-models/coco-ssd");
const fs = require("fs");
const fetch = require('node-fetch');
const sizeOf = require('image-size');
let model = null;

const webcams = [
    'https://www.sanparks.org/webcams/addo.jpg',
    'https://www.sanparks.org/webcams/nossob.jpg',
    'https://www.sanparks.org/webcams/orpen.jpg',
    'https://www.sanparks.org/webcams/satara.jpg',
    'https://www.sanparks.org/webcams/punda.jpg'
]
// from https://github.com/tensorflow/tfjs-models/blob/master/coco-ssd/src/classes.ts
const animals = [ 'bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'zebra', 'giraffe', 'mouse']
const threshold = 0.65 

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

const doImagePrediction = async (image) => {
  const img = tf.node.decodeImage(image);
  const predictions = await model.detect(img);
    
  if (predictions && predictions.length > 0) {
    console.log('raw predictions amount', predictions.length);
    return predictions
  }

  return null
};

const filterAnimals = (predictions) => predictions.filter(a=>(animals.includes(a.class) && a.score>threshold));

const doPredictionOnWebcam = async (url) => {

    const response = await fetch(`${url}?${Date.now()}`);
    if(!response.ok){
        console.log('Image download failed')
        return
    }

    const buffer = await response.buffer();
    if(sizeOf(buffer).height===308 && sizeOf(buffer).width===384){
        console.log('Webcam error image', url)
        return
    }
    
    const prediction = await doImagePrediction(buffer)
    if(prediction){
        const anyAnimals = filterAnimals(prediction)

        if(anyAnimals && anyAnimals.length>0){
            console.log('got animals', {anyAnimals})
            fs.writeFileSync(`results/${Date.now()}.jpg`, buffer);
        }

    }

}

(async function() {

    console.log("Loading model");
    model = await cocoSsd.load();


    // not putting much redundancy in

    try {
        await asyncForEach(webcams, (a)=>doPredictionOnWebcam(a))
    } catch (error) {
        console.log("failed!!", {error});
    }
    

})();

