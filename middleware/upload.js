const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Provjera i kreiranje direktorijuma
['public/uploads/books', 'public/uploads/images'].forEach((dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folder = file.mimetype.includes('image')
            ? 'public/uploads/images'
            : 'public/uploads/books';
        cb(null, folder);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    },
});

const upload = multer({ storage });

module.exports = upload;
