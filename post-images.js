const fs = require("fs");
const fetch = require("node-fetch");
const FormData = require("form-data");
const jsonfile = require("jsonfile");
const resultsFile = "results/data.json";

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

// quick and dirty
const myArgs = process.argv.slice(2);
const botToken = myArgs[0];
const chatId = myArgs[1];

if (botToken === undefined || chatId === undefined) {
  console.log("missing telegram things");
  return;
}

(async function() {
  const results = await jsonfile.readFile(resultsFile);

  console.log({ results });

  // const images = fs.readdirSync("results");

  if (results.length > 0) {
    asyncForEach(results, async (result) => {
      const formData = new FormData();
      formData.append("chat_id", chatId);
      formData.append(
        "caption",
        `${result.name} sighting! Link: ${result.url}`
      );
      formData.append("disable_notification", "true");
      formData.append("photo", fs.createReadStream(`results/${result.image}`));

      try {
        await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
          method: "POST",
          body: formData,
        });
        console.log("sent: ", result);
      } catch (error) {
        console.log("cannot send", { error });
      }
    });
  } else {
    console.log("no images to send");
  }
})();
