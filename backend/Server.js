import dns from "node:dns/promises";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import { MongoClient, ObjectId } from "mongodb";
import "dotenv/config";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();
// import express from "express";
// import cors from "cors";

// const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://my-all-neon.vercel.app"
];

app.use((req, res, next) => {

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header(
      "Access-Control-Allow-Origin",
      origin
    );
  }

  res.header(
    "Vary",
    "Origin"
  );

  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );

  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, user-id"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// app.use(express.json());
app.use(express.json());

// app.options("*", cors());


// const express = require("express");
// const cors = require("cors");

// const app = express();


// ===============================
// CORS
// ===============================

// const allowedOrigins = [
//   "http://localhost:5173",
//   "https://YOUR-FRONTEND.vercel.app"
// ];

// const corsOptions = {
//   origin: function (origin, callback) {

//     if (!origin) {
//       return callback(null, true);
//     }

//     if (allowedOrigins.includes(origin)) {
//       return callback(null, true);
//     }

//     return callback(new Error("Not allowed by CORS"));
//   },

//   methods: [
//     "GET",
//     "POST",
//     "PUT",
//     "DELETE",
//     "OPTIONS"
//   ],

//   allowedHeaders: [
//     "Content-Type",
//     "Authorization",
//     "user-id"
//   ]
// };

// ===============================
// CORS
// ===============================

// const allowedOrigins = [
//   "http://localhost:5173"
// ];

// const corsOptions = {
//   origin: function (origin, callback) {
//     if (!origin) {
//       return callback(null, true);
//     }

//     if (allowedOrigins.includes(origin)) {
//       return callback(null, true);
//     }

//     return callback(new Error("Not allowed by CORS"));
//   },

//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],

//   allowedHeaders: [
//     "Content-Type",
//     "Authorization",
//     "user-id"
//   ],

//   credentials: false
// };

// app.use(cors(corsOptions));
// app.options(/.*/, cors(corsOptions));

// app.options(/.*/, cors());


// app.options(/.*/, cors(corsOptions));

app.use(express.json());


// ===============================
// DATABASE
// ===============================

const client = new MongoClient(
  process.env.MONGODB_URL
);

let db;
let products;
let cart;
let users;
let reviews;
let newsletter;


async function connectDB() {

  if (db) {
    return db;
  }

  await client.connect();

  db = client.db("clothing_store");

  products = db.collection("products");
  cart = db.collection("cart");
  users = db.collection("users");
  reviews = db.collection("reviews");
  newsletter = db.collection("newsletter");

  await users.createIndex(
    { email: 1 },
    { unique: true }
  );

  await newsletter.createIndex(
    { email: 1 },
    { unique: true }
  );

  console.log("MongoDB connected successfully");

  return db;
}


// ===============================
// DATABASE MIDDLEWARE
// ===============================

app.use(async (req, res, next) => {

  try {

    await connectDB();

    next();

  } catch (error) {

    console.error(
      "Database connection error:",
      error
    );

    res.status(500).json({
      message: "Database connection failed"
    });

  }

});

// ===============================
// DATABASE MIDDLEWARE
// ===============================

// app.use(async (req, res, next) => {

//   try {

//     await connectDB();

//     next();

//   } catch (error) {

//     console.error(
//       "Database connection error:",
//       error
//     );

//     res.status(500).json({
//       message: "Database connection failed"
//     });

//   }

// });



async function createAdmin() {
  try {

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error(
        "ADMIN_EMAIL or ADMIN_PASSWORD is missing"
      );
      return;
    }

    const existingAdmin = await users.findOne({
      email: adminEmail.toLowerCase()
    });

    if (existingAdmin) {

      await users.updateOne(
        { email: adminEmail.toLowerCase() },
        {
          $set: {
            role: "admin"
          }
        }
      );

      console.log("Existing user promoted to admin");

      return;
    }

    const hashedPassword = await bcrypt.hash(
      adminPassword,
      10
    );

    await users.insertOne({
      name: "Davira Admin",
      email: adminEmail.toLowerCase(),
      password: hashedPassword,
      role: "admin",
      createdAt: new Date()
    });

    console.log("Admin created successfully");

  } catch (error) {

    console.error(
      "Error creating admin:",
      error
    );

  }
}

