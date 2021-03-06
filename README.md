# kruger-cam

So I thought I could do some game watching without the effort. The South African National Parks service (SANParks) has a few webcams at the watering holes. Link is [www.sanparks.org/webcams/](https://www.sanparks.org/webcams/). They don't really have live video feed (seems to be offline) but have still cameras which put out a jpg image every few seconds. So I basically wired up the coco tensorflow example object detection to look at these still cameras. Then if animals are seen it sends me an image.

See some results [here](best/some-results.md)

This idea started when we were in lockdown as SANParks were promoting the cameras on social media while you couldn't travel.

I initially ran a version on my raspberry pi but then wondered if I could do it somewhere in the cloud for free. Hence using Github actions, they even have a scheduled run where you can do an action every minutes. So this is what it's doing and if it sees an animal it sends me a telegram message with the image.

I only run it every 10 minutes so I'm sure many sightings are missed. My thinking is I don't want to abuse the free Github actions and don't want too many images per day.

This is not very efficient as I cannot keep the model in memory and ready to go. So each time the action runs it installs node, then npm modules and then loads the model into memory before doing a detection. I'm sure there is a better way to do this, like an already built detection binary that runs efficiently. Let me know.

The SANParks website has a place for humans to submit sightings of animals. Which is quite good, so possibly a better way would be to watch this feed and send the human sightings of animals to me. But I'm not doing that.

I think there are a couple things todo in the future:
- Publish images to twitter perhaps for public consumption or make the telegram chat a group so people can join
- Do a custom model for detecting more animals
- Make more efficient
- Gain insights/statistics from the sightings

Not sure if this is a good idea. Let me know.

## Alternative

There is a really cool project [africam](https://www.africam.com/) where there are high quality HD cameras with sound in places across Africa. They have a community of people that control the cameras and pickup amazing animal sightings. It is way better than the SANParks still cams!

## What is being detected

From the coco-ssd model lib here: [classes](https://github.com/tensorflow/tfjs-models/blob/master/coco-ssd/src/classes.ts)

So I'm doing the following that seem to give me some decent results:
'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'zebra', 'giraffe', 'mouse'

Removed 'bird' because there are too many!

## Running locally for fun 

clone the project

``` npm i```

```while true; do node index.js; sleep 180; done```

The images will go into a folder called results.

## Disclaimer

I have nothing to do with SANParks or their website. Let me know if I'm doing anything wrong.