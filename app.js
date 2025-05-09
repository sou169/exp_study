const express = require('express');
const mongoose = require('mongoose');

const app = express();

// Serve static files from the 'public' directory
app.use(express.static('public'));
// Use JSON middleware
app.use(express.json());
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

app.get('/', (req, res) => {
  res.send('Hello, Study-Buddy!');
});

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
    res.status(500).json({ message: 'Server error', error });
  }
});


// You will need to add a login route here later
