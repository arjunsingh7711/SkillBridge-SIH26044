const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const Application = require("../models/Application");
const Opportunity = require("../models/Opportunity");
const Skill = require("../models/Skill");

const auth = require("../middleware/auth");

/* =========================================================
HELPER FUNCTIONS
========================================================= */

function isValidObjectId(id) {
return mongoose.Types.ObjectId.isValid(id);
}

/* =========================================================
SKILL LEVEL HELPERS
========================================================= */

const LEVEL_SCORE = {
Beginner: 1,
Intermediate: 2,
Advanced: 3,
Expert: 4
};

/*

* Normalize skill name so:
*
* Python
* python
* PYTHON
* Python
*
* are treated as the same skill.
  */
  function normalizeSkillName(name) {

  return String(name || "")
  .trim()
  .toLowerCase()
  .replace(/\s+/g, " ");

}

/*

* Convert requiredSkills into a common format.
*
* Supported:
*
* ["Python", "JavaScript"]
*
* OR
*
* [
* {
* 
   name: "Python",
  
* 
   level: "Advanced"
  
* }
* ]
  */
  function normalizeRequiredSkills(requiredSkills) {

  if (!Array.isArray(requiredSkills)) {
  return [];
  }

  return requiredSkills

  
   .map(skill => {

       /* -----------------------------------------
          OLD FORMAT
          "Python"
       ----------------------------------------- */

       if (typeof skill === "string") {

           const name = skill.trim();

           if (!name) {
               return null;
           }

           return {
               name,
               key: normalizeSkillName(name),
               level: "Intermediate"
           };

       }


       /* -----------------------------------------
          OBJECT FORMAT
       ----------------------------------------- */

       if (
           skill &&
           typeof skill === "object"
       ) {

           const name =
               skill.name ||
               skill.skill ||
               skill.title ||
               skill.skillName;


           if (!name) {
               return null;
           }


           const level =
               LEVEL_SCORE[skill.level]
                   ? skill.level
                   : "Intermediate";


           return {
               name: String(name).trim(),

               key: normalizeSkillName(name),

               level
           };

       }


       return null;

   })

   .filter(Boolean);
  

}

/*

* Normalize student's skills.
  */
  function normalizeStudentSkills(studentSkills) {

  if (!Array.isArray(studentSkills)) {
  return [];
  }

  return studentSkills

  
   .map(skill => {

       if (!skill || typeof skill !== "object") {
           return null;
       }


       const name =
           skill.name ||
           skill.skill ||
           skill.title ||
           skill.skillName;


       if (!name) {
           return null;
       }


       const level =
           LEVEL_SCORE[skill.level]
               ? skill.level
               : "Beginner";


       let percentage =
           Number(skill.percentage);


       if (!Number.isFinite(percentage)) {
           percentage = 0;
       }


       percentage =
           Math.max(
               0,
               Math.min(
                   100,
                   percentage
               )
           );


       return {

           name: String(name).trim(),

           key: normalizeSkillName(name),

           level,

           percentage

       };

   })

   .filter(Boolean);
  

}

/* =========================================================
MATCHING ENGINE
========================================================= */

