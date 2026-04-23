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

const hexToRgb = (hex) => {
    if (!hex || hex === 'transparent') return rgb(1, 1, 1);
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const bigint = parseInt(hex, 16);
    return rgb(((bigint >> 16) & 255) / 255, ((bigint >> 8) & 255) / 255, (bigint & 255) / 255);
};

const generateRoutinePDF = async (timetable, title) => {
    const isLegacy = Array.isArray(timetable);
    // console.log(timetable.cells[3]);
    const grid = isLegacy ? { columns: [], rows: [], cells: [] } : timetable;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([1200, 900]);
    const { width, height } = page.getSize();
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const resolveBg = (color, fallback) => (!color || color === 'transparent') ? fallback : color;  
    // Header layout
    const centerText = (text, y, size, f, color) => {
        const tw = f.widthOfTextAtSize(text, size);
        page.drawText(text, { x: (width - tw) / 2, y, size, font: f, color });
    };
    centerText('University of Rajshahi', height - 28, 16, bold, rgb(0.05, 0.12, 0.42));
    centerText('Department of Information and Communication Engineering', height - 46, 11, bold, rgb(0.12, 0.12, 0.12));
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    centerText('[Effective From ' + dateStr + ']', height - 61, 9, font, rgb(0.35, 0.35, 0.35));

    if (isLegacy || !grid.columns) return Buffer.from(await pdfDoc.save());

    // Grid Scaling Calculations
    const ROW_H = 26;
    const originX = 30; 
    const colW = [45, 45, 95, ...grid.columns.map(() => 105)];
    const colX = [originX];
    colW.forEach((w, i) => colX.push(colX[i] + w));
    const totalW = colX[colX.length - 1] - originX;
    
    // Calculate Grid Height Offset
    const tableTop = height - 85;

    // Helper block
    const drawCell = (x, y, w, h, bgHex, cellStrData, isHdr = false) => {
        const isDark = bgHex.toLowerCase() === '#1e293b';
        const safeBg = resolveBg(bgHex, '#ffffff');
       try {
        page.drawRectangle({ x, y: y - h, width: w, height: h, color: hexToRgb(safeBg) });
        } catch (e) {
        page.drawRectangle({ x, y: y - h, width: w, height: h, color: rgb(1, 1, 1) });
        }
        page.drawLine({ start: { x, y: y - h }, end: { x: x + w, y: y - h }, thickness: 0.5, color: rgb(0.7,0.7,0.7) });
        page.drawLine({ start: { x, y: y }, end: { x: x + w, y: y }, thickness: 0.5, color: rgb(0.7,0.7,0.7) });
        page.drawLine({ start: { x, y: y - h }, end: { x, y }, thickness: 0.5, color: rgb(0.7,0.7,0.7) });
        page.drawLine({ start: { x: x + w, y: y - h }, end: { x: x + w, y }, thickness: 0.5, color: rgb(0.7,0.7,0.7) });

        if (!cellStrData) return;
        
        if (cellStrData.status === 'CANCELLED') {
             const tw = bold.widthOfTextAtSize('CANCELLED', 6.5);
             page.drawText('CANCELLED', { x: x + (w - tw)/2, y: y - (h/2) + 2, size: 6.5, font: bold, color: rgb(0.85, 0.1, 0.1) });
             if (cellStrData.reason) {
                 const rw = font.widthOfTextAtSize(cellStrData.reason, 5);
                 page.drawText(cellStrData.reason.slice(0, 30), { x: x + (w - Math.min(rw, w-4))/2, y: y - (h/2) - 6, size: 5, font: font, color: rgb(0.6, 0.2, 0.2) });
             }
             return;
        }

        let rawTexts = [];
        if (typeof cellStrData === 'string') {
            rawTexts.push(cellStrData);
        } else if (cellStrData.course) {
            rawTexts.push(cellStrData.course);
            if (cellStrData.teacher || cellStrData.room) Object.keys(cellStrData).length && rawTexts.push(`[${cellStrData.teacher || ''}] (${cellStrData.room || ''})`);
        } else if (cellStrData.value) {
            rawTexts.push(cellStrData.value);
        }

        const lines = [];
        rawTexts.forEach(text => {
            if (text) {
                // Split by \n and by | to support legacy breaks and UI line breaks
                const parts = text.toString().split(/[\n|]/);
                lines.push(...parts);
            }
        });

        let ty = y - (h/2) + ((lines.length - 1) * 4.5);
        lines.forEach(l => {
            if (!l) return;
            // Clean up any remaining invalid characters that pdf-lib might choke on
            const cleanStr = l.replace(/[\r\n\t]/g, '');
            if (!cleanStr) return;
            const fs = isHdr ? 7 : 6.5;
            const lw = bold.widthOfTextAtSize(cleanStr, fs);
            page.drawText(cleanStr, { x: x + (w - lw)/2, y: ty - 2, size: fs, font: isHdr ? bold : font, color: isDark ? rgb(1,1,1) : rgb(0.1,0.1,0.1) });
            ty -= 10;
        });
    };

    // Draw Column Headers (Top Row)
    ['Day', 'Year', 'Semester'].forEach((lbl, i) => {
        drawCell(colX[i], tableTop, colW[i], ROW_H, '#1e293b', { value: lbl }, true);
    });
    grid.columns.forEach((col, i) => {
        if (!col || col.hidden) return;
        const colVal = typeof col === 'object' ? col : { value: col };
        const w = colW.slice(i + 3, i + 3 + (col.colSpan || 1)).reduce((a,b)=>a+b, 0);
        // Column headers:
        drawCell(colX[i+3], tableTop, w, ROW_H * (col.rowSpan || 1), resolveBg(col.bgColor, '#1e293b'), colVal, true);
    });

    let currentY = tableTop - ROW_H;

    // Draw Data Rows & Row Headers
    grid.rows.forEach((row, ri) => {
        ['day', 'year', 'sem'].forEach((key, ci) => {
            let cell = row[key];
            if (!cell) return;
            if (typeof cell === 'string') cell = { value: cell };
            if (cell.hidden) return;
            
            const h = ROW_H * (cell.rowSpan || 1);
            const w = colW.slice(ci, ci + (cell.colSpan || 1)).reduce((a,b)=>a+b, 0);
            // Row headers:
            drawCell(colX[ci], currentY, w, h, resolveBg(cell.bgColor, '#f1f5f9'), cell, true);

        });

        const rCells = grid.cells[ri] || [];
        rCells.forEach((cell, ci) => {
            if (!cell || cell.hidden) return;
            const h = ROW_H * (cell.rowSpan || 1);
            const w = colW.slice(ci + 3, ci + 3 + (cell.colSpan || 1)).reduce((a,b)=>a+b, 0);
            // Data cells:
            drawCell(colX[ci+3], currentY, w, h, resolveBg(cell.bgColor, '#ffffff'), cell, false);
        });
        currentY -= ROW_H;
    });

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
            const grid = routine.timetable;
            if (!grid || !grid.rows || !grid.cells) continue;
            
            grid.rows.forEach((row, rIdx) => {
                const rowDay = typeof row.day === 'object' ? row.day.value : row.day;
                if ((rowDay||"").toUpperCase() === today) {
                    const year = typeof row.year === 'object' ? row.year.value : row.year;
                    const sem = typeof row.sem === 'object' ? row.sem.value : row.sem;
                    
                    grid.cells[rIdx].forEach((cell, cIdx) => {
                       if (cIdx >= grid.columns.length) return; 
                       const colSlot = grid.columns[cIdx];
                       const timeSlot = typeof colSlot === 'object' ? colSlot.value : colSlot;
                       if ((timeSlot||'').toLowerCase().includes('break')) return;

                       if (!cell || cell.hidden) return; // skip merged child
                       const entry = {
                           year, semester: sem, timeSlot: timeSlot || `Slot ${cIdx + 1}`,
                           course: cell.course, teacher: cell.teacher, room: cell.room,
                           status: cell.status, reason: cell.reason,
                           routineTitle: routine.title, routineAuthor: routine.author?.full_name, routineId: routine._id
                       };
                       if (cell.status === 'CANCELLED' && (cell.course || cell.reason)) cancelled.push(entry);
                       else if (cell.course) classes.push(entry);
                    });
                }
            });
        }

        // Sort dynamically without hardcoded index arrays
        const sortBySlot = (a, b) => parseInt(a.timeSlot) - parseInt(b.timeSlot);
        classes.sort(sortBySlot);
        cancelled.sort(sortBySlot);

        res.json({ today, classes, cancelled, totalRoutines: approvedRoutines.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;