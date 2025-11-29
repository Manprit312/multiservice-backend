import Ride from "../models/Ride.js";
import Provider from "../models/Provider.js";

// Get all rides
export const getRides = async (req, res) => {
  try {
    const { providerId, vehicleType, pickup, drop } = req.query;
    let query = {};

    if (providerId) query.provider = providerId;
    if (vehicleType) query.vehicleType = vehicleType;
    if (pickup) query.pickup = { $regex: pickup, $options: "i" };
    if (drop) query.drop = { $regex: drop, $options: "i" };

    const rides = await Ride.find(query).populate("provider").sort({ createdAt: -1 });
    res.json({ success: true, rides });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get ride by ID
export const getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id).populate("provider");
    if (!ride) {
      return res.status(404).json({ success: false, message: "Ride not found" });
    }
    res.json({ success: true, ride });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const bookRide = async (req, res) => {
  try {
    const { pickup, drop, when, provider, vehicleType, driverId, fare, distance, paymentMethod } = req.body;
    if (!pickup || !drop) {
      return res.status(400).json({ ok: false, message: "Pickup and drop are required" });
    }

    // Use provided fare or calculate
    let calculatedFare = fare;
    if (!calculatedFare) {
      const baseFare = vehicleType === "bike" ? 20 : vehicleType === "auto" ? 30 : 50;
      const perKmRate = vehicleType === "bike" ? 5 : vehicleType === "auto" ? 8 : 12;
      const rideDistance = distance || Math.floor(Math.random() * 10) + 2;
      calculatedFare = baseFare + rideDistance * perKmRate;
    }

    const ride = await Ride.create({
      pickup,
      drop,
      when: when || new Date().toISOString(),
      fare: calculatedFare,
      distance: distance || null,
      vehicleType: vehicleType || null,
      driverId: driverId || null,
      paymentMethod: paymentMethod || "cash",
      status: "confirmed",
      provider,
    });

    // If provider is specified, add this ride to the provider's services
    if (provider) {
      await Provider.findByIdAndUpdate(
        provider,
        { $addToSet: { services: ride._id } },
        { new: true }
      );
    }

    res.status(200).json({
      ok: true,
      success: true,
      message: `Ride booked successfully from ${pickup} to ${drop}`,
      fare: calculatedFare,
      rideId: ride._id,
      ride: ride,
    });
  } catch (err) {
    console.error("Booking Error:", err);
    res.status(500).json({ ok: false, success: false, message: "Internal server error" });
  }
};
