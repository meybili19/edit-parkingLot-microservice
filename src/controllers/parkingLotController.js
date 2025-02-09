const db = require('../config/db');
const request = require('request');
require('dotenv').config();

exports.updateParkingLot = async (req, res) => {
  const parkingLotId = req.params.id;
  const { name, address, total_space } = req.body;

  console.log(`🔄 [STEP 1] Received request to update parking lot with ID: ${parkingLotId}`);

  if (!name || !address || !total_space) {
    console.log(`⚠️ [ERROR] Missing fields in the request`);
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const parkingLotServiceURL = `${process.env.PARKING_SERVICE_URL}${parkingLotId}`;
    console.log(`🔎 [STEP 2] Querying the parking lot at: ${parkingLotServiceURL}`);

    request(parkingLotServiceURL, { json: true }, async (err, response, body) => {
      if (err) {
        console.error(`🚨 [ERROR] Failed to query the parking lot:`, err);
        return res.status(500).json({ message: 'Error fetching parking lot data', error: err.message });
      }

      if (!body || !body.id) {
        console.log(`❌ [STEP 3] Parking lot with ID ${parkingLotId} not found`);
        return res.status(404).json({ message: "Parking lot not found" });
      }

      let { total_space: old_total_space, capacity: old_capacity } = body;

      console.log(`📊 [STEP 4] Current data - total_space: ${old_total_space}, capacity: ${old_capacity}`);
      console.log(`📢 [STEP 5] New total_space: ${total_space}`);

      let new_capacity = old_capacity;
      let occupied_spaces = old_total_space - old_capacity; // Currently occupied spaces

      if (total_space > old_total_space) {
        // ✅ If total_space increases, add the difference to capacity
        const difference = total_space - old_total_space;
        new_capacity += difference;
        console.log(`🔄 [STEP 6] total_space increased by ${difference}, capacity is now ${new_capacity}`);
      } else if (total_space < old_total_space) {
        // ✅ If total_space decreases, we verify that it won't affect the parked cars
        if (total_space < occupied_spaces) {
          console.log(
            `🚨 [ERROR] Cannot reduce total_space to ${total_space} because there are ${occupied_spaces} parked cars`
          );
          return res.status(400).json({
            message: `Cannot reduce total_space to ${total_space}, as ${occupied_spaces} spaces are already occupied.`,
          });
        }

        const difference = old_total_space - total_space;
        new_capacity = Math.max(0, old_capacity - difference);
        console.log(`⚠️ [STEP 6] total_space reduced by ${difference}, capacity adjusted to ${new_capacity}`);
      }

      console.log(`🛠️ [STEP 7] Updating parking lot in the database...`);

      try {
        const [result] = await db.execute(
          'UPDATE ParkingLot SET name = ?, address = ?, total_space = ?, capacity = ? WHERE id = ?',
          [name, address, total_space, new_capacity, parkingLotId]
        );

        if (result.affectedRows === 0) {
          console.log(`❌ [STEP 8] Parking lot not found in the database`);
          return res.status(404).json({ message: 'Parking lot not found in database' });
        }

        console.log(`✅ [STEP 9] Parking lot updated successfully`);

        res.status(200).json({
          message: 'Parking lot updated successfully',
          updatedParkingLot: {
            id: parkingLotId,
            name,
            address,
            total_space,
            capacity: new_capacity
          }
        });
      } catch (dbError) {
        console.error(`🚨 [ERROR] Failed to update the database:`, dbError);
        res.status(500).json({ message: 'Error updating parking lot', error: dbError.message });
      }
    });
  } catch (error) {
    console.error(`🚨 [ERROR] Unexpected error during update:`, error);
    res.status(500).json({ message: 'Error updating parking lot', error: error.message });
  }
};
