const express = require("express");
const mongoose = require("mongoose");

const Opportunity = require("../models/Opportunity");
const User = require("../models/User");
const Application = require("../models/Application");
const Skill = require("../models/Skill");

const authMiddleware = require("../middleware/auth");

const router = express.Router();


// =====================================================
// SMART SKILL NORMALIZATION
// =====================================================

const normalizeSkill = (skill) => {

    const aliases = {

        "js": "javascript",
        "javascript": "javascript",

        "node": "node.js",
        "nodejs": "node.js",
        "node.js": "node.js",

        "mongo": "mongodb",
        "mongodb": "mongodb",

        "ml": "machine learning",
        "machine learning": "machine learning",

        "ai": "artificial intelligence",
        "artificial intelligence": "artificial intelligence",

        "py": "python",
        "python": "python",

        "c++": "c++",
        "cpp": "c++",

        "sql": "sql",

        "react": "react",
        "reactjs": "react",

        "express": "express",
        "expressjs": "express"
    };

    const cleaned =
        String(skill || "")
            .trim()
            .toLowerCase();

    return aliases[cleaned] || cleaned;
};


// =====================================================
// SKILL LEVEL VALUES
// =====================================================

const LEVEL_VALUE = {

    Beginner: 1,
    Intermediate: 2,
    Advanced: 3,
    Expert: 4
};


// =====================================================
// NORMALIZE LEVEL
// =====================================================

const normalizeLevel = (level) => {

    const cleaned =
        String(level || "")
            .trim()
            .toLowerCase();

    const levels = {

        beginner: "Beginner",
        intermediate: "Intermediate",
        advanced: "Advanced",
        expert: "Expert"
    };

    return levels[cleaned] || "Beginner";
};


// =====================================================
// VALID MONGODB ID
// =====================================================

const isValidObjectId = (id) => {

    return mongoose.Types.ObjectId.isValid(id);
};


// =====================================================
// NORMALIZE REQUIRED SKILLS
// =====================================================

const normalizeRequiredSkills = (requiredSkills) => {

    if (!Array.isArray(requiredSkills)) {

        return [];
    }

    return requiredSkills

        .map(skill => {

            // OLD FORMAT

            if (typeof skill === "string") {

                return {

                    name: skill.trim(),

                    level: "Beginner"
                };
            }


            // NEW FORMAT

            if (
                skill &&
                typeof skill === "object"
            ) {

                return {

                    name:
                        String(
                            skill.name || ""
                        ).trim(),

                    level:
                        normalizeLevel(
                            skill.level
                        )
                };
            }

            return null;
        })

        .filter(skill =>
            skill &&
            skill.name
        );
};


// =====================================================
// CALCULATE LEVEL MULTIPLIER
// =====================================================

const calculateLevelMultiplier = (
    studentLevel,
    requiredLevel
) => {

    const studentValue =
        LEVEL_VALUE[
            normalizeLevel(studentLevel)
        ] || 1;

    const requiredValue =
        LEVEL_VALUE[
            normalizeLevel(requiredLevel)
        ] || 1;


    if (
        studentValue >=
        requiredValue
    ) {

        return 1;
    }


    const difference =
        requiredValue -
        studentValue;


    if (difference === 1) {

        return 0.75;
    }

    if (difference === 2) {

        return 0.50;
    }

    return 0.25;
};


// =====================================================
// CALCULATE SKILL SCORE
// =====================================================

const calculateSkillScore = (
    studentSkill,
    requiredSkill
) => {

    const efficiency =
        Number(
            studentSkill.percentage
        );

    const safeEfficiency =
        Number.isFinite(efficiency)
            ? Math.max(
                0,
                Math.min(
                    100,
                    efficiency
                )
            )
            : 25;


    const multiplier =
        calculateLevelMultiplier(
            studentSkill.level,
            requiredSkill.level
        );


    return Math.round(
        safeEfficiency *
        multiplier
    );
};


// =====================================================
// GET ALL OPPORTUNITIES
// PUBLIC
// =====================================================

router.get(
    "/",
    async (req, res) => {

        try {

            const opportunities =
                await Opportunity
                    .find()
                    .sort({
                        createdAt: -1
                    });

            res.status(200).json(
                opportunities
            );

        } catch (error) {

            console.error(
                "GET OPPORTUNITIES ERROR:",
                error
            );

            res.status(500).json({

                message:
                    "Failed to fetch opportunities"
            });
        }
    }
);


// =====================================================
// GET COMPANY'S OWN OPPORTUNITIES
// COMPANY ONLY
//
// FIX:
// Also returns real applicationCount
// for every opportunity.
// =====================================================

