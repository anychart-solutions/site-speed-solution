var PAGE_NAMES = [
  '/support/ask_question',
  '/home',
  '/contacts',
  '/privacy_policy',
  '/home/products/Wine',
  '/home/products/Beer',
  '/home/products/Cider',
  '/home/products/Vodka',
  '/home/products/Tequila',
  '/home/products/Brandy',
  '/home/products/Rum',
  '/home/products'
];


/**
 * Returns random integer between min and max
 @param min {int} - min
 @param max {int} - max
 @return {int}
 */
function generateNumber(min, max) {
  return Math.floor(min + Math.random() * (max + 1 - min));
}


function genNumber(x, max, min) {
  var range = max - min;
  var millsInDay = generateNumber(1, 2) * 60 * 60 * 1000;
  x = x % (millsInDay) - 6 * 60 * 60 * 1000;
  x = x / millsInDay * 2 * Math.PI;
  var signalNormalized = (Math.cos(x) + 1) / 2;

  var noiseRange = range * 4 * (1 - Math.sin(x / 2) + 1) / 2;

  signalNormalized += Math.random() * 0.1 - 0.05;
  var signal = signalNormalized * range + min;

  var noise = Math.random() * noiseRange - noiseRange / 2;
  if (signal + noise <= 0) {
    noise = 0;
  }
  return signal + noise;
}


/**
 * Returns random page link from PAGE_NAMES
 @return {string} - page link
 */
var generatePageName = function () {
  return PAGE_NAMES[generateNumber(0, PAGE_NAMES.length - 1)];
};


/**
 * Generate new fake random data row
 @param datetime {number} - datetime to create fake data to. If null, will be set upped as now.
 @return {string} - random data row
 */
function generateData(datetime) {
  if (!datetime) datetime = (new Date).getTime();
  var result =
      datetime + ';' +                                  // time
      genNumber(datetime, 5, 10) + ';' +                // dns_ms
      genNumber(datetime, 1, 50) + ';' +                // connect_ms
      genNumber(datetime, 200, 800) + ';' +             // response_ms
      genNumber(datetime, 50, 20) + ';' +               // html_loading_ms
      genNumber(datetime, 200, 700) + ';' +             // html_processing_ms
      genNumber(datetime, 5, 100) + ';' +               // html_rendering_ms
      Math.round(generateNumber(1, 100)) + ';"[';       // viewers_count

  var first = true;
  for (var i = 0; i < generateNumber(1, 10); i++) {
    if (first)
      first = false;
    else
      result += ',';
    result += '{""name"":""' + generatePageName() + '"",""visits"":' + generateNumber(3, 20) + ',""speed"":' + generateNumber(500, 2700) + '}';
  }
  return result + ']";';
}

/**
 * Creates dataset of fake random data for 6 previous hours.
 @return {object} list of rows
 */
function generateStartData() {
  var date = new Date();
  date.setHours(new Date().getHours() - 6);
  var datetime = date.getTime();
  var result = [];
  for (var i = 0; i < 720; i++) {
    result.unshift(generateData(datetime));
    datetime = datetime + 30000;
  }
  return result;
}

