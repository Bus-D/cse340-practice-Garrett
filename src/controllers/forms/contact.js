import { Router } from 'express';
import { body, validationResult} from 'express-validator';
import { createContactForm, getAllContactForms } from '../../models/forms/contact.js';

const router = Router();

/* Display Contact Form Page */
const showContactForm = (req, res) => {
    res.render('forms/contact/form', {
        title: 'Contact Us'
    });
};

/*
    Handle Contact Form Submission with Validation
    If validation passes, save to database and redirect
    If validation fails, log erros and redirect back to form.
*/
const handleContactSubmission = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        //Log erros for dev debuging
        console.error('Validation Errors:', errors.array());

        return res.redirect('/contact');
    }

    // Extract validated data
    const { subject, message } = req.body;

    try {
        // Save to database
        await createContactForm(subject, message);
        console.log('Contact form submitted successfully');
        // Redirect to responses page on success
        res.redirect('/contact/responses');
    } catch (error) {
        console.log('Error saving contact form:', error);
        res.redirect('/contact');
    }
};

/*
    Display all contact form submissions
*/
const showContactResponses = async (req, res) => {
    let contactForms = [];

    try {
        contactForms = await getAllContactForms();
    } catch (error) {
        console.error('Error retrieving contact forms:', error);
    }

    res.render('forms/contact/responses', {
        title: 'Contact Form Submissions',
        contactForms
    });
};

/*
    GET /contact - Display contact form
*/
router.get('/', showContactForm);

/*
    POST /contact - Handle contact form submission with validation
*/
router.post('/',
    [
        body('subject')
            .trim()
            .isLength({ min: 2})
            .withMessage('Subject must be at least 2 characters'),
        body('message') 
            .trim()
            .isLength({ min: 10})
            .withMessage('Message must be at least 10 characters')
    ],
    handleContactSubmission
);

/*
    GET /contact/responses - Disaply all form submissions
*/
router.get('/responses', showContactResponses);

export { showContactForm, handleContactSubmission, showContactResponses};