router.get(
    "/my",
    authMiddleware,
    async (req, res) => {

        try {

            if (
                req.user.role !== "company"
            ) {

                return res.status(403).json({

                    message:
                        "Only companies can access their opportunities"
                });
            }


            // -----------------------------------------
            // GET COMPANY OPPORTUNITIES
            // -----------------------------------------

            const opportunities =
                await Opportunity
                    .find({

                        companyId:
                            req.user.id

                    })
                    .sort({

                        createdAt: -1

                    })
                    .lean();


            // -----------------------------------------
            // GET OPPORTUNITY IDS
            // -----------------------------------------

            const opportunityIds =
                opportunities.map(
                    opportunity =>
                        opportunity._id
                );


            // -----------------------------------------
            // COUNT APPLICATIONS
            //
            // One aggregation query gets counts
            // for all opportunities.
            // -----------------------------------------

            let applicationCounts = [];


            if (
                opportunityIds.length > 0
            ) {

                applicationCounts =
                    await Application.aggregate([

                        {
                            $match: {

                                opportunity: {
                                    $in:
                                        opportunityIds
                                }

                            }
                        },

                        {
                            $group: {

                                _id:
                                    "$opportunity",

                                count: {
                                    $sum: 1
                                }

                            }
                        }

                    ]);
            }


            // -----------------------------------------
            // CREATE COUNT MAP
            // -----------------------------------------

            const countMap =
                new Map();


            applicationCounts.forEach(
                item => {

                    countMap.set(
                        String(item._id),
                        item.count
                    );

                }
            );


            // -----------------------------------------
            // ATTACH COUNT TO OPPORTUNITIES
            // -----------------------------------------

            const opportunitiesWithCounts =
                opportunities.map(
                    opportunity => {

                        const applicationCount =
                            countMap.get(
                                String(
                                    opportunity._id
                                )
                            ) || 0;


                        return {

                            ...opportunity,

                            // Main field used by frontend
                            applicationCount:

                                applicationCount,

                            // Compatibility field
                            applicationsCount:

                                applicationCount
                        };

                    }
                );


            // -----------------------------------------
            // SEND RESPONSE
            // -----------------------------------------

            res.status(200).json(
                opportunitiesWithCounts
            );

        } catch (error) {

            console.error(
                "GET MY OPPORTUNITIES ERROR:",
                error
            );

            res.status(500).json({

                message:
                    "Failed to fetch your opportunities"
            });
        }
    }
);


// =====================================================
// SMART MATCHED OPPORTUNITIES
// STUDENT ONLY
// =====================================================

