const express = require('express');
const app = express();
app.enable('trust proxy');

const bodyParser = require('body-parser');
const routes = require('./routes');

app.use(bodyParser.json());
routes(app);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});