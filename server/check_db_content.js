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