router.get(
    "/matches",
    authMiddleware,
    async (req, res) => {

        try {

            if (
                req.user.role !== "student"
            ) {

                return res.status(403).json({

                    message:
                        "Only students can access opportunity matches"
                });
            }


            const studentSkills =
                await Skill.find({

                    userId:
                        req.user.id

                });


            const studentSkillMap =
                new Map();


            studentSkills.forEach(
                skill => {

                    const normalizedName =
                        normalizeSkill(
                            skill.name
                        );

                    if (!normalizedName) {

                        return;
                    }


                    studentSkillMap.set(
                        normalizedName,
                        {

                            name:
                                skill.name,

                            level:
                                normalizeLevel(
                                    skill.level
                                ),

                            percentage:
                                Number(
                                    skill.percentage
                                )
                        }
                    );
                }
            );


            const opportunities =
                await Opportunity
                    .find()
                    .sort({
                        createdAt: -1
                    });


            const matchedOpportunities =
                opportunities.map(
                    opportunity => {

                        const requiredSkills =
                            normalizeRequiredSkills(
                                opportunity.requiredSkills
                            );


                        const uniqueSkills = [];

                        const seen = new Set();


                        requiredSkills.forEach(
                            skill => {

                                const normalizedName =
                                    normalizeSkill(
                                        skill.name
                                    );


                                if (
                                    !seen.has(
                                        normalizedName
                                    )
                                ) {

                                    seen.add(
                                        normalizedName
                                    );

                                    uniqueSkills.push({

                                        ...skill,

                                        normalizedName
                                    });
                                }
                            }
                        );


                        // -----------------------------------------
                        // NO REQUIRED SKILLS
                        // -----------------------------------------

                        if (
                            uniqueSkills.length === 0
                        ) {

                            return {

                                ...opportunity.toObject(),

                                matchPercentage: 100,

                                matchedSkills: [],

                                missingSkills: [],

                                skillDetails: []
                            };
                        }


                        let totalScore = 0;

                        const matchedSkills = [];

                        const missingSkills = [];

                        const skillDetails = [];


                        // -----------------------------------------
                        // CALCULATE EACH SKILL
                        // -----------------------------------------

                        uniqueSkills.forEach(
                            requiredSkill => {

                                const studentSkill =
                                    studentSkillMap.get(
                                        requiredSkill.normalizedName
                                    );


                                // -----------------------------------------
                                // MISSING SKILL
                                // -----------------------------------------

                                if (!studentSkill) {

                                    missingSkills.push({

                                        name:
                                            requiredSkill.name,

                                        requiredLevel:
                                            requiredSkill.level
                                    });


                                    skillDetails.push({

                                        name:
                                            requiredSkill.name,

                                        requiredLevel:
                                            requiredSkill.level,

                                        studentLevel:
                                            null,

                                        studentPercentage:
                                            0,

                                        score:
                                            0,

                                        status:
                                            "Missing"
                                    });

                                    return;
                                }


                                // -----------------------------------------
                                // CALCULATE SCORE
                                // -----------------------------------------

                                const skillScore =
                                    calculateSkillScore(
                                        studentSkill,
                                        requiredSkill
                                    );


                                totalScore +=
                                    skillScore;


                                const studentLevelValue =
                                    LEVEL_VALUE[
                                        normalizeLevel(
                                            studentSkill.level
                                        )
                                    ] || 1;


                                const requiredLevelValue =
                                    LEVEL_VALUE[
                                        normalizeLevel(
                                            requiredSkill.level
                                        )
                                    ] || 1;


                                const status =
                                    studentLevelValue >=
                                    requiredLevelValue
                                        ? "Matched"
                                        : "Level Gap";


                                // -----------------------------------------
                                // MATCHED SKILLS
                                // -----------------------------------------

                                matchedSkills.push({

                                    name:
                                        requiredSkill.name,

                                    requiredLevel:
                                        requiredSkill.level,

                                    studentLevel:
                                        studentSkill.level,

                                    studentPercentage:
                                        studentSkill.percentage,

                                    score:
                                        skillScore
                                });


                                // -----------------------------------------
                                // SKILL DETAILS
                                // -----------------------------------------

                                skillDetails.push({

                                    name:
                                        requiredSkill.name,

                                    requiredLevel:
                                        requiredSkill.level,

                                    studentLevel:
                                        studentSkill.level,

                                    studentPercentage:
                                        studentSkill.percentage,

                                    score:
                                        skillScore,

                                    status
                                });


                                // -----------------------------------------
                                // LEVEL GAP
                                // -----------------------------------------

                                if (
                                    studentLevelValue <
                                    requiredLevelValue
                                ) {

                                    missingSkills.push({

                                        name:
                                            requiredSkill.name,

                                        requiredLevel:
                                            requiredSkill.level,

                                        studentLevel:
                                            studentSkill.level,

                                        studentPercentage:
                                            studentSkill.percentage,

                                        score:
                                            skillScore,

                                        reason:
                                            "Level below requirement"
                                    });
                                }
                            }
                        );


                        // -----------------------------------------
                        // FINAL MATCH PERCENTAGE
                        // -----------------------------------------

                        const matchPercentage =
                            Math.round(
                                totalScore /
                                uniqueSkills.length
                            );


                        return {

                            ...opportunity.toObject(),

                            matchPercentage,

                            matchedSkills,

                            missingSkills,

                            skillDetails
                        };
                    }
                );


            // -----------------------------------------
            // SORT BY MATCH
            // -----------------------------------------

            matchedOpportunities.sort(
                (a, b) => {

                    if (
                        b.matchPercentage !==
                        a.matchPercentage
                    ) {

                        return (
                            b.matchPercentage -
                            a.matchPercentage
                        );
                    }


                    return (
                        new Date(
                            b.createdAt
                        ) -
                        new Date(
                            a.createdAt
                        )
                    );
                }
            );


            res.status(200).json(
                matchedOpportunities
            );

        } catch (error) {

            console.error(
                "GET OPPORTUNITY MATCHES ERROR:",
                error
            );

            res.status(500).json({

                message:
                    "Failed to calculate opportunity matches"
            });
        }
    }
);


// =====================================================
// GET SINGLE OPPORTUNITY
// PUBLIC
// =====================================================

router.get(
    "/:id",
    async (req, res) => {

        try {

            // -----------------------------------------
            // INVALID ID PROTECTION
            // -----------------------------------------

            if (
                !isValidObjectId(
                    req.params.id
                )
            ) {

                return res.status(400).json({

                    message:
                        "Invalid opportunity ID"
                });
            }


            const opportunity =
                await Opportunity.findById(
                    req.params.id
                );


            if (!opportunity) {

                return res.status(404).json({

                    message:
                        "Opportunity not found"
                });
            }


            res.status(200).json(
                opportunity
            );

        } catch (error) {

            console.error(
                "GET OPPORTUNITY ERROR:",
                error
            );

            res.status(500).json({

                message:
                    "Failed to fetch opportunity"
            });
        }
    }
);


