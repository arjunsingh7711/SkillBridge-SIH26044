const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

const router = express.Router();


// ==========================================
// GET PROFILE
// ==========================================

router.get("/:id", authMiddleware, async (req, res) => {

    try {

        const loggedInUserId = String(req.user.id);
        const requestedUserId = String(req.params.id);

        console.log("========== GET PROFILE ==========");
        console.log("JWT USER ID:", loggedInUserId);
        console.log("REQUESTED ID:", requestedUserId);

        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(requestedUserId)) {

            return res.status(400).json({
                message: "Invalid user ID"
            });

        }

        // Own profile only
        if (loggedInUserId !== requestedUserId) {

            return res.status(403).json({
                message: "Access denied"
            });

        }

        const user = await User.findById(requestedUserId)
            .select("-password");

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }

        res.json(user);

    }

    catch (error) {

        console.error("GET PROFILE ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch profile"
        });

    }

});


// ==========================================
// UPDATE PROFILE
// ==========================================

router.put("/:id", authMiddleware, async (req, res) => {

    try {

        const loggedInUserId = String(req.user.id);
        const requestedUserId = String(req.params.id);

        console.log("========== UPDATE PROFILE ==========");
        console.log("JWT USER ID:", loggedInUserId);
        console.log("REQUESTED ID:", requestedUserId);
        console.log("BODY:", req.body);

        // ======================================
        // VALIDATE ID
        // ======================================

        if (!mongoose.Types.ObjectId.isValid(requestedUserId)) {

            return res.status(400).json({
                message: "Invalid user ID"
            });

        }


        // ======================================
        // OWN PROFILE ONLY
        // ======================================

        if (loggedInUserId !== requestedUserId) {

            return res.status(403).json({
                message: "Access denied"
            });

        }


        // ======================================
        // FIND USER
        // ======================================

        const user = await User.findById(requestedUserId);

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }


        // ======================================
        // BASIC DETAILS
        // ======================================

        if (req.body.name !== undefined) {

            user.name = String(req.body.name).trim();

        }


        // ======================================
        // EMAIL
        // ======================================

        if (req.body.email !== undefined) {

            user.email = String(req.body.email)
                .trim()
                .toLowerCase();

        }


        // ======================================
        // STUDENT PROFILE
        // ======================================

        if (req.body.college !== undefined) {
            user.college = req.body.college;
        }

        if (req.body.branch !== undefined) {
            user.branch = req.body.branch;
        }

        if (req.body.year !== undefined) {
            user.year = req.body.year;
        }

        if (req.body.preferredRole !== undefined) {
            user.preferredRole = req.body.preferredRole;
        }

        if (req.body.preferredLocation !== undefined) {
            user.preferredLocation =
                req.body.preferredLocation;
        }

        if (req.body.workMode !== undefined) {
            user.workMode = req.body.workMode;
        }

        if (req.body.experience !== undefined) {
            user.experience = req.body.experience;
        }

        if (req.body.bio !== undefined) {
            user.bio = req.body.bio;
        }

        if (req.body.github !== undefined) {
            user.github = req.body.github;
        }

        if (req.body.linkedin !== undefined) {
            user.linkedin = req.body.linkedin;
        }

        if (req.body.portfolio !== undefined) {
            user.portfolio = req.body.portfolio;
        }

        if (req.body.resume !== undefined) {
            user.resume = req.body.resume;
        }


        // ======================================
        // COMPANY PROFILE
        // ======================================

        if (req.body.industry !== undefined) {

            user.industry =
                String(req.body.industry).trim();

        }

        if (req.body.companySize !== undefined) {

            user.companySize =
                String(req.body.companySize).trim();

        }

        if (req.body.foundedYear !== undefined) {

            user.foundedYear =
                String(req.body.foundedYear).trim();

        }

        if (req.body.companyLocation !== undefined) {

            user.companyLocation =
                String(req.body.companyLocation).trim();

        }

        if (req.body.companyWebsite !== undefined) {

            user.companyWebsite =
                String(req.body.companyWebsite).trim();

        }

        if (req.body.companyDescription !== undefined) {

            user.companyDescription =
                String(req.body.companyDescription).trim();

        }

        if (req.body.hiringRoles !== undefined) {

            user.hiringRoles =
                String(req.body.hiringRoles).trim();

        }

        if (req.body.preferredSkills !== undefined) {

            user.preferredSkills =
                String(req.body.preferredSkills).trim();

        }

        if (req.body.companyExperience !== undefined) {

            user.companyExperience =
                String(req.body.companyExperience).trim();

        }

        if (req.body.companyWorkMode !== undefined) {

            user.companyWorkMode =
                String(req.body.companyWorkMode).trim();

        }

        if (req.body.companyLinkedin !== undefined) {

            user.companyLinkedin =
                String(req.body.companyLinkedin).trim();

        }

        if (req.body.companyGithub !== undefined) {

            user.companyGithub =
                String(req.body.companyGithub).trim();

        }

        if (req.body.companyLogo !== undefined) {

            user.companyLogo =
                String(req.body.companyLogo).trim();

        }


        // ======================================
        // SAVE TO MONGODB
        // ======================================

        await user.save();


        console.log("PROFILE SAVED SUCCESSFULLY");
        console.log("COMPANY DATA:", {
            industry: user.industry,
            companySize: user.companySize,
            foundedYear: user.foundedYear,
            companyLocation: user.companyLocation,
            companyWebsite: user.companyWebsite,
            companyDescription: user.companyDescription,
            hiringRoles: user.hiringRoles,
            preferredSkills: user.preferredSkills,
            companyExperience: user.companyExperience,
            companyWorkMode: user.companyWorkMode,
            companyLinkedin: user.companyLinkedin,
            companyGithub: user.companyGithub
        });


        // ======================================
        // REMOVE PASSWORD
        // ======================================

        const updatedUser = user.toObject();

        delete updatedUser.password;


        // ======================================
        // RESPONSE
        // ======================================

        return res.status(200).json({

            message: "Profile updated successfully",

            user: updatedUser

        });

    }

    catch (error) {

        console.error(
            "UPDATE PROFILE ERROR:",
            error
        );


        // Duplicate email
        if (error.code === 11000) {

            return res.status(400).json({
                message: "Email already exists"
            });

        }


        // Mongoose validation
        if (error.name === "ValidationError") {

            return res.status(400).json({
                message: error.message
            });

        }


        return res.status(500).json({
            message: "Failed to update profile",
            error: error.message
        });

    }

});


module.exports = router;
