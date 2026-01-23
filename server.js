import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// ---------- MVC Components ----------
import routes from './src/controllers/routes.js';
import { addLocalVariables } from './src/middleware/global.js';

// ---------- Server Config ----------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const NODE_ENV = process.env.NODE_ENV?.toLocaleLowerCase() || 'production';
const PORT = process.env.PORT || 3000;
console.log('NODE_ENV:', process.env.NODE_ENV);

// ---------- Express Sever Set Up ----------
const app = express();

// ---------- Express Config ----------
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));
console.log('__dirname:', __dirname);

// ---------- Global Middleware ----------
app.use(addLocalVariables);

// ---------- Routes ----------
app.use('/', routes);

// ---------- Error Handling ----------
// 404
app.use((req, res, next) => {
  const err = new Error('Page Not Found');
  err.status = 404;
  next(err);
});

// Global Error Handler
app.use((err, req, res, next) => {
  // Prevent infinite loops
  if (res.headersSent || res.finished) {
    return next(err);
  }

  // Determine status and template
  const status = err.status || 500;
  const template = status === 404 ? '404' : '500';

  // Prepare data
  const context = {
    title: status === 404 ? 'Page Not Found' : 'Server Error',
    NODE_ENV,
    error: NODE_ENV === 'production' ? 'An error occured' : err.message,
    stack: NODE_ENV === 'production' ? null : err.stack
  };

  // Render the error template
  try {
    res.status(status).render(`errors/${template}`, context);
  } catch (renderErr) {
    if (!res.headersSent) {
      res.status(status).send(`<h1>Error ${status}</h1><p>An error occurred.</p>`);
    }
  }
});

// Start WebSocket in Dev Move
if (NODE_ENV.includes('dev')) {
  const ws = await import('ws');

  try {
    const wsPort = parseInt(PORT) + 1;
    const wsServer = new ws.WebSocketServer({ port: wsPort });

    wsServer.on('listening', () => {
      console.log(`WebSocket server in running on port ${wsPort}`);
    });

    wsServer.on('error', (error) => {
      console.error('Websocket server error:', error);
    });
  } catch (error) {
    console.error('Failed to start WebSocket server:', error);
  }
}

// ---------- Start Server ----------
app.listen(PORT, () => {
  console.log(`Server is running on http://127.0.0.1:${PORT}`);
});