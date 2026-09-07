const dotenv = require("dotenv");

dotenv.config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const skillRoutes = require("./routes/skillRoutes");
const profileRoutes = require("./routes/profileRoutes");
const opportunityRoutes = require("./routes/opportunityRoutes");
const applicationRoutes = require("./routes/applicationRoutes");

const app = express();


// ========================================
// MIDDLEWARE
// ========================================

app.use(cors());

app.use(express.json());

app.use(express.static("public"));


// ========================================
// DATABASE
// ========================================

connectDB();


// ========================================
// API ROUTES
// ========================================

app.use("/api/auth", authRoutes);

app.use("/api/skills", skillRoutes);

app.use("/api/profile", profileRoutes);

app.use("/api/opportunities", opportunityRoutes);
app.use("/api/applications", applicationRoutes);

// ========================================
// TEST ROUTE
// ========================================

app.get("/", (req, res) => {

    res.send("SkillBridge Server is Running 🚀");

});


// ========================================
// SERVER
// ========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(
        `SkillBridge Server running on port ${PORT}`
    );

});

