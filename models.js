const mongoose = require('mongoose');

// 🎬 Movie Schema
const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  genre: String,
  director: String,
  imageURL: String,
  isFeatured: { type: Boolean, default: false }, // ✅ Correct field name
  releaseYear: Number,
  rating: Number,
  cast: [String]
});

// 👤 User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  dateOfBirth: Date,
  favoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
  createdAt: { type: Date, default: Date.now }
});

// 📦 Models
const Movie = mongoose.model('Movie', movieSchema);
const User = mongoose.model('User', userSchema);

module.exports = { Movie, User };
