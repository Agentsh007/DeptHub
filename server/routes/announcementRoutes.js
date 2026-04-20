 const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Announcement = require('../models/Announcement');
const multer = require('multer');
const path = require('path');
const { cloudinary } = require('../config/cloudinary');

// ✅ FIX: Missing pdf-lib import (was causing ReferenceError in generateRoutinePDF)
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

// Multer Config (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10000000 },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|pdf|doc|docx/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype || extname) return cb(null, true);
        else cb('Error: Images, PDFs and Docs Only!');
    }
});

// ================== PDF GENERATOR ==================
const TIME_SLOTS = [
    '09:05-10:00',
    '10:05-11:00',
    '11:05-12:00',
    '01:00-02:00',
    '02:05-03:00',
    '03:05-04:00',
];

const PDF_YEAR_GROUPS = [
    { year: '1st', count: 1 },
    { year: '2nd', count: 1 },
    { year: '3rd', count: 1 },
    { year: '4th', count: 2 },
    { year: 'MSc', count: 1 },
];

const generateRoutinePDF = async (timetable, title) => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([1200, 900]);
    const { width, height } = page.getSize();
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // ── Column layout ──
    const CW = { day: 38, year: 36, sem: 92, slot: 138, brk: 28 };
    const totalW = CW.day + CW.year + CW.sem + CW.slot * 6 + CW.brk;
    const originX = Math.floor((width - totalW) / 2);
    const colX = [originX];
    [CW.day, CW.year, CW.sem, CW.slot, CW.slot, CW.slot, CW.brk, CW.slot, CW.slot, CW.slot].forEach(w => colX.push(colX[colX.length - 1] + w));
    const colW = [CW.day, CW.year, CW.sem, CW.slot, CW.slot, CW.slot, CW.brk, CW.slot, CW.slot, CW.slot];
    const ROWS_PER_DAY = 6;
    const ROW_H = 24;
    const HDR_H = 30;

    // ── Centered text helper ──
    const centerText = (text, y, size, f, color) => {
        const tw = f.widthOfTextAtSize(text, size);
        page.drawText(text, { x: (width - tw) / 2, y, size, font: f, color });
    };

    // ── Header ──
    centerText('University of Rajshahi', height - 28, 16, bold, rgb(0.05, 0.12, 0.42));
    centerText('Department of Information and Communication Engineering', height - 46, 11, bold, rgb(0.12, 0.12, 0.12));
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    centerText('[Effective From ' + dateStr + ']', height - 61, 9, font, rgb(0.35, 0.35, 0.35));

    // ── Table header row ──
    const tableTop = height - 78;
    page.drawRectangle({ x: colX[0], y: tableTop - HDR_H, width: totalW, height: HDR_H, color: rgb(0.06, 0.15, 0.38) });

    const hdrLabels = ['Day', 'Year', 'Semester',
        '09:05 AM -|10:00 AM', '10:05 AM -|11:00 AM', '11:05 AM -|12:00 PM',
        'BREAK|12-1PM',
        '01:00 PM -|2:00 PM', '2:05 PM -|3:00 PM', '3:05 PM -|4:00 PM'];

    hdrLabels.forEach((label, ci) => {
        const lines = label.split('|');
        const fs = ci === 6 ? 5 : 6.5;
        lines.forEach((line, li) => {
            const lw = bold.widthOfTextAtSize(line, fs);
            const tx = colX[ci] + (colW[ci] - lw) / 2;
            const ty = lines.length === 1
                ? tableTop - HDR_H / 2 - 3
                : tableTop - 10 - li * 11;
            page.drawText(line, { x: Math.max(tx, colX[ci] + 2), y: ty, size: fs, font: bold, color: rgb(1, 1, 1) });
        });
    });

    // ── Data rows ──
    let y = tableTop - HDR_H;
    const slotColIdx = [3, 4, 5, 7, 8, 9];

    (timetable || []).forEach((dayRow) => {
        const dayH = ROWS_PER_DAY * ROW_H;

        // Day cell background + text
        page.drawRectangle({ x: colX[0], y: y - dayH, width: CW.day, height: dayH, color: rgb(0.88, 0.93, 1) });
        const dayTW = bold.widthOfTextAtSize(dayRow.day, 9);
        page.drawText(dayRow.day, { x: colX[0] + (CW.day - dayTW) / 2, y: y - dayH / 2 - 3, size: 9, font: bold, color: rgb(0.05, 0.2, 0.55) });

        // Break column background + vertical text
        page.drawRectangle({ x: colX[6], y: y - dayH, width: CW.brk, height: dayH, color: rgb(1, 0.96, 0.93) });
        const brkText = 'BREAK';
        for (let bi = 0; bi < brkText.length; bi++) {
            const ch = brkText[bi];
            const chW = bold.widthOfTextAtSize(ch, 5.5);
            page.drawText(ch, { x: colX[6] + (CW.brk - chW) / 2, y: y - dayH / 2 + 16 - bi * 7, size: 5.5, font: bold, color: rgb(0.7, 0.15, 0.15) });
        }
        const timeStr = '12-1PM';
        const tmW = font.widthOfTextAtSize(timeStr, 4.5);
        page.drawText(timeStr, { x: colX[6] + (CW.brk - tmW) / 2, y: y - dayH / 2 - 25, size: 4.5, font: font, color: rgb(0.5, 0.25, 0.25) });

        // Year-grouped semester rows
        let rowY = y;
        let semIdx = 0;
        PDF_YEAR_GROUPS.forEach(({ year: yr, count: cnt }) => {
            const groupH = cnt * ROW_H;
            // Year cell
            page.drawRectangle({ x: colX[1], y: rowY - groupH, width: CW.year, height: groupH, color: rgb(0.93, 0.96, 1) });
            const yrTW = bold.widthOfTextAtSize(yr, 7.5);
            page.drawText(yr, { x: colX[1] + (CW.year - yrTW) / 2, y: rowY - groupH / 2 - 3, size: 7.5, font: bold, color: rgb(0.12, 0.25, 0.55) });

            for (let gi = 0; gi < cnt; gi++) {
                const sr = (dayRow.semesterRows || [])[semIdx];
                const cellTop = rowY - gi * ROW_H;

                if (sr) {
                    // Semester label
                    const semLabel = (sr.semester || '').slice(0, 18);
                    page.drawText(semLabel, { x: colX[2] + 3, y: cellTop - 15, size: 6, font: font, color: rgb(0.25, 0.25, 0.25) });

                    // Time slot cells
                    (sr.slots || []).forEach((slot, si) => {
                        const ci = slotColIdx[si];
                        const sx = colX[ci];
                        if (slot.status === 'CANCELLED') {
                            page.drawRectangle({ x: sx + 1, y: cellTop - ROW_H + 1, width: colW[ci] - 2, height: ROW_H - 2, color: rgb(1, 0.94, 0.94) });
                            page.drawText('CANCELLED', { x: sx + 3, y: cellTop - 11, size: 5.5, font: bold, color: rgb(0.85, 0.08, 0.08) });
                            if (slot.reason) {
                                page.drawText(slot.reason.slice(0, 20), { x: sx + 3, y: cellTop - 19, size: 4.5, font: font, color: rgb(0.55, 0.18, 0.18) });
                            }
                        } else if (slot.course) {
                            page.drawText(slot.course.slice(0, 18), { x: sx + 3, y: cellTop - 10, size: 6.5, font: bold, color: rgb(0.05, 0.15, 0.45) });
                            let detail = '';
                            if (slot.teacher) detail += '[' + slot.teacher + ']';
                            if (slot.room) detail += '(' + slot.room + ')';
                            if (detail) page.drawText(detail.slice(0, 24), { x: sx + 3, y: cellTop - 19, size: 5, font: font, color: rgb(0.3, 0.3, 0.3) });
                        }
                    });
                }
                // Row divider
                page.drawLine({ start: { x: colX[1], y: cellTop - ROW_H }, end: { x: colX[10], y: cellTop - ROW_H }, thickness: 0.3, color: rgb(0.82, 0.82, 0.82) });
                semIdx++;
            }
            // Year group border
            page.drawLine({ start: { x: colX[1], y: rowY - groupH }, end: { x: colX[10], y: rowY - groupH }, thickness: 0.6, color: rgb(0.7, 0.7, 0.7) });
            rowY -= groupH;
        });

        // Day separator
        page.drawLine({ start: { x: colX[0], y: y - dayH }, end: { x: colX[10], y: y - dayH }, thickness: 1.2, color: rgb(0.35, 0.35, 0.35) });
        y -= dayH;
    });

    // ── Vertical column lines ──
    const tableBottom = y;
    colX.forEach((x) => {
        page.drawLine({ start: { x, y: tableTop }, end: { x, y: tableBottom }, thickness: 0.5, color: rgb(0.65, 0.65, 0.65) });
    });

    // ── Outer border ──
    page.drawLine({ start: { x: colX[0], y: tableTop }, end: { x: colX[10], y: tableTop }, thickness: 1.5, color: rgb(0.2, 0.2, 0.2) });
    page.drawLine({ start: { x: colX[0], y: tableBottom }, end: { x: colX[10], y: tableBottom }, thickness: 1.5, color: rgb(0.2, 0.2, 0.2) });
    page.drawLine({ start: { x: colX[0], y: tableTop }, end: { x: colX[0], y: tableBottom }, thickness: 1.5, color: rgb(0.2, 0.2, 0.2) });
    page.drawLine({ start: { x: colX[10], y: tableTop }, end: { x: colX[10], y: tableBottom }, thickness: 1.5, color: rgb(0.2, 0.2, 0.2) });

    return Buffer.from(await pdfDoc.save());
};

