// MongoDB Connection
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/myapp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt'); // Import bcrypt for password checking
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

const htmlFiles = ['signin', 'signup', 'dashboard', 'funds', 'holdings', 'orders', 'portfolio', 'profile', 'settings', 'home'];
htmlFiles.forEach(page => {
  app.get(`/${page}`, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', `${page}.html`));
  });
});

// Signup route
app.post('/signup', async (req, res) => {
  console.log('Signup request received:', req.body);
  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).send('User already exists');

    const hashedPassword = await bcrypt.hash(password, 10); // Hash password before saving
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.status(200).send('Signup successful');
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).send('Signup failed');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login request:', { email, password });

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      return res.status(400).send('Invalid credentials');
    }

    console.log('User found:', user);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      return res.status(400).send('Invalid credentials');
    }

    res.status(200).send('Login successful');
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Login failed');
  }
});
