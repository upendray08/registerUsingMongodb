const express = require("express");
const mongoose = require("mongoose");
const User = require("./model/user"); // Import the User model
const app = express();

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/UserData', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
});

// Configure middleware
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// Define routes
app.get("/", (req, res) => {
    res.render("index");
});

app.post("/", async (req, res) => {
    try {
        const data = new User(req.body);
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