app.get("/admin/products", verifyAdmin, async (req, res) => {

  try {

    const allProducts = await products
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(allProducts);

  } catch (error) {

    res.status(500).json({
      message: "Error fetching products",
      error: error.message
    });

  }

});
app.post("/admin/products", verifyAdmin, async (req, res) => {

  try {

    const {
      name,
      brand,
      price,
      sizes,
      image
    } = req.body;

    if (!name || !brand || !price || !sizes || !image) {

      return res.status(400).json({
        message: "Please fill in all product fields"
      });

    }

    const newProduct = {

      name: name.trim(),

      brand: brand.trim(),

      price: Number(price),

      sizes: sizes.trim(),

      image: image.trim(),

      createdAt: new Date(),

      updatedAt: new Date()

    };

    const result = await products.insertOne(
      newProduct
    );

    res.status(201).json({

      message: "Product added successfully",

      product: {
        _id: result.insertedId,
        ...newProduct
      }

    });

  } catch (error) {

    res.status(500).json({
      message: "Error adding product",
      error: error.message
    });

  }

});
app.put("/admin/products/:id", verifyAdmin, async (req, res) => {

  try {

    const id = new ObjectId(req.params.id);

    const {
      name,
      brand,
      price,
      sizes,
      image
    } = req.body;

    const result = await products.updateOne(

      { _id: id },

      {
        $set: {

          name: name.trim(),

          brand: brand.trim(),

          price: Number(price),

          sizes: sizes.trim(),

          image: image.trim(),

          updatedAt: new Date()

        }
      }

    );

    if (result.matchedCount === 0) {

      return res.status(404).json({
        message: "Product not found"
      });

    }

    const updatedProduct =
      await products.findOne({
        _id: id
      });

    res.status(200).json({

      message: "Product updated successfully",

      product: updatedProduct

    });

  } catch (error) {

    res.status(500).json({
      message: "Error updating product",
      error: error.message
    });

  }

});
app.delete("/admin/products/:id", verifyAdmin, async (req, res) => {

  try {

    const id = new ObjectId(req.params.id);

    const result = await products.deleteOne({
      _id: id
    });

    if (result.deletedCount === 0) {

      return res.status(404).json({
        message: "Product not found"
      });

    }

    res.status(200).json({
      message: "Product deleted successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: "Error deleting product",
      error: error.message
    });

  }

});
app.get("/admin/stats", verifyAdmin, async (req, res) => {

  try {

    const totalProducts =
      await products.countDocuments();

    const totalUsers =
      await users.countDocuments();

    const totalCartItems =
      await cart.countDocuments();

    res.status(200).json({

      totalProducts,

      totalUsers,

      totalCartItems

    });

  } catch (error) {

    res.status(500).json({

      message: "Error fetching dashboard statistics",

      error: error.message

    });

  }

});
app.get("/admin/users", verifyAdmin, async (req, res) => {

  try {

    const allUsers = await users
      .find(
        {},
        {
          projection: {
            password: 0
          }
        }
      )
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(allUsers);

  } catch (error) {

    res.status(500).json({

      message: "Error fetching users",

      error: error.message

    });

  }

});

// ========================================
// REGISTER USER
// POST /register
// ========================================

app.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password
    } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please fill in all fields"
      });
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    // Convert email to lowercase
    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await users.findOne({
      email: cleanEmail
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // Create user
    const newUser = {
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      createdAt: new Date()
    };

    const result = await users.insertOne(newUser);

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: result.insertedId,
        name: newUser.name,
        email: newUser.email
      }
    });

  } catch (error) {

    console.error("Registration error:", error);

    // Handle duplicate email
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    res.status(500).json({
      message: "Server error during registration"
    });
  }
});

// ========================================
// LOGIN USER
// POST /login
// ========================================

app.post("/login", async (req, res) => {
  try {

    const {
      email,
      password
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter email and password"
      });
    }

    const cleanEmail = email
      .trim()
      .toLowerCase();

    const user = await users.findOne({
      email: cleanEmail
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    res.status(200).json({
      message: "Login successful",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "user"
      }
    });

  } catch (error) {

    console.error("Login error:", error);

    res.status(500).json({
      message: "Server error during login"
    });
  }
});


// ========================================
// NEWSLETTER SUBSCRIPTION
// POST /newsletter
// ========================================

app.post("/newsletter", async (req, res) => {
  try {
    const { email } = req.body;

    // Check email
    if (!email || !email.trim()) {
      return res.status(400).json({
        message: "Please enter your email address"
      });
    }

    // Clean email
    const cleanEmail = email.trim().toLowerCase();

    // Check if email already subscribed
    const existingSubscriber = await newsletter.findOne({
      email: cleanEmail
    });

    if (existingSubscriber) {
      return res.status(409).json({
        message: "This email is already subscribed"
      });
    }

    // Create subscriber
    const newSubscriber = {
      email: cleanEmail,
      subscribedAt: new Date()
    };

    // Save to MongoDB
    const result = await newsletter.insertOne(newSubscriber);

    res.status(201).json({
      message: "Successfully subscribed to our newsletter!",
      subscriber: {
        _id: result.insertedId,
        email: cleanEmail
      }
    });

  } catch (error) {
    console.error("Newsletter subscription error:", error);

    res.status(500).json({
      message: "Failed to subscribe to newsletter",
      error: error.message
    });
  }
});
// ========================================
// GET CURRENT USER
// ========================================

app.get("/users/:id", async (req, res) => {
  try {

    const id = new ObjectId(req.params.id);

    const user = await users.findOne(
      { _id: id },
      {
        projection: {
          password: 0
        }
      }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.status(200).json(user);

  } catch (error) {

    res.status(500).json({
      message: "Error fetching user",
      error: error.message
    });
  }
});

// ========================================
// CREATE PRODUCT
// POST /products
// ========================================

app.post("/products", async (req, res) => {
  try {

    const {
      name,
      brand,
      price,
      sizes,
      image
    } = req.body;

    const product = {
      name,
      brand,
      price,
      sizes,
      image,
      createdAt: new Date()
    };

    const result = await products.insertOne(product);

    res.status(201).json({
      message: "Product created successfully",
      productId: result.insertedId
    });

  } catch (error) {

    res.status(500).json({
      message: "Error creating product",
      error: error.message
    });
  }
});
// ========================================
// ADD REVIEW
// POST /reviews
// ========================================

app.post("/reviews", async (req, res) => {
  try {
    const {
      productId,
      productName,
      name,
      rating,
      comment
    } = req.body;

    // Check required fields
    if (
      !productId ||
      !productName ||
      !name?.trim() ||
      !comment?.trim() ||
      !rating
    ) {
      return res.status(400).json({
        message: "Please fill in all review fields"
      });
    }

    // Convert rating to number
    const numericRating = Number(rating);

    // Validate rating
    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5"
      });
    }

    // Create review FIRST
    const newReview = {
      productId: productId,
      productName: productName.trim(),
      name: name.trim(),
      rating: numericRating,
      comment: comment.trim(),
      createdAt: new Date()
    };

    // Then save it to MongoDB
    const result = await reviews.insertOne(newReview);

    res.status(201).json({
      message: "Review submitted successfully",

      review: {
        _id: result.insertedId,
        ...newReview
      }
    });

  } catch (error) {
    console.error("Add review error:", error);

    res.status(500).json({
      message: "Error submitting review",
      error: error.message
    });
  }
});


// ========================================
// GET ALL PRODUCTS
// GET /products
// ========================================

app.get("/products", async (req, res) => {
  try {

    const allProducts = await products
      .find({})
      .toArray();

    res.status(200).json(allProducts);

  } catch (error) {

    res.status(500).json({
      message: "Error fetching products",
      error: error.message
    });
  }
});
// ========================================
// GET REVIEWS FOR PRODUCT
// GET /reviews/:productId
// ========================================

app.get("/reviews/:productId", async (req, res) => {
  try {

    const productId = req.params.productId;

    const productReviews = await reviews
      .find({ productId: productId })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(productReviews);

  } catch (error) {

    console.error("Get reviews error:", error);

    res.status(500).json({
      message: "Error fetching reviews",
      error: error.message
    });

  }
});


// ========================================
// GET ONE PRODUCT
// GET /products/:id
// ========================================

app.get("/products/:id", async (req, res) => {
  try {

    const id = new ObjectId(req.params.id);

    const product = await products.findOne({
      _id: id
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.status(200).json(product);

  } catch (error) {

    res.status(500).json({
      message: "Error fetching product",
      error: error.message
    });
  }
});

// ========================================
// UPDATE PRODUCT
// PUT /products/:id
// ========================================

app.put("/products/:id", async (req, res) => {
  try {

    const id = new ObjectId(req.params.id);

    const {
      name,
      category,
      brand,
      price,
      sizes,
      colors,
      stock,
      description,
      image
    } = req.body;

    const result = await products.updateOne(
      { _id: id },
      {
        $set: {
          name,
          category,
          brand,
          price,
          sizes,
          colors,
          stock,
          description,
          image,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.status(200).json({
      message: "Product updated successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: "Error updating product",
      error: error.message
    });
  }
});


// ========================================
// DELETE PRODUCT
// DELETE /products/:id
// ========================================

app.delete("/products/:id", async (req, res) => {
  try {

    const id = new ObjectId(req.params.id);

    const result = await products.deleteOne({
      _id: id
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.status(200).json({
      message: "Product deleted successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: "Error deleting product",
      error: error.message
    });
  }
});
// ========================================
// DELETE REVIEW
// DELETE /reviews/:id
// ========================================

app.delete("/reviews/:id", async (req, res) => {
  try {

    const id = new ObjectId(req.params.id);

    const result = await reviews.deleteOne({
      _id: id
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Review not found"
      });
    }

    res.status(200).json({
      message: "Review deleted successfully"
    });

  } catch (error) {

    console.error("Delete review error:", error);

    res.status(500).json({
      message: "Error deleting review",
      error: error.message
    });

  }
});


// ========================================
// ADD PRODUCT TO CART
// POST /cart
// ========================================

// ========================================
// ADD PRODUCT TO CART
// POST /cart
// ========================================
app.post("/cart", async (req, res) => {
  try {

    const userId = req.headers["user-id"];

    const {
      productId,
      name,
      brand,
      price,
      sizes,
      image,
      quantity
    } = req.body;

    if (!userId || !productId || !name || price === undefined) {
      return res.status(400).json({
        message: "Invalid cart information"
      });
    }

    let userObjectId;

    try {
      userObjectId = new ObjectId(userId);
    } catch (error) {
      return res.status(400).json({
        message: "Invalid user ID"
      });
    }

    // Make sure the user actually exists
    const user = await users.findOne({
      _id: userObjectId
    });

    if (!user) {
      return res.status(401).json({
        message: "User not found. Please login again."
      });
    }

    const cartProduct = {
      userId: userObjectId,
      productId: String(productId),
      name: name.trim(),
      brand: brand?.trim() || "",
      price: Number(price),
      sizes: sizes || "",
      image: image || "",
      quantity: Number(quantity) || 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await cart.insertOne(cartProduct);

    res.status(201).json({
      message: "Product added to cart",
      cartId: result.insertedId,
      product: {
        _id: result.insertedId,
        ...cartProduct
      }
    });

  } catch (error) {

    console.error("Add to cart error:", error);

    res.status(500).json({
      message: "Failed to add product to cart",
      error: error.message
    });
  }
});


// ========================================
// GET CART
// GET /cart
// ========================================

app.get("/cart", async (req, res) => {
  try {

    const userId = req.headers["user-id"];

    if (!userId) {
      return res.status(401).json({
        message: "Please login first"
      });
    }

    let userObjectId;

    try {
      userObjectId = new ObjectId(userId);
    } catch (error) {
      return res.status(400).json({
        message: "Invalid user ID"
      });
    }

    const cartProducts = await cart
      .find({
        userId: userObjectId
      })
      .toArray();

    res.status(200).json(cartProducts);

  } catch (error) {

    console.error("Get cart error:", error);

    res.status(500).json({
      message: "Error fetching cart",
      error: error.message
    });
  }
});

// ========================================
// UPDATE CART QUANTITY
// PUT /cart/:id
// ========================================

app.put("/cart/:id", async (req, res) => {
  try {

    const id = new ObjectId(req.params.id);

    const {
      quantity
    } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        message: "Quantity must be at least 1"
      });
    }

    const result = await cart.updateOne(
      { _id: id },
      {
        $set: {
          quantity: quantity,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "Cart product not found"
      });
    }

    const updatedProduct = await cart.findOne({
      _id: id
    });

    res.status(200).json({
      message: "Cart updated successfully",
      product: updatedProduct
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error updating cart",
      error: error.message
    });
  }
});

// ========================================
// DELETE CART PRODUCT
// DELETE /cart/:id
// ========================================

app.delete("/cart/:id", async (req, res) => {
  try {

    const id = new ObjectId(req.params.id);

    const result = await cart.deleteOne({
      _id: id
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Cart product not found"
      });
    }

    res.status(200).json({
      message: "Product removed from cart"
    });

  } catch (error) {

    res.status(500).json({
      message: "Error removing product from cart",
      error: error.message
    });
  }
});

// ========================================
// CREATE PAYMENT
// POST /payment
// ========================================

// ========================================
// CREATE PAYMENT
// POST /payment
// ========================================

app.post("/payment", async (req, res) => {

  try {

    const {
      userId,
      email,
      cartId,
      productName,
      quantity,
      amount
    } = req.body;


    // ========================================
    // CHECK REQUIRED FIELDS
    // ========================================

    if (
      !userId ||
      !email ||
      !cartId ||
      !productName ||
      !quantity ||
      !amount
    ) {

      return res.status(400).json({
        message: "Missing payment information"
      });

    }


    // ========================================
    // CHECK USER
    // ========================================

    let user;

    try {

      user = await users.findOne({
        _id: new ObjectId(userId)
      });

    } catch (error) {

      return res.status(400).json({
        message: "Invalid user ID"
      });

    }


    if (!user) {

      return res.status(401).json({
        message: "User not found. Please login again."
      });

    }


    // ========================================
    // GET PRODUCT FROM CART
    // ========================================

    let cartItem;

    try {

      cartItem = await cart.findOne({
        _id: new ObjectId(cartId)
      });

    } catch (error) {

      return res.status(400).json({
        message: "Invalid cart ID"
      });

    }


    if (!cartItem) {

      return res.status(404).json({
        message: "Cart item not found"
      });

    }


    // ========================================
    // CALCULATE AMOUNT FROM CART
    // ========================================

    const cartQuantity =
      Number(cartItem.quantity) || 1;

    const productPrice =
      Number(cartItem.price);

    const totalAmount =
      productPrice * cartQuantity;


    // ========================================
    // CREATE PAYMENT RECORD
    // ========================================

    const payment = {

      userId: user._id,

      email: user.email,

      cartId: cartItem._id,

      productName: cartItem.name,

      quantity: cartQuantity,

      amount: totalAmount,

      status: "pending",

      createdAt: new Date()

    };


    // ========================================
    // PAYMENT COLLECTION
    // ========================================

    const paymentCollection =
      client
        .db("clothing_store")
        .collection("payments");


    // ========================================
    // SAVE PAYMENT
    // ========================================

    const result =
      await paymentCollection.insertOne(
        payment
      );


    // ========================================
    // SEND RESPONSE
    // ========================================

    res.status(201).json({

      message:
        "Payment created successfully",

      paymentId:
        result.insertedId,

      amount:
        totalAmount,

      email:
        user.email

    });


  } catch (error) {

    console.error(
      "Payment error:",
      error
    );

    res.status(500).json({

      message:
        "Error creating payment",

      error:
        error.message

    });

  }

});

// ========================================
// SERVER URL
// ========================================

// const PORT = process.env.PORT || 5000;

// if (process.env.NODE_ENV !== "production") {

//   connectDB()
//     .then(async () => {

//       await createAdmin();

//       app.listen(PORT, () => {

//         console.log(
//           `Server running at http://localhost:${PORT}`
//         );

//       });

//     })
//     .catch((error) => {

//       console.error(
//         "Server startup error:",
//         error
//       );

//     });

// }

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

// export default app;
export default app;
