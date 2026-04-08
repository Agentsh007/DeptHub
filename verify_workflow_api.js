const { Blob } = require('buffer');

// Check Node version for fetch
const nodeVersion = process.version.match(/^v(\d+)/)[1];
if (parseInt(nodeVersion) < 18) {
    console.error(`Node.js version ${process.version} is too old. Please upgrade to Node 18+ to run this script.`);
    process.exit(1);
}

const API_URL = 'http://localhost:5000/api';

const teacherCreds = {
    email: 'salma@uni.edu',
    password: 'password123'
};

const chairmanCreds = {
    email: 'chairman@uni.edu',
    password: 'password123'
};

const runVerification = async () => {
    try {
        console.log('--- Step 1: Login as Teacher (Salma) ---');
        const teacherLoginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(teacherCreds)
        });

        if (!teacherLoginRes.ok) {
            const err = await teacherLoginRes.text();
            throw new Error(`Teacher Login Failed: ${teacherLoginRes.status} ${err}`);
        }
        const teacherData = await teacherLoginRes.json();
        const teacherToken = teacherData.token;
        console.log('Teacher Login Success. Token stored.');

        console.log('\n--- Step 2: Upload Routine ---');
        const formData = new FormData();
        formData.append('title', 'API Test Routine (Fetch)');
        formData.append('content', 'This is a test routine uploaded via script using fetch.');
        formData.append('type', 'ROUTINE');
        formData.append('status', 'PENDING_APPROVAL');

        // Create a dummy file blob
        const fileContent = 'dummy pdf content';
        const file = new Blob([fileContent], { type: 'application/pdf' });
        formData.append('file', file, 'test_routine_fetch.pdf');

        const uploadRes = await fetch(`${API_URL}/announcements`, {
            method: 'POST',
            headers: {
                'x-auth-token': teacherToken
                // Note: Don't set Content-Type header manually when using FormData, fetch does it automatically with boundary
            },
            body: formData
        });

        if (!uploadRes.ok) {
            const errText = await uploadRes.text();
            throw new Error(`Upload Failed: ${uploadRes.status} ${errText}`);
        }

        const uploadData = await uploadRes.json();
        const routineId = uploadData._id;
        console.log(`Routine Uploaded. ID: ${routineId}, Status: ${uploadData.status}`);

        if (uploadData.status !== 'PENDING_APPROVAL') {
            throw new Error(`Expected PENDING_APPROVAL, got ${uploadData.status}`);
        }

        console.log('\n--- Step 3: Login as Chairman ---');
        const chairmanLoginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(chairmanCreds)
        });

        if (!chairmanLoginRes.ok) throw new Error(`Chairman Login Failed: ${chairmanLoginRes.status}`);
        const chairmanData = await chairmanLoginRes.json();
        const chairmanToken = chairmanData.token;
        console.log('Chairman Login Success. Token stored.');

        console.log('\n--- Step 4: Approve Routine ---');
        const approveRes = await fetch(`${API_URL}/announcements/${routineId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': chairmanToken
            },
            body: JSON.stringify({ status: 'APPROVED' })
        });

        if (!approveRes.ok) {
            const errText = await approveRes.text();
            throw new Error(`Approval Failed: ${approveRes.status} ${errText}`);
        }

        const approveData = await approveRes.json();
        console.log(`Routine Approved. New Status: ${approveData.status}`);

        if (approveData.status !== 'APPROVED') {
            throw new Error(`Expected APPROVED, got ${approveData.status}`);
        }

        console.log('\n--- SUCCESS: Workflow Verified ---');

    } catch (err) {
        console.error('\n--- FAILURE ---');
        console.error(err);
        process.exit(1);
    }
};

runVerification();