/*

* Matching strategy:
*
* 1. Skill name must match.
*
* 2. Required level is compared with student's level.
*
* 3. Student proficiency percentage is also considered.
*
* 4. Higher level than required gets strong score.
*
* 5. Lower level gets partial score.
*
* 6. Missing skill gets 0.
*
* Final percentage is average of all required skills.
  */
  function calculateSkillMatch(
  requiredSkills,
  studentSkills
  ) {

  const required =
  normalizeRequiredSkills(
  requiredSkills
  );

  const students =
  normalizeStudentSkills(
  studentSkills
  );

  /* -----------------------------------------
  NO REQUIRED SKILLS
  ----------------------------------------- */

  if (required.length === 0) {

  
   return {

       matchPercentage: 100,

       matchedSkills: [],

       missingSkills: [],

       belowLevelSkills: [],

       skillBreakdown: []

   };
  

  }

  /* -----------------------------------------
  CREATE STUDENT SKILL MAP
  ----------------------------------------- */

  const studentMap = new Map();

  for (const skill of students) {

  
   /*
    * If duplicate skills exist,
    * keep the strongest one.
    */

   const existing =
       studentMap.get(skill.key);


   if (!existing) {

       studentMap.set(
           skill.key,
           skill
       );

   } else {

       const existingLevel =
           LEVEL_SCORE[
               existing.level
           ] || 1;


       const currentLevel =
           LEVEL_SCORE[
               skill.level
           ] || 1;


       if (
           currentLevel > existingLevel ||
           (
               currentLevel === existingLevel &&
               skill.percentage >
               existing.percentage
           )
       ) {

           studentMap.set(
               skill.key,
               skill
           );

       }

   }
  

  }

  let totalScore = 0;

  const matchedSkills = [];

  const missingSkills = [];

  const belowLevelSkills = [];

  const skillBreakdown = [];

  /* -----------------------------------------
  CALCULATE EVERY REQUIRED SKILL
  ----------------------------------------- */

  for (const requiredSkill of required) {

  
   const studentSkill =
       studentMap.get(
           requiredSkill.key
       );


   /* =====================================
      MISSING SKILL
   ===================================== */

   if (!studentSkill) {

       missingSkills.push({

           name:
               requiredSkill.name,

           requiredLevel:
               requiredSkill.level

       });


       skillBreakdown.push({

           name:
               requiredSkill.name,

           requiredLevel:
               requiredSkill.level,

           studentLevel:
               null,

           studentPercentage:
               0,

           score: 0,

           status: "Missing"

       });


       continue;

   }


   const requiredLevelScore =
       LEVEL_SCORE[
           requiredSkill.level
       ] || 2;


   const studentLevelScore =
       LEVEL_SCORE[
           studentSkill.level
       ] || 1;


   /*
    * Level ratio.
    *
    * Example:
    *
    * Required Advanced = 3
    * Student Intermediate = 2
    *
    * Level ratio = 2/3
    */

   let levelRatio =
       studentLevelScore /
       requiredLevelScore;


   levelRatio =
       Math.min(
           1,
           levelRatio
       );


   /*
    * Proficiency contribution.
    *
    * 70% proficiency
    * becomes 0.70
    */

   const proficiencyRatio =
       studentSkill.percentage / 100;


   /*
    * Combined score:
    *
    * 60% level
    * 40% proficiency
    *
    * This gives the skill LEVEL more importance.
    */

   let skillScore =
       (
           levelRatio * 0.60
       ) +
       (
           proficiencyRatio * 0.40
       );


   /*
    * Convert to 0-100.
    */

   skillScore =
       Math.round(
           skillScore * 100
       );


   /*
    * Never exceed 100.
    */

   skillScore =
       Math.max(
           0,
           Math.min(
               100,
               skillScore
           )
       );


   totalScore += skillScore;


   /* =====================================
      FULL MATCH
   ===================================== */

   if (
       studentLevelScore >=
       requiredLevelScore
   ) {

       matchedSkills.push({

           name:
               requiredSkill.name,

           requiredLevel:
               requiredSkill.level,

           studentLevel:
               studentSkill.level,

           percentage:
               studentSkill.percentage,

           score:
               skillScore

       });

   }


   /* =====================================
      BELOW REQUIRED LEVEL
   ===================================== */

   else {

       belowLevelSkills.push({

           name:
               requiredSkill.name,

           requiredLevel:
               requiredSkill.level,

           studentLevel:
               studentSkill.level,

           percentage:
               studentSkill.percentage,

           score:
               skillScore

       });

   }


   skillBreakdown.push({

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

       status:
           studentLevelScore >=
           requiredLevelScore
               ? "Matched"
               : "Below Required Level"

   });
  

  }

  /* -----------------------------------------
  FINAL MATCH %
  ----------------------------------------- */

  let matchPercentage =
  totalScore /
  required.length;

  matchPercentage =
  Math.round(
  matchPercentage
  );

  matchPercentage =
  Math.max(
  0,
  Math.min(
  100,
  matchPercentage
  )
  );

  return {

  
   matchPercentage,

   matchedSkills,

   missingSkills,

   belowLevelSkills,

   skillBreakdown
  

  };

}

