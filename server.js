const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 5173;
const root = __dirname;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const safePath = req.url.split('?')[0];
  let filePath = path.join(root, safePath);

  if (safePath === '/' || safePath === '') {
    filePath = path.join(root, 'index.html');
  }

  // 防止目錄穿越
  if (!filePath.startsWith(root)) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    return res.end('Bad Request');
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 Not Found');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.createReadStream(filePath)
      .on('error', () => {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 Internal Server Error');
      })
      .once('open', () => {
        res.writeHead(200, { 'Content-Type': contentType });
      })
      .pipe(res);
  });
});

server.listen(port, () => {
  console.log(`Static server running at http://localhost:${port}/`);
});