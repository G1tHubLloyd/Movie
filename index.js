const express = require('express');
const mongoose = require('mongoose');
const { Movie, User } = require('./models');

const app = express();
app.use(express.json());

// Helper: Validate ObjectId format
const isValidObjectId = id => mongoose.Types.ObjectId.isValid(id);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/MovieDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// 🎬 Movie Routes

app.get('/movies', async (req, res) => {
  const movies = await Movie.find();
  res.json(movies);
});

app.get('/movies/:title', async (req, res) => {
  const movie = await Movie.findOne({ title: req.params.title });
  movie ? res.json(movie) : res.status(404).send('Movie not found');
});

app.post('/movies', async (req, res) => {
  try {
    const newMovie = await Movie.create(req.body);
    res.status(201).json(newMovie);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.get('/genres/:genre', async (req, res) => {
  const genreParam = req.params.genre;

  try {
    const movies = await Movie.find({
      $or: [
        { genre: genreParam },
        { 'genre.name': genreParam }
      ]
    });

    if (movies.length) {
      res.json({
        genre: genreParam,
        description: `Movies in the ${genreParam} genre`,
        examples: movies
      });
    } else {
      res.status(404).send('Genre not found');
    }
  } catch (err) {
    console.error('Error fetching genre:', err);
    res.status(500).send('Server error');
  }
});

app.get('/directors/:name', async (req, res) => {
  const movies = await Movie.find({ director: req.params.name });
  movies.length
    ? res.json({ director: req.params.name, bio: "Bio not stored", birthYear: null, deathYear: null, movies })
    : res.status(404).send('Director not found');
});

// 👤 User Routes

app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post('/users', async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.put('/users/:id', async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).send('Invalid user ID format');
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedUser);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.post('/users/:id/favorites/:movieId', async (req, res) => {
  if (!isValidObjectId(req.params.id) || !isValidObjectId(req.params.movieId)) {
    return res.status(400).send('Invalid user or movie ID format');
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { favoriteMovies: req.params.movieId } },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.delete('/users/:id/favorites/:movieId', async (req, res) => {
  if (!isValidObjectId(req.params.id) || !isValidObjectId(req.params.movieId)) {
    return res.status(400).send('Invalid user or movie ID format');
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $pull: { favoriteMovies: req.params.movieId } },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.delete('/users/:id', async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).send('Invalid user ID format');
  }

  try {
    await User.findByIdAndDelete(req.params.id);
    res.send('User deleted');
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Start server
app.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
});
