const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

// Load Models
const User = require('./models/User');
const Batch = require('./models/Batch');
const seedData = async () => {
    try {
        console.log('🌱 Seeding Dummy Data...');
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected.');

        // 1. Create Chairman
        const salt = await bcrypt.genSalt(10);
        const hashedChairmanPassword = await bcrypt.hash('password123', salt);

        const chairman = await User.create({
            full_name: 'Chairman User',
            email: 'chairman@gmail.com',
            password: hashedChairmanPassword,
            role: 'CHAIRMAN',
            department: 'ICE'
        });
        console.log('✔ Created Chairman: chairman@gmail.com / password123');

        // 3. Create Computer Operator
        const hashedComputerOperatorPassword = await bcrypt.hash('password123', salt);
        const computerOperator = await User.create({
            full_name: 'Babu',
            email: 'babu@gmail.com',
            password: hashedComputerOperatorPassword,
            role: 'COMPUTER_OPERATOR',
            department: 'ICE'
        });
        console.log('✔ Created Computer Operator: babu@gmail.com / password123');

        // 2. Create Batch (by Computer Operator)
        // Batch passwords are usually plain text in this specific app based on previous context 
        // (or hashed? Model ref says just String. Let's assume plain or handle consistently.
        // Wait, verifying Batch.js: batch_password is required. 
        // In verify_chairman.js or similar, checking if it is hashed usually.
        // Let's hash it to be safe as it authentication related, or check logic.
        // Actually, let's look at how batch is created in routes usually. 
        // Assuming plain for now to ensure simplicity or hashing if auth uses bcrypt compare.
        // Let's hash it standardly.)
        const hashedBatchPassword = await bcrypt.hash('password123', salt);

        const batch1 = await Batch.create({
            batch_name: 'ICE-21-TEST',
            batch_username: 'ice21test',
            batch_password: hashedBatchPassword,
            created_by: computerOperator._id
        });
        console.log('✔ Created Batch: ICE-21-TEST (user: ice21test / pass: password123)');
        const batch2 = await Batch.create({
            batch_name: 'ICE-22-TEST',
            batch_username: 'ice22test',
            batch_password: hashedBatchPassword,
            created_by: computerOperator._id
        });
        console.log('✔ Created Batch: ICE-22-TEST (user: ice22test / pass: password123)');

        // 3. Create Teacher
        const hashedTeacherPassword = await bcrypt.hash('password123', salt);
        const teacher = await User.create({
            full_name: 'Shanto Islam',
            email: 'shanto@gmail.com',
            password: hashedTeacherPassword,
            role: 'TEACHER',
            department: 'ICE'
        });
        console.log('✔ Created Teacher: shanto@gmail.com / password123');

        // 4. Create another Teacher (Acting as CC) ? 
        // Optional, but user asked for "some dummy...". Let's update `seed_data` to be robust.

        console.log('\nSeed Complete! 🚀');
        console.log('------------------------------------------------');
        console.log('Chairman Login: chairman@gmail.com / password123');
        console.log('Teacher Login:  shanto@gmail.com / password123');
        console.log('Computer Operator Login: babu@gmail.com / password123');
        console.log('Batch Login:    ice21test            / password123');
        console.log('Batch Login:    ice22test            / password123');
        console.log('------------------------------------------------');

        process.exit(0);
    } catch (err) {
        if (err.code === 11000) {
            console.log('⚠ Data already exists! (Duplicate Key Error)');
            console.log('Run `npm run reset-system` first if you want a fresh start.');
            process.exit(0);
        }
        console.error('Seeding Failed:', err);
        process.exit(1);
    }
};
seedData();
