const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');
const Batch = require('../models/Batch');

// @route   POST api/auth/register-staff
// @desc    Register new staff (Coordinator/Teacher)
// @access  Public
// @route   POST api/auth/register-public
// @desc    Public registration for Chairman and Teachers
// @access  Public
router.post('/register-public', async (req, res) => {
    const { full_name, email, password, role, secret_code, department } = req.body;

    // Validation
    if (!['CHAIRMAN', 'TEACHER'].includes(role)) {
        return res.status(400).json({ msg: 'Invalid role for public registration' });
    }

    if (role === 'CHAIRMAN' && secret_code !== process.env.CHAIRMAN_SECRET) {
        return res.status(400).json({ msg: 'Invalid Chairman Secret Code' });
    }
    if (role === 'TEACHER' && secret_code !== process.env.FACULTY_SECRET) {
        return res.status(400).json({ msg: 'Invalid Faculty Secret Code' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ msg: 'User already exists' });

        const newUser = new User({
            full_name, email, password, role, department
        });

        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(password, salt);
        await newUser.save();

        const token = jwt.sign(
            { id: newUser.id, role: newUser.role, name: newUser.full_name, email: newUser.email, department: newUser.department },
            process.env.JWT_SECRET,
            { expiresIn: 3600 * 24 }
        );

        res.json({ token, user: { id: newUser.id, name: newUser.full_name, email: newUser.email, role: newUser.role, department: newUser.department } });
    } catch (err) {
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   POST api/auth/create-staff
// @desc    Chairman creates Computer Operator
// @access  Chairman Only
router.post('/create-staff', auth, async (req, res) => {
    if (req.user.role !== 'CHAIRMAN') {
        return res.status(403).json({ msg: 'Access denied: Chairman only' });
    }

    const { full_name, email, password, role, department } = req.body;

    if (role !== 'COMPUTER_OPERATOR') {
        return res.status(400).json({ msg: 'Invalid role assignment' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ msg: 'User already exists' });

        const newUser = new User({
            full_name, email, password, role, department
        });

        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(password, salt);
        await newUser.save();

        res.json({ msg: `${role} created successfully` });
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   POST api/auth/login
// @desc    Login for all Staff (Chairman, CC, Operator, Teacher)
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'User does not exist' });

        if (user.role === 'BATCH') return res.status(400).json({ msg: 'Please use Student Login' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.full_name, email: user.email, department: user.department },
            process.env.JWT_SECRET,
            { expiresIn: 3600 * 24 }
        );

        res.json({
            token,
            user: { id: user.id, name: user.full_name, email: user.email, role: user.role, department: user.department }
        });
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   POST api/auth/login-batch
// @desc    Auth Batch & Get Token
// @access  Public
router.post('/login-batch', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check for batch
        const batch = await Batch.findOne({ batch_username: username });
        if (!batch) return res.status(400).json({ msg: 'Batch does not exist' });

        // Validate password
        // Note: For simplicity in the prompt, hash wasn't explicitly strictly enforced for batch everywhere but schema has it. 
        // We will assume Coordinators set plain text passwords that get hashed, or just comparing simple hash. 
        // I will implement bcrypt comparison here assuming the creation hashes it.
        const isMatch = await bcrypt.compare(password, batch.batch_password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        const token = jwt.sign(
            { id: batch.id, role: 'BATCH' },
            process.env.JWT_SECRET,
            { expiresIn: 3600 * 24 }
        );

        res.json({
            token,
            user: {
                id: batch.id,
                name: batch.batch_name,
                role: 'BATCH'
            }
        });

    } catch (err) {
        console.error('Batch Login Error:', err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   PUT api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
    const { full_name, email, department } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        if (full_name) user.full_name = full_name;
        if (email) user.email = email;
        if (department) user.department = department;

        await user.save();

        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.full_name,
                email: user.email,
                role: user.role,
                department: user.department
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/auth/profile
// @desc    Delete user account
// @access  Private
router.delete('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        await user.deleteOne();
        res.json({ success: true, msg: 'Account deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            // Check if it's a batch
            const batch = await Batch.findById(req.user.id);
            if (batch) {
                return res.json({
                    id: batch.id,
                    name: batch.batch_name,
                    role: 'BATCH'
                });
            }
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json({
            id: user.id,
            name: user.full_name,
            email: user.email,
            role: user.role,
            department: user.department
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// =====================================================================
// PATCH 1: server/routes/authRoutes.js
// Change ONE line in the GET /teachers route
// =====================================================================
 
// FIND this line (around line ~175):
//   if (req.user.role !== 'CHAIRMAN') {
// REPLACE with:
//   if (!['CHAIRMAN', 'TEACHER'].includes(req.user.role)) {
 
// This allows teachers to fetch the teacher list for the cell editor dropdown.
// The full replaced block looks like:
 
router.get('/teachers', auth, async (req, res) => {
    if (!['CHAIRMAN', 'TEACHER'].includes(req.user.role)) {  // ← CHANGED LINE
        return res.status(403).json({ msg: 'Access denied' });
    }
    try {
        const teachers = await User.find({ role: 'TEACHER' }).select('-password').populate('assigned_batch', 'batch_name');
        res.json(teachers);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;