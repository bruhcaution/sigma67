const express = require('express');
const Unblocker = require('unblocker');

const app = express();
const port = process.env.PORT || 8080;

// Initialize the unblocker proxy with a specific prefix
const unblocker = new Unblocker({ prefix: '/proxy/' });

// Use the unblocker middleware
app.use(unblocker);

// Serve the front-end interface
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Simple Web Proxy</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background-color: #f4f4f9;
          margin: 0;
        }
        .container {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          text-align: center;
        }
        input[type="text"] {
          width: 300px;
          padding: 10px;
          margin-bottom: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        button {
          padding: 10px 20px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        button:hover {
          background-color: #0056b3;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Surf the Web</h1>
        <p>Enter a URL to browse via proxy.</p>
        <form id="proxy-form">
          <input type="text" id="url" placeholder="https://example.com" required />
          <br>
          <button type="submit">Go</button>
        </form>
      </div>

      <script>
        document.getElementById('proxy-form').onsubmit = function(e) {
          e.preventDefault(); // Prevent standard form submission
          let url = document.getElementById('url').value;
          
          // Ensure the URL starts with http:// or https://
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
          }
          
          // Redirect the user to the proxy route
          window.location.href = '/proxy/' + url;
        };
      </script>
    </body>
    </html>
  `);
});

// Start the server
app.listen(port, () => {
  console.log(\`Proxy server is running at http://localhost:\${port}\`);
});
