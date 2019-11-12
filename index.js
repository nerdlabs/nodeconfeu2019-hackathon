const express = require('express');
const app = express();
const port = 12345;

app.get('/', (request, response) => {
  response.write('ok cool');
  response.end();
});

app.listen(port, () => {
  console.log(`listening on ${port}.`);
});
