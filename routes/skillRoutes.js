const express = require("express");

const Skill = require("../models/Skill");

const authMiddleware = require("../middleware/auth");

const router = express.Router();


// ================================
// GET MY SKILLS
// ================================

router.get("/", authMiddleware, async (req, res) => {

    try {

        const skills = await Skill.find({
            userId: req.user.id
        }).sort({
            createdAt: -1
        });

        res.json(skills);

    } catch (error) {

        console.error(
            "GET SKILLS ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch skills"
        });

    }

});


// ================================
// ADD SKILL
// ================================

router.post("/", authMiddleware, async (req, res) => {

    try {

        const {
            name,
            level,
            percentage
        } = req.body;


        if (!name) {

            return res.status(400).json({
                message: "Skill name is required"
            });

        }


        const existingSkill =
            await Skill.findOne({
                userId: req.user.id,
                name: name
            });


        if (existingSkill) {

            return res.status(400).json({
                message: "Skill already added"
            });

        }


        const skill =
            await Skill.create({

                userId: req.user.id,

                name: name,

                level:
                    level || "Beginner",

                percentage:
                    percentage !== undefined
                        ? percentage
                        : 25

            });


        res.status(201).json({

            message:
                "Skill added successfully",

            skill: skill

        });

    } catch (error) {

        console.error(
            "ADD SKILL ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to add skill"
        });

    }

});


// ================================
// DELETE SKILL
// ================================

router.delete(
    "/:id",
    authMiddleware,
    async (req, res) => {

        try {

            const skill =
                await Skill.findOneAndDelete({

                    _id: req.params.id,

                    userId: req.user.id

                });


            if (!skill) {

                return res.status(404).json({
                    message: "Skill not found"
                });

            }


            res.json({

                message:
                    "Skill deleted successfully"

            });

        } catch (error) {

            console.error(
                "DELETE SKILL ERROR:",
                error
            );

            res.status(500).json({
                message: "Failed to delete skill"
            });

        }

    }
);


module.exports = router;