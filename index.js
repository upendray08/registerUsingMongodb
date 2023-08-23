const express = require("express");
const mongoose = require("mongoose");
const crypto = require("crypto");

const app = express();


// Encrypt data before saving to the database
const encryptData = (data) => {
    const algorithm = 'aes-256-cbc';
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
};

// Decrypt data when retrieving from the database
const decryptData = (data) => {
    const algorithm = 'aes-256-cbc';
    const [iv, encryptedData] = data.split(':');

    const key = crypto.randomBytes(32);
    const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

// MongoDB connection mongodb://localhost:27017
mongoose.connect('mongodb://0.0.0.0:27017/UserData', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
});

// Define the User schema and model
const userSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true // Ensure unique email addresses
    },
    password: {
        type: String,
        required: true
    }
});

const User = mongoose.model("User", userSchema);

// Configure middleware
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// Define routes
app.get("/", (req, res) => {
    res.render("index");
});

app.post("/", async (req, res) => {
    try {
        // Encrypt the user's password before saving
        const encryptedPassword = encryptData(req.body.password);

        // Create a new User instance with encrypted password
        const data = new User({
            user: req.body.user,
            email: req.body.email,
            password: encryptedPassword
        });

        await data.save();
        res.send("Data saved successfully");
    } catch (error) {
        console.error("Error saving data:", error);
        res.status(500).send("An error occurred while saving data");
    }
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
