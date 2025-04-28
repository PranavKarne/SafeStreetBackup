require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const connectDB = require("./config/db");
const RoadImage = require("./models/RoadImage");
const User = require("./models/User");

const app = express();
connectDB();

// ✅ CORS Configuration
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// Handle preflight requests
app.options('*', cors());

// Add error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
});

// ✅ Middleware for JSON
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Remove local uploads directory handling
// const uploadsPath = path.join(__dirname, "uploads");
// console.log(`Serving static files from: ${uploadsPath}`);

// // Ensure uploads directory exists
// if (!fs.existsSync(uploadsPath)) {
//     fs.mkdirSync(uploadsPath, { recursive: true });
//     console.log(`Created uploads directory at: ${uploadsPath}`);
// }

// // Serve static files with better error handling
// app.use("/uploads", (req, res, next) => {
//     const filePath = path.join(uploadsPath, req.path);
//     console.log(`Attempting to serve file: ${filePath}`);
    
//     if (!fs.existsSync(filePath)) {
//         console.log(`File not found: ${filePath}`);
//         return res.status(404).json({ error: "File not found" });
//     }
    
//     next();
// }, express.static(uploadsPath, {
//     fallthrough: false,
//     index: false,
//     redirect: false
// }));

// ✅ Multer Storage (Saves Images in `uploads/`)
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         if (!fs.existsSync(uploadsPath)) {
//             fs.mkdirSync(uploadsPath, { recursive: true });
//         }
//         console.log(`Saving file to directory: ${uploadsPath}`);
//         cb(null, uploadsPath);
//     },
//     filename: (req, file, cb) => {
//         const filename = `${Date.now()}_${file.originalname}`;
//         console.log(`Generated filename: ${filename}`);
//         cb(null, filename);
//     }
// });
// const upload = multer({ storage });

// === Backend Endpoint Modification (Accepting data from Frontend) ===

// Modify /api/upload Endpoint to only store data received from frontend
app.post("/api/upload", async (req, res) => {
    console.log("=== Starting Image Upload Process ===");
    try {
        const { 
            imageName, 
            imageUrl, 
            classification, 
            confidence, 
            userEmail, 
            predictedImageUrl 
        } = req.body;

        // Fetch user's profile to get their address details
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        // Check if user has address details
        if (!user.address || !user.city || !user.pincode) {
            return res.status(400).json({ 
                success: false, 
                error: "Please complete your address details in My Details section before uploading images." 
            });
        }
       
        // Create new image with user's address details
        const newImage = new RoadImage({
            imageName: imageName,
            imageUrl: imageUrl, // Use the direct imageUrl from the request
            classification: classification, 
            confidence: confidence,
            userEmail: userEmail,
            predictedImageUrl: predictedImageUrl,
            roadLocation: {
                address: user.address,
                city: user.city,
                pincode: user.pincode
            }
        });

        // Save the image
        const savedImage = await newImage.save();
        console.log("Image saved successfully with location:", savedImage.roadLocation);

        res.json({ 
            success: true, 
            message: "Image details saved successfully.", 
            imageId: savedImage._id,
            imageUrl: savedImage.imageUrl,
            roadLocation: savedImage.roadLocation
        });

    } catch (error) {
        console.error("Error saving image:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Ensure the separate classification endpoint is removed or commented out
/*
app.post("/api/reports/:id/classify", async (req, res) => {
    // ... logic ...
});
*/

app.get("/api/images", async (req, res) => {
    try {
        const images = await RoadImage.find({});
        console.log("📂 Retrieved Images from MongoDB:", images); // ✅ Debugging

        if (images.length === 0) {
            console.log("❌ No images found in MongoDB");
            return res.json({ success: true, images: [] });
        }

        res.json({ success: true, images });
    } catch (error) {
        console.error("❌ Error fetching images:", error);
        res.status(500).json({ error: "Failed to fetch images" });
    }
});


// ✅ User Authentication Routes
app.post("/api/auth/register", async (req, res) => {
    try {
        const { firstName, lastName, phoneNumber, email, password, userType } = req.body;
        
        // Basic validation for all users
        if (!firstName || !lastName || !phoneNumber || !email || !password || !userType) {
            return res.status(400).json({ error: "Please provide all required fields" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user based on type
        const newUser = new User({
            firstName,
            lastName,
            phoneNumber,
            email,
            password: hashedPassword,
            role: userType, // This sets the role in the database
            // Only add address fields for regular users
            ...(userType === 'user' ? {
                address: '',
                city: '',
                pincode: ''
            } : {})
        });

        await newUser.save();
        res.json({ success: true, message: "User registered successfully" });
    } catch (error) {
        console.error("❌ Registration error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Log the user data for debugging
        console.log('User found:', {
            email: user.email,
            role: user.role
        });

        // Determine the user type based on role
        const userType = user.role;

        // Prepare response payload
        const responsePayload = { 
            success: true, 
            userType: userType,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber
        };
        
        // Only include address fields for regular users
        if (userType === 'user') {
            responsePayload.address = user.address;
            responsePayload.city = user.city;
            responsePayload.pincode = user.pincode;
        }
        
        // Log the response payload
        console.log('Login response payload:', responsePayload);
        
        // Send the response
        res.json(responsePayload);

    } catch (error) {
        console.error("❌ Login error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ User Profile Routes
app.get("/api/user", async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        const user = await User.findOne({ email }).select('-password'); // Exclude password
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        // User data already excludes password due to .select('-password')
        res.json({ success: true, user }); // Send the whole user object (without password)

    } catch (error) {
        console.error("❌ User profile error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/api/uploads", async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        const uploads = await RoadImage.find({ userEmail: email })
            .sort({ uploadedAt: -1 }); // Sort by most recent first

        // Log the uploads to see what URLs are being stored
        console.log('Uploads found:', JSON.stringify(uploads, null, 2));

        res.json({ success: true, uploads });
    } catch (error) {
        console.error("❌ Uploads fetch error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Update User Details Endpoint
app.put("/api/user/details", async (req, res) => {
  console.log("=== User Details Update Request ===");
  console.log("Request body:", req.body);
  console.log("Request headers:", req.headers);
  
  try {
    // Extract details including firstName and lastName
    const { email, firstName, lastName, phoneNumber, address, city, pincode } = req.body;

    // Validate email presence
    if (!email) {
      console.log("❌ Email is required for update");
      return res.status(400).json({ error: "Email is required to update details" });
    }

    // Prepare update object
    const updateData = {};
    // Add fields to updateData only if they are provided in the request body
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (pincode !== undefined) updateData.pincode = pincode;

    console.log("Update data prepared:", updateData);

    // Prevent updating with empty required fields if they are provided as empty strings
    if (updateData.firstName === '') delete updateData.firstName; 
    if (updateData.lastName === '') delete updateData.lastName;

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      console.log("❌ No update data provided");
      return res.status(400).json({ error: "No update data provided" });
    }

    console.log("Attempting to find and update user:", email);
    
    // Find user by email and update specified fields
    const updatedUser = await User.findOneAndUpdate(
      { email: email },       // Find condition
      { $set: updateData },    // Update operation using $set
      { 
        new: true,             // Return the modified document
        runValidators: true    // Ensure schema validation rules are run on update
      } 
    ).select('-password');      // Exclude password from the result

    if (!updatedUser) {
      console.log(`❌ User not found for update: ${email}`);
      return res.status(404).json({ error: "User not found" });
    }

    console.log(`✅ User details updated for: ${email}`);
    console.log("Updated user data:", updatedUser);
    
    res.json({ success: true, message: "Details updated successfully", user: updatedUser });

  } catch (error) {
    console.error("❌ Error updating user details:", error);
    if (error.name === 'ValidationError') {
      // Construct a more informative error message from validation errors
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    res.status(500).json({ error: "Server error while updating details", details: error.message });
  }
});

// ✅ Health Check Endpoint
app.get('/health', (req, res) => {
    console.log('Health check request received');
    res.json({ 
        status: 'ok',
        server: 'running',
        port: process.env.PORT || 5000,
        timestamp: new Date().toISOString()
    });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`✅ Server URL: http://localhost:${PORT}`);
    console.log(`✅ MongoDB URI: ${process.env.MONGO_URI}`);
    console.log(`✅ Database Name: ${process.env.DB_NAME}`);
    console.log(`✅ Health check available at: http://localhost:${PORT}/health`);
});