/* =========================================================

1. STUDENT APPLY FOR OPPORTUNITY
   ========================================================= */

router.post("/", auth, async (req, res) => {


try {

    if (!req.user) {

        return res.status(401).json({
            message:
                "Authentication required"
        });

    }


    if (req.user.role !== "student") {

        return res.status(403).json({
            message:
                "Only students can apply for opportunities"
        });

    }


    const {
        opportunityId
    } = req.body;


    if (!opportunityId) {

        return res.status(400).json({
            message:
                "Opportunity ID is required"
        });

    }


    if (!isValidObjectId(opportunityId)) {

        return res.status(400).json({
            message:
                "Invalid opportunity ID"
        });

    }


    const opportunity =
        await Opportunity.findById(
            opportunityId
        );


    if (!opportunity) {

        return res.status(404).json({
            message:
                "Opportunity not found"
        });

    }


    /* -----------------------------------------
       DEADLINE
    ----------------------------------------- */

    if (
        opportunity.deadline &&
        new Date() >
        new Date(opportunity.deadline)
    ) {

        return res.status(400).json({
            message:
                "Application deadline has passed"
        });

    }


    /* -----------------------------------------
       DUPLICATE APPLICATION
    ----------------------------------------- */

    const existingApplication =
        await Application.findOne({

            student:
                req.user.id,

            opportunity:
                opportunityId

        });


    if (existingApplication) {

        return res.status(409).json({

            message:
                "You have already applied for this opportunity",

            application:
                existingApplication

        });

    }


    /* -----------------------------------------
       CREATE APPLICATION
       
       ALWAYS STARTS AS APPLIED
    ----------------------------------------- */

    const application =
        await Application.create({

            student:
                req.user.id,

            opportunity:
                opportunityId,

            status:
                "Applied"

        });


    /* -----------------------------------------
       RESPONSE
    ----------------------------------------- */

    const populatedApplication =
        await Application.findById(
            application._id
        )

            .populate(
                "student",
                "name email college branch year preferredRole preferredLocation workMode experience bio github linkedin portfolio resume"
            )

            .populate(
                "opportunity",
                "title company companyId description type requiredSkills location workMode salary experience deadline applicationLink"
            );


    return res.status(201).json({

        message:
            "Application submitted successfully",

        application:
            populatedApplication

    });


} catch (error) {

    console.error(
        "CREATE APPLICATION ERROR:",
        error
    );


    if (error.code === 11000) {

        return res.status(409).json({
            message:
                "You have already applied for this opportunity"
        });

    }


    return res.status(500).json({

        message:
            "Server error while applying",

        error:
            error.message

    });

}


});

/* =========================================================
2. GET STUDENT APPLICATIONS
========================================================= */

router.get("/", auth, async (req, res) => {


try {

    if (!req.user) {

        return res.status(401).json({
            message:
                "Authentication required"
        });

    }


    if (req.user.role !== "student") {

        return res.status(403).json({
            message:
                "Only students can view their applications"
        });

    }


    const applications =
        await Application.find({

            student:
                req.user.id

        })

            .populate(
                "opportunity",
                "title company companyId description type requiredSkills location workMode salary experience deadline applicationLink"
            )

            .sort({
                createdAt:
                    -1
            });


    return res.status(200).json(
        applications
    );


} catch (error) {

    console.error(
        "GET STUDENT APPLICATIONS ERROR:",
        error
    );


    return res.status(500).json({

        message:
            "Server error while fetching applications",

        error:
            error.message

    });

}


});

/* =========================================================
3. GET COMPANY APPLICATIONS
===========================

GET /api/applications/company

Returns:

* Student information
* Student skills
* Match percentage
* Matched skills
* Missing skills
* Below-level skills
  ========================================================= */

