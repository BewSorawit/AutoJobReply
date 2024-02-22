const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config(); // Load environment variables from .env file
const app = express();

// Check if MongoDB connection URL is defined
if (!process.env.MONGODB_CONNECTION_URL) {
    console.error("Error: MongoDB connection URL is not defined. Make sure to set the MONGODB_CONNECTION_URL environment variable.");
    process.exit(1); // Exit the application
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_CONNECTION_URL, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
})
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1); // Exit the application in case of connection error
    });

// Set up view engine and static folder
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Include routes
const routes = require('./routes');
app.use('/', routes);

// Define a route for the success page
app.get('/success-page', (req, res) => {
    res.render('success-page');
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
