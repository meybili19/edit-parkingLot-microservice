const express = require('express');
const app = express();
const parkingLotRoutes = require('./routes/parkingLotRoutes');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();

app.use(bodyParser.json());

app.use('/parkinglot', parkingLotRoutes);

const PORT = process.env.PORT || 6002;
app.listen(PORT, () => {
  console.log(`Parking lot update microservice running on port ${PORT}`);
});