// ===================================================
// @route   POST api/announcements
// @desc    Create a notice or announcement
// @access  Chairman, Operator, CC, Teacher
router.post('/', auth, upload.single('file'), async (req, res) => {
    const { title, content, target_batch, type, target_audience } = req.body;
    const { role } = req.user;

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
        if (req.file) {
            const b64 = Buffer.from(req.file.buffer).toString('base64');
            const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
            const result = await cloudinary.uploader.upload(dataURI, {
                resource_type: "auto",
                folder: "uni_connect_notices"
            });
            file_url = result.secure_url;
        }

        let status = 'PENDING_APPROVAL';
        if (type === 'ANNOUNCEMENT') status = 'APPROVED';
        else if (role === 'CHAIRMAN') status = 'APPROVED';
        else if (role === 'TEACHER' && type === 'ROUTINE') {
            status = ['PENDING_FEEDBACK', 'PENDING_APPROVAL'].includes(req.body.status)
                ? req.body.status
                : 'PENDING_FEEDBACK';
        } else if (role === 'COMPUTER_OPERATOR') status = 'PENDING_APPROVAL';

        const allowedAudience = ['Teacher', 'Student', 'Everyone'];
        const normalizedAudience = allowedAudience.includes(target_audience) ? target_audience : 'Everyone';

        const newAnnouncement = new Announcement({
            title, content,
            author: req.user.id,
            target_audience: normalizedAudience,
            target_batch: target_batch || null,
            type, file_url, status
        });

        const saved = await newAnnouncement.save();
        res.json(saved);
    } catch (err) {
        console.error('Upload Error:', err);
        if (!res.headersSent) res.status(500).json({ msg: 'Server Error', error: err.message });
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
            query = {
                status: 'APPROVED',
                $or: [{ type: 'NOTICE' }, { type: 'ROUTINE' }, { target_batch: id }]
            };
        } else if (role === 'CHAIRMAN') {
            query = { status: { $in: ['APPROVED', 'PENDING_APPROVAL'] } };
        } else if (role === 'TEACHER') {
            query = {
                $or: [
                    { status: 'APPROVED' },
                    { status: 'PENDING_FEEDBACK', type: 'ROUTINE' },
                    { author: req.user.id }
                ]
            };
        } else {
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
router.delete('/:id', auth, async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) return res.status(404).json({ msg: 'Not Found' });
        if (announcement.author.toString() !== req.user.id && req.user.role !== 'CHAIRMAN') {
            return res.status(401).json({ msg: 'Not Authorized' });
        }
        await Announcement.deleteOne({ _id: req.params.id });
        res.json({ msg: 'Deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   PUT api/announcements/:id/status
router.put('/:id/status', auth, async (req, res) => {
    if (req.user.role !== 'CHAIRMAN' && req.user.role !== 'TEACHER') {
        return res.status(403).json({ msg: 'Not authorized' });
    }

    const { status, feedback } = req.body;

    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) return res.status(404).json({ msg: 'Announcement not found' });

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

// ====================== ROUTINE BUILDER ======================

// @route   POST api/announcements/routine-builder
// @desc    Create or update a routine via interactive builder
// @access  Teacher only
router.post('/routine-builder', auth, async (req, res) => {
    const { title, timetable, routineId } = req.body;

    if (req.user.role !== 'TEACHER') {
        return res.status(403).json({ msg: 'Only teachers can create/edit routines' });
    }

    try {
        const pdfBuffer = await generateRoutinePDF(timetable, title || 'Weekly Routine');
        const b64 = pdfBuffer.toString('base64');
        const dataURI = `data:application/pdf;base64,${b64}`;
        const uploadResult = await cloudinary.uploader.upload(dataURI, {
            resource_type: 'raw',
            folder: 'uni_connect_routines',
            public_id: 'routine_' + Date.now() + '.pdf'
        });

        const routineData = {
            title: title || 'Weekly Routine',
            content: 'Interactive Routine Builder',
            author: req.user.id,
            type: 'ROUTINE',
            timetable: timetable,
            file_url: uploadResult.secure_url,
            status: 'PENDING_FEEDBACK'
        };

        let saved;
        if (routineId) {
            const existing = await Announcement.findById(routineId);
            if (!existing || existing.author.toString() !== req.user.id) {
                return res.status(403).json({ msg: 'Not authorized to edit this routine' });
            }
            // Preserve status unless it was rejected (allow resubmit)
            if (existing.status === 'REJECTED') routineData.status = 'PENDING_FEEDBACK';
            else routineData.status = existing.status;
            Object.assign(existing, routineData);
            saved = await existing.save();
        } else {
            saved = await new Announcement(routineData).save();
        }

        res.json(saved);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// ====================== CHAIRMAN SUPERVISION ======================

// @route   GET api/announcements/supervision/today
// @desc    Get all classes happening today from APPROVED routines
// @access  Chairman only
router.get('/supervision/today', auth, async (req, res) => {
    if (req.user.role !== 'CHAIRMAN') {
        return res.status(403).json({ msg: 'Not authorized' });
    }

    try {
        // Get today's short day name: SUN, MON, TUE, WED, THU
        const today = new Date().toLocaleString('en-US', { weekday: 'short' }).toUpperCase();

        const approvedRoutines = await Announcement.find({ type: 'ROUTINE', status: 'APPROVED' })
            .populate('author', 'full_name');

        const classes = [];
        const cancelled = [];

        for (const routine of approvedRoutines) {
            if (!Array.isArray(routine.timetable)) continue;
            const dayRow = routine.timetable.find(d => d.day === today);
            if (!dayRow) continue;

            for (const semRow of (dayRow.semesterRows || [])) {
                (semRow.slots || []).forEach((slot, idx) => {
                    const entry = {
                        year: semRow.year || '',
                        semester: semRow.semester,
                        timeSlot: TIME_SLOTS[idx] || `Slot ${idx + 1}`,
                        course: slot.course,
                        teacher: slot.teacher,
                        room: slot.room,
                        status: slot.status,
                        reason: slot.reason,
                        routineTitle: routine.title,
                        routineAuthor: routine.author?.full_name,
                        routineId: routine._id,
                    };

                    if (slot.status === 'CANCELLED' && (slot.course || slot.reason)) {
                        cancelled.push(entry);
                    } else if (slot.course) {
                        classes.push(entry);
                    }
                });
            }
        }

        // Sort by time slot index
        const sortBySlot = (a, b) => TIME_SLOTS.indexOf(a.timeSlot) - TIME_SLOTS.indexOf(b.timeSlot);
        classes.sort(sortBySlot);
        cancelled.sort(sortBySlot);

        res.json({ today, classes, cancelled, totalRoutines: approvedRoutines.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;