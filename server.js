//Import express using ESM syntax
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Create an instance of an Exress application
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

const name = process.env.NAME;

//Define a route handler for the root URL ('/')
app.get('/', (req, res) => {
  res.send(`Welcome ${name}!`);
});

app.get('/new-route', (req, res) => {
  res.send('THis is a new route!');
});

//Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on http://127.0.0.1:${PORT}`);
});