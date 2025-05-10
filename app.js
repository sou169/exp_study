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

// Simple Admin Check Middleware (for demonstration purposes)
// In a real application, implement proper session management or JWT with roles
const isAdmin = (req, res, next) => {
  // Placeholder for admin check. Replace with your actual authentication/authorization logic.
  // This assumes req.user is populated by preceding middleware and has a 'role' property.
  if (req.user && req.user.role === 'admin') {
    next(); // User is admin, proceed
  } else {
    res.status(403).json({ message: 'Access forbidden. Admins only.' }); // Or redirect to login
  }
};

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

// Basic login endpoint (needs session or JWT for state management)
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    // In a real application, you would establish a session or issue a JWT here.
    // For demonstration, we'll simulate adding a 'user' object with a role for the admin check middleware.
    // THIS IS NOT SECURE FOR PRODUCTION. Implement proper authentication.
    req.user = { email: user.email, role: user.email === 'admin@example.com' ? 'admin' : 'user' }; // Simulate user object
    res.status(200).json({ message: 'Login successful', user: { email: user.email, role: req.user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Admin Routes (Protected)

// --- User Management ---

// Get all users
app.get('/admin/users', isAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Exclude password
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching users', error });
  }
});

// Add a new user (might be redundant with /register, but useful for admin)
app.post('/admin/users', isAdmin, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User with that email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User added successfully', user: { _id: newUser._id, name: newUser.name, email: newUser.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error adding user', error });
  }
});

// Add a new user (might be redundant with /register, but useful for admin)
app.post('/admin/users', isAdmin, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User with that email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User added successfully', user: { _id: newUser._id, name: newUser.name, email: newUser.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error adding user', error });
  }
});

// Update a user
app.put('/admin/users/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;
    const updateData = { name, email };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true, select: '-password' }); // Exclude password
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating user', error });
  }
});

// Delete a user
app.delete('/admin/users/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting user', error });
  }
});

// --- Join Us Management ---

// Get all Join Us entries
app.get('/admin/joinus', isAdmin, async (req, res) => {
  try {
    const joinusEntries = await JoinUs.find();
    res.status(200).json(joinusEntries);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching Join Us entries', error });
  }
});

// Delete a Join Us entry
app.delete('/admin/joinus/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEntry = await JoinUs.findByIdAndDelete(id);
    if (!deletedEntry) return res.status(404).json({ message: 'Join Us entry not found' });
    res.status(200).json({ message: 'Join Us entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting Join Us entry', error });
  }
});

// Add a new Join Us entry
app.post('/admin/joinus', isAdmin, async (req, res) => {
  try {
    const { name, email } = req.body;
    const newJoinUs = new JoinUs({ name, email });
    await newJoinUs.save();
    res.status(201).json({ message: 'Join Us entry added successfully', entry: newJoinUs });
  } catch (error) {
    res.status(500).json({ message: 'Server error adding Join Us entry', error });
  }
});

// Update a Join Us entry
app.put('/admin/joinus/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedEntry = await JoinUs.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedEntry) return res.status(404).json({ message: 'Join Us entry not found' });
    res.status(200).json({ message: 'Join Us entry updated successfully', entry: updatedEntry });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating Join Us entry', error });
  }
