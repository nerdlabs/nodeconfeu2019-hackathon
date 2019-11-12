const express = require('express');
const handlebars = require('express-handlebars');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
const port = 12345;

let flightData = {};
let offset = 0;

app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');
app.use(express.static('static'));

fs.readdir('./data', (err, items) => {
  if (err) throw err;

  app.get('/', (request, response) => {
    response.render('index', {
      accessToken: fs.readFileSync('.cesium_access_token', 'UTF-8').trim(),
      dataSources: items,
    });
  });

  items.forEach((item) => {
    flightData[item] = [];
    fs.createReadStream(`./data/${item}`)
      .pipe(csv())
      .on('data', (row) => {
        if (row.isflying != "true") return;
        row.timestamp = new Date(row.timestamp).toISOString();
        flightData[item].push(row.timestamp, parseFloat(row.longitude), parseFloat(row.latitude), parseFloat(row.altitude)+1642);
      })
      .on('end', () => {
        app.get(`/data/${item}.json`, (request, response) => {
          response.setHeader('Content-Type', 'application/json');
          response.render('czml', {
            layout: false,
            flightData: JSON.stringify(flightData[item]),
            intervalStart: flightData[item][0],
            intervalEnd: flightData[item][flightData[item].length-4],
          });
        });
      });
  });
});

app.listen(port, () => {
  console.log(`listening on ${port}.`);
});
