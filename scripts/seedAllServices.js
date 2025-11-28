import mongoose from "mongoose";
import dotenv from "dotenv";
import Provider from "../models/Provider.js";
import Cleaning from "../models/cleaningModel.js";
import Hotel from "../models/Hotel.js";
import Ride from "../models/Ride.js";
import connectDB from "../config/db.js";
import cloudinary from "../config/cloudinary.js";

dotenv.config();

// Helper function to upload image from URL to Cloudinary
async function uploadImageToCloudinary(imageUrl, folder) {
  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        imageUrl,
        {
          folder: folder,
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
    return result.secure_url;
  } catch (error) {
    console.error(`❌ Error uploading image ${imageUrl} to Cloudinary:`, error.message);
    // Return original URL as fallback
    return imageUrl;
  }
}

async function seedAllServices() {
  try {
    await connectDB();
    console.log("✅ Connected to database");

    // Get all active providers
    const providers = await Provider.find({ isActive: true });
    if (providers.length === 0) {
      console.log("❌ No providers found. Please run seed:providers first.");
      process.exit(1);
    }

    console.log(`📋 Found ${providers.length} providers`);

    // Mock Cleaning Services (including Car Wash)
    const cleaningServices = [
      { name: "Home Deep Cleaning", description: "Complete deep cleaning for your home", price: 1999, category: "Deep Cleaning", duration: "4 hours", suppliesIncluded: true },
      { name: "Office Cleaning", description: "Professional office cleaning service", price: 2999, category: "Office", duration: "6 hours", suppliesIncluded: true },
      { name: "Kitchen Cleaning", description: "Thorough kitchen cleaning and sanitization", price: 999, category: "Home", duration: "2 hours", suppliesIncluded: true },
      { name: "Bathroom Cleaning", description: "Complete bathroom deep clean", price: 799, category: "Home", duration: "2 hours", suppliesIncluded: true },
      { name: "Carpet Cleaning", description: "Professional carpet and rug cleaning", price: 1499, category: "Home", duration: "3 hours", suppliesIncluded: true },
      { name: "Laundry Service", description: "Wash, dry, and fold laundry service", price: 499, category: "Laundry", duration: "1 day", suppliesIncluded: false },
      { name: "Car Wash - Basic", description: "Exterior car wash and vacuum", price: 299, category: "Car Wash", duration: "30 mins", suppliesIncluded: true },
      { name: "Car Wash - Premium", description: "Complete car wash with wax and polish", price: 799, category: "Car Wash", duration: "1 hour", suppliesIncluded: true },
      { name: "Car Wash - Deep Clean", description: "Interior and exterior deep cleaning", price: 1299, category: "Car Wash", duration: "2 hours", suppliesIncluded: true },
    ];

    // Mock Hotel Services - Comprehensive list with MakeMyTrip-like variety
    const hotelServices = [
      // Luxury Hotels
      { name: "Grand Hotel Mumbai", location: "Mumbai, Maharashtra", price: 8500, capacity: 2, outsideFoodAllowed: true, description: "Luxury hotel in the heart of Mumbai with stunning city views", amenities: ["WiFi", "AC", "Room Service", "Parking", "Spa", "Gym", "Pool", "Restaurant"], rating: 4.8 },
      { name: "Taj Palace Delhi", location: "New Delhi", price: 12000, capacity: 2, outsideFoodAllowed: false, description: "5-star luxury hotel with world-class amenities", amenities: ["WiFi", "AC", "Breakfast", "Spa", "Gym", "Pool", "Restaurant", "Bar"], rating: 4.9 },
      { name: "ITC Gardenia Bangalore", location: "Bangalore, Karnataka", price: 9500, capacity: 4, outsideFoodAllowed: true, description: "Luxury business hotel with modern facilities", amenities: ["WiFi", "AC", "Gym", "Conference Room", "Pool", "Spa", "Restaurant"], rating: 4.7 },
      
      // Mid-Range Hotels
      { name: "Delhi Comfort Inn", location: "New Delhi", price: 3500, capacity: 2, outsideFoodAllowed: false, description: "Comfortable stay in the heart of Delhi", amenities: ["WiFi", "AC", "Breakfast", "Parking"], rating: 4.2 },
      { name: "Pune City View", location: "Pune, Maharashtra", price: 2800, capacity: 2, outsideFoodAllowed: true, description: "Affordable hotel with beautiful city views", amenities: ["WiFi", "AC", "Parking"], rating: 4.0 },
      { name: "Hyderabad Heritage", location: "Hyderabad, Telangana", price: 4200, capacity: 3, outsideFoodAllowed: true, description: "Heritage hotel experience with modern amenities", amenities: ["WiFi", "AC", "Restaurant", "Parking", "Room Service"], rating: 4.3 },
      { name: "Chennai Express Hotel", location: "Chennai, Tamil Nadu", price: 3200, capacity: 2, outsideFoodAllowed: true, description: "Convenient location near railway station", amenities: ["WiFi", "AC", "Parking", "Restaurant"], rating: 4.1 },
      { name: "Kolkata Grand", location: "Kolkata, West Bengal", price: 3800, capacity: 2, outsideFoodAllowed: false, description: "Comfortable stay in the cultural capital", amenities: ["WiFi", "AC", "Breakfast", "Parking"], rating: 4.2 },
      
      // Budget Hotels
      { name: "Goa Beach Stay", location: "Goa", price: 2200, capacity: 2, outsideFoodAllowed: true, description: "Budget-friendly hotel near the beach", amenities: ["WiFi", "AC", "Parking"], rating: 3.8 },
      { name: "Jaipur Heritage Inn", location: "Jaipur, Rajasthan", price: 2500, capacity: 2, outsideFoodAllowed: true, description: "Traditional Rajasthani hospitality", amenities: ["WiFi", "AC", "Parking"], rating: 3.9 },
      { name: "Ahmedabad Business Hub", location: "Ahmedabad, Gujarat", price: 2400, capacity: 2, outsideFoodAllowed: true, description: "Perfect for business travelers", amenities: ["WiFi", "AC", "Parking", "Restaurant"], rating: 4.0 },
      { name: "Indore City Center", location: "Indore, Madhya Pradesh", price: 2000, capacity: 2, outsideFoodAllowed: true, description: "Affordable stay in city center", amenities: ["WiFi", "AC"], rating: 3.7 },
      
      // Family Hotels
      { name: "Mumbai Family Resort", location: "Mumbai, Maharashtra", price: 5500, capacity: 4, outsideFoodAllowed: true, description: "Spacious rooms perfect for families", amenities: ["WiFi", "AC", "Pool", "Restaurant", "Parking", "Kids Play Area"], rating: 4.5 },
      { name: "Delhi Family Suites", location: "New Delhi", price: 4800, capacity: 4, outsideFoodAllowed: false, description: "Family-friendly hotel with connecting rooms", amenities: ["WiFi", "AC", "Breakfast", "Parking", "Restaurant"], rating: 4.4 },
      
      // Boutique Hotels
      { name: "Udaipur Lake Palace View", location: "Udaipur, Rajasthan", price: 6500, capacity: 2, outsideFoodAllowed: true, description: "Boutique hotel with lake views", amenities: ["WiFi", "AC", "Restaurant", "Spa", "Parking"], rating: 4.6 },
      { name: "Shimla Mountain View", location: "Shimla, Himachal Pradesh", price: 4500, capacity: 2, outsideFoodAllowed: true, description: "Cozy hotel with mountain views", amenities: ["WiFi", "Heating", "Restaurant", "Parking"], rating: 4.3 },
    ];

    // Mock Ride Services
    const rideServices = [
      { pickup: "Airport", drop: "City Center", when: "2024-01-15T10:00:00", fare: 450 },
      { pickup: "Railway Station", drop: "Hotel", when: "2024-01-15T14:00:00", fare: 250 },
      { pickup: "City Center", drop: "Mall", when: "2024-01-15T16:00:00", fare: 150 },
      { pickup: "Hotel", drop: "Airport", when: "2024-01-16T08:00:00", fare: 500 },
      { pickup: "Office", drop: "Home", when: "2024-01-15T18:00:00", fare: 200 },
    ];

    // Distribute services across providers
    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i];
      console.log(`\n📦 Seeding services for ${provider.name}...`);

      // Add Cleaning Services (including Car Wash)
      for (let j = 0; j < 4; j++) {
        const serviceIndex = (i * 4 + j) % cleaningServices.length;
        const serviceData = cleaningServices[serviceIndex];
        const existing = await Cleaning.findOne({ name: serviceData.name, provider: provider._id });
        if (!existing) {
          // Use different images for car wash
          const imageUrl = serviceData.category === "Car Wash" 
            ? `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop`
            : `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop`;
          
          // Upload to Cloudinary
          console.log(`  📤 Uploading image for ${serviceData.name}...`);
          const cloudinaryUrl = await uploadImageToCloudinary(imageUrl, "multiserv_cleaning");
          
          const cleaning = await Cleaning.create({
            ...serviceData,
            provider: provider._id,
            images: [cloudinaryUrl],
          });
          await Provider.findByIdAndUpdate(provider._id, {
            $addToSet: { services: cleaning._id },
          });
          console.log(`  ✅ Created ${serviceData.category === "Car Wash" ? "car wash" : "cleaning"}: ${cleaning.name}`);
        }
      }

      // Add Hotel Services - More hotels per provider
      for (let j = 0; j < 4; j++) {
        const hotelIndex = (i * 4 + j) % hotelServices.length;
        const hotelData = hotelServices[hotelIndex];
        const existing = await Hotel.findOne({ name: hotelData.name, provider: provider._id });
        if (!existing) {
          // Use different hotel images based on type
          const imageUrls = [
            `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop`,
            `https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&h=800&fit=crop`,
            `https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&h=800&fit=crop`,
          ];
          
          // Upload all images to Cloudinary
          console.log(`  📤 Uploading images for ${hotelData.name}...`);
          const cloudinaryUrls = await Promise.all(
            imageUrls.map(url => uploadImageToCloudinary(url, "multiserv_hotels"))
          );
          
          const hotel = await Hotel.create({
            ...hotelData,
            provider: provider._id,
            images: cloudinaryUrls,
            rating: hotelData.rating || 4.0,
          });
          await Provider.findByIdAndUpdate(provider._id, {
            $addToSet: { services: hotel._id },
          });
          console.log(`  ✅ Created hotel: ${hotel.name} (₹${hotel.price}/night)`);
        }
      }

      // Add Ride Services
      for (let j = 0; j < 2; j++) {
        const rideIndex = (i * 2 + j) % rideServices.length;
        const rideData = rideServices[rideIndex];
        const existing = await Ride.findOne({ 
          pickup: rideData.pickup, 
          drop: rideData.drop, 
          provider: provider._id 
        });
        if (!existing) {
          const ride = await Ride.create({
            ...rideData,
            provider: provider._id,
          });
          await Provider.findByIdAndUpdate(provider._id, {
            $addToSet: { services: ride._id },
          });
          console.log(`  ✅ Created ride: ${rideData.pickup} to ${rideData.drop}`);
        }
      }
    }

    console.log("\n🎉 All services seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding services:", error);
    process.exit(1);
  }
}

seedAllServices();

