const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

// Serve the clean front-end UI
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Private Proxy</title>
      <style>
        body { font-family: Arial, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background-color: #121212; color: #fff; margin: 0; }
        .box { background: #1e1e1e; padding: 30px; border-radius: 8px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.5); width: 85%; max-width: 400px; }
        input { width: 100%; padding: 12px; margin-bottom: 15px; border: 1px solid #333; background: #252525; color: white; border-radius: 4px; box-sizing: border-box; }
        button { width: 100%; padding: 12px; background: #007bff; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; }
        button:hover { background: #0056b3; }
      </style>
    </head>
    <body>
      <div class="box">
        <h2>Web Proxy</h2>
        <form action="/go" method="GET">
          <input type="text" name="url" placeholder="wikipedia.org" required />
          <button type="submit">Browse</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

// Redirect mechanism to structure the incoming URL
app.get('/go', (req, res) => {
  let targetUrl = req.query.url;
  if (!targetUrl) return res.redirect('/');
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = 'https://' + targetUrl;
  }
  res.redirect(`/service?url=${encodeURIComponent(targetUrl)}`);
});

// Core Proxy Engine using modern native Node fetch
app.get('/service', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send('No URL specified');

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const contentType = response.headers.get('content-type') || '';
    res.status(response.status);
    res.setHeader('Content-Type', contentType);

    // If it's a web page, rewrite assets/links to keep them inside the proxy
    if (contentType.includes('text/html')) {
      let html = await response.text();

      const rewriteUrl = (match, attribute, url) => {
        if (!url || url.startsWith('#') || url.startsWith('data:')) return match;
        try {
          const resolved = new URL(url, targetUrl).href;
          return `${attribute}="/service?url=${encodeURIComponent(resolved)}"`;
        } catch (e) {
          return match;
        }
      };

      html = html.replace(/(href|src)="([^"]*)"/gi, rewriteUrl);
      html = html.replace(/(href|src)='([^']*)'/gi, (match, attribute, url) => rewriteUrl(match, attribute, url));

      res.send(html);
    } else {
      // For binary files, pictures, scripts, and stylesheets
      const arrayBuffer = await response.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    }
  } catch (err) {
    res.status(500).send(`Proxy Error: ${err.message}`);
  }
});

app.listen(port, () => {
  console.log(`Proxy active on port ${port}`);
});
