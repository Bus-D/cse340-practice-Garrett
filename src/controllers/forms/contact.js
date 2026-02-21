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
        // Store validation errors as flash errors
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });
        

        return res.redirect('/contact');
    }

    // Extract validated data
    const { subject, message } = req.body;

    try {
        // Save to database
        await createContactForm(subject, message);
        req.flash('success', 'Thank you for contacting us! We will respond soon.');
        res.redirect('/contact');
    } catch (error) {
        console.error('Error saving contact form:', error);
        req.flash ('error', 'Unable to submit your error. Please try again later.');
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
            .isLength({ min: 2, max: 255})
            .withMessage('Subject must be between 2 and 255 characters')
            .matches(/^[a-zA-Z0-9\s\-.,!?]+$/)
            .withMessage('Subjext contains invalid characters'),
        body('message') 
            .trim()
            .isLength({ min: 10, max: 2000})
            .withMessage('Message must be between 10 and 2000 characters')
            .custom((value) => {
                const words = value.split(/\s+/);
                const uniqueWords = new Set(words);

                if (words.length > 20 && uniqueWords.size / words.length < 0.3) {
                    throw new Error('Message appears to be spam');
                }
            })
    ],
    handleContactSubmission
);

/*
    GET /contact/responses - Disaply all form submissions
*/
router.get('/responses', showContactResponses);

// export { showContactForm, handleContactSubmission, showContactResponses};
export default router;