router.get("/company", auth, async (req, res) => {


try {

    if (!req.user) {

        return res.status(401).json({
            message:
                "Authentication required"
        });

    }


    if (req.user.role !== "company") {

        return res.status(403).json({
            message:
                "Only companies can view applications"
        });

    }


    /* -----------------------------------------
       COMPANY OPPORTUNITIES
    ----------------------------------------- */

    const opportunities =
        await Opportunity.find({

            companyId:
                req.user.id

        })
            .select("_id");


    const opportunityIds =
        opportunities.map(
            opportunity =>
                opportunity._id
        );


    if (opportunityIds.length === 0) {

        return res.status(200).json([]);

    }


    /* -----------------------------------------
       APPLICATIONS
    ----------------------------------------- */

    const applications =
        await Application.find({

            opportunity: {
                $in:
                    opportunityIds
            }

        })

            .populate(
                "student",
                "name email college branch year preferredRole preferredLocation workMode experience bio github linkedin portfolio resume"
            )

            .populate(
                "opportunity",
                "title company companyId description type requiredSkills location workMode salary experience deadline applicationLink"
            )

            .sort({
                createdAt:
                    -1
            });


    /* -----------------------------------------
       GET STUDENT IDS
    ----------------------------------------- */

    const studentIds =
        applications

            .filter(
                application =>
                    application.student
            )

            .map(
                application =>
                    application.student._id
            );


    /* -----------------------------------------
       FETCH ALL STUDENT SKILLS
    ----------------------------------------- */

    let skills = [];


    if (studentIds.length > 0) {

        skills =
            await Skill.find({

                userId: {
                    $in:
                        studentIds
                }

            })

                .select(
                    "_id userId name level percentage"
                )

                .sort({
                    createdAt:
                        -1
                });

    }


    /* -----------------------------------------
       GROUP SKILLS
    ----------------------------------------- */

    const skillsByStudent = {};


    for (const skill of skills) {

        const studentId =
            String(
                skill.userId
            );


        if (
            !skillsByStudent[
                studentId
            ]
        ) {

            skillsByStudent[
                studentId
            ] = [];

        }


        skillsByStudent[
            studentId
        ].push({

            _id:
                skill._id,

            userId:
                skill.userId,

            name:
                skill.name,

            level:
                skill.level,

            percentage:
                skill.percentage

        });

    }


    /* -----------------------------------------
       BUILD FINAL RESPONSE
    ----------------------------------------- */

    const applicationsWithMatch =
        applications.map(
            application => {

                const applicationObject =
                    application.toObject();


                let studentSkills = [];


                if (
                    applicationObject.student
                ) {

                    const studentId =
                        String(
                            applicationObject
                                .student
                                ._id
                        );


                    studentSkills =
                        skillsByStudent[
                            studentId
                        ] || [];


                    applicationObject
                        .student
                        .skills =
                        studentSkills;

                }


                /* --------------------------------
                   MATCHING
                -------------------------------- */

                const requiredSkills =
                    applicationObject
                        .opportunity
                        ?.requiredSkills
                    || [];


                const match =
                    calculateSkillMatch(

                        requiredSkills,

                        studentSkills

                    );


                /* --------------------------------
                   ATTACH MATCH DATA
                -------------------------------- */

                applicationObject
                    .matchPercentage =
                    match.matchPercentage;


                applicationObject
                    .matchPercent =
                    match.matchPercentage;


                applicationObject
                    .matchScore =
                    match.matchPercentage;


                applicationObject
                    .matchedSkills =
                    match.matchedSkills;


                applicationObject
                    .missingSkills =
                    match.missingSkills;


                applicationObject
                    .belowLevelSkills =
                    match.belowLevelSkills;


                applicationObject
                    .skillBreakdown =
                    match.skillBreakdown;


                return applicationObject;

            }
        );


    return res.status(200).json(
        applicationsWithMatch
    );


} catch (error) {

    console.error(
        "GET COMPANY APPLICATIONS ERROR:",
        error
    );


    return res.status(500).json({

        message:
            "Server error while fetching company applications",

        error:
            error.message

    });

}


});

/* =========================================================
4. GET SINGLE APPLICATION
========================================================= */

