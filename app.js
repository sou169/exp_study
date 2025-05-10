const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const port = 3000;
const mongoURI = 'mongodb://localhost:27017/studybuddy';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB setup
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schemas and Models
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true }
});
const joinUsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);
const JoinUs = mongoose.model('JoinUs', joinUsSchema);

// Routes
app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User with that email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

app.post('/joinus', async (req, res) => {
  try {
    const { name, email } = req.body;
    const newJoinUs = new JoinUs({ name, email });
    await newJoinUs.save();
    res.status(201).json({ message: 'Join Us information saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
