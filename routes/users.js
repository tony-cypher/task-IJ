const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const router = express.Router();
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, username, password } = req.body;
        const user = new User({ firstName, lastName, email, username, password });
        await user.save();
        res.status(201).send({ message: 'User registered successfully' });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).send({ message: 'Username or email already exists' });
        } else {
            res.status(400).send({ message: error.message });
        }
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        req.session.userId = user._id.toString();
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({ message: 'Error logging in' });
            }
            console.log('Login - Session saved:', req.session);
            res.json({ message: 'Logged in successfully', user: { id: user._id, username: user.username } });
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.error('Logout error:', error);
            return res.status(500).send({ message: 'Could not log out, please try again' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
    });
});

module.exports = router;

