const db = require('../config/db');
const request = require('request');
require('dotenv').config();

exports.updateParkingLot = async (req, res) => {
  const parkingLotId = req.params.id;
  const { name, address, capacity } = req.body;

  console.log("Received Parking Lot ID:", parkingLotId);

  if (!name || !address || !capacity) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const parkingLotServiceURL = `${process.env.PARKING_SERVICE_URL}${parkingLotId}`;
    console.log("Querying parking lot:", parkingLotServiceURL);

    request(parkingLotServiceURL, { json: true }, async (err, response, body) => {
      if (err) {
        console.error("Error querying the parking lot:", err);
        return res.status(500).json({ message: 'Error fetching parking lot data', error: err.message });
      }

      console.log("Parking lot service response:", body);

      if (!body || !body.id) {
        return res.status(404).json({ message: "Parking lot not found" });
      }

      console.log("Updating parking lot with ID:", parkingLotId);

      try {
        const [result] = await db.execute(
          'UPDATE ParkingLot SET name = ?, address = ?, capacity = ? WHERE id = ?',
          [name, address, capacity, parkingLotId]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Parking lot not found in database' });
        }

        res.status(200).json({ message: 'Parking lot updated successfully' });
      } catch (dbError) {
        console.error("Database error:", dbError);
        res.status(500).json({ message: 'Error updating parking lot', error: dbError.message });
      }
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ message: 'Error updating parking lot', error: error.message });
  }
};