router.get("/:id", auth, async (req, res) => {


try {

    const {
        id
    } = req.params;


    if (!isValidObjectId(id)) {

        return res.status(400).json({
            message:
                "Invalid application ID"
        });

    }


    const application =
        await Application.findById(id)

            .populate(
                "student",
                "name email college branch year preferredRole preferredLocation workMode experience bio github linkedin portfolio resume"
            )

            .populate(
                "opportunity",
                "title company companyId description type requiredSkills location workMode salary experience deadline applicationLink"
            );


    if (!application) {

        return res.status(404).json({
            message:
                "Application not found"
        });

    }


    /* =================================================
       STUDENT ACCESS
    ================================================= */

    if (
        req.user.role ===
        "student"
    ) {

        if (
            !application.student ||
            String(
                application.student._id
            ) !==
            String(
                req.user.id
            )
        ) {

            return res.status(403).json({
                message:
                    "Access denied"
            });

        }


        return res.status(200).json(
            application
        );

    }


    /* =================================================
       COMPANY ACCESS
    ================================================= */

    if (
        req.user.role ===
        "company"
    ) {

        if (
            !application.opportunity ||
            String(
                application
                    .opportunity
                    .companyId
            ) !==
            String(
                req.user.id
            )
        ) {

            return res.status(403).json({
                message:
                    "Access denied"
            });

        }


        /* -----------------------------------------
           STUDENT SKILLS
        ----------------------------------------- */

        const studentSkills =
            application.student
                ? await Skill.find({

                    userId:
                        application
                            .student
                            ._id

                })

                    .select(
                        "_id userId name level percentage"
                    )

                    .sort({
                        createdAt:
                            -1
                    })

                : [];


        const applicationObject =
            application.toObject();


        if (
            applicationObject.student
        ) {

            applicationObject
                .student
                .skills =
                studentSkills;

        }


        /* -----------------------------------------
           MATCH
        ----------------------------------------- */

        const requiredSkills =
            applicationObject
                .opportunity
                ?.requiredSkills
            || [];


        const match =
            calculateSkillMatch(

                requiredSkills,

                studentSkills

            );


        applicationObject
            .matchPercentage =
            match.matchPercentage;


        applicationObject
            .matchPercent =
            match.matchPercentage;


        applicationObject
            .matchScore =
            match.matchPercentage;


        applicationObject
            .matchedSkills =
            match.matchedSkills;


        applicationObject
            .missingSkills =
            match.missingSkills;


        applicationObject
            .belowLevelSkills =
            match.belowLevelSkills;


        applicationObject
            .skillBreakdown =
            match.skillBreakdown;


        return res.status(200).json(
            applicationObject
        );

    }


    return res.status(403).json({
        message:
            "Access denied"
    });


} catch (error) {

    console.error(
        "GET SINGLE APPLICATION ERROR:",
        error
    );


    return res.status(500).json({

        message:
            "Server error while fetching application",

        error:
            error.message

    });

}


});

/* =========================================================
5. COMPANY UPDATE APPLICATION STATUS
========================================================= */

router.patch(
"/:id/status",
auth,
async (req, res) => {


    try {

        if (!req.user) {

            return res.status(401).json({
                message:
                    "Authentication required"
            });

        }


        if (
            req.user.role !==
            "company"
        ) {

            return res.status(403).json({

                message:
                    "Only companies can update application status"

            });

        }


        const {
            id
        } = req.params;


        const {
            status
        } = req.body;


        if (!isValidObjectId(id)) {

            return res.status(400).json({
                message:
                    "Invalid application ID"
            });

        }


        const allowedStatuses = [

            "Applied",

            "Selected for Interview",

            "Under Review",

            "Shortlisted",

            "Selected",

            "Rejected"

        ];


        if (
            !allowedStatuses.includes(
                status
            )
        ) {

            return res.status(400).json({

                message:
                    "Invalid application status",

                allowedStatuses

            });

        }


        const application =
            await Application.findById(id)

                .populate(
                    "opportunity",
                    "title company companyId"
                );


        if (!application) {

            return res.status(404).json({
                message:
                    "Application not found"
            });

        }


        /* -----------------------------------------
           SECURITY
        ----------------------------------------- */

        if (
            !application.opportunity ||

            String(
                application
                    .opportunity
                    .companyId
            ) !==
            String(
                req.user.id
            )
        ) {

            return res.status(403).json({

                message:
                    "You can update only applications for your own opportunities"

            });

        }


        /* -----------------------------------------
           UPDATE
        ----------------------------------------- */

        application.status =
            status;


        await application.save();


        /* -----------------------------------------
           FETCH UPDATED APPLICATION
        ----------------------------------------- */

        const updatedApplication =
            await Application.findById(
                application._id
            )

                .populate(
                    "student",
                    "name email college branch year preferredRole preferredLocation workMode experience bio github linkedin portfolio resume"
                )

                .populate(
                    "opportunity",
                    "title company companyId description type requiredSkills location workMode salary experience deadline applicationLink"
                );


        /* -----------------------------------------
           STUDENT SKILLS
        ----------------------------------------- */

        const studentSkills =
            updatedApplication.student

                ? await Skill.find({

                    userId:
                        updatedApplication
                            .student
                            ._id

                })

                    .select(
                        "_id userId name level percentage"
                    )

                    .sort({
                        createdAt:
                            -1
                    })

                : [];


        const updatedApplicationObject =
            updatedApplication.toObject();


        if (
            updatedApplicationObject.student
        ) {

            updatedApplicationObject
                .student
                .skills =
                studentSkills;

        }


        /* -----------------------------------------
           MATCH
        ----------------------------------------- */

        const requiredSkills =
            updatedApplicationObject
                .opportunity
                ?.requiredSkills
            || [];


        const match =
            calculateSkillMatch(

                requiredSkills,

                studentSkills

            );


        updatedApplicationObject
            .matchPercentage =
            match.matchPercentage;


        updatedApplicationObject
            .matchPercent =
            match.matchPercentage;


        updatedApplicationObject
            .matchScore =
            match.matchPercentage;


        updatedApplicationObject
            .matchedSkills =
            match.matchedSkills;


        updatedApplicationObject
            .missingSkills =
            match.missingSkills;


        updatedApplicationObject
            .belowLevelSkills =
            match.belowLevelSkills;


        updatedApplicationObject
            .skillBreakdown =
            match.skillBreakdown;


        return res.status(200).json({

            message:
                "Application status updated successfully",

            application:
                updatedApplicationObject

        });


    } catch (error) {

        console.error(
            "UPDATE APPLICATION STATUS ERROR:",
            error
        );


        return res.status(500).json({

            message:
                "Server error while updating application status",

            error:
                error.message

        });

    }

}


);

/* =========================================================
6. STUDENT WITHDRAW APPLICATION
========================================================= */

router.delete(
"/:id",
auth,
async (req, res) => {


    try {

        if (!req.user) {

            return res.status(401).json({
                message:
                    "Authentication required"
            });

        }


        if (
            req.user.role !==
            "student"
        ) {

            return res.status(403).json({

                message:
                    "Only students can withdraw applications"

            });

        }


        const {
            id
        } = req.params;


        if (!isValidObjectId(id)) {

            return res.status(400).json({
                message:
                    "Invalid application ID"
            });

        }


        const application =
            await Application.findById(id);


        if (!application) {

            return res.status(404).json({
                message:
                    "Application not found"
            });

        }


        if (
            String(
                application.student
            ) !==
            String(
                req.user.id
            )
        ) {

            return res.status(403).json({
                message:
                    "Access denied"
            });

        }


        await Application.findByIdAndDelete(
            id
        );


        return res.status(200).json({

            message:
                "Application withdrawn successfully"

        });


    } catch (error) {

        console.error(
            "DELETE APPLICATION ERROR:",
            error
        );


        return res.status(500).json({

            message:
                "Server error while withdrawing application",

            error:
                error.message

        });

    }

}


);

/* =========================================================
EXPORT
========================================================= */

module.exports = router;
