// Start of: ./server\check_db_content.js
const mongoose = require('mongoose');
const path = require('path');
// Adjust path to point to server/.env relative from server/check_db_content.js
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const User = require('./models/User');

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        const users = await User.find({}, 'full_name email role');
        console.log('Users found:', users);
        if (users.length === 0) {
            console.log('NO USERS FOUND!');
        } else {
            const chairman = users.find(u => u.email === 'chairman@example.com');
            const salma = users.find(u => u.email === 'salma@gmail.com');
            console.log('Chairman Exists:', !!chairman);
            console.log('Salma Exists:', !!salma);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUsers();

// End of file

// Start of: ./server\check_secrets.js
require('dotenv').config();
console.log('CHAIRMAN_SECRET:', process.env.CHAIRMAN_SECRET);
console.log('FACULTY_SECRET:', process.env.FACULTY_SECRET);

// End of file

// Start of: ./server\index.js
// Main Server Entry - Restart triggered for final verification
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000
})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/batches', require('./routes/batchRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
// Make uploads folder static
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
    res.send('UniResource API is running');
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;

// End of file

// Start of: ./server\mock-server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static((path.join(__dirname, 'uploads'))));

// Ensure uploads dir
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Mock Data Stores
let users = []; // { id, name, email, password, role, secret }
let batches = []; // { id, batch_name, batch_username, batch_password, created_by }
let documents = []; // { id, file_path, original_filename, uploaded_by, target_batch, upload_date }
let feedback = []; // { id, message_content, from_batch, sent_at }

// Helpers
const generateId = () => Math.random().toString(36).substr(2, 9);

// Mock Auth Middleware
const auth = (req, res, next) => {
    // For mock, we just trust the token is the user Object JSON stringified or ID
    // Actually, let's just make a simple "mock-token" that contains the ID
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token' });

    // In real app this is JWT verify. Here we just assume token IS the user ID or json
    try {
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
        req.user = decoded;
        next();
    } catch (e) {
        return res.status(401).json({ msg: 'Invalid token' });
    }
};

const createToken = (user) => {
    // Simple base64 encode of user object
    return Buffer.from(JSON.stringify(user)).toString('base64');
};

// --- ROUTES ---

// Auth
app.post('/api/auth/register-staff', (req, res) => {
    const { full_name, email, password, role, secret_code } = req.body;
    if (secret_code !== 'UNI2026') return res.status(400).json({ msg: 'Invalid Secret' });
    if (users.find(u => u.email === email)) return res.status(400).json({ msg: 'User exists' });

    const newUser = { id: generateId(), name: full_name, email, password, role }; // Password stored plain for mock
    users.push(newUser);

    const token = createToken({ id: newUser.id, role: newUser.role, name: newUser.name });
    res.json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } });
});

