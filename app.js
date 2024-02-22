const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/interShip', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
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
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
