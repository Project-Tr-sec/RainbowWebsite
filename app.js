const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Set view engine
app.set('view engine', 'ejs');

// Serve static files (like CSS)
app.use(express.static('public'));

//get data POST
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));


// Routes

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/english', (req, res) => {
  res.render('English');
});

app.get('/contact', (req, res) => {
  res.render('contact');
});

app.post('/contact', (req, res) => {
  const name = req.body.name;
  const message = req.body.message;
  console.log(`Message from ${name}: ${message}`);
  res.send(`Thank you ${name}, we have received your message.`);
});

// Start server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});