app.post('/api/auth/login-staff', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = createToken({ id: user.id, role: user.role, name: user.name });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

app.post('/api/auth/login-batch', (req, res) => {
    const { username, password } = req.body;
    const batch = batches.find(b => b.batch_username === username && b.batch_password === password);
    if (!batch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = createToken({ id: batch.id, role: 'BATCH', name: batch.batch_name });
    res.json({ token, user: { id: batch.id, name: batch.batch_name, role: 'BATCH' } });
});

// Batches
app.post('/api/batches', auth, (req, res) => {
    const { batch_name, batch_username, batch_password } = req.body;
    const newBatch = { id: generateId(), batch_name, batch_username, batch_password, created_by: req.user.id };
    batches.push(newBatch);
    res.json(newBatch);
});

app.get('/api/batches', auth, (req, res) => {
    res.json(batches);
});

// Documents
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

app.post('/api/documents/upload', auth, upload.single('file'), (req, res) => {
    const newDoc = {
        id: generateId(),
        file_path: req.file.path,
        original_filename: req.file.originalname,
        uploaded_by: req.user.id,
        target_batch: req.body.target_batch_id,
        upload_date: new Date()
    };
    documents.push(newDoc);
    res.json(newDoc);
});

app.get('/api/documents/my-uploads', auth, (req, res) => {
    const myDocs = documents.filter(d => d.uploaded_by === req.user.id).map(d => {
        const batch = batches.find(b => b.id === d.target_batch);
        return { ...d, target_batch: batch };
    });
    res.json(myDocs);
});

app.delete('/api/documents/:id', auth, (req, res) => {
    documents = documents.filter(d => d.id !== req.params.id);
    res.json({ msg: 'Deleted' });
});

app.get('/api/documents/batch/:batch_id/teachers', auth, (req, res) => {
    const batchDocs = documents.filter(d => d.target_batch === req.params.batch_id);
    const teacherIds = [...new Set(batchDocs.map(d => d.uploaded_by))];
    const teachers = users.filter(u => teacherIds.includes(u.id)).map(u => ({ _id: u.id, full_name: u.name })); // React expects _id
    res.json(teachers);
});

app.get('/api/documents/batch/:batch_id/teacher/:teacher_id', auth, (req, res) => {
    const docs = documents.filter(d => d.target_batch === req.params.batch_id && d.uploaded_by === req.params.teacher_id);
    // map id to _id for frontend compatibility if needed
    res.json(docs.map(d => ({ ...d, _id: d.id })));
});

// Feedback
app.post('/api/feedback', auth, (req, res) => {
    const newMsg = {
        id: generateId(),
        message_content: req.body.message_content,
        from_batch: req.user.id,
        sent_at: new Date()
    };
    feedback.push(newMsg);
    res.json(newMsg);
});

app.get('/api/feedback', auth, (req, res) => {
    const populated = feedback.map(f => {
        const batch = batches.find(b => b.id === f.from_batch);
        return { ...f, _id: f.id, from_batch: batch || { batch_name: 'Unknown' } };
    });
    res.json(populated);
});

const PORT = 5001;
app.listen(PORT, () => console.log(`Mock Server running on ${PORT}`));

// End of file

// Start of: ./server\seed_users_for_verification.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Batch = require('./models/Batch');
const Announcement = require('./models/Announcement');

dotenv.config({ path: './server/.env' });

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Clear existing data (optional, but good for clean state)
        await User.deleteMany({});
        await Batch.deleteMany({});
        await Announcement.deleteMany({});
        console.log('Cleared existing data');

        // 1. Create Chairman
        let chairman = await User.findOne({ email: 'chairman@example.com' });
        if (!chairman) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123', salt);
            chairman = new User({
                full_name: 'Chairman User',
                email: 'chairman@example.com',
                password: hashedPassword,
                role: 'CHAIRMAN',
                department: 'CSE'
            });
            await chairman.save();
            console.log('Created Chairman (chairman@example.com)');
        }

        // 2. Create Teachers
        const teachers = [
            { name: 'Salma', email: 'salma@gmail.com' },
            { name: 'Fardin', email: 'fardin@gmail.com' },
            { name: 'Shanto', email: 'shanto@gmail.com' }
        ];

        for (const t of teachers) {
            let teacher = await User.findOne({ email: t.email });
            if (!teacher) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash('password123', salt);
                teacher = new User({
                    full_name: t.name,
                    email: t.email,
                    password: hashedPassword,
                    role: 'TEACHER',
                    department: 'CSE'
                });
                await teacher.save();
                console.log(`Created Teacher ${t.name} (${t.email})`);
            }
        }

        // 3. Create Computer Operator
        let operator = await User.findOne({ email: 'babu@gmail.com' });
        if (!operator) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123', salt);
            operator = new User({
                full_name: 'Babu',
                email: 'babu@gmail.com',
                password: hashedPassword,
                role: 'COMPUTER_OPERATOR',
                department: 'CSE'
            });
            await operator.save();
            console.log('Created Computer Operator (babu@gmail.com)');
        }

        console.log('Seeding complete');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seed();

// End of file

// Start of: ./server\test-db.js
const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI;
console.log('Testing Connection to:', uri.replace(/:([^:@]{1,})@/, ':****@')); // Hide password

mongoose.connect(uri)
    .then(() => {
        console.log('✅ MongoDB Connection SUCCESS');
        console.log('State:', mongoose.connection.readyState); // 1 = connected
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ MongoDB Connection FAILED');
        console.error('Error Name:', err.name);
        console.error('Error Message:', err.message);
        if (err.cause) console.error('Cause:', err.cause);
        process.exit(1);
    });

// End of file

// Start of: ./server\test-server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { MongoMemoryServer } = require('mongodb-memory-server');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/batches', require('./routes/batchRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));

app.get('/', (req, res) => {
    res.send('UniResource Test API is running');
});

