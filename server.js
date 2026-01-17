// ---------- Imports ----------
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

const NODE_ENV = process.env.NODE_ENV || 'production';
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------- Important Variables --------
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

//EJS as templating Engine
app.set('view engine', 'ejs');
// Where to find templates
app.set('views', path.join(__dirname, 'src/views'));

const name = process.env.NAME;

//Global template variables middleware

app.use((req, res, next) => {
  res.locals.NODE_ENV = NODE_ENV.toLowerCase() || 'production';

  next();
})


// Temp hardcoded Course Data
const courses = {
    'CS121': {
        id: 'CS121',
        title: 'Introduction to Programming',
        description: 'Learn programming fundamentals using JavaScript and basic web development concepts.',
        credits: 3,
        sections: [
            { time: '9:00 AM', room: 'STC 392', professor: 'Brother Jack' },
            { time: '2:00 PM', room: 'STC 394', professor: 'Sister Enkey' },
            { time: '11:00 AM', room: 'STC 390', professor: 'Brother Keers' }
        ]
    },
    'MATH110': {
        id: 'MATH110',
        title: 'College Algebra',
        description: 'Fundamental algebraic concepts including functions, graphing, and problem solving.',
        credits: 4,
        sections: [
            { time: '8:00 AM', room: 'MC 301', professor: 'Sister Anderson' },
            { time: '1:00 PM', room: 'MC 305', professor: 'Brother Miller' },
            { time: '3:00 PM', room: 'MC 307', professor: 'Brother Thompson' }
        ]
    },
    'ENG101': {
        id: 'ENG101',
        title: 'Academic Writing',
        description: 'Develop writing skills for academic and professional communication.',
        credits: 3,
        sections: [
            { time: '10:00 AM', room: 'GEB 201', professor: 'Sister Anderson' },
            { time: '12:00 PM', room: 'GEB 205', professor: 'Brother Davis' },
            { time: '4:00 PM', room: 'GEB 203', professor: 'Sister Enkey' }
        ]
    }
};


// ---------- Routes ----------
app.get('/', (req, res) => {
  const title = 'Express Application Home';
  res.render('home', { title });
});

app.get('/about', (req, res) => {
  const title = 'About Me';
  res.render('about', { title });
});

app.get('/products', (req, res) => {
  const title = 'Our Products';
  res.render('products', { title});
});

app.get('/students', (req, res) => {
  const title = 'Student List';
  res.render('students', { title });
})

app.get('/teapot', (req, res, next) => {
  const err = new Error('This is a test error');
  err.status = 418;
  next(err);
})

app.get('/catalog', (req, res) => {
  res.render('catalog', {
    title: 'Course Catalog',
    courses: courses
  });
});

// ---------- Route Parameters ----------
app.get('/catalog/:courseId', (req, res, next) => {
  // Extract course ID
  const courseId = req.params.courseId;
  const course = courses[courseId];

  if (!course) {
    const err = new Error(`Course ${courseId} not fuond`);
  }

  // Get sort parameter (default to 'time')
  const sortBy = req.query.sort || 'time';

  // Create a copy of sections to sort
  let sortedSections = [...course.sections];

  // Sort based on the parameter
  switch (sortBy) {
    case 'professor':
      sortedSections.sort((a, b) => a.professor.localeCompare(b.professor));
      break;
    case 'room':
      sortedSections.sort((a, b) => a.room.localeCompare(b.room));
      break;
    case 'time':
      break;
  }

  console.log(`Viewing course: ${courseId}, sorted by: ${sortBy}`);

  // Render
  res.render('course-details', {
    title: `${course.id} - ${course.title}`,
    course: {...course, sections: sortedSections },
    currentSort: sortBy
  });
})

// ---------- Error Handling ----------
// 404 Errors
app.use((req, res, next) => {
  const err = new Error('Page Not Found');
  err.status = 404;
  next(err);
})

// 418
app.use((req, res, next) => {
  const err = new Error('Brew coffee in a teapot?')
  err.status = 418;
  next(err);
})

// Global Error Handler
app.use((err, req, res, next) => {
  // Prevents infinte loops if response has already been sent
  if (res.headersSent || res.finshed) {
    return next(err);
  }

  // Determine status and template
  const status = err.status || 500;
  const template = status === 404 ? '404': status === 418 ? '418' : '500';

  // Prepare data for the template
  const context = {
    title: status === 404 ? 'Page Not Found' : status === 418 ? 'Brew coffee in a teapot?!' : 'Server Error',
    error: NODE_ENV === 'production' ? 'An error occured' : err.message,
    stack: NODE_ENV === 'production' ? null : err.stack
  };

  // Render the correct error template
  try {
    res.status(status).render(`errors/${template}`, context);
  } catch (renderErr) {
    //If rendering fails, show simple error message
    if (!res.headersSent) {
      res.status(status).send(`<h1>Error ${status}</h1><p>An error occured.</p>`);
    }
  }
})


// ---------- Start the Server ----------
if (NODE_ENV.includes('dev')) {
  const ws = await import('ws');

  try {
    const wsPort = parseInt(PORT) +1;
    const wsServer = new ws.WebSocketServer({ port: wsPort });

    wsServer.on('listening', () => {
      console.log(`WebSocket server is running on port ${wsPort}`);
    });

    wsServer.on('error', (error) => {
      console.error('WebSocket server error:', error);
    });
  } catch(error) {
    console.error('Failed to start WebSocket server:', error);
  }
}

app.listen(PORT, () => {
  console.log(`Server is running on http://127.0.0.1:${PORT}`);
});