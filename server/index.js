import express from 'express';
import cors from 'cors';
import db from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API route to get all freelancer talent profiles
app.get('/api/freelancers', (req, res) => {
    const sql = "SELECT * FROM freelancers ORDER BY created_at DESC";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: "success",
            data: rows
        });
    });
});

// API route to add a contact message
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const sql = "INSERT INTO contacts (name, email, message) VALUES (?,?,?)";
    const params = [name, email, message];

    db.run(sql, params, function (err, result) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: "success",
            id: this.lastID
        });
    });
});

// In production, serve Vite frontend
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../dist')));
    app.get('*', (req, res) => {
        // Don't proxy API requests to index.html
        if (!req.path.startsWith('/api/')) {
            res.sendFile(path.join(__dirname, '../dist/index.html'));
        }
    });
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
