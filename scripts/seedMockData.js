import mongoose from "mongoose";
import dotenv from "dotenv";
import Provider from "../models/Provider.js";
import Cleaning from "../models/cleaningModel.js";
import Hotel from "../models/Hotel.js";
import Ride from "../models/Ride.js";
import connectDB from "../config/db.js";
import cloudinary from "../config/cloudinary.js";

dotenv.config();

// Helper function to upload image from URL to Cloudinary with Ausweb folder
async function uploadImageToCloudinary(imageUrl, folder) {
  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        imageUrl,
        {
          folder: `Ausweb/${folder}`,
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
    // Return a placeholder URL as fallback
    return `https://via.placeholder.com/800x600?text=${encodeURIComponent(folder)}`;
  }
}

async function seedMockData() {
  try {
    await connectDB();
    console.log("✅ Connected to database");

    // Create a default provider if none exists
    let provider = await Provider.findOne({ isActive: true });
    if (!provider) {
      console.log("📦 Creating default provider...");
      const logoUrl = await uploadImageToCloudinary(
        "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400&h=400&fit=crop",
        "providers"
      );
      
      provider = await Provider.create({
        name: "Ausweb Services",
        description: "Your trusted partner for all service needs",
        email: "info@ausweb.com",
        phone: "+91 9876543210",
        city: "Mumbai",
        state: "Maharashtra",
        rating: 4.8,
        logo: logoUrl,
        isActive: true,
        specialties: ["Home Cleaning", "Hotel Bookings", "Cab Services"],
      });
      console.log(`✅ Created provider: ${provider.name}`);
    } else {
      console.log(`📋 Using existing provider: ${provider.name}`);
    }

    // Clear existing services for this provider
    await Cleaning.deleteMany({ provider: provider._id });
    await Hotel.deleteMany({ provider: provider._id });
    await Ride.deleteMany({ provider: provider._id });
    console.log("🧹 Cleared existing services");

    // Mock Cleaning Services
    const cleaningServices = [
      {
        name: "Deep Home Cleaning",
        description: "Comprehensive deep cleaning service for your entire home. Includes all rooms, bathrooms, kitchen, and living areas. Professional equipment and eco-friendly products used.",
        price: 2499,
        category: "Deep Cleaning",
        duration: "4-5 hours",
        suppliesIncluded: true,
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
      },
      {
        name: "Office Cleaning Service",
        description: "Professional office cleaning to keep your workspace spotless. Includes desks, floors, restrooms, and common areas. Available for daily, weekly, or monthly contracts.",
        price: 3999,
        category: "Office",
        duration: "6-8 hours",
        suppliesIncluded: true,
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
      },
      {
        name: "Kitchen Deep Clean",
        description: "Thorough kitchen cleaning including appliances, cabinets, countertops, and floors. Removes grease, stains, and ensures hygiene standards.",
        price: 1299,
        category: "Home",
        duration: "2-3 hours",
        suppliesIncluded: true,
        image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&h=600&fit=crop",
      },
      {
        name: "Bathroom Sanitization",
        description: "Complete bathroom cleaning and sanitization. Includes tiles, fixtures, mirrors, and all surfaces. Uses hospital-grade disinfectants.",
        price: 899,
        category: "Home",
        duration: "1.5-2 hours",
        suppliesIncluded: true,
        image: "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&h=600&fit=crop",
      },
      {
        name: "Carpet & Rug Cleaning",
        description: "Professional steam cleaning for carpets and rugs. Removes deep-seated dirt, stains, and allergens. Suitable for all carpet types.",
        price: 1799,
        category: "Home",
        duration: "3-4 hours",
        suppliesIncluded: true,
        image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop",
      },
      {
        name: "Laundry & Dry Cleaning",
        description: "Premium laundry service with pickup and delivery. Includes washing, drying, ironing, and folding. Special care for delicate items.",
        price: 599,
        category: "Laundry",
        duration: "24-48 hours",
        suppliesIncluded: false,
        image: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800&h=600&fit=crop",
      },
      {
        name: "Premium Car Wash",
        description: "Complete car detailing service. Includes exterior wash, wax, interior vacuuming, dashboard polish, and tire shine.",
        price: 999,
        category: "Car Wash",
        duration: "1-1.5 hours",
        suppliesIncluded: true,
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
      },
      {
        name: "Window Cleaning",
        description: "Crystal clear window cleaning for homes and offices. Includes inside and outside windows, frames, and sills. Streak-free finish guaranteed.",
        price: 699,
        category: "Home",
        duration: "2 hours",
        suppliesIncluded: true,
        image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop",
      },
    ];

    // Mock Hotel Services
    const hotelServices = [
      {
        name: "Grand Luxury Hotel Mumbai",
        location: "Mumbai, Maharashtra",
        price: 8500,
        capacity: 2,
        outsideFoodAllowed: true,
        description: "5-star luxury hotel in the heart of Mumbai with stunning city views. Features world-class amenities, fine dining restaurants, and a rooftop pool.",
        amenities: ["WiFi", "AC", "Room Service", "Parking", "Spa", "Gym", "Pool", "Restaurant", "Bar", "Concierge"],
        rating: 4.8,
        images: [
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop",
          "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&h=800&fit=crop",
          "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&h=800&fit=crop",
        ],
      },
      {
        name: "Taj Palace Delhi",
        location: "New Delhi",
        price: 12000,
        capacity: 2,
        outsideFoodAllowed: false,
        description: "Iconic 5-star hotel offering unparalleled luxury and hospitality. Located in the diplomatic enclave with easy access to major attractions.",
        amenities: ["WiFi", "AC", "Breakfast", "Spa", "Gym", "Pool", "Restaurant", "Bar", "Business Center", "Valet Parking"],
        rating: 4.9,
        images: [
          "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200&h=800&fit=crop",
          "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&h=800&fit=crop",
        ],
      },
      {
        name: "ITC Gardenia Bangalore",
        location: "Bangalore, Karnataka",
        price: 9500,
        capacity: 4,
        outsideFoodAllowed: true,
        description: "Luxury business hotel with modern facilities and eco-friendly practices. Perfect for both business and leisure travelers.",
        amenities: ["WiFi", "AC", "Gym", "Conference Room", "Pool", "Spa", "Restaurant", "Parking", "Airport Shuttle"],
        rating: 4.7,
        images: [
          "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&h=800&fit=crop",
          "https://images.unsplash.com/photo-1571003123894-1c0594d2bbf9?w=1200&h=800&fit=crop",
        ],
      },
      {
        name: "Delhi Comfort Inn",
        location: "New Delhi",
        price: 3500,
        capacity: 2,
        outsideFoodAllowed: false,
        description: "Comfortable and affordable stay in the heart of Delhi. Clean rooms, friendly staff, and great value for money.",
        amenities: ["WiFi", "AC", "Breakfast", "Parking", "Room Service"],
        rating: 4.2,
        images: [
          "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&h=800&fit=crop",
        ],
      },
      {
        name: "Pune City View Hotel",
        location: "Pune, Maharashtra",
        price: 2800,
        capacity: 2,
        outsideFoodAllowed: true,
        description: "Modern hotel with beautiful city views. Located in the business district with easy access to shopping and dining.",
        amenities: ["WiFi", "AC", "Parking", "Restaurant"],
        rating: 4.0,
        images: [
          "https://images.unsplash.com/photo-1596436889106-be35e843f974?w=1200&h=800&fit=crop",
        ],
      },
      {
        name: "Hyderabad Heritage Hotel",
        location: "Hyderabad, Telangana",
        price: 4200,
        capacity: 3,
        outsideFoodAllowed: true,
        description: "Heritage hotel experience with modern amenities. Experience the rich culture of Hyderabad with contemporary comfort.",
        amenities: ["WiFi", "AC", "Restaurant", "Parking", "Room Service", "Spa"],
        rating: 4.3,
        images: [
          "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&h=800&fit=crop",
        ],
      },
      {
        name: "Goa Beach Resort",
        location: "Goa",
        price: 5500,
        capacity: 2,
        outsideFoodAllowed: true,
        description: "Beachfront resort with direct access to pristine beaches. Perfect for a relaxing vacation with stunning ocean views.",
        amenities: ["WiFi", "AC", "Pool", "Beach Access", "Restaurant", "Bar", "Spa", "Parking"],
        rating: 4.6,
        images: [
          "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&h=800&fit=crop",
          "https://images.unsplash.com/photo-1571003123894-1c0594d2bbf9?w=1200&h=800&fit=crop",
        ],
      },
      {
        name: "Mumbai Family Resort",
        location: "Mumbai, Maharashtra",
        price: 6500,
        capacity: 4,
        outsideFoodAllowed: true,
        description: "Spacious family-friendly resort with multiple room options. Features kids' play area, pool, and family entertainment.",
        amenities: ["WiFi", "AC", "Pool", "Restaurant", "Parking", "Kids Play Area", "Gym"],
        rating: 4.5,
        images: [
          "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200&h=800&fit=crop",
        ],
      },
    ];

    // Seed Cleaning Services
    console.log("\n🧹 Seeding Cleaning Services...");
    for (const serviceData of cleaningServices) {
      const imageUrl = await uploadImageToCloudinary(serviceData.image, "cleaning");
      const cleaning = await Cleaning.create({
        name: serviceData.name,
        description: serviceData.description,
        price: serviceData.price,
        category: serviceData.category,
        duration: serviceData.duration,
        suppliesIncluded: serviceData.suppliesIncluded,
        provider: provider._id,
        images: [imageUrl],
      });
      await Provider.findByIdAndUpdate(provider._id, {
        $addToSet: { services: cleaning._id },
      });
      console.log(`  ✅ Created: ${cleaning.name} (₹${cleaning.price})`);
    }

    // Seed Hotel Services
    console.log("\n🏨 Seeding Hotel Services...");
    for (const hotelData of hotelServices) {
      const imageUrls = await Promise.all(
        hotelData.images.map(url => uploadImageToCloudinary(url, "hotels"))
      );
      const hotel = await Hotel.create({
        name: hotelData.name,
        location: hotelData.location,
        price: hotelData.price,
        capacity: hotelData.capacity,
        outsideFoodAllowed: hotelData.outsideFoodAllowed,
        description: hotelData.description,
        amenities: hotelData.amenities,
        rating: hotelData.rating,
        provider: provider._id,
        images: imageUrls,
      });
      await Provider.findByIdAndUpdate(provider._id, {
        $addToSet: { services: hotel._id },
      });
      console.log(`  ✅ Created: ${hotel.name} (₹${hotel.price}/night, Rating: ${hotel.rating})`);
    }

    // Mock Cab/Ride Services
    const cabServices = [
      {
        name: "Airport Transfer Service",
        pickup: "Airport Terminal 1",
        drop: "City Center",
        vehicleType: "cab",
        fare: 450,
        distance: 15,
        description: "Comfortable cab ride from airport to city center. AC vehicle with professional driver.",
        rating: 4.8,
        images: [
          "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop",
        ],
      },
      {
        name: "Railway Station Transfer",
        pickup: "Railway Station",
        drop: "Hotel District",
        vehicleType: "cab",
        fare: 300,
        distance: 10,
        description: "Reliable cab service from railway station to hotels. Available 24/7.",
        rating: 4.6,
        images: [
          "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&fit=crop",
        ],
      },
      {
        name: "City Center Shuttle",
        pickup: "City Center",
        drop: "Shopping Mall",
        vehicleType: "auto",
        fare: 150,
        distance: 5,
        description: "Quick auto rickshaw ride for short distances. Affordable and convenient.",
        rating: 4.5,
        images: [
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
        ],
      },
      {
        name: "Evening Commute Service",
        pickup: "Office Complex",
        drop: "Residential Area",
        vehicleType: "cab",
        fare: 250,
        distance: 8,
        description: "Evening commute service. Comfortable ride after work hours.",
        rating: 4.7,
        images: [
          "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=600&fit=crop",
        ],
      },
      {
        name: "Premium Airport Transfer",
        pickup: "Hotel",
        drop: "Airport Terminal 2",
        vehicleType: "cab",
        fare: 500,
        distance: 18,
        description: "Airport transfer service. On-time pickup guaranteed.",
        rating: 4.9,
        images: [
          "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop",
        ],
      },
      {
        name: "Quick Bike Ride",
        pickup: "Bus Stand",
        drop: "City Center",
        vehicleType: "bike",
        fare: 80,
        distance: 3,
        description: "Quick bike ride for short distances. Fast and economical.",
        rating: 4.4,
        images: [
          "https://images.unsplash.com/photo-1558980663-36856cfe1600?w=800&h=600&fit=crop",
        ],
      },
    ];

    // Seed Cab Services
    console.log("\n🚕 Seeding Cab/Ride Services...");
    for (const cabData of cabServices) {
      // Upload images to Cloudinary
      const imageUrls = [];
      for (const imageUrl of cabData.images || []) {
        try {
          const uploadedUrl = await uploadImageToCloudinary(imageUrl, "rides");
          imageUrls.push(uploadedUrl);
        } catch (err) {
          console.error(`  ⚠️  Failed to upload image for ${cabData.name}:`, err.message);
        }
      }

      const ride = await Ride.create({
        name: cabData.name,
        pickup: cabData.pickup,
        drop: cabData.drop,
        vehicleType: cabData.vehicleType,
        fare: cabData.fare,
        distance: cabData.distance,
        description: cabData.description,
        rating: cabData.rating,
        images: imageUrls,
        when: new Date().toISOString(),
        status: "pending",
        provider: provider._id,
      });
      await Provider.findByIdAndUpdate(provider._id, {
        $addToSet: { services: ride._id },
      });
      console.log(`  ✅ Created: ${cabData.name} (${cabData.vehicleType.toUpperCase()}) - ₹${cabData.fare}`);
    }

    console.log("\n🎉 All mock data seeded successfully!");
    console.log(`📊 Summary:`);
    console.log(`   - Provider: ${provider.name}`);
    console.log(`   - Cleaning Services: ${cleaningServices.length}`);
    console.log(`   - Hotels: ${hotelServices.length}`);
    console.log(`   - Cab/Ride Services: ${cabServices.length}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding mock data:", error);
    process.exit(1);
  }
}

seedMockData();

