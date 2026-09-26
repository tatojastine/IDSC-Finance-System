const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const Transaction = require("./models/Transaction");
const User = require("./models/User");

const app = express();
const PORT = 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.json({
        message: "IDSC Finance Management System API is running"
    });
});

// ===============================
// LOGIN
// ===============================
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase()
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        if (user.password !== password) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        res.json({
            message: "Login successful",
            user: {
                id: user._id,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

// ===============================
// TRANSACTIONS
// ===============================

// Get all transactions
app.get("/api/transactions", async (req, res) => {
    try {
        const transactions =
            await Transaction.find().sort({ date: -1 });

        res.json(transactions);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Add a transaction
app.post("/api/transactions", async (req, res) => {
    try {
        const transaction = new Transaction(req.body);

        const savedTransaction =
            await transaction.save();

        res.status(201).json(savedTransaction);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});

// Delete a transaction
app.delete("/api/transactions/:id", async (req, res) => {
    try {
        const deletedTransaction =
            await Transaction.findByIdAndDelete(req.params.id);

        if (!deletedTransaction) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        res.json({
            message: "Transaction deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Update a transaction
app.put("/api/transactions/:id", async (req, res) => {
    try {
        const updatedTransaction =
            await Transaction.findByIdAndUpdate(
                req.params.id,
                req.body,
                {
                    new: true,
                    runValidators: true
                }
            );

        if (!updatedTransaction) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        res.json(updatedTransaction);
    } catch (error) {
        console.error("Update error:", error);

        res.status(400).json({
            message: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(
        `Server running on http://localhost:${PORT}`
    );
});