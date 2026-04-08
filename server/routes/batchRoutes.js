const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../middleware/authMiddleware');
const Batch = require('../models/Batch');
const Document = require('../models/Document');

// @route   POST api/batches
// @desc    Create a new batch
// @access  Coordinator Only
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'COORDINATOR' && req.user.role !== 'CHAIRMAN' && req.user.role !== 'COMPUTER_OPERATOR') {
        return res.status(403).json({ msg: 'Access denied: Staff only' });
    }

    const { batch_name, batch_username, batch_password } = req.body;

    try {
        let batch = await Batch.findOne({ batch_username });
        if (batch) return res.status(400).json({ msg: 'Batch username already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(batch_password, salt);

        const newBatch = new Batch({
            batch_name,
            batch_username,
            batch_password: hashedPassword,
            created_by: req.user.id
        });

        const savedBatch = await newBatch.save();
        res.json(savedBatch);

    } catch (err) {
        console.error('Create Batch Error:', err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   GET api/batches
// @desc    Get all batches
// @access  Staff
router.get('/', auth, async (req, res) => {
    if (!['COORDINATOR', 'TEACHER', 'CHAIRMAN', 'CC', 'COMPUTER_OPERATOR'].includes(req.user.role)) {
        return res.status(403).json({ msg: 'Access denied' });
    }

    try {
        const batches = await Batch.find().select('-batch_password').sort({ created_at: -1 });
        res.json(batches);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   DELETE api/batches/:id
// @desc    Delete a batch
// @access  Coordinator Only
router.delete('/:id', auth, async (req, res) => {
    if (req.user.role !== 'COORDINATOR' && req.user.role !== 'CHAIRMAN' && req.user.role !== 'COMPUTER_OPERATOR') {
        return res.status(403).json({ msg: 'Access denied' });
    }

    try {
        const batch = await Batch.findById(req.params.id);
        if (!batch) return res.status(404).json({ msg: 'Batch not found' });

        await Document.deleteMany({ target_batch: req.params.id });

        await batch.deleteOne();
        res.json({ msg: 'Batch removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;
