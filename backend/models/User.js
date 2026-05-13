
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const User = require('./models/User');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection (Aapna MongoDB URI yahan dalein)
mongoose.connect('mongodb://localhost:27017/mindguard')
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

// --- SIGNUP API ---
app.post('/signup', async (req, res) => {
    try {
        const { name, email, password, guardianOne, guardianTwo } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        // Password Hashing (Security)
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ name, email, password: hashedPassword, guardianOne, guardianTwo });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully", success: true });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// --- LOGIN API ---
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, 'secretkey', { expiresIn: '1h' });
        res.json({ token, user: { name: user.name, email: user.email }, success: true });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

app.listen(5000, () => console.log("Server running on port 5000"));