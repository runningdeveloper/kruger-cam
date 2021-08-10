// I want the latest image on a url I can call
const fs = require("fs");
const jsonfile = require("jsonfile");
const resultsFile = "results/data.json";

(async function () {
    try {
        const results = await jsonfile.readFile(resultsFile);

        if (results.length > 0) {
            // just going to use the first one
            const latest = results[0]
            fs.copyFileSync(`results/${latest.image}`, `results/latest.jpg`);

            // write the simplest html file

            const simpleSite = `<div><img style="width: 100%; height: 100%; object-fit: contain;" src="latest.jpg"/></div><div><a href="${latest.url}">${latest.name}</a></div>`

            fs.writeFileSync(`results/index.html`, simpleSite);

        } else {
            console.log("no images to make website");
        }
    } catch (error) {
        console.log("no results file", error);
        return;
    }
})();
