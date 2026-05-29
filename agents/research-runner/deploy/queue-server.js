#!/usr/bin/env node
/**
 * Minimal queue UI for pi-runner — zero dependencies, Node built-ins only.
 * Serves a mobile-friendly form on :8080 (or QUEUE_UI_PORT) that appends
 * items to /app/data/vault/RESEARCH_QUEUE.md.
 *
 * Protected by HTTP Basic Auth (QUEUE_UI_USER / QUEUE_UI_PASSWORD).
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.QUEUE_UI_PORT || '8080', 10);
const QUEUE_FILE = process.env.QUEUE_FILE || '/app/data/vault/RESEARCH_QUEUE.md';
const AUTH_USER = process.env.QUEUE_UI_USER || 'admin';
const AUTH_PASS = process.env.QUEUE_UI_PASSWORD || '';

function checkAuth(req) {
  const header = req.headers['authorization'] || '';
  const parts = header.split(' ');
  if (parts[0] !== 'Basic' || !parts[1]) return false;
  const decoded = Buffer.from(parts[1], 'base64').toString('utf8');
  const [user, pass] = decoded.split(':');
  return user === AUTH_USER && pass === AUTH_PASS;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const page = ({ message = '', status = '' } = {}) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Research Queue</title>
<style>
  :root { --bg:#f5f5f7; --card:#fff; --accent:#007aff; --good:#34c759; --bad:#ff3b30; --text:#1c1c1e; --muted:#8e8e93; }
  * { box-sizing:border-box; }
  body { font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; margin:0; padding:24px 16px; background:var(--bg); color:var(--text); }
  .wrap { max-width:520px; margin:0 auto; }
  h1 { font-size:1.5rem; margin:0 0 4px; }
  p.sub { margin:0 0 20px; color:var(--muted); font-size:.9rem; }
  form { background:var(--card); border-radius:16px; padding:20px; box-shadow:0 1px 3px rgba(0,0,0,.06); }
  label { display:block; font-size:.85rem; font-weight:600; margin:16px 0 6px; color:var(--muted); text-transform:uppercase; letter-spacing:.4px; }
  label:first-of-type { margin-top:0; }
  select, textarea { width:100%; padding:12px 14px; font-size:1rem; border:1px solid #d1d1d6; border-radius:10px; background:#fafafc; }
  textarea { resize:vertical; min-height:100px; }
  button { width:100%; margin-top:18px; padding:14px; font-size:1rem; font-weight:600; color:#fff; background:var(--accent); border:none; border-radius:12px; cursor:pointer; }
  button:active { transform:scale(.98); }
  .msg { margin-top:16px; padding:14px; border-radius:12px; font-size:.95rem; }
  .msg.ok { background:#e6f9ee; color:#0a5c2a; }
  .msg.err { background:#ffe5e5; color:#7a1f1f; }
  .footer { text-align:center; margin-top:24px; font-size:.8rem; color:var(--muted); }
</style>
</head>
<body>
<div class="wrap">
  <h1>Add to Research Queue</h1>
  <p class="sub">Pick a tag, type a topic, submit — done.</p>
  <form method="POST" action="/">
    <label for="tag">Tag</label>
    <select id="tag" name="tag">
      <option value="engineering">engineering</option>
      <option value="research">research</option>
      <option value="personal">personal</option>
    </select>
    <label for="topic">Topic</label>
    <textarea id="topic" name="topic" placeholder="What should we research?" required></textarea>
    <button type="submit">Add to Queue</button>
    ${status ? `<div class="msg ${status}">${message}</div>` : ''}
  </form>
  <div class="footer">pi-runner · research.v1truv1us.dev</div>
</div>
</body>
</html>`;

const server = http.createServer((req, res) => {
  if (!checkAuth(req)) {
    res.writeHead(401, {
      'WWW-Authenticate': 'Basic realm="Research Queue"',
      'Content-Type': 'text/plain'
    });
    return res.end('Unauthorized');
  }

  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(page());
  }

  if (req.method === 'POST' && req.url === '/') {
    let body = '';
    req.on('data', c => { body += c; });
    req.on('end', () => {
      const params = new URLSearchParams(body);
      const tag = params.get('tag');
      const topic = (params.get('topic') || '').trim();

      if (!tag || !topic || !['engineering','research','personal'].includes(tag)) {
        res.writeHead(422, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(page({ message: 'Pick a valid tag and enter a topic.', status: 'err' }));
      }

      try {
        const content = fs.readFileSync(QUEUE_FILE, 'utf8');
        const marker = `## #${tag}`;
        if (!content.includes(marker)) {
          throw new Error(`Section ${marker} not found`);
        }
        const parts = content.split(marker);
        const after = parts[1];
        const nl = after.indexOf('\n');
        const line = `\n- [ ] ${topic.replace(/\n/g, ' ')}`;
        parts[1] = after.slice(0, nl + 1) + line + after.slice(nl + 1);
        fs.writeFileSync(QUEUE_FILE, parts.join(marker), 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(page({ message: `Added to #${escapeHtml(tag)}: ${escapeHtml(topic)}`, status: 'ok' }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(page({ message: `Error: ${escapeHtml(e.message)}`, status: 'err' }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`[queue-ui] Listening on :${PORT} (auth user: ${AUTH_USER})`);
});
