// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb+srv://admin:shivam1317@cluster0.9atsbkc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));


// Define User Schema & Model
const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
});
const User = mongoose.model('User', UserSchema);

// Define Feedback Schema & Model
const FeedbackSchema = new mongoose.Schema({
    email: String,
    rating: Number,
    message: String,
});
const Feedback = mongoose.model('Feedback', FeedbackSchema);
const QuizResultSchema = new mongoose.Schema({
  email: String,
  date: { type: Date, default: Date.now },
  score: Number,
  responses: [
    {
      question: String,
      selectedAnswer: String,
      correctAnswer: String,
    },
  ],
});

const QuizResult = mongoose.model('QuizResult', QuizResultSchema);


// Route: Register User
app.post('/api/users', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const lastUser = await User.findOne().sort({ id: -1 }); // sort by custom id
    const newId = lastUser ? lastUser.id + 1 : 1;

    const newUser = new User({ id: newId, name, email, password });
    await newUser.save();

    res.json({ success: true, message: 'User registered successfully.', userId: newId });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});


// Route: Submit Feedback
app.post('/api/feedback', async (req, res) => {
    const { email, rating, message } = req.body;
    try {
        const newFeedback = new Feedback({ email, rating, message });
        await newFeedback.save();
        res.json({ success: true, message: 'Feedback submitted successfully.' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Route: Sign In
app.post('/api/signin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Compare passwords (plain text for now — should hash in production)
    if (user.password !== password) {
      return res.status(401).json({ success: false, message: "Incorrect password." });
    }

    res.json({ success: true, message: "Sign-in successful.", user: { name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});
app.post('/api/quiz-result', async (req, res) => {
  const { email, score, responses } = req.body;

  try {
    const newResult = new QuizResult({ email, score, responses });
    await newResult.save();

    res.json({ success: true, message: 'Quiz result saved successfully.' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
