import mongoose from "mongoose";
import dotenv from "dotenv";
import Provider from "../models/Provider.js";
import Cleaning from "../models/cleaningModel.js";
import connectDB from "../config/db.js";

dotenv.config();

const mockProviders = [
  {
    name: "CleanPro Services",
    description: "Professional cleaning services with 10+ years of experience. Trusted by thousands of customers.",
    email: "info@cleanpro.com",
    phone: "+91 98765 43210",
    address: "123 Main Street",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    rating: 4.8,
    totalReviews: 1250,
    specialties: ["Home Cleaning", "Office Cleaning", "Deep Cleaning"],
    isActive: true,
  },
  {
    name: "Sparkle Clean",
    description: "Eco-friendly cleaning solutions for homes and offices. We use only green products.",
    email: "hello@sparkleclean.com",
    phone: "+91 98765 43211",
    address: "456 Business Park",
    city: "Delhi",
    state: "Delhi",
    pincode: "110001",
    rating: 4.9,
    totalReviews: 890,
    specialties: ["Home Cleaning", "Deep Cleaning", "Laundry"],
    isActive: true,
  },
  {
    name: "Elite Home Services",
    description: "Premium cleaning services for luxury homes and commercial spaces.",
    email: "contact@elitehomes.com",
    phone: "+91 98765 43212",
    address: "789 Luxury Lane",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560001",
    rating: 4.7,
    totalReviews: 650,
    specialties: ["Home Cleaning", "Office Cleaning"],
    isActive: true,
  },
  {
    name: "QuickClean Express",
    description: "Fast and reliable cleaning services. Book now and get cleaned within 2 hours!",
    email: "support@quickclean.com",
    phone: "+91 98765 43213",
    address: "321 Speed Avenue",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411001",
    rating: 4.6,
    totalReviews: 420,
    specialties: ["Home Cleaning", "Deep Cleaning"],
    isActive: true,
  },
  {
    name: "GreenClean Solutions",
    description: "100% organic and eco-friendly cleaning products. Safe for your family and pets.",
    email: "info@greenclean.com",
    phone: "+91 98765 43214",
    address: "654 Green Street",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500001",
    rating: 4.9,
    totalReviews: 780,
    specialties: ["Home Cleaning", "Laundry"],
    isActive: true,
  },
];

async function seedProviders() {
  try {
    await connectDB();
    console.log("✅ Connected to database");

    // Fix the index if it exists (drop and let mongoose recreate with sparse)
    try {
      await mongoose.connection.db.collection("providers").dropIndex("user_1");
      console.log("✅ Dropped old user index");
    } catch (err) {
      // Index doesn't exist or already dropped, that's fine
      if (err.message && err.message.includes("index not found")) {
        console.log("ℹ️  No existing index to drop");
      } else {
        console.log("ℹ️  Index handling:", err.message);
      }
    }

    // Ensure the index is created with sparse: true
    try {
      await Provider.collection.createIndex({ user: 1 }, { unique: true, sparse: true });
      console.log("✅ Created sparse unique index on user field");
    } catch (err) {
      console.log("ℹ️  Index creation:", err.message);
    }

    // Clear existing providers (optional - comment out if you want to keep existing data)
    // await Provider.deleteMany({});
    // console.log("✅ Cleared existing providers");

    const createdProviders = [];

    for (const providerData of mockProviders) {
      // Check if provider already exists
      const existing = await Provider.findOne({ name: providerData.name });
      if (existing) {
        console.log(`⏭️  Provider "${providerData.name}" already exists, skipping...`);
        createdProviders.push(existing);
        continue;
      }

      // Don't set user field for mock providers (they're not linked to users)
      const providerDataWithoutUser = { ...providerData };
      delete providerDataWithoutUser.user; // Ensure no user field

      const provider = await Provider.create(providerDataWithoutUser);
      createdProviders.push(provider);
      console.log(`✅ Created provider: ${provider.name} (ID: ${provider._id})`);
    }

    // Link some existing cleaning services to providers
    const allServices = await Cleaning.find({ provider: { $exists: false } });
    console.log(`\n📋 Found ${allServices.length} services without providers`);

    if (allServices.length > 0 && createdProviders.length > 0) {
      // Distribute services across providers
      for (let i = 0; i < allServices.length; i++) {
        const provider = createdProviders[i % createdProviders.length];
        await Cleaning.findByIdAndUpdate(allServices[i]._id, {
          provider: provider._id,
        });
        console.log(`✅ Linked service "${allServices[i].name}" to provider "${provider.name}"`);
      }
    }

    console.log("\n🎉 Seeding completed successfully!");
    console.log(`📊 Created/Linked ${createdProviders.length} providers`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding providers:", error);
    process.exit(1);
  }
}

seedProviders();

