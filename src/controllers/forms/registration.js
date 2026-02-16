import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { emailExists, saveUser, getAllUsers } from '../../models/forms/registations.js';

const router = Router();

/**
 * Validation rules for user registration
 */

const registrationValidation = [
    body('name')
        .trim()
        .isLength({ min:2 })
        .withMessage('Name must be at least 2 characters'),
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Must be a valid email address'),
    body('emailConfirm')
        .trim()
        .custom((value, {req}) => value === req.body.email)
        .withMessage('Email addresses must match'),
    body('password')
        .isLength({ min: 8})
        .matches(/[0-9]/)
        .withMessage('Must contain at least 1 number')
        .matches(/[!@#$%*^]/)
        .withMessage('Must contain at least 1 special character'),
    body('passwordConfirm')
        .custom((value, {req}) => value === req.body.password)
        .withMessage('Passwords must match')
];



/**
 * Display the registration form page.
 */
const showRegistrationForm = (req, res) => {
    res.render('forms/register/form', {
        title: 'Register'
    });
};


/**
 * Handle user registration with validation and password hashing.
 */
const processRegistration = async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // TODO: Log validation errors to console for debugging
        console.error('Registration Errors:', errors.array());
        // TODO: Redirect back to /register
        return res.redirect('/register');
    }

    // Extract validated data from request body
    // TODO: Destructure name, email, password from req.body
    const {name, email, password } = req.body;

    try {
        // Check if email already exists in database
        // TODO: Call emailExists(email) and store the result in a variable
        const emailIsIn = await emailExists(email);

        if (emailIsIn) {
            // TODO: Log message: 'Email already registered'
            console.log(`${email} already exists. Please use a different email or sign in`);
            // TODO: Redirect back to /register
            res.redirect('/register');
            return;
        }

        // Hash the password before saving to database
        // TODO: Use bcrypt.hash(password, 10) to hash the password
        // TODO: Store the result in a variable called hashedPassword
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user to database with hashed password
        // TODO: Call saveUser(name, email, hashedPassword)
        await saveUser(name, email, hashedPassword);

        // TODO: Log success message to console
        // TODO: Redirect to /register/list to show successful registration
        // NOTE: Later when we add authentication, we'll change this to require login first
        console.log('Registration Successful');
        res.redirect('forms/register/ist');
    } catch (error) {
        // TODO: Log the error to console
        // TODO: Redirect back to /register
        console.error('Error saving user:', error);
        res.redirect('/register');
    }
};

/**
 * Display all registered users.
 */
const showAllUsers = async (req, res) => {
    // Initialize users as empty array
    let users = [];

    try {
        // TODO: Call getAllUsers() and assign to users variable
        users = await getAllUsers();

    } catch (error) {
        // TODO: Log the error to console
        // users remains empty array on error
        console.error('Error retrieving user list:', error);
    }

    // TODO: Render the users list view (forms/registration/list)
    // TODO: Pass title: 'Registered Users' and the users variable in the data object
    res.render('forms/register/list', {
        title: 'Registered Users',
        users
    })
};

router.get('/', showRegistrationForm);

router.post('/', registrationValidation, processRegistration);

router.get('/list', showAllUsers);

export default router;