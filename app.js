const express = require('express');
const mongoose = require('mongoose');

const app = express();

// Use JSON middleware
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
const bcrypt = require('bcrypt');
const port = 3000;
const mongoURI = 'mongodb://localhost:27017/studybuddy';

// Define User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true }
});

// Define JoinUs Schema
const joinUsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true }
});

// Create Mongoose Models
const User = mongoose.model('User', userSchema);
const JoinUs = mongoose.model('JoinUs', joinUsSchema);

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware to check authentication
function isAuthenticated(req, res, next) {
  // For now, this is a placeholder.
  // In a real application, you would check for a valid session or token.
  // Since we're using localStorage on the frontend, we'll simulate a check.
  // The frontend needs to send an indicator (e.g., a header) for protected pages.
  const isLoggedIn = req.headers['x-is-logged-in'] === 'true'; // Example check for a custom header
  if (isLoggedIn) {
    next(); // User is authenticated, proceed to the next middleware or route handler
  } else {
    res.redirect('/login.html'); // User is not authenticated, redirect to login page
  }
}

app.get('/', isAuthenticated, (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/index.html', isAuthenticated, (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/study-material.html', isAuthenticated, (req, res) => { // Corrected a missing closing curly brace for the isAuthenticated function
  res.sendFile(__dirname + '/public/study-material.html');
});

app.get('/video-lectures.html', isAuthenticated, (req, res) => {
  res.sendFile(__dirname + '/public/video-lectures.html');
});


app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  }
);

// Serve static files from the 'public' directory
// This should come after the protected routes to avoid bypassing them
app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Registration route
app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with that email already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Join Us route
app.post('/joinus', async (req, res) => {
  try {
    const { name, email } = req.body;

    // Create a new join us entry
    const newJoinUs = new JoinUs({ name, email });
    await newJoinUs.save();

    res.status(201).json({ message: 'Join Us information saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Login route
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare provided password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error(error); // Log the full error to the server console
    res.status(500).json({ message: 'Server error', error });
  }
});