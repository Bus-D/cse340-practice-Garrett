import { Router} from 'express';
import { addDemoHeaders } from '../middleware/demo/headers.js';
import { catalogPage, courseDetailPage } from './catalog/catalog.js';
import { homePage, aboutPage, demoPage, testErrorPage } from './index.js';
import { facultyListPage, facultyDetailPage } from './faculty/faculty.js';

// New Router instance
const router = Router();

router.use('/', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/main.css">');
    next();
}) 

router.use('/catalog', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/catalog.css">');
    next();
});

router.use('/faculty', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/faculty.css">');
    next();
});



// Home and Basic Pages
router.get('/', homePage);
router.get('/about', aboutPage);

// Course Catalog
router.get('/catalog', catalogPage);
router.get('/catalog/:courseSlug', courseDetailPage);

// Faculty Page
router.get('/faculty/list', facultyListPage);
router.get('/faculty/:facultySlug', facultyDetailPage);

// Demo page
router.get('/demo', addDemoHeaders, demoPage);

// Test Error
router.get('/test-error', testErrorPage);

export default router;