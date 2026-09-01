import dns from "node:dns/promises";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import { MongoClient, ObjectId } from "mongodb";
import "dotenv/config";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();

// ========================================
// CORS
// ========================================
// ========================================
// CORS
// ========================================
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://my-all-3397.vercel.app",
    "https://my-all-3397-r5dhng7e0-gospels-projects-8582e4e3.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "user-id"],
  credentials: false
}));

app.use(express.json());
// app.use(express.json());
// app.use(express.json());
// Handle browser preflight requests


// ========================================
// JSON
// ========================================




// ========================================
// MONGODB
// ========================================

const client = new MongoClient(
  process.env.MONGODB_URI
);

let db;

async function connectDB() {

  if (!db) {

    if (!process.env.MONGODB_URI) {

      throw new Error(
        "MONGODB_URI is missing"
      );

    }

    await client.connect();

    db = client.db("davira");

    console.log(
      "MongoDB connected"
    );
  }

  return db;
}


// ========================================
// TEST ROUTE
// ========================================

app.get("/", (req, res) => {

  res.status(200).json({
    message:
      "Davira backend is working"
  });

});


// ========================================
// GET CART
// ========================================

app.get("/cart", async (req, res) => {

  try {

    const userId =
      req.headers["user-id"];

    if (!userId) {

      return res.status(400).json({
        message:
          "User ID is required"
      });

    }

    if (!ObjectId.isValid(userId)) {

      return res.status(400).json({
        message:
          "Invalid user ID"
      });

    }

    const database =
      await connectDB();

    const cartCollection =
      database.collection("cart");

    const cart =
      await cartCollection
        .find({
          userId:
            new ObjectId(userId)
        })
        .sort({
          createdAt: -1
        })
        .toArray();

    res.status(200).json(cart);

  } catch (error) {

    console.error(
      "GET CART ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to get cart"
    });

  }

});


// ========================================
// ADD PRODUCT TO CART
// ========================================

app.post("/cart", async (req, res) => {

  try {

    const {
      userId,
      productId,
      name,
      brand,
      price,
      sizes,
      image,
      quantity
    } = req.body;


    // ========================================
    // VALIDATE REQUIRED DATA
    // ========================================

    if (
      !userId ||
      productId === undefined ||
      !name ||
      !brand ||
      price === undefined ||
      !sizes ||
      !image
    ) {

      return res.status(400).json({
        message:
          "Missing product information"
      });

    }


    // ========================================
    // VALIDATE USER ID
    // ========================================

    if (!ObjectId.isValid(userId)) {

      return res.status(400).json({
        message:
          "Invalid user ID"
      });

    }


    const numericProductId =
      Number(productId);

    const numericPrice =
      Number(price);

    const numericQuantity =
      Number(quantity || 1);


    if (
      !Number.isInteger(
        numericProductId
      )
    ) {

      return res.status(400).json({
        message:
          "Invalid product ID"
      });

    }


    if (
      !Number.isFinite(
        numericPrice
      ) ||
      numericPrice < 0
    ) {

      return res.status(400).json({
        message:
          "Invalid product price"
      });

    }


    if (
      !Number.isInteger(
        numericQuantity
      ) ||
      numericQuantity < 1
    ) {

      return res.status(400).json({
        message:
          "Invalid quantity"
      });

    }


    const database =
      await connectDB();

    const cartCollection =
      database.collection("cart");


    const mongoUserId =
      new ObjectId(userId);


    // ========================================
    // CHECK EXISTING PRODUCT
    // ========================================

    const existingProduct =
      await cartCollection.findOne({
        userId: mongoUserId,
        productId: numericProductId
      });


    // ========================================
    // PRODUCT ALREADY EXISTS
    // ========================================

    if (existingProduct) {

      const newQuantity =
        Number(
          existingProduct.quantity || 1
        ) + numericQuantity;


      const updatedProduct =
        await cartCollection.findOneAndUpdate(

          {
            _id:
              existingProduct._id
          },

          {
            $set: {
              quantity:
                newQuantity,

              updatedAt:
                new Date()
            }
          },

          {
            returnDocument:
              "after"
          }

        );


      return res.status(200).json({

        message:
          "Product quantity updated",

        cartItem:
          updatedProduct

      });

    }


    // ========================================
    // CREATE NEW CART ITEM
    // ========================================

    const newCartItem = {

      userId:
        mongoUserId,

      productId:
        numericProductId,

      name:
        name.trim(),

      brand:
        brand.trim(),

      price:
        numericPrice,

      sizes:
        sizes,

      image:
        image,

      quantity:
        numericQuantity,

      createdAt:
        new Date(),

      updatedAt:
        new Date()

    };


    const result =
      await cartCollection.insertOne(
        newCartItem
      );


    // ========================================
    // RESPONSE
    // ========================================

    res.status(201).json({

      message:
        "Product added to cart successfully",

      cartItem: {

        _id:
          result.insertedId,

        ...newCartItem

      }

    });

  } catch (error) {

    console.error(
      "ADD TO CART ERROR:",
      error
    );

    res.status(500).json({

      message:
        "Failed to add product to cart"

    });

  }

});


