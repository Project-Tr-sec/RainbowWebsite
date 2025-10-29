// file: app.js
'use strict';

/**
 * Express app for Rainbow Language Academy.
 * Why: consistent EJS rendering, safe form handling, and predictable errors.
 */

const path = require('path');
const express = require('express');

const app = express();
const port = Number(process.env.PORT) || 3000;

// --- View engine & static ---
app.set('views', path.join(__dirname, 'views'));        // e.g. views/index.ejs, views/English.ejs, views/contact.ejs
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1d', extensions: ['html'] }));

// --- Body parsing (no body-parser) ---
app.use(express.urlencoded({ extended: true }));        // form POSTs
app.use(express.json());                                // JSON payloads

// --- Basic security headers (lightweight; avoids surprises) ---
app.disable('x-powered-by');

// --- Health check ---
app.get('/healthz', (_req, res) => res.type('text').send('ok'));

// --- Routes ---
app.get('/', (_req, res) => {
  res.render('index');                                  // views/index.ejs
});

app.get('/english', (_req, res, next) => {
  // Note: filename is case-sensitive on Linux. Ensure views/English.ejs exists.
  res.render('English', {}, (err, html) => {
    if (err) return next(err);
    res.send(html);
  });
});

app.get('/contact', (_req, res) => {
  res.render('contact');                                // views/contact.ejs
});

app.post('/contact', (req, res) => {
  const {
    name = 'Guest',
    phone = '',
    consultation = '',
    course = '',
    message = ''
  } = req.body || {};

  // Why: keep a simple audit trail in server logs
  console.log('[CONTACT]', {
    at: new Date().toISOString(),
    name,
    phone,
    consultation,
    course,
    message: String(message).slice(0, 500)              // avoid log bloat
  });

  // Simple success response; replace with redirect or flash if desired
  res
    .status(200)
    .type('html')
    .send(
      `<p>Thank you <strong>${escapeHtml(name)}</strong>, we have received your message.</p>
       <p><a href="/">Back to Home</a></p>`
    );
});

// --- 404 handler ---
app.use((req, res) => {
  res.status(404);
  // Prefer rendering a 404.ejs if you add one; fallback to text.
  try {
    return res.render('404', { url: req.originalUrl });
  } catch {
    return res.type('text').send(`Not Found: ${req.originalUrl}`);
  }
});

// --- Error handler ---
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  const status = err.status || 500;
  // Render an error view if available; otherwise minimal text.
  try {
    return res.status(status).render('error', { status, message: err.message });
  } catch {
    return res.status(status).type('text').send(`Error ${status}: ${err.message}`);
  }
});

// --- Start server ---
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// --- Utilities ---
function escapeHtml(value) {
  // Why: prevent HTML injection in the plain thank-you response
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}