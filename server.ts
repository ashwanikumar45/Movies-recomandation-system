import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './server/db.ts';
import { tmdb } from './server/tmdb.ts';
import { recommender } from './server/recommender.ts';
import { User, RecommenderWeights } from './server/types.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// --- REST API ENDPOINTS ---

// Users API
app.get('/api/users', (_req: Request, res: Response) => {
  res.json({ users: db.getUsers() });
});

app.get('/api/users/:id', (req: Request, res: Response) => {
  const user = db.getUser(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user });
});

app.post('/api/users', (req: Request, res: Response) => {
  const { name, tagline, bio, favoriteGenres, dislikedGenres, aesthetic, primaryColor } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const newUser: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name,
    tagline: tagline || 'Custom Film Buff',
    bio: bio || 'Exploring personalized algorithmic cinema recommendations.',
    avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name)}`,
    favoriteGenres: Array.isArray(favoriteGenres) && favoriteGenres.length > 0 ? favoriteGenres : ['Drama', 'Sci-Fi'],
    dislikedGenres: Array.isArray(dislikedGenres) ? dislikedGenres : [],
    aesthetic: aesthetic || 'Custom Cinephile',
    primaryColor: primaryColor || '#8b5cf6',
  };

  db.addUser(newUser);
  res.status(201).json({ user: newUser });
});

// Movies API
app.get('/api/movies', (_req: Request, res: Response) => {
  res.json({ movies: db.getMovies() });
});

app.get('/api/movies/trending', async (_req: Request, res: Response) => {
  try {
    const movies = await tmdb.getTrendingMovies();
    res.json({ movies });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch trending movies' });
  }
});

app.get('/api/movies/search', async (req: Request, res: Response) => {
  const query = (req.query.q as string) || '';
  try {
    const movies = await tmdb.searchMovies(query);
    res.json({ movies });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Search failed' });
  }
});

app.get('/api/movies/:id', async (req: Request, res: Response) => {
  try {
    const movie = await tmdb.getMovieDetails(req.params.id);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    res.json({ movie });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Movie lookup failed' });
  }
});

// Recommendations API
app.get('/api/recommendations/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 12;

  try {
    const recommendations = await recommender.getRecommendations(userId, limit);
    const weights = db.getWeights(userId);
    res.json({ recommendations, weights });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Recommendation generation failed' });
  }
});

app.post('/api/recommendations/:userId/tune', async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { contentWeight, collabWeight, semanticWeight } = req.body;

  try {
    const updatedWeights = db.updateWeights(userId, { contentWeight, collabWeight, semanticWeight });
    const recommendations = await recommender.getRecommendations(userId, 12);
    res.json({ weights: updatedWeights, recommendations });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Weight tuning failed' });
  }
});

// Interactions API (Likes, Superlikes, Dislikes, Ratings)
app.get('/api/interactions/:userId', (req: Request, res: Response) => {
  const interactions = db.getInteractions(req.params.userId);
  res.json({ interactions });
});

app.post('/api/interactions', async (req: Request, res: Response) => {
  const { userId, movieId, type, rating } = req.body;
  if (!userId || !movieId || !type) {
    return res.status(400).json({ error: 'userId, movieId, and type are required' });
  }

  try {
    const interaction = db.saveInteraction({ userId, movieId, type, rating });
    // Recalculate stats & updated recommendations immediately for real-time reactivity
    const stats = recommender.getProfileMLStats(userId);
    res.json({ interaction, stats });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save interaction' });
  }
});

app.delete('/api/interactions', (req: Request, res: Response) => {
  const { userId, movieId } = req.body;
  if (!userId || !movieId) {
    return res.status(400).json({ error: 'userId and movieId are required' });
  }

  const success = db.removeInteraction(userId, movieId);
  res.json({ success });
});

// Watchlist API
app.get('/api/watchlist/:userId', (req: Request, res: Response) => {
  const watchlist = db.getWatchlist(req.params.userId);
  res.json({ watchlist });
});

app.post('/api/watchlist', (req: Request, res: Response) => {
  const { userId, movieId, notes } = req.body;
  if (!userId || !movieId) {
    return res.status(400).json({ error: 'userId and movieId are required' });
  }

  const result = db.toggleWatchlist(userId, movieId, notes);
  res.json(result);
});

app.patch('/api/watchlist', (req: Request, res: Response) => {
  const { userId, movieId, watched } = req.body;
  if (!userId || !movieId || typeof watched !== 'boolean') {
    return res.status(400).json({ error: 'userId, movieId, and boolean watched are required' });
  }

  const success = db.setWatchedStatus(userId, movieId, watched);
  res.json({ success });
});

// ML Transparency & Stats API
app.get('/api/stats/:userId', (req: Request, res: Response) => {
  const stats = recommender.getProfileMLStats(req.params.userId);
  if (!stats) {
    return res.status(404).json({ error: 'User stats not found' });
  }
  res.json({ stats });
});

// Reset Database API
app.post('/api/reset', (_req: Request, res: Response) => {
  db.resetToDefaults();
  res.json({ success: true, message: 'Database reset to default 3 personas and initial states' });
});

// --- SERVER SETUP & VITE MIDDLEWARE ---
async function startServer() {
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CineMatrix ML Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
