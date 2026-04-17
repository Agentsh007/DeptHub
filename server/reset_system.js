const mongoose = require('./node_modules/mongoose');
const dotenv = require('dotenv');
const cloudinary = require('cloudinary').v2;
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

// Config Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const resetSystem = async () => {
    try {
        console.log('⚠ WARNING: This will DELETE ALL DATA from MongoDB and Cloudinary!');
        console.log('Starting in 3 seconds... (Ctrl+C to cancel)');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 1. Connect to DB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected.');

        // 2. Clear Database
        console.log('Dropping MongoDB database...');
        await mongoose.connection.dropDatabase();
        console.log('✔ MongoDB database dropped successfully.');

        // 3. Clear Cloudinary
        console.log('Clearing Cloudinary resources...');

        // Delete all resources (images, raw, video)
        // api.delete_all_resources() helps but we might need to specify types
        // This deletes everything in the account or derived resources

        try {
            const result = await cloudinary.api.delete_all_resources();
            console.log('- Default resources cleared:', result);

            // Also need to clear raw files (PDFs often stored as raw or auto)
            const resultRaw = await cloudinary.api.delete_all_resources({ resource_type: 'raw' });
            console.log('- Raw resources cleared:', resultRaw);

            // Also clear video if any
            const resultVideo = await cloudinary.api.delete_all_resources({ resource_type: 'video' });
            console.log('- Video resources cleared:', resultVideo);

            // Force delete folders? Cloudinary folders are virtual, they disappear when empty,
            // but empty folders might remain in listing. We can assume they are gone if files are gone.
            // But let's try to delete the main folder 'uni_connect_documents' if empty just in case?
            // Usually not strictly necessary for "wiping data".

        } catch (cloudErr) {
            console.error('❌ Cloudinary Wipe Error:', cloudErr.message);
            console.log('Note: You might need Admin API enabled in Cloudinary settings.');
        }

        console.log('✔ System Reset Complete.');
        process.exit(0);

    } catch (err) {
        console.error('FATAL ERROR:', err);
        process.exit(1);
    }
};

resetSystem();
