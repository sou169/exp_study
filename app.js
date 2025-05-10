const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');
const session = require('express-session');

const app = express();
const port = 3000;
const mongoURI = 'mongodb://localhost:27017/studybuddy'; // Make sure this is your correct MongoDB URI

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session setup
app.use(session({
  secret: 'your_very_secure_secret_key_replace_this', // **CRITICAL: Replace with a strong, unique secret key**
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public'))); // Assuming your static files are in a 'public' folder

// MongoDB setup
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schemas and Models
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, default: 'user' }
});
const joinUsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String }
});

// Admin Schema and Model
const adminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true }
});


const User = mongoose.model('User', userSchema);
const JoinUs = mongoose.model('JoinUs', joinUsSchema);
const Admin = mongoose.model('Admin', adminSchema); // Admin Model

// Middleware to set req.user based on session
app.use((req, res, next) => {
    req.user = req.session.user; // Get user information from the session
    next();
});


// Admin Check Middleware (relies on req.user.role set in session)
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); // User is admin, proceed
  } else {
    res.status(403).json({ message: 'Access forbidden. Admins only.' }); // Or redirect on the frontend
  }
};


// Routes

// User Registration
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
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Join Us Submission
app.post('/joinus', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const newJoinUs = new JoinUs({ name, email, message });
    await newJoinUs.save();
    res.status(201).json({ message: 'Join Us information saved successfully' });
  } catch (error) {
    console.error('Join Us submission error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if it's an admin login
    const adminUser = await Admin.findOne({ email });
    if (adminUser && await bcrypt.compare(password, adminUser.password)) {
        req.session.user = { email: adminUser.email, role: 'admin' }; // Set admin role in session
        return res.status(200).json({ message: 'Admin login successful', user: { email: adminUser.email, role: 'admin' } });
    }

    // Check if it's a regular user login
    const regularUser = await User.findOne({ email });
    if (regularUser && await bcrypt.compare(password, regularUser.password)) {
        req.session.user = { email: regularUser.email, role: regularUser.role || 'user' }; // Set user role in session
        return res.status(200).json({ message: 'User login successful', user: { email: regularUser.email, role: regularUser.role || 'user' } });
    }

    // If no user or admin found with matching credentials
    res.status(400).json({ message: 'Invalid credentials' });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Logout endpoint
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.status(200).json({ message: 'Logout successful' });
    });
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
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error fetching users', error });
  }
});

// Add a new user
app.post('/admin/users', isAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User with that email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role: role || 'user' });
    await newUser.save();
    res.status(201).json({ message: 'User added successfully', user: { _id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role } });
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ message: 'Server error adding user', error });
  }
});

// Update a user
app.put('/admin/users/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;
    const updateData = { name, email, role };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true, select: '-password' }); // Exclude password
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
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
    console.error('Error deleting user:', error);
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
    console.error('Error fetching Join Us entries:', error);
    res.status(500).json({ message: 'Server error fetching Join Us entries', error });
  }
});

// Add a new Join Us entry
app.post('/admin/joinus', isAdmin, async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const newJoinUs = new JoinUs({ name, email, message });
    await newJoinUs.save();
    res.status(201).json({ message: 'Join Us entry added successfully', entry: newJoinUs });
  } catch (error) {
    console.error('Error adding Join Us entry:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Update a Join Us entry
app.put('/admin/joinus/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, message } = req.body;
    const updateData = { name, email, message };
    const updatedEntry = await JoinUs.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedEntry) return res.status(404).json({ message: 'Join Us entry not found' });
    res.status(200).json({ message: 'Join Us entry updated successfully', entry: updatedEntry });
  } catch (error) {
    console.error('Error updating Join Us entry:', error);
    res.status(500).json({ message: 'Server error', error });
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
    console.error('Error deleting Join Us entry:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});


// Route to create an initial admin user (for setup) - **REMOVE or SECURE this heavily in production**
app.post('/create-admin', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) return res.status(400).json({ message: 'Admin with that email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = new Admin({ name, email, password: hashedPassword });
        await newAdmin.save();
        res.status(201).json({ message: 'Initial admin user created successfully' });
    } catch (error) {
        console.error('Error creating initial admin:', error);
        res.status(500).json({ message: 'Server error creating initial admin', error });
    }
});
