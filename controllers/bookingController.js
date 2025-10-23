import Ride from "../models/Ride.js";

export const bookRide = async (req, res) => {
  try {
    const { pickup, drop, when } = req.body;
    if (!pickup || !drop) {
      return res.status(400).json({ ok: false, message: "Pickup and drop are required" });
    }

    const baseFare = 30;
    const distance = Math.floor(Math.random() * 10) + 2;
    const perKmRate = 12;
    const fare = baseFare + distance * perKmRate;

    const ride = await Ride.create({ pickup, drop, when, fare });

    res.status(200).json({
      ok: true,
      message: `Ride booked successfully from ${pickup} to ${drop}`,
      fare,
      rideId: ride._id,
    });
  } catch (err) {
    console.error("Booking Error:", err);
    res.status(500).json({ ok: false, message: "Internal server error" });
  }
};
