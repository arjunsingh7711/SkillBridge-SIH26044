const mongoose = require("mongoose");

const opportunitySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        company: {
            type: String,
            required: true,
            trim: true
        },

        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        description: {
            type: String,
            required: true
        },

        type: {
            type: String,
            enum: [
                "Internship",
                "Job",
                "Hackathon",
                "Course"
            ],
            required: true
        },

        /*
         * Supports BOTH:
         *
         * Old:
         * ["Python", "JavaScript"]
         *
         * New:
         * [
         *   { name: "Python", level: "Advanced" },
         *   { name: "JavaScript", level: "Intermediate" }
         * ]
         */
        requiredSkills: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
            default: []
        },

        location: {
            type: String,
            default: "India"
        },

        workMode: {
            type: String,
            enum: [
                "Remote",
                "On-site",
                "Hybrid"
            ],
            default: "Remote"
        },

        salary: {
            type: String,
            default: "Not specified"
        },

        experience: {
            type: String,
            default: "Fresher"
        },

        deadline: {
            type: Date
        },

        applicationLink: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Opportunity",
    opportunitySchema
);