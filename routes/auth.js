const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

// =====================
// Register Page
// =====================
router.get("/register", (req, res) => {
    res.render("register");
});

// =====================
// Login Page
// =====================
router.get("/login", (req, res) => {
    res.render("login");
});

// =====================
// Register User
// =====================
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.send("Email already registered.");
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        // Save user in session
        req.session.user = {
            id: user._id,
            name: user.name,
            email: user.email,
        };

        res.redirect("/chat");
    } catch (error) {
        console.log(error);
        res.send("Something went wrong.");
    }
});

// =====================
// Login User
// =====================
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.send("Invalid email or password.");
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.send("Invalid email or password.");
        }

        // Save user in session
        req.session.user = {
            id: user._id,
            name: user.name,
            email: user.email,
        };

        res.redirect("/chat");
    } catch (error) {
        console.log(error);
        res.send("Something went wrong.");
    }
});

// =====================
// Logout
// =====================
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

module.exports = router;