// ========================================
// UPDATE CART QUANTITY
// ========================================

app.put("/cart/:id", async (req, res) => {

  try {

    const { id } =
      req.params;

    const {
      quantity
    } = req.body;


    // ========================================
    // VALIDATE CART ID
    // ========================================

    if (!ObjectId.isValid(id)) {

      return res.status(400).json({
        message:
          "Invalid cart item ID"
      });

    }


    const newQuantity =
      Number(quantity);


    // ========================================
    // VALIDATE QUANTITY
    // ========================================

    if (
      !Number.isInteger(
        newQuantity
      ) ||
      newQuantity < 1
    ) {

      return res.status(400).json({
        message:
          "Quantity must be at least 1"
      });

    }


    const database =
      await connectDB();

    const cartCollection =
      database.collection("cart");


    // ========================================
    // UPDATE
    // ========================================

    const updatedCartItem =
      await cartCollection.findOneAndUpdate(

        {
          _id:
            new ObjectId(id)
        },

        {
          $set: {

            quantity:
              newQuantity,

            updatedAt:
              new Date()

          }
        },

        {
          returnDocument:
            "after"
        }

      );


    if (!updatedCartItem) {

      return res.status(404).json({
        message:
          "Cart item not found"
      });

    }


    res.status(200).json({

      message:
        "Cart quantity updated",

      cartItem:
        updatedCartItem

    });

  } catch (error) {

    console.error(
      "UPDATE CART ERROR:",
      error
    );

    res.status(500).json({

      message:
        "Failed to update cart"

    });

  }

});


// ========================================
// DELETE CART ITEM
// ========================================

app.delete("/cart/:id", async (req, res) => {

  try {

    const { id } =
      req.params;


    // ========================================
    // VALIDATE ID
    // ========================================

    if (!ObjectId.isValid(id)) {

      return res.status(400).json({
        message:
          "Invalid cart item ID"
      });

    }


    const database =
      await connectDB();

    const cartCollection =
      database.collection("cart");


    // ========================================
    // DELETE
    // ========================================

    const result =
      await cartCollection.deleteOne({

        _id:
          new ObjectId(id)

      });


    if (
      result.deletedCount === 0
    ) {

      return res.status(404).json({

        message:
          "Cart item not found"

      });

    }


    res.status(200).json({

      message:
        "Cart item deleted successfully"

    });

  } catch (error) {

    console.error(
      "DELETE CART ERROR:",
      error
    );

    res.status(500).json({

      message:
        "Failed to delete cart item"

    });

  }

});


// ========================================
// GET REVIEWS FOR PRODUCT
// ========================================

app.get(
  "/reviews/:productId",
  async (req, res) => {

    try {

      const {
        productId
      } = req.params;


      if (!productId) {

        return res.status(400).json({

          message:
            "Product ID is required"

        });

      }


      const numericProductId =
        Number(productId);


      if (
        !Number.isInteger(
          numericProductId
        )
      ) {

        return res.status(400).json({

          message:
            "Invalid product ID"

        });

      }


      const database =
        await connectDB();

      const reviewsCollection =
        database.collection(
          "reviews"
        );


      const reviews =
        await reviewsCollection
          .find({

            productId:
              numericProductId

          })
          .sort({

            createdAt:
              -1

          })
          .toArray();


      res.status(200).json(
        reviews
      );

    } catch (error) {

      console.error(
        "GET REVIEWS ERROR:",
        error
      );

      res.status(500).json({

        message:
          "Failed to get reviews"

      });

    }

  }
);


