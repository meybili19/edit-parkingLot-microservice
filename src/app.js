const express = require('express');
const cors = require('cors');
const parkingRoutes = require('./routes/parkingLotRoutes');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// 🔹 Permitir cualquier origen
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(parkingRoutes);

const PORT = process.env.PORT || 7005;
app.listen(PORT, () => {
  console.log(`Parking lot update microservice running on port ${PORT}`);
});
