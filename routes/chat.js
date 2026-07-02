const express = require("express");
const router = express.Router();

const Chat = require("../models/Chat");
const Message = require("../models/Message");
const isLoggedIn = require("../middleware/auth");
const generateResponse = require("../config/openrouter");


// ======================
// Chat Dashboard
// ======================
router.get("/", isLoggedIn, async (req, res) => {
    try {
        const chats = await Chat.find({
            user: req.session.user.id,
        }).sort({ updatedAt: -1 });

        res.render("chat", {
            user: req.session.user,
            chats,
            messages: [],
            activeChat: null,
        });

    } catch (err) {
        console.error("Dashboard Error:", err);
        res.status(500).send("Something went wrong.");
    }
});


// ======================
// Create New Chat
// ======================
router.post("/new", isLoggedIn, async (req, res) => {
    try {
        const chat = await Chat.create({
            user: req.session.user.id,
            title: "New Chat",
        });

        res.redirect(`/chat/${chat._id}`);

    } catch (err) {
        console.error("Create Chat Error:", err);
        res.status(500).send("Something went wrong.");
    }
});


// ======================
// Open Chat
// ======================
router.get("/:id", isLoggedIn, async (req, res) => {
    try {
        const chats = await Chat.find({
            user: req.session.user.id,
        }).sort({ updatedAt: -1 });

        const messages = await Message.find({
            chat: req.params.id,
        });

        res.render("chat", {
            user: req.session.user,
            chats,
            messages,
            activeChat: req.params.id,
        });

    } catch (err) {
        console.error("Open Chat Error:", err);
        res.status(500).send("Something went wrong.");
    }
});


// ======================
// Send Message (FIXED - JSON RESPONSE)
// ======================
router.post("/:id/message", isLoggedIn, async (req, res) => {
    console.log("========== NEW MESSAGE ==========");
    console.log("Chat ID:", req.params.id);

    try {
        const { prompt } = req.body;

        console.log("Prompt:", prompt);

        if (!prompt) {
            return res.status(400).json({
                success: false,
                message: "Prompt is required"
            });
        }

        // Save user message
        await Message.create({
            chat: req.params.id,
            role: "user",
            content: prompt,
        });

        console.log("User message saved.");

        // Generate AI response
        console.log("Calling OpenRouter...");
        const reply = await generateResponse(prompt);

        console.log("AI Reply:", reply);

        // Save AI message
        await Message.create({
            chat: req.params.id,
            role: "assistant",
            content: reply,
        });

        console.log("AI message saved.");

        // Update chat timestamp
        await Chat.findByIdAndUpdate(req.params.id, {
            updatedAt: new Date(),
        });

        console.log("Sending JSON response...");

        return res.json({
            success: true,
            reply: reply
        });

    } catch (err) {
        console.error("Send Message Error:", err);

        return res.status(500).json({
            success: false,
            message: err.message || "Server error"
        });
    }
});


// ======================
// Delete Chat
// ======================
router.post("/:id/delete", isLoggedIn, async (req, res) => {
    try {
        await Chat.findByIdAndDelete(req.params.id);

        await Message.deleteMany({
            chat: req.params.id,
        });

        res.redirect("/chat");

    } catch (err) {
        console.error("Delete Chat Error:", err);
        res.status(500).send("Something went wrong.");
    }
});

module.exports = router;