// ========================================
// ADD REVIEW
// ========================================

app.post(
  "/reviews",
  async (req, res) => {

    try {

      const {
        productId,
        productName,
        name,
        rating,
        comment
      } = req.body;


      // ========================================
      // REQUIRED DATA
      // ========================================

      if (
        productId === undefined ||
        !name ||
        rating === undefined ||
        !comment
      ) {

        return res.status(400).json({

          message:
            "Please provide all review information"

        });

      }


      const cleanName =
        name.trim();

      const cleanComment =
        comment.trim();


      if (
        !cleanName ||
        !cleanComment
      ) {

        return res.status(400).json({

          message:
            "Name and comment cannot be empty"

        });

      }


      // ========================================
      // PRODUCT ID
      // ========================================

      const reviewProductId =
        Number(productId);


      if (
        !Number.isInteger(
          reviewProductId
        )
      ) {

        return res.status(400).json({

          message:
            "Invalid product ID"

        });

      }


      // ========================================
      // RATING
      // ========================================

      const reviewRating =
        Number(rating);


      if (
        !Number.isInteger(
          reviewRating
        ) ||
        reviewRating < 1 ||
        reviewRating > 5
      ) {

        return res.status(400).json({

          message:
            "Rating must be between 1 and 5"

        });

      }


      const database =
        await connectDB();

      const reviewsCollection =
        database.collection(
          "reviews"
        );


      // ========================================
      // CREATE REVIEW
      // ========================================

      const newReview = {

        productId:
          reviewProductId,

        productName:
          productName?.trim() ||
          "Product",

        name:
          cleanName,

        rating:
          reviewRating,

        comment:
          cleanComment,

        createdAt:
          new Date(),

        updatedAt:
          new Date()

      };


      const result =
        await reviewsCollection.insertOne(
          newReview
        );


      res.status(201).json({

        message:
          "Review submitted successfully",

        review: {

          _id:
            result.insertedId,

          ...newReview

        }

      });

    } catch (error) {

      console.error(
        "ADD REVIEW ERROR:",
        error
      );

      res.status(500).json({

        message:
          "Failed to submit review"

      });

    }

  }
);


// ========================================
// DELETE REVIEW
// ========================================

app.delete(
  "/reviews/:id",
  async (req, res) => {

    try {

      const { id } =
        req.params;


      if (
        !ObjectId.isValid(id)
      ) {

        return res.status(400).json({

          message:
            "Invalid review ID"

        });

      }


      const database =
        await connectDB();

      const reviewsCollection =
        database.collection(
          "reviews"
        );


      const result =
        await reviewsCollection.deleteOne({

          _id:
            new ObjectId(id)

        });


      if (
        result.deletedCount === 0
      ) {

        return res.status(404).json({

          message:
            "Review not found"

        });

      }


      res.status(200).json({

        message:
          "Review deleted successfully"

      });

    } catch (error) {

      console.error(
        "DELETE REVIEW ERROR:",
        error
      );

      res.status(500).json({

        message:
          "Failed to delete review"

      });

    }

  }
);


// ========================================
// REGISTER
// ========================================

app.post(
  "/register",
  async (req, res) => {

    try {

      const {
        name,
        email,
        password
      } = req.body;


      // ========================================
      // REQUIRED DATA
      // ========================================

      if (
        !name ||
        !email ||
        !password
      ) {

        return res.status(400).json({

          message:
            "Please provide name, email and password"

        });

      }


      const cleanName =
        name.trim();

      const cleanEmail =
        email
          .trim()
          .toLowerCase();


      // ========================================
      // VALIDATE NAME
      // ========================================

      if (!cleanName) {

        return res.status(400).json({

          message:
            "Name cannot be empty"

        });

      }


      // ========================================
      // VALIDATE EMAIL
      // ========================================

      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


      if (
        !emailRegex.test(
          cleanEmail
        )
      ) {

        return res.status(400).json({

          message:
            "Please provide a valid email address"

        });

      }


      // ========================================
      // VALIDATE PASSWORD
      // ========================================

      if (
        password.length < 6
      ) {

        return res.status(400).json({

          message:
            "Password must be at least 6 characters"

        });

      }


      // ========================================
      // DATABASE
      // ========================================

      const database =
        await connectDB();

      const usersCollection =
        database.collection(
          "users"
        );


      // ========================================
      // CHECK EXISTING USER
      // ========================================

      const existingUser =
        await usersCollection.findOne({

          email:
            cleanEmail

        });


      if (existingUser) {

        return res.status(409).json({

          message:
            "An account with this email already exists"

        });

      }


      // ========================================
      // HASH PASSWORD
      // ========================================

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );


      // ========================================
      // CREATE USER
      // ========================================

      const newUser = {

        name:
          cleanName,

        email:
          cleanEmail,

        password:
          hashedPassword,

        role:
          "user",

        createdAt:
          new Date(),

        updatedAt:
          new Date()

      };


      const result =
        await usersCollection.insertOne(
          newUser
        );


      // ========================================
      // RESPONSE
      // ========================================

      res.status(201).json({

        message:
          "Registration successful",

        user: {

          id:
            result.insertedId.toString(),

          name:
            cleanName,

          email:
            cleanEmail,

          role:
            "user"

        }

      });

    } catch (error) {

      console.error(
        "REGISTER ERROR:",
        error
      );

      res.status(500).json({

        message:
          "Registration failed"

      });

    }

  }
);


// ========================================
// LOGIN
// ========================================

app.post(
  "/login",
  async (req, res) => {

    try {

      const {
        email,
        password
      } = req.body;


      // ========================================
      // REQUIRED DATA
      // ========================================

      if (
        !email ||
        !password
      ) {

        return res.status(400).json({

          message:
            "Please provide email and password"

        });

      }


      const cleanEmail =
        email
          .trim()
          .toLowerCase();


      // ========================================
      // DATABASE
      // ========================================

      const database =
        await connectDB();

      const usersCollection =
        database.collection(
          "users"
        );


      // ========================================
      // FIND USER
      // ========================================

      const user =
        await usersCollection.findOne({

          email:
            cleanEmail

        });


      if (!user) {

        return res.status(401).json({

          message:
            "Invalid email or password"

        });

      }


      // ========================================
      // CHECK PASSWORD
      // ========================================

      const passwordCorrect =
        await bcrypt.compare(

          password,

          user.password

        );


      if (!passwordCorrect) {

        return res.status(401).json({

          message:
            "Invalid email or password"

        });

      }


      // ========================================
      // LOGIN SUCCESS
      // ========================================

      res.status(200).json({

        message:
          "Login successful",

        user: {

          id:
            user._id.toString(),

          name:
            user.name,

          email:
            user.email,

          role:
            user.role ||
            "user"

        }

      });

    } catch (error) {

      console.error(
        "LOGIN ERROR:",
        error
      );

      res.status(500).json({

        message:
          "Login failed"

      });

    }

  }
);


// ========================================
// CREATE ADMIN ACCOUNT
// ========================================

async function createAdmin() {

  try {

    const adminEmail =
      process.env.ADMIN_EMAIL
        ?.trim()
        .toLowerCase();

    const adminPassword =
      process.env.ADMIN_PASSWORD;


    // ========================================
    // CHECK ENVIRONMENT VARIABLES
    // ========================================

    if (
      !adminEmail ||
      !adminPassword
    ) {

      console.log(
        "ADMIN_EMAIL or ADMIN_PASSWORD is missing. Admin setup skipped."
      );

      return;

    }


    const database =
      await connectDB();

    const usersCollection =
      database.collection(
        "users"
      );


    // ========================================
    // CHECK ADMIN
    // ========================================

    const existingAdmin =
      await usersCollection.findOne({

        email:
          adminEmail

      });


    if (existingAdmin) {

      console.log(
        "Admin account already exists."
      );

      return;

    }


    // ========================================
    // HASH ADMIN PASSWORD
    // ========================================

    const hashedPassword =
      await bcrypt.hash(
        adminPassword,
        10
      );


    // ========================================
    // CREATE ADMIN
    // ========================================

    await usersCollection.insertOne({

      name:
        "Davira Admin",

      email:
        adminEmail,

      password:
        hashedPassword,

      role:
        "admin",

      createdAt:
        new Date(),

      updatedAt:
        new Date()

    });


    console.log(
      "Admin account created successfully."
    );

  } catch (error) {

    console.error(
      "CREATE ADMIN ERROR:",
      error
    );

  }

}


