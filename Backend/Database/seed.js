import bcrypt from "bcrypt";
import { sequelize } from "./db.js";
import { User } from "../Model/User/UserModel.js";
import { Product } from "../Model/Product/productModel.js";
import { Booking } from "../Model/Booking/BookingModel.js";
import { Review } from "../Model/Review/ReviewModel.js";
import { EquipmentPurchase } from "../Model/EquipmentPurchase/EquipmentPurchaseModel.js";
import { WishlistItem } from "../Model/Wishlist/WishlistModel.js";
import { ContactMessage } from "../Model/ContactMessage/ContactMessageModel.js";

const seedData = async () => {
  try {
    console.log("Starting database seeding...");
    await sequelize.authenticate();
    
    // Clear existing data in reverse order of dependencies
    await WishlistItem.destroy({ where: {}, truncate: true, cascade: true });
    await ContactMessage.destroy({ where: {}, truncate: true, cascade: true });
    await EquipmentPurchase.destroy({ where: {}, truncate: true, cascade: true });
    await Review.destroy({ where: {}, truncate: true, cascade: true });
    await Booking.destroy({ where: {}, truncate: true, cascade: true });
    await Product.destroy({ where: {}, truncate: true, cascade: true });
    await User.destroy({ where: {}, truncate: true, cascade: true });
    
    console.log("✅ Cleared existing data");

    // Admin + Users
    const adminUsers = [
      {
        username: "admin",
        email: "admin@triptokailash.com",
        password: await bcrypt.hash("admin@123", 10),
        role: "admin",
        phone: "9841234567",
        profilePicture: null,
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    ];

    const regularUsers = [
      {
        username: "John Smith",
        email: "john.smith@email.com",
        password: await bcrypt.hash("password123", 10),
        role: "user",
        phone: "5550123456",
        profilePicture: null,
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
      {
        username: "Mary Johnson",
        email: "mary.johnson@email.com",
        password: await bcrypt.hash("password123", 10),
        role: "user",
        phone: "5550124567",
        profilePicture: null,
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
      {
        username: "David Wilson",
        email: "david.wilson@email.com",
        password: await bcrypt.hash("password123", 10),
        role: "user",
        phone: "5550125678",
        profilePicture: null,
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    ];

    const createdUsers = await User.bulkCreate([...adminUsers, ...regularUsers], {
      returning: true,
    });
    console.log(`✅ Created ${createdUsers.length} users`);

    // Packages + Equipment
    const travelPackages = [
      {
        name: "Kailash Mansarovar Yatra - 15 Days",
        description: "Sacred pilgrimage to Mount Kailash and Mansarovar with guided support and acclimatization days.",
        price: 4500.0,
        duration: "15 days",
        category: "Kailash Yatra",
        stock_quantity: 25,
        category_id: 1,
        brand_id: 1,
        image_url: null,
        status: "active",
      },
      {
        name: "Kailash Inner Kora - 16 Days",
        description: "Extended Kailash journey with additional spiritual sites and cultural immersion.",
        price: 5200.0,
        duration: "16 days",
        category: "Kailash Yatra",
        stock_quantity: 18,
        category_id: 1,
        brand_id: 1,
        image_url: null,
        status: "active",
      },
      {
        name: "Everest Base Camp Trek - 14 Days",
        description: "Classic EBC trek with experienced guides and breathtaking Himalayan views.",
        price: 2800.0,
        duration: "14 days",
        category: "Adventure",
        stock_quantity: 30,
        category_id: 2,
        brand_id: 1,
        image_url: null,
        status: "active",
      },
      {
        name: "Annapurna Circuit Trek - 12 Days",
        description: "A rewarding trek around the Annapurna massif with diverse landscapes.",
        price: 1800.0,
        duration: "12 days",
        category: "Adventure",
        stock_quantity: 40,
        category_id: 2,
        brand_id: 1,
        image_url: null,
        status: "active",
      },
      {
        name: "Kathmandu Heritage Tour - 7 Days",
        description: "UNESCO heritage sites, temples, and traditional culture in Kathmandu Valley.",
        price: 650.0,
        duration: "7 days",
        category: "Domestic",
        stock_quantity: 35,
        category_id: 3,
        brand_id: 1,
        image_url: null,
        status: "active",
      },
      {
        name: "Lumbini Pilgrimage Tour - 5 Days",
        description: "Visit the birthplace of Lord Buddha and sacred meditation sites.",
        price: 800.0,
        duration: "5 days",
        category: "Domestic",
        stock_quantity: 50,
        category_id: 3,
        brand_id: 1,
        image_url: null,
        status: "active",
      },
      {
        name: "Tibet Lhasa Tour - 7 Days",
        description: "Visit Lhasa, Potala Palace, Jokhang Temple, and Tibetan cultural sites.",
        price: 2600.0,
        duration: "7 days",
        category: "International",
        stock_quantity: 20,
        category_id: 4,
        brand_id: 1,
        image_url: null,
        status: "active",
      },
      {
        name: "Upper Mustang Adventure - 12 Days",
        description: "Explore the hidden kingdom of Mustang with ancient caves and monasteries.",
        price: 3100.0,
        duration: "12 days",
        category: "Adventure",
        stock_quantity: 16,
        category_id: 2,
        brand_id: 1,
        image_url: null,
        status: "active",
      },
      // Equipment items
      {
        name: "High-Altitude Trekking Boots",
        description: "Durable trekking boots with ankle support and anti-slip soles.",
        price: 120.0,
        duration: "Gear",
        category: "Equipment",
        stock_quantity: 100,
        category_id: 6,
        brand_id: 1,
        image_url: null,
        status: "active",
      },
      {
        name: "Thermal Sleeping Bag (Sub-zero)",
        description: "Warm sleeping bag suitable for cold nights and high-altitude camps.",
        price: 90.0,
        duration: "Gear",
        category: "Equipment",
        stock_quantity: 80,
        category_id: 6,
        brand_id: 1,
        image_url: null,
        status: "active",
      },
      {
        name: "Windproof Trekking Jacket",
        description: "Lightweight windproof jacket with inner fleece.",
        price: 75.0,
        duration: "Gear",
        category: "Equipment",
        stock_quantity: 120,
        category_id: 6,
        brand_id: 1,
        image_url: null,
        status: "active",
      },
      {
        name: "Reusable Water Bottle (1L)",
        description: "Stainless steel bottle for long treks and travel days.",
        price: 12.0,
        duration: "Gear",
        category: "Equipment",
        stock_quantity: 200,
        category_id: 6,
        brand_id: 1,
        image_url: null,
        status: "active",
      },
      {
        name: "Trekking Poles (Pair)",
        description: "Adjustable trekking poles for stability on steep trails.",
        price: 35.0,
        duration: "Gear",
        category: "Equipment",
        stock_quantity: 150,
        category_id: 6,
        brand_id: 1,
        image_url: null,
        status: "active",
      },
      {
        name: "Portable First Aid Kit",
        description: "Compact first-aid kit for travel safety and emergencies.",
        price: 18.0,
        duration: "Gear",
        category: "Equipment",
        stock_quantity: 180,
        category_id: 6,
        brand_id: 1,
        image_url: null,
        status: "active",
      },
      {
        name: "Trekking Backpack (45L)",
        description: "Comfortable backpack with rain cover and padded straps.",
        price: 55.0,
        duration: "Gear",
        category: "Equipment",
        stock_quantity: 120,
        category_id: 6,
        brand_id: 1,
        image_url: null,
        status: "active",
      },
      {
        name: "Headlamp + Batteries",
        description: "LED headlamp for night walks and early starts.",
        price: 14.0,
        duration: "Gear",
        category: "Equipment",
        stock_quantity: 220,
        category_id: 6,
        brand_id: 1,
        image_url: null,
        status: "active",
      },
    ];

    const createdPackages = await Product.bulkCreate(travelPackages, {
      returning: true,
    });
    console.log(`✅ Created ${createdPackages.length} products`);

    const regularUserIds = createdUsers.filter(u => u.role === "user").map(u => u.id);
    const packageIds = createdPackages.filter(p => p.category !== "Equipment").map(p => p.id);
    const equipmentIds = createdPackages.filter(p => p.category === "Equipment").map(p => p.id);

    // Sample bookings
    const sampleBookings = [
      {
        userId: regularUserIds[0],
        userName: "John Smith",
        userEmail: "john.smith@email.com",
        productId: packageIds[0],
        packageName: "Kailash Mansarovar Yatra - 15 Days",
        price: 4500.0,
        travelDate: "2026-04-15",
        numberOfPeople: 2,
        specialRequests: "Vegetarian meals required",
        status: "Confirmed",
      },
      {
        userId: regularUserIds[1],
        userName: "Mary Johnson",
        userEmail: "mary.johnson@email.com",
        productId: packageIds[2],
        packageName: "Everest Base Camp Trek - 14 Days",
        price: 2800.0,
        travelDate: "2026-05-20",
        numberOfPeople: 1,
        specialRequests: "Need porter assistance",
        status: "Pending",
      },
    ];

    const createdBookings = await Booking.bulkCreate(sampleBookings, {
      returning: true,
    });
    console.log(`✅ Created ${createdBookings.length} bookings`);

    // Sample reviews
    const sampleReviews = [
      {
        userId: regularUserIds[0],
        userName: "John Smith",
        packageId: packageIds[0],
        packageName: "Kailash Mansarovar Yatra - 15 Days",
        rating: 5,
        title: "Life-changing journey",
        comment: "Well organized and spiritually uplifting experience.",
        status: "Approved",
      },
    ];
    const createdReviews = await Review.bulkCreate(sampleReviews, {
      returning: true,
    });
    console.log(`✅ Created ${createdReviews.length} reviews`);

    // Sample equipment purchases
    if (equipmentIds.length > 0) {
      const sampleEquipmentPurchases = [
        {
          userId: regularUserIds[0],
          userName: "John Smith",
          userEmail: "john.smith@email.com",
          productId: equipmentIds[0],
          productName: "High-Altitude Trekking Boots",
          price: 120.0,
          quantity: 1,
          totalPrice: 120.0,
          phone: "5550123456",
          address: "Kathmandu, Nepal",
          notes: "Size 42",
          status: "Confirmed",
        },
      ];
      const createdEquipmentPurchases = await EquipmentPurchase.bulkCreate(sampleEquipmentPurchases, {
        returning: true,
      });
      console.log(`✅ Created ${createdEquipmentPurchases.length} equipment purchase requests`);
    }

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("Admin Login: admin@triptokailash.com | Password: admin@123");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
};

const runSeed = async () => {
  try {
    await seedData();
    console.log("✅ Seeding process completed. Closing database connection...");
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    await sequelize.close();
    process.exit(1);
  }
};

export { seedData };

// Run seed directly when file is executed
runSeed();
