const db = require('../config/db');
const request = require('request-promise');
const dotenv = require('dotenv');

dotenv.config();

exports.updateParkingLot = async (req, res) => {
  const { id } = req.params;
  const { name, address, capacity } = req.body;

  if (!name || !address || !capacity) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    
    const parkingLotServiceURL = `${process.env.PARKING_SERVICE_URL}${id}`;

   
    const parkingLotResponse = await request({ uri: parkingLotServiceURL, json: true });

    if (!parkingLotResponse || !parkingLotResponse.id) {
      return res.status(404).json({ message: "Parking lot not found" });
    }

    
    await db.execute(
      'UPDATE ParkingLot SET name = ?, address = ?, capacity = ? WHERE id = ?',
      [name, address, capacity, id]
    );

    res.status(200).json({ message: 'Parking lot updated successfully' });
  } catch (error) {
    console.error('Error updating parking lot:', error);
    res.status(500).json({ message: 'Error updating parking lot' });
  }
};
