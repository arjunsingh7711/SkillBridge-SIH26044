const express = require("express");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const OTP = require("../models/OTP");

const router = express.Router();


// ========================================
// EMAIL TRANSPORTER
// ========================================

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },

    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
});


// ========================================
// VERIFY SMTP CONNECTION
// ========================================

transporter.verify((error, success) => {
    if (error) {
        console.error("========================================");
        console.error("SMTP VERIFY ERROR:");
        console.error(error);
        console.error("========================================");
    } else {
        console.log("========================================");
        console.log("SMTP SERVER READY");
        console.log("========================================");
    }
});


// ========================================
// SEND OTP - SIGNUP
// ========================================

router.post("/send-otp", async (req, res) => {
    try {

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const existingUser = await User.findOne({
            email
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        // Delete old OTP
        await OTP.deleteMany({
            email
        });

        // Save new OTP
        await OTP.create({
            email: email,
            otp: otp,
            expiresAt: new Date(
                Date.now() + 5 * 60 * 1000
            )
        });

        // Send email
        await transporter.sendMail({
            from: `"SkillBridge" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "SkillBridge Email Verification",
            text:
                `Your SkillBridge OTP is ${otp}.\n\n` +
                `This OTP will expire in 5 minutes.\n\n` +
                `If you did not request this OTP, please ignore this email.`
        });

        console.log(
            `OTP SENT SUCCESSFULLY TO: ${email}`
        );

        return res.json({
            message: "OTP sent successfully"
        });

    } catch (error) {

        console.error("========================================");
        console.error("SEND OTP ERROR:");
        console.error(error);
        console.error("========================================");

        return res.status(500).json({
            message: "Failed to send OTP"
        });
    }
});


// ========================================
// VERIFY OTP + CREATE ACCOUNT
// ========================================

router.post("/verify-otp", async (req, res) => {
    try {

        const {
            name,
            email,
            password,
            role,
            otp
        } = req.body;

        if (
            !name ||
            !email ||
            !password ||
            !otp
        ) {
            return res.status(400).json({
                message: "Please fill all required fields"
            });
        }

        const otpRecord = await OTP.findOne({
            email
        });

        if (!otpRecord) {
            return res.status(400).json({
                message: "OTP not found"
            });
        }

        // Check expiry
        if (
            otpRecord.expiresAt < new Date()
        ) {

            await OTP.deleteOne({
                _id: otpRecord._id
            });

            return res.status(400).json({
                message: "OTP expired"
            });
        }

        // Check OTP
        if (otpRecord.otp !== otp) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        // Check existing user
        const existingUser = await User.findOne({
            email
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        // Create user
        const user = await User.create({
            name: name,
            email: email,
            password: hashedPassword,
            role: role || "student"
        });

        // Delete used OTP
        await OTP.deleteOne({
            _id: otpRecord._id
        });

        console.log(
            `ACCOUNT CREATED: ${email}`
        );

        return res.status(201).json({
            message: "Account created successfully",

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {

        console.error(
            "VERIFY OTP ERROR:",
            error
        );

        return res.status(500).json({
            message: "Server error"
        });
    }
});


// ========================================
// LOGIN + JWT
// ========================================

router.post("/login", async (req, res) => {
    try {

        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message:
                    "Email and password are required"
            });
        }

        const user = await User.findOne({
            email
        });

        if (!user) {
            return res.status(401).json({
                message:
                    "Invalid email or password"
            });
        }

        const isPasswordCorrect =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message:
                    "Invalid email or password"
            });
        }


        // ========================================
        // CREATE JWT TOKEN
        // ========================================

        const token = jwt.sign(
            {
                id: user._id.toString(),
                role: user.role
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "7d"
            }
        );


        // ========================================
        // LOGIN RESPONSE
        // ========================================

        return res.json({

            message: "Login successful",

            token: token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }

        });

    } catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );

        return res.status(500).json({
            message: "Server error"
        });
    }
});


// ========================================
// FORGOT PASSWORD
// ========================================

router.post(
    "/forgot-password",
    async (req, res) => {

        try {

            const { email } = req.body;

            if (!email) {
                return res.status(400).json({
                    message: "Email is required"
                });
            }

            const user = await User.findOne({
                email
            });

            if (!user) {
                return res.status(404).json({
                    message:
                        "No account found with this email"
                });
            }

            // Generate OTP
            const otp = Math.floor(
                100000 +
                Math.random() * 900000
            ).toString();

            // Remove previous OTP
            await OTP.deleteMany({
                email
            });

            // Save OTP
            await OTP.create({
                email: email,
                otp: otp,
                expiresAt: new Date(
                    Date.now() + 5 * 60 * 1000
                )
            });

            // Send reset email
            await transporter.sendMail({

                from:
                    `"SkillBridge" <${process.env.EMAIL_USER}>`,

                to: email,

                subject:
                    "SkillBridge Password Reset OTP",

                text:
                    `Your SkillBridge password reset OTP is ${otp}.\n\n` +
                    `This OTP will expire in 5 minutes.\n\n` +
                    `If you did not request a password reset, please ignore this email.`

            });

            console.log(
                `PASSWORD RESET OTP SENT TO: ${email}`
            );

            return res.json({
                message:
                    "Password reset OTP sent successfully"
            });

        } catch (error) {

            console.error(
                "FORGOT PASSWORD ERROR:",
                error
            );

            return res.status(500).json({
                message:
                    "Failed to send password reset OTP"
            });
        }
    }
);


// ========================================
// RESET PASSWORD
// ========================================

router.post(
    "/reset-password",
    async (req, res) => {

        try {

            const {
                email,
                otp,
                newPassword
            } = req.body;

            if (
                !email ||
                !otp ||
                !newPassword
            ) {
                return res.status(400).json({
                    message:
                        "Please fill all fields"
                });
            }

            const otpRecord =
                await OTP.findOne({
                    email: email
                });

            if (!otpRecord) {
                return res.status(400).json({
                    message:
                        "OTP not found"
                });
            }

            // Check expiry
            if (
                otpRecord.expiresAt < new Date()
            ) {

                await OTP.deleteOne({
                    _id: otpRecord._id
                });

                return res.status(400).json({
                    message:
                        "OTP expired"
                });
            }

            // Check OTP
            if (
                otpRecord.otp !== otp
            ) {
                return res.status(400).json({
                    message:
                        "Invalid OTP"
                });
            }

            // Hash new password
            const hashedPassword =
                await bcrypt.hash(
                    newPassword,
                    10
                );

            // Update password
            await User.findOneAndUpdate(
                {
                    email: email
                },
                {
                    password:
                        hashedPassword
                }
            );

            // Delete used OTP
            await OTP.deleteOne({
                _id: otpRecord._id
            });

            console.log(
                `PASSWORD RESET SUCCESSFUL: ${email}`
            );

            return res.json({
                message:
                    "Password reset successfully"
            });

        } catch (error) {

            console.error(
                "RESET PASSWORD ERROR:",
                error
            );

            return res.status(500).json({
                message: "Server error"
            });
        }
    }
);


// ========================================
// EXPORT ROUTER
// ========================================

module.exports = router;

