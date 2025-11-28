import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Provider from "../models/Provider.js";

/**
 * @desc Create a hotel booking
 * @route POST /api/hotels/book
 */
export const bookHotel = async (req, res) => {
  try {
    const {
      hotelId,
      checkIn,
      checkOut,
      guests,
      guestName,
      guestEmail,
      guestPhone,
      providerId,
    } = req.body;

    // Validate required fields
    if (!hotelId || !checkIn || !checkOut || !guests || !guestName || !guestEmail) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: hotelId, checkIn, checkOut, guests, guestName, guestEmail",
      });
    }

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      return res.status(400).json({
        success: false,
        message: "Check-in date cannot be in the past",
      });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        success: false,
        message: "Check-out date must be after check-in date",
      });
    }

    // Calculate number of nights
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    // Fetch hotel details
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    // Check if hotel capacity is sufficient
    if (hotel.capacity < guests) {
      return res.status(400).json({
        success: false,
        message: `Hotel capacity is ${hotel.capacity} guests. You selected ${guests} guests.`,
      });
    }

    // Calculate total amount (price per night * number of nights)
    const totalAmount = hotel.price * nights;

    // Create booking
    const booking = await Booking.create({
      hotelId: hotel._id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: Number(guests),
      guestName,
      guestEmail,
      guestPhone: guestPhone || "",
      totalAmount,
      nights,
      providerId: providerId || hotel.provider,
      paymentStatus: "pending", // In real app, integrate payment gateway
      bookingStatus: "confirmed",
    });

    // Populate hotel and provider details
    await booking.populate("hotelId");
    if (booking.providerId) {
      await booking.populate("providerId");
    }

    res.status(201).json({
      success: true,
      message: "Hotel booked successfully!",
      booking: {
        _id: booking._id,
        hotel: {
          name: hotel.name,
          location: hotel.location,
        },
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guests: booking.guests,
        nights: booking.nights,
        totalAmount: booking.totalAmount,
        bookingStatus: booking.bookingStatus,
        bookingId: booking._id,
      },
    });
  } catch (error) {
    console.error("❌ Error booking hotel:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create booking",
    });
  }
};

/**
 * @desc Get booking by ID
 * @route GET /api/hotels/bookings/:id
 */
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id)
      .populate("hotelId")
      .populate("providerId");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("❌ Error fetching booking:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch booking",
    });
  }
};

/**
 * @desc Get all bookings (for admin/provider)
 * @route GET /api/hotels/bookings
 */
export const getAllBookings = async (req, res) => {
  try {
    const { providerId, hotelId } = req.query;
    const query = {};

    if (providerId) {
      query.providerId = providerId;
    }
    if (hotelId) {
      query.hotelId = hotelId;
    }

    const bookings = await Booking.find(query)
      .populate("hotelId")
      .populate("providerId")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("❌ Error fetching bookings:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch bookings",
    });
  }
};

/**
 * @desc Cancel a booking
 * @route PUT /api/hotels/bookings/:id/cancel
 */
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.bookingStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled",
      });
    }

    booking.bookingStatus = "cancelled";
    await booking.save();

    res.json({
      success: true,
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error("❌ Error cancelling booking:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to cancel booking",
    });
  }
};

