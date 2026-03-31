const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5009;

app.get('/health', (req, res) => res.status(200).json({ status: 'Telemedicine Service is Healthy' }));

// Placeholder for Member 3's logic
// GET /join-session/:roomId
// POST /create-session

app.listen(PORT, () => {
    console.log(`Telemedicine Service (Placeholder) running on port ${PORT}`);
});