const startServer = async () => {
    try {
        const mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        await mongoose.connect(uri);
        console.log('Connected to In-Memory MongoDB');

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`Test Server running on port ${PORT}`));
    } catch (err) {
        console.error(err);
    }
};

startServer();

// End of file

// Start of: ./server\test_cloudinary_direct.js
require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('Testing Cloudinary Connection...');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY);

cloudinary.uploader.upload("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==",
    { public_id: "test_upload_local_base64" },
    function (error, result) {
        if (error) {
            console.error('Upload Failed:', error);
        } else {
            console.log('Upload Success:', result);
        }
    });

// End of file

// Start of: ./server\config\cloudinary.js
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = { cloudinary };

// End of file

// Start of: ./server\middleware\authMiddleware.js
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const token = req.header('x-auth-token');

    // Check for token
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Add user from payload
        req.user = decoded;
        next();
    } catch (e) {
        res.status(400).json({ msg: 'Token is not valid' });
    }
};

module.exports = auth;

// End of file

// Start of: ./server\models\Announcement.js
const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    target_batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', default: null }, // Null = Global/Department Notice
    type: { type: String, enum: ['NOTICE', 'ANNOUNCEMENT', 'ROUTINE'], required: true },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'PENDING_FEEDBACK', 'PENDING_APPROVAL'], default: 'PENDING' },
    feedback: { type: String, default: '' },
    file_url: { type: String, default: null }, // URL for attached PDF/File
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Announcement', AnnouncementSchema);

// End of file

// Start of: ./server\models\Batch.js
const mongoose = require('mongoose');

const BatchSchema = new mongoose.Schema({
    batch_name: { type: String, required: true }, // e.g., "CSE-2026"
    batch_username: { type: String, required: true, unique: true },
    batch_password: { type: String, required: true },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Batch', BatchSchema);

// End of file

// Start of: ./server\models\Document.js
const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    file_path: { type: String, required: true }, // URL
    cloudinary_id: { type: String }, // Cloudinary Public ID
    original_filename: { type: String, required: true },
    uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    target_batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
    upload_date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', DocumentSchema);

// End of file

// Start of: ./server\models\Feedback.js
const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
    message_content: {
        type: String,
        required: true
    },
    is_anonymous: {
        type: Boolean,
        default: false
    },
    from_batch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch'
    },
    from_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    target_announcement: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Announcement'
    },
    sent_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Feedback', FeedbackSchema);

// End of file

// Start of: ./server\models\User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    full_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['CHAIRMAN', 'COMPUTER_OPERATOR', 'CC', 'COORDINATOR', 'TEACHER'], required: true },
    department: { type: String }, // Optional for Coord, Required logic in route or frontend
    assigned_batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }, // For CC (Teacher) or specific assignments
    account_status: { type: String, enum: ['ACTIVE', 'SUSPENDED'], default: 'ACTIVE' },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);

// End of file

// Start of: ./server\routes\announcementRoutes.js
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

