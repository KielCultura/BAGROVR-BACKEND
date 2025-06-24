const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY; // Set on Render

app.post('/api/google-places-groq', async (req, res) => {
  const { term } = req.body;
  if (!term) return res.status(400).json({ error: 'Missing term' });
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(term)}&key=${GOOGLE_API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    const places = (data.results || []).slice(0, 10).map(place => ({
      name: place.name,
      address: place.formatted_address,
      rating: place.rating,
      user_ratings_total: place.user_ratings_total,
      google_maps_url: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
      review: place?.reviews?.[0]?.text || ""
    }));
    res.json({ summary: `Here are results for: ${term}`, places });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch places.' });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
