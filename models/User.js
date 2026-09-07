const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        // ========================================
        // BASIC ACCOUNT DETAILS
        // ========================================

        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: [
                "student",
                "college",
                "company",
                "admin"
            ],
            default: "student"
        },


        // ========================================
        // STUDENT EDUCATION
        // ========================================

        college: {
            type: String,
            default: "",
            trim: true
        },

        branch: {
            type: String,
            default: "",
            trim: true
        },

        year: {
            type: String,
            default: ""
        },


        // ========================================
        // STUDENT CAREER PREFERENCES
        // ========================================

        preferredRole: {
            type: String,
            default: "",
            trim: true
        },

        preferredLocation: {
            type: String,
            default: "",
            trim: true
        },

        workMode: {
            type: String,
            enum: [
                "",
                "Remote",
                "On-site",
                "Hybrid"
            ],
            default: ""
        },

        experience: {
            type: String,
            default: "Fresher"
        },


        // ========================================
        // STUDENT ABOUT
        // ========================================

        bio: {
            type: String,
            default: "",
            trim: true
        },


        // ========================================
        // STUDENT SOCIAL LINKS
        // ========================================

        github: {
            type: String,
            default: "",
            trim: true
        },

        linkedin: {
            type: String,
            default: "",
            trim: true
        },

        portfolio: {
            type: String,
            default: "",
            trim: true
        },


        // ========================================
        // RESUME
        // ========================================

        resume: {
            type: String,
            default: "",
            trim: true
        },


        // ========================================
        // COMPANY PROFILE
        // ========================================

        industry: {
            type: String,
            default: "",
            trim: true
        },

        companySize: {
            type: String,
            default: "",
            trim: true
        },

        foundedYear: {
            type: String,
            default: "",
            trim: true
        },

        companyLocation: {
            type: String,
            default: "",
            trim: true
        },

        companyWebsite: {
            type: String,
            default: "",
            trim: true
        },

        companyDescription: {
            type: String,
            default: "",
            trim: true
        },

        hiringRoles: {
            type: String,
            default: "",
            trim: true
        },

        preferredSkills: {
            type: String,
            default: "",
            trim: true
        },

        companyExperience: {
            type: String,
            default: "Fresher"
        },

        companyWorkMode: {
            type: String,
            enum: [
                "",
                "Remote",
                "On-site",
                "Hybrid"
            ],
            default: ""
        },

        companyLinkedin: {
            type: String,
            default: "",
            trim: true
        },

        companyGithub: {
            type: String,
            default: "",
            trim: true
        },

        companyLogo: {
            type: String,
            default: "",
            trim: true
        }
    },

    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);