// @route   GET api/announcements/public
// @desc    Get all public notices (for Home Page)
// @access  Public
router.get('/public', async (req, res) => {
    try {
        const notices = await Announcement.find({ type: 'NOTICE', status: 'APPROVED' })
            .populate('author', 'full_name role')
            .sort({ created_at: -1 })
            .limit(10); // Limit to latest 10
        res.json(notices);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   POST api/announcements
// @desc    Create a notice or announcement
// @access  Chairman, Operator, CC, Teacher
router.post('/', auth, upload.single('file'), async (req, res) => {
    const { title, content, target_batch, type } = req.body;
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

        const newAnnouncement = new Announcement({
            title,
            content,
            author: req.user.id,
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

// End of file

// Start of: ./server\routes\authRoutes.js
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

// @route   GET api/auth/teachers
// @desc    Get all teachers
// @access  Chairman
router.get('/teachers', auth, async (req, res) => {
    if (req.user.role !== 'CHAIRMAN') {
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

// End of file

// Start of: ./server\routes\batchRoutes.js
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
    if (!['COORDINATOR', 'TEACHER', 'CHAIRMAN', 'CC'].includes(req.user.role)) {
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

// End of file

// Start of: ./server\routes\documentRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/authMiddleware');
const Document = require('../models/Document');
const User = require('../models/User');

const { cloudinary } = require('../config/cloudinary');
const Batch = require('../models/Batch');

// Multer Config (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10000000 },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|pdf|doc|docx|ppt|pptx/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype || extname) {
            return cb(null, true);
        } else {
            cb('Error: Images, PDFs and Docs Only!');
        }
    }
});

// @route   POST api/documents/upload
// @desc    Upload a document
// @access  Teacher Only
router.post('/upload', auth, upload.single('file'), async (req, res) => {
    if (req.user.role !== 'TEACHER') {
        return res.status(403).json({ msg: 'Access denied: Teachers only' });
    }

    if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });

    try {
        // Determine folder name based on batch
        let folderName = 'general';
        const batchId = req.query.target_batch_id || req.body.target_batch_id;

        if (batchId) {
            const batch = await Batch.findById(batchId);
            if (!batch) {
                return res.status(400).json({ msg: 'Invalid Batch ID. Please refresh the page to get the latest batch list.' });
            }
            if (batch.batch_name) {
                folderName = batch.batch_name.trim().replace(/[^a-zA-Z0-9]/g, '_');
            }
        }

        // Upload to Cloudinary using Stream
        const path = require('path');
        // Stream Upload with 'auto' resource type
        const cleanFileName = req.file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_');
        const timestamp = Date.now();
        const fullPublicId = `uni_connect_documents/${folderName}/${cleanFileName}_${timestamp}`;

        // Data URI Upload with FORCED RAW
        const fileExt = path.extname(req.file.originalname);
        const isImage = req.file.mimetype.startsWith('image/');
        const resourceType = isImage ? 'image' : 'raw';

        let finalPublicId = fullPublicId;
        if (resourceType === 'raw') {
            finalPublicId += fileExt;
        }

        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

        console.log(`[DocUpload] Uploading as ${resourceType} to ${finalPublicId}`);

        const result = await cloudinary.uploader.upload(dataURI, {
            public_id: finalPublicId,
            resource_type: resourceType
        });

        console.log('[DocUpload] Success:', result.secure_url);

        const newDoc = new Document({
            file_path: result.secure_url,
            cloudinary_id: result.public_id,
            original_filename: req.file.originalname,
            uploaded_by: req.user.id,
            target_batch: batchId || undefined
        });

        const doc = await newDoc.save();
        res.json(doc);

    } catch (err) {
        console.error('Upload Route Error:', err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   DELETE api/documents/:id
// @desc    Delete a document
// @access  Owner Teacher Only
router.delete('/:id', auth, async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ msg: 'Document not found' });

        // Check ownership
        if (doc.uploaded_by.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized to delete this file' });
        }

        // Remove from Cloudinary
        if (doc.cloudinary_id) {
            await cloudinary.uploader.destroy(doc.cloudinary_id);
        }

        await doc.deleteOne();
        res.json({ msg: 'Document removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   GET api/documents/batch/:batch_id/teachers
// @desc    Get all teachers who uploaded to this batch
// @access  Batch/Staff
router.get('/batch/:batch_id/teachers', auth, async (req, res) => {
    try {
        // Find documents for this batch
        const docs = await Document.find({ target_batch: req.params.batch_id });

        // Extract unique teacher IDs
        const teacherIds = [...new Set(docs.map(doc => doc.uploaded_by.toString()))];

        // Get Teacher details
        const teachers = await User.find({ _id: { $in: teacherIds } }).select('full_name _id email');

        res.json(teachers);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   GET api/documents/batch/:batch_id/teacher/:teacher_id
// @desc    Get files for specific batch & teacher
// @access  Batch/Staff
router.get('/batch/:batch_id/teacher/:teacher_id', auth, async (req, res) => {
    try {
        const docs = await Document.find({
            target_batch: req.params.batch_id,
            uploaded_by: req.params.teacher_id
        }).sort({ upload_date: -1 });

        res.json(docs);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   GET api/documents/my-uploads
// @desc    Get current teacher's uploads
// @access  Teacher
router.get('/my-uploads', auth, async (req, res) => {
    if (req.user.role !== 'TEACHER') {
        return res.status(403).json({ msg: 'Access denied' });
    }
    try {
        const docs = await Document.find({ uploaded_by: req.user.id })
            .populate('target_batch', 'batch_name')
            .sort({ upload_date: -1 });
        res.json(docs);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;

// End of file

// Start of: ./server\routes\feedbackRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Feedback = require('../models/Feedback');

const Announcement = require('../models/Announcement');

// @route   POST api/feedback
// @desc    Send feedback (Batch -> Admin, or Peer -> Routine)
// @access  Authenticated
router.post('/', auth, async (req, res) => {
    // Roles: BATCH (General Feedback), TEACHER/OPERATOR (Peer Review/General)
    const { message_content, is_anonymous, target_announcement } = req.body;

    try {
        const feedbackData = {
            message_content,
            is_anonymous: is_anonymous || false
        };

        if (req.user.role === 'BATCH') {
            feedbackData.from_batch = req.user.id;
        } else {
            feedbackData.from_user = req.user.id;
        }

        if (target_announcement) {
            feedbackData.target_announcement = target_announcement;
        }

        const newFeedback = new Feedback(feedbackData);
        const feedback = await newFeedback.save();
        res.json(feedback);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   GET api/feedback
// @desc    Get all feedback or feedback for specific target
// @access  Staff & Batch (Own)
router.get('/', auth, async (req, res) => {
    try {
        let query = {};
        const { target_announcement_id } = req.query;

        if (target_announcement_id) {
            // Fetch feedback for a specific routine/announcement
            // Everyone authorized to view the routine can view its feedback? 
            // Or just the author? The prompt says "all of the feedbacks will be shown to that particular teacher".
            // Let's allow fetching by ID. frontend will control who requests it.
            query = { target_announcement: target_announcement_id };
        } else {
            // General Dashboard Feedback
            if (req.user.role === 'BATCH') {
                query = { from_batch: req.user.id };
            } else if (['CHAIRMAN', 'COMPUTER_OPERATOR', 'TEACHER'].includes(req.user.role)) {
                // Staff can see general feedback (Chairman/Operator usually). 
                // Teacher might only want to see relevant ones, but 'All' is fine for now as they filtered on frontend.
                // Wait, Teachers shouldn't see system-wide feedback meant for Chairman.
                // If not targeting announcement, restrict to Chairman/Operator.
                if (req.user.role === 'TEACHER') {
                    // Teachers can see feedback they wrote OR feedback on their own announcements.
                    // Since filtering by "on my announcements" is complex here (needs join), 
                    // we will allow them to see all non-anonymous feedback or rely on the frontend to filter by specific target ID.
                    // For now, let's remove the restriction so they can fetch by target_id freely.
                    // If no target_id, we just return feedback they sent (as before) to avoid data leak, 
                    // BUT we must ensure the `if (target_announcement_id)` block above works for them. 
                    // It does (lines 46-51 don't check role strictness beyond Auth). 
                    // So the issue might be how Dashboard fetches it.
                    query = { from_user: req.user.id };
                } else {
                    query = { target_announcement: null }; // General feedback (not linked to routine)
                }
            } else {
                return res.status(403).json({ msg: 'Access denied' });
            }
        }

        const feedback = await Feedback.find(query)
            .populate('from_batch', 'batch_name')
            .populate('from_user', 'full_name role')
            .sort({ sent_at: -1 });
        res.json(feedback);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   DELETE api/feedback/:id
// @desc    Delete feedback
// @access  Coordinator Only (+ Sender & Receiver)
router.delete('/:id', auth, async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id);
        if (!feedback) return res.status(404).json({ msg: 'Feedback not found' });

        // Check permissions
        let isAuthorized = false;

        // 1. Admin/Chairman/Operator
        if (['COORDINATOR', 'CHAIRMAN', 'COMPUTER_OPERATOR'].includes(req.user.role)) {
            isAuthorized = true;
        }
        // 2. Sender (Batch or User)
        else if (req.user.role === 'BATCH' && feedback.from_batch && feedback.from_batch.toString() === req.user.id) {
            isAuthorized = true;
        }
        else if (feedback.from_user && feedback.from_user.toString() === req.user.id) {
            isAuthorized = true;
        }

        // 3. Receiver (Routine Creator)
        if (!isAuthorized && feedback.target_announcement) {
            const announcement = await Announcement.findById(feedback.target_announcement);
            if (announcement && announcement.author && announcement.author.toString() === req.user.id) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            return res.status(403).json({ msg: 'Access denied' });
        }

        await feedback.deleteOne();
        res.json({ msg: 'Feedback deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;

// End of file

