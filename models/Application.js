const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        opportunity: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Opportunity",
            required: true
        },

        status: {
            type: String,
            enum: [
                "Applied",
                "Under Review",
                "Selected for Interview",
                "Shortlisted",
                "Selected",
                "Rejected"
            ],
            default: "Applied"
        },

        appliedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

/*
    Same student cannot apply twice
    for the same opportunity.
*/
applicationSchema.index(
    {
        student: 1,
        opportunity: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model(
    "Application",
    applicationSchema
);