// ========================================
// NEWSLETTER
// ========================================

app.post(
  "/newsletter",
  async (req, res) => {

    try {

      const {
        email
      } = req.body;


      if (!email) {

        return res.status(400).json({

          message:
            "Please enter your email"

        });

      }


      const cleanEmail =
        email
          .trim()
          .toLowerCase();


      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


      if (
        !emailRegex.test(
          cleanEmail
        )
      ) {

        return res.status(400).json({

          message:
            "Please enter a valid email address"

        });

      }


      const database =
        await connectDB();

      const newsletterCollection =
        database.collection(
          "newsletter"
        );


      // ========================================
      // CHECK EXISTING SUBSCRIBER
      // ========================================

      const existingSubscriber =
        await newsletterCollection.findOne({

          email:
            cleanEmail

        });


      if (existingSubscriber) {

        return res.status(409).json({

          message:
            "This email is already subscribed"

        });

      }


      // ========================================
      // SAVE SUBSCRIBER
      // ========================================

      await newsletterCollection.insertOne({

        email:
          cleanEmail,

        createdAt:
          new Date()

      });


      res.status(201).json({

        message:
          "Successfully subscribed to our newsletter"

      });

    } catch (error) {

      console.error(
        "NEWSLETTER ERROR:",
        error
      );

      res.status(500).json({

        message:
          "Failed to subscribe to newsletter"

      });

    }

  }
);


// ========================================
// CREATE PAYMENT RECORD
// ========================================

app.post(
  "/payment",
  async (req, res) => {

    try {

      const {
        userId,
        email,
        cartId,
        productName,
        quantity
      } = req.body;


      // ========================================
      // REQUIRED DATA
      // ========================================

      if (
        !userId ||
        !email ||
        !cartId
      ) {

        return res.status(400).json({

          message:
            "Missing payment information"

        });

      }


      // ========================================
      // VALIDATE IDs
      // ========================================

      if (
        !ObjectId.isValid(userId)
      ) {

        return res.status(400).json({

          message:
            "Invalid user ID"

        });

      }


      if (
        !ObjectId.isValid(cartId)
      ) {

        return res.status(400).json({

          message:
            "Invalid cart ID"

        });

      }


      const database =
        await connectDB();

      const cartCollection =
        database.collection(
          "cart"
        );

      const paymentCollection =
        database.collection(
          "payments"
        );


      // ========================================
      // FIND CART ITEM
      // ========================================

      const cartItem =
        await cartCollection.findOne({

          _id:
            new ObjectId(cartId),

          userId:
            new ObjectId(userId)

        });


      if (!cartItem) {

        return res.status(404).json({

          message:
            "Cart item not found"

        });

      }


      // ========================================
      // CALCULATE PRICE ON SERVER
      // ========================================

      const itemQuantity =
        Number(quantity) ||
        Number(cartItem.quantity) ||
        1;

      const itemPrice =
        Number(cartItem.price);


      if (
        !Number.isFinite(
          itemPrice
        ) ||
        itemPrice < 0
      ) {

        return res.status(400).json({

          message:
            "Invalid product price"

        });

      }


      if (
        !Number.isInteger(
          itemQuantity
        ) ||
        itemQuantity < 1
      ) {

        return res.status(400).json({

          message:
            "Invalid quantity"

        });

      }


      const amount =
        itemPrice *
        itemQuantity;


      // ========================================
      // CREATE PAYMENT RECORD
      // ========================================

      const payment = {

        userId:
          new ObjectId(userId),

        email:
          email
            .trim()
            .toLowerCase(),

        cartId:
          new ObjectId(cartId),

        productName:
          productName ||
          cartItem.name,

        quantity:
          itemQuantity,

        amount:
          amount,

        status:
          "pending",

        createdAt:
          new Date(),

        updatedAt:
          new Date()

      };


      const result =
        await paymentCollection.insertOne(
          payment
        );


      // ========================================
      // RESPONSE
      // ========================================

      res.status(201).json({

        message:
          "Payment record created",

        payment: {

          id:
            result.insertedId.toString(),

          amount:
            amount,

          email:
            payment.email,

          status:
            "pending"

        }

      });

    } catch (error) {

      console.error(
        "CREATE PAYMENT ERROR:",
        error
      );

      res.status(500).json({

        message:
          "Failed to create payment"

      });

    }

  }
);