// =====================================================
// CREATE OPPORTUNITY
// COMPANY ONLY
// =====================================================

router.post(
    "/",
    authMiddleware,
    async (req, res) => {

        try {

            if (
                req.user.role !== "company"
            ) {

                return res.status(403).json({

                    message:
                        "Only companies can post opportunities"
                });
            }


            const companyUser =
                await User.findById(
                    req.user.id
                );


            if (!companyUser) {

                return res.status(404).json({

                    message:
                        "Company account not found"
                });
            }


            const {

                title,
                description,
                type,
                requiredSkills,
                location,
                workMode,
                salary,
                experience,
                deadline,
                applicationLink

            } = req.body;


            // -----------------------------------------
            // REQUIRED FIELDS
            // -----------------------------------------

            if (

                !title ||
                !description ||
                !type ||
                !requiredSkills

            ) {

                return res.status(400).json({

                    message:
                        "Please fill all required fields"
                });
            }


            let cleanedSkills;


            // -----------------------------------------
            // ARRAY FORMAT
            // -----------------------------------------

            if (
                Array.isArray(
                    requiredSkills
                )
            ) {

                cleanedSkills =
                    requiredSkills
                        .map(skill => {

                            // OLD STRING FORMAT

                            if (
                                typeof skill ===
                                "string"
                            ) {

                                const name =
                                    skill.trim();


                                if (!name) {

                                    return null;
                                }


                                return name;
                            }


                            // NEW OBJECT FORMAT

                            if (
                                skill &&
                                typeof skill ===
                                "object"
                            ) {

                                const name =
                                    String(
                                        skill.name || ""
                                    ).trim();


                                if (!name) {

                                    return null;
                                }


                                return {

                                    name,

                                    level:
                                        normalizeLevel(
                                            skill.level
                                        )
                                };
                            }


                            return null;

                        })
                        .filter(Boolean);

            } else {

                // -----------------------------------------
                // COMMA SEPARATED FORMAT
                // -----------------------------------------

                cleanedSkills =
                    String(
                        requiredSkills
                    )
                        .split(",")
                        .map(
                            skill =>
                                skill.trim()
                        )
                        .filter(Boolean);
            }


            // -----------------------------------------
            // CREATE OPPORTUNITY
            // -----------------------------------------

            const opportunity =
                await Opportunity.create({

                    title,

                    description,

                    type,

                    requiredSkills:
                        cleanedSkills,

                    location,

                    workMode,

                    salary,

                    experience,

                    deadline,

                    applicationLink,

                    company:
                        companyUser.name,

                    companyId:
                        companyUser._id
                });


            res.status(201).json({

                message:
                    "Opportunity created successfully",

                opportunity
            });

        } catch (error) {

            console.error(
                "CREATE OPPORTUNITY ERROR:",
                error
            );

            res.status(500).json({

                message:
                    "Failed to create opportunity"
            });
        }
    }
);


// =====================================================
// DELETE OPPORTUNITY
// COMPANY ONLY + OWNERSHIP CHECK
// =====================================================

router.delete(
    "/:id",
    authMiddleware,
    async (req, res) => {

        try {

            if (
                req.user.role !== "company"
            ) {

                return res.status(403).json({

                    message:
                        "Only companies can delete opportunities"
                });
            }


            // -----------------------------------------
            // INVALID ID PROTECTION
            // -----------------------------------------

            if (
                !isValidObjectId(
                    req.params.id
                )
            ) {

                return res.status(400).json({

                    message:
                        "Invalid opportunity ID"
                });
            }


            const opportunity =
                await Opportunity.findById(
                    req.params.id
                );


            if (!opportunity) {

                return res.status(404).json({

                    message:
                        "Opportunity not found"
                });
            }


            // -----------------------------------------
            // CRITICAL OWNERSHIP CHECK
            // -----------------------------------------

            if (
                String(
                    opportunity.companyId
                ) !==
                String(
                    req.user.id
                )
            ) {

                return res.status(403).json({

                    message:
                        "You can only delete your own opportunities"
                });
            }


            // -----------------------------------------
            // DELETE RELATED APPLICATIONS
            // -----------------------------------------

            await Application.deleteMany({

                opportunity:
                    opportunity._id
            });


            // -----------------------------------------
            // DELETE OPPORTUNITY
            // -----------------------------------------

            await Opportunity.findByIdAndDelete(
                opportunity._id
            );


            res.status(200).json({

                message:
                    "Opportunity and related applications deleted successfully"
            });

        } catch (error) {

            console.error(
                "DELETE OPPORTUNITY ERROR:",
                error
            );

            res.status(500).json({

                message:
                    "Failed to delete opportunity"
            });
        }
    }
);


module.exports = router;

