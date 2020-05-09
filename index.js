const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();

app.use(cors());

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Nature Image Search API. Make a request to /search?q=your-search-term-here'
  });
});

const BASE_URL = 'https://www.reddit.com/r/earthporn/search.json?restrict_sr=1&q=';
app.get('/search', (req, res) => {
  const { after, q } = req.query;
  let url = `${BASE_URL}${q}`;
  if (after) url += `&after=${after}`;
  fetch(url)
    .then(res => res.json())
    .then(result => {
      const { children, after } = result.data;
      const images = children
        .filter(({ data }) => data.url && data.url.match(/\.(jpg|png|jpeg|bmp|webm)$/))
        .map(({ data }) => {
          return {
            title: data.title.replace(/\[(.*)\]|\((.*)\)/, '').trim(),
            image: data.url,
            thumbnail: data.thumbnail,
            author: data.author,
            source: `https://www.reddit.com${data.permalink}`,
            created_utc: data.created_utc,
          };
        });
      res.json({ images, after });
    });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log('Listening on port', port));
