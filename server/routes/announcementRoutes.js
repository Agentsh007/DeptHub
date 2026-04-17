const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Announcement = require('../models/Announcement');
const multer = require('multer');
const path = require('path');
const { cloudinary } = require('../config/cloudinary');

// Multer Config (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10000000 },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|pdf|doc|docx/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype || extname) {
            return cb(null, true);
        } else {
            cb('Error: Images, PDFs and Docs Only!');
        }
    }
});

// // @route   GET api/announcements/public
// // @desc    Get all public notices (for Home Page)
// // @access  Public
// router.get('/public', async (req, res) => {
//     try {
//         const notices = await Announcement.find({ type: 'NOTICE', status: 'APPROVED' })
//             .populate('author', 'full_name role')
//             .sort({ created_at: -1 })
//             .limit(10); // Limit to latest 10 notices for homepage display
//         res.json(notices);
//     } catch (err) {
//         res.status(500).json({ msg: 'Server Error' });
//     }
// });

// @route   POST api/announcements
// @desc    Create a notice or announcement
// @access  Chairman, Operator, CC, Teacher
router.post('/', auth, upload.single('file'), async (req, res) => {
    const { title, content, target_batch, type, target_audience } = req.body;
    const { role } = req.user;

    // Permission Check
    if (type === 'NOTICE' || type === 'ROUTINE') {
        if (!['CHAIRMAN', 'COMPUTER_OPERATOR', 'TEACHER'].includes(role)) {
            return res.status(403).json({ msg: 'Not Authorized to post Notices/Routines' });
        }
    } else if (type === 'ANNOUNCEMENT') {
        if (!['TEACHER', 'COMPUTER_OPERATOR'].includes(role)) {
            return res.status(403).json({ msg: 'Only Teacher or Operator can post Announcements' });
        }
    } else {
        return res.status(400).json({ msg: 'Invalid Type' });
    }

    try {
        let file_url = null;
        console.log('Processing upload request for:', req.user.email);
        console.log('Request Body:', req.body);
        console.log('Request File:', req.file ? 'File present' : 'No file');

        if (req.file) {
            console.log('Uploading file to Cloudinary...');
            const b64 = Buffer.from(req.file.buffer).toString('base64');
            const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
            const result = await cloudinary.uploader.upload(dataURI, {
                resource_type: "auto",
                folder: "uni_connect_notices"
            });
            file_url = result.secure_url;
            console.log('File uploaded to Cloudinary:', file_url);
        }

        // Determine Status
        let status = 'PENDING_APPROVAL'; // Default for Staff (Notice/Routine)

        if (type === 'ANNOUNCEMENT') {
            status = 'APPROVED'; // Class updates/internal announcements are auto-approved
        } else if (role === 'CHAIRMAN') {
            status = 'APPROVED';
        } else if (role === 'TEACHER' && type === 'ROUTINE') {
            // Teacher posting Routine: Check requested status
            if (req.body.status === 'PENDING_FEEDBACK' || req.body.status === 'PENDING_APPROVAL') {
                status = req.body.status;
            } else {
                status = 'PENDING_FEEDBACK'; // Default to feedback phase
            }
        } else if (role === 'COMPUTER_OPERATOR') {
            status = 'PENDING_APPROVAL';
        }

        const allowedAudience = ['Teacher', 'Student', 'Everyone'];
        const normalizedAudience = allowedAudience.includes(target_audience)
            ? target_audience
            : 'Everyone';

        const newAnnouncement = new Announcement({
            title,
            content,
            author: req.user.id,
            target_audience: normalizedAudience,
            target_batch: target_batch || null,
            type,
            file_url,
            status
        });

        const saved = await newAnnouncement.save();
        console.log('Announcement saved successfully:', saved._id);
        res.json(saved);

    } catch (err) {
        console.error('Upload Error Detailed:', err);
        if (!res.headersSent) res.status(500).json({ msg: 'Server Error', error: err.message, stack: err.stack });
    }
});

// @route   GET api/announcements
// @desc    Get announcements relevant to the user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        let query = {};
        const { role, id } = req.user;

        if (role === 'BATCH') {
            // Batches see Approved Global Notices AND Approved Announcements for their batch
            query = {
                status: 'APPROVED',
                $or: [
                    { type: 'NOTICE' }, // Global
                    { type: 'ROUTINE' }, // Global
                    { target_batch: id } // Specific to this batch
                ]
            };
        } else if (role === 'CHAIRMAN') {
            // Chairman sees Approved and Pending Approval (Strictly excludes PENDING_FEEDBACK)
            query = {
                status: { $in: ['APPROVED', 'PENDING_APPROVAL'] }
            };
        } else if (role === 'TEACHER') {
            // Teachers see Approved, Pending Feedback Routines (for peer review), and Own posts
            query = {
                $or: [
                    { status: 'APPROVED' },
                    { status: 'PENDING_FEEDBACK', type: 'ROUTINE' },
                    { author: req.user.id }
                ]
            };
        } else {
            // Operator sees all except pending feedback (unless they own it, but ops don't do feedback)
            query = {
                $or: [
                    { status: 'APPROVED' },
                    { status: 'PENDING_APPROVAL' },
                    { author: req.user.id }
                ]
            };
        }

        const announcements = await Announcement.find(query)
            .populate('author', 'full_name role')
            .populate('target_batch', 'batch_name')
            .sort({ created_at: -1 });

        res.json(announcements);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   DELETE api/announcements/:id
// @desc    Delete an announcement
// @access  Author or Chairman
router.delete('/:id', auth, async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) return res.status(404).json({ msg: 'Not Found' });

        // Check ownership
        if (announcement.author.toString() !== req.user.id && req.user.role !== 'CHAIRMAN') {
            return res.status(401).json({ msg: 'Not Authorized' });
        }

        await Announcement.deleteOne({ _id: req.params.id });
        console.log(`[Delete] Announcement ${req.params.id} deleted by ${req.user.id}`);
        res.json({ msg: 'Deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error', error: err.message, stack: err.stack });
    }
});

// Update announcement status (Approve/Reject)
router.put('/:id/status', auth, async (req, res) => {
    // Only Chairman or Author (Teacher) can update status
    // Chairman: Approve/Reject any pending item
    // Author: Move Routine from 'PENDING_FEEDBACK' to 'PENDING_APPROVAL'
    if (req.user.role !== 'CHAIRMAN' && req.user.role !== 'TEACHER') {
        return res.status(403).json({ msg: 'Not authorized' });
    }

    const { status, feedback } = req.body;

    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) {
            return res.status(404).json({ msg: 'Announcement not found' });
        }

        // Teacher Validation
        if (req.user.role === 'TEACHER') {
            if (announcement.author.toString() !== req.user.id) {
                return res.status(403).json({ msg: 'You can only update your own routines' });
            }
            if (status !== 'PENDING_APPROVAL') {
                return res.status(400).json({ msg: 'Teachers can only send routines for approval' });
            }
        }

        if (status) announcement.status = status;
        if (feedback) announcement.feedback = feedback;

        await announcement.save();
        res.json(announcement);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
