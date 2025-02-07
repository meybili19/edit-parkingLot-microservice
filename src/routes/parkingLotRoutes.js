const express = require('express');
const router = express.Router();
const parkingLotController = require('../controllers/parkingLotController');

router.put('/update/:id', parkingLotController.updateParkingLot);

module.exports = router;
