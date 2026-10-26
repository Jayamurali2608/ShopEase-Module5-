
require("dotenv").config();

const dns = require("dns");
dns.setServers(["8.8.8.8"]);

const mongoose = require("mongoose");
const Product = require("./models/Product");

const products = [
  {
    name: "Classic Cotton T-Shirt",
    description: "Comfortable everyday cotton T-shirt",
    price: 499,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",
    stock: 30,
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    name: "Denim Jacket",
    description: "Stylish casual denim jacket",
    price: 1499,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600",
    stock: 15,
    sizes: ["S", "M", "L", "XL"],
  },
  {
    name: "Running Shoes",
    description: "Lightweight everyday running shoes",
    price: 1999,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
    stock: 20,
    sizes: ["S", "M", "L", "XL"],
  },
  {
    name: "Wireless Headphones",
    description: "Wireless headphones with comfortable ear cushions",
    price: 1299,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
    stock: 25,
  },
  {
    name: "Smart Watch",
    description: "Modern smartwatch for daily activities",
    price: 2499,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
    stock: 18,
  },
  {
    name: "Smartphone",
    description: "Feature-packed smartphone",
    price: 14999,
    category: "Mobiles",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600",
    stock: 12,
  },
  {
    name: "Laptop",
    description: "Laptop for study and everyday work",
    price: 45999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600",
    stock: 8,
  },
  {
    name: "Makeup Essentials",
    description: "Everyday makeup collection",
    price: 799,
    category: "Beauty",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600",
    stock: 20,
  },
  {
    name: "Skin Care Set",
    description: "Daily skincare essentials",
    price: 999,
    category: "Beauty",
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600",
    stock: 15,
  },
  {
    name: "Modern Sofa",
    description: "Comfortable sofa for your living room",
    price: 12999,
    category: "Home",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600",
    stock: 5,
  },
  {
    name: "Coffee Mug",
    description: "Ceramic mug for everyday use",
    price: 299,
    category: "Home",
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600",
    stock: 40,
  },
  {
    name: "Reading Book",
    description: "A book for your reading collection",
    price: 399,
    category: "Books",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600",
    stock: 25,
  },

  {
    name: "Samsung Galaxy Smartphone",
    description: "Modern smartphone with a vibrant display",
    price: 18999,
    category: "Mobiles",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600",
    stock: 15,
  },
  {
    name: "iPhone Style Smartphone",
    description: "Premium design smartphone for everyday use",
    price: 29999,
    category: "Mobiles",
    image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600",
    stock: 10,
  },
  {
    name: "HP Everyday Laptop",
    description: "Laptop for work and online learning",
    price: 42999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600",
    stock: 8,
  },
  {
    name: "Slim Business Laptop",
    description: "Slim laptop for productivity and study",
    price: 52999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600",
    stock: 6,
  },
  {
    name: "Beauty Makeup Kit",
    description: "Makeup essentials for everyday looks",
    price: 899,
    category: "Beauty",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600",
    stock: 20,
  },
  {
    name: "Face Care Collection",
    description: "Daily face care and skincare essentials",
    price: 1199,
    category: "Beauty",
    image: "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=600",
    stock: 18,
  },
  {
    name: "Luxury Lipstick Set",
    description: "A collection of stylish lipstick shades",
    price: 699,
    category: "Beauty",
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600",
    stock: 25,
  },
];

async function seedProducts() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from the backend .env file");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully!");

    const result = await Product.bulkWrite(
      products.map((product) => ({
        updateOne: {
          filter: { name: product.name },
          update: { $set: product },
          upsert: true,
        },
      }))
    );

    console.log("Sample products processed successfully!");
    console.log("New products added:", result.upsertedCount);
    console.log("Existing products updated:", result.modifiedCount);
  } catch (error) {
    console.error("Error adding products:", error.message);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

seedProducts();
