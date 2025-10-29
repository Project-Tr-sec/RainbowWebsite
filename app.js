// file: app.js
'use strict';

const path = require('path');
const express = require('express');

const app = express();
const port = Number(process.env.PORT) || 3000;

// Views & static
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1d' }));

// Parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Health
app.get('/healthz', (_req, res) => res.type('text').send('ok'));

// Routes
app.get('/', (_req, res) => res.render('index', { active: 'home' }));
app.get('/english', (_req, res, next) =>
  res.render('English', { active: 'english' }, (err, html) => (err ? next(err) : res.send(html)))
);
app.get('/contact', (_req, res) => res.render('contact', { active: 'contact' }));

app.post('/contact', (req, res) => {
  const { name = 'Guest', phone = '', consultation = '', course = '', message = '' } = req.body || {};
  console.log('[CONTACT]', { at: new Date().toISOString(), name, phone, consultation, course, message: String(message).slice(0, 500) });
  res
    .status(200)
    .type('html')
    .send(
      `<p>Thank you <strong>${escapeHtml(name)}</strong>, we have received your message.</p>
       <p><a href="/">Back to Home</a></p>`
    );
});

// 404
app.use((req, res) => res.status(404).type('text').send(`Not Found: ${req.originalUrl}`));
// Errors
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).type('text').send(`Error ${err.status || 500}: ${err.message}`);
});

app.listen(port, () => console.log(`Server is running at http://localhost:${port}`));

function escapeHtml(v) {
  return String(v).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}
