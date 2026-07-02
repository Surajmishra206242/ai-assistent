require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");

const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");

const app = express();


// ======================
// Connect Database
// ======================
connectDB();


// ======================
// Core Middleware
// ======================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// ======================
// Static Files
// ======================
app.use(express.static(path.join(__dirname, "public")));


// ======================
// Session Middleware
// ======================
app.use(
    session({
        secret: process.env.SESSION_SECRET || "default_secret_key",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false, // set true only in production (HTTPS)
            maxAge: 1000 * 60 * 60 * 24 // 1 day
        }
    })
);


// ======================
// View Engine
// ======================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


// ======================
// Make user available in all EJS files
// ======================
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});


// ======================
// Home Page
// ======================
app.get("/", (req, res) => {
    res.render("home");
});


// ======================
// Logout
// ======================
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});


// ======================
// Routes
// ======================
app.use("/", authRoutes);
app.use("/chat", chatRoutes);


// ======================
// 404 Handler
// ======================
app.use((req, res) => {
    res.status(404).send("404 | Page Not Found");
});


// ======================
// Start Server
// ======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});