// ========================================
// VERIFY PAYSTACK PAYMENT
// ========================================

app.post(
  "/payment/verify",
  async (req, res) => {

    try {

      const {
        reference,
        paymentId
      } = req.body;


      if (
        !reference ||
        !paymentId
      ) {

        return res.status(400).json({

          message:
            "Payment reference and payment ID are required"

        });

      }


      if (
        !ObjectId.isValid(
          paymentId
        )
      ) {

        return res.status(400).json({

          message:
            "Invalid payment ID"

        });

      }


      if (
        !process.env.PAYSTACK_SECRET_KEY
      ) {

        return res.status(500).json({

          message:
            "Paystack secret key is missing"

        });

      }


      // ========================================
      // VERIFY WITH PAYSTACK
      // ========================================

      const paystackResponse =
        await fetch(

          `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,

          {

            method:
              "GET",

            headers: {

              Authorization:
                `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,

              "Content-Type":
                "application/json"

            }

          }

        );


      const paystackData =
        await paystackResponse.json();


      if (
        !paystackResponse.ok ||
        !paystackData.status
      ) {

        return res.status(400).json({

          message:
            paystackData.message ||
            "Payment verification failed"

        });

      }


      const transaction =
        paystackData.data;


      if (
        transaction.status !==
        "success"
      ) {

        return res.status(400).json({

          message:
            "Payment was not successful"

        });

      }


      const database =
        await connectDB();

      const paymentCollection =
        database.collection(
          "payments"
        );


      // ========================================
      // FIND PAYMENT
      // ========================================

      const payment =
        await paymentCollection.findOne({

          _id:
            new ObjectId(
              paymentId
            )

        });


      if (!payment) {

        return res.status(404).json({

          message:
            "Payment record not found"

        });

      }


      // ========================================
      // CHECK PAYMENT AMOUNT
      // ========================================

      const expectedAmount =
        Number(payment.amount) *
        100;


      const paidAmount =
        Number(transaction.amount);


      if (
        paidAmount !==
        expectedAmount
      ) {

        return res.status(400).json({

          message:
            "Payment amount does not match"

        });

      }


      // ========================================
      // UPDATE PAYMENT
      // ========================================

      await paymentCollection.updateOne(

        {
          _id:
            new ObjectId(
              paymentId
            )

        },

        {

          $set: {

            status:
              "paid",

            reference:
              reference,

            paystackTransactionId:
              transaction.id,

            paidAt:
              new Date(),

            updatedAt:
              new Date()

          }

        }

      );


      // ========================================
      // DELETE PAID CART ITEM
      // ========================================

      const cartCollection =
        database.collection(
          "cart"
        );


      await cartCollection.deleteOne({

        _id:
          payment.cartId,

        userId:
          payment.userId

      });


      // ========================================
      // RESPONSE
      // ========================================

      res.status(200).json({

        message:
          "Payment verified successfully",

        payment: {

          id:
            paymentId,

          reference:
            reference,

          amount:
            payment.amount,

          status:
            "paid"

        }

      });

    } catch (error) {

      console.error(
        "VERIFY PAYMENT ERROR:",
        error
      );

      res.status(500).json({

        message:
          "Failed to verify payment"

      });

    }

  }
);


// ========================================
// SERVER
// ========================================

const PORT =
  process.env.PORT ||
  5000;


// ========================================
// LOCAL DEVELOPMENT
// ========================================

if (
  process.env.NODE_ENV !==
  "production"
) {

  app.listen(
    PORT,
    () => {

      console.log(
        `Server running at http://localhost:${PORT}`
      );

    }
  );

}


// ========================================
// INITIALIZE ADMIN
// ========================================

createAdmin();


// ========================================
// EXPORT FOR VERCEL
// ========================================

export default app;