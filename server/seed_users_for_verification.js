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
