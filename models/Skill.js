const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema(
{
userId: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
required: true
},


    name: {
        type: String,
        required: true,
        trim: true
    },

    level: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
        default: "Beginner"
    },

    percentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 25
    }
},
{
    timestamps: true
}


);

module.exports = mongoose.model("Skill", skillSchema);
