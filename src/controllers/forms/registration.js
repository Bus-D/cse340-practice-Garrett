import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { 
    emailExists, 
    saveUser, 
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
} from '../../models/forms/registration.js';
import { requireLogin } from '../../middleware/auth.js';

const router = Router();

/**
 * Validation rules for user registration
 */

const registrationValidation = [
    body('name')
        .trim()
        .isLength({ min:2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
        
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Must be a valid email address')
        .isLength({ max: 255 })
        .withMessage('Email is too long'),
    body('emailConfirm')
        .trim()
        .custom((value, {req}) => value === req.body.email)
        .withMessage('Email addresses must match'),
    body('password')
        .isLength({ min: 8, max: 128})
        .withMessage('Password must be between 8 and 128 characters')
        .matches(/[0-9]/)
        .withMessage('Must contain at least 1 number')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least 1 lowercase character')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least 1 upper case character')
        .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
        .withMessage('Must contain at least 1 special character'),
    body('passwordConfirm')
        .custom((value, {req}) => value === req.body.password)
        .withMessage('Passwords must match')
];

const editValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100})
        .withMessage('Name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
    body('email')  
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Must be a valid email address')
        .isLength({ max: 255} )
        .withMessage('Email is too long')
]



/**
 * Display the registration form page.
 */
const showRegistrationForm = (req, res) => {
    res.render('forms/register/form', {
        title: 'Register'
    });
};


/**
 * Display the edit account form
 * Users can edit their own account, admins can edit any account
 */
const showEditAccountForm = (req, res) => {
    const targetUserId = parseInt(req.params.id);
    const currentUser = req.session.user;

    const targetUser = getUserById(targetUserId);

    if (!targetUser) {
        req.flash('error', 'User not found')
        return res.redirect('/register/list');
    }

    // Check permissions: users can edit themselves, admins can edit anyone
    const canEdit = currentUser.id === targetUserId || currentUser.roleName === 'admin';

    if (!canEdit) {
        req.flash('error', 'You do not have permission to edit this account');
        return res.redirect('/register/login');
    }

    res.render('/forms/registration/edit', {
        title: 'Edit Account',
        user: targetUser
    });
};

/**
 * Process acount edit submission
 */
const processEditAccount = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });
    }

    const targetUserId = parseInt(req.params.id);
    const currentUser = req.session.user;
    const {name, email} = req.body;

    try {
        const targetUser = await getUserById(targetUserId);

        if (!targetUser) {
            req.flash('error', 'User not found');
            return res.redirect('/register/list');
        }

        // Check permissions
        const canEdit = currentUser.id === targetUserId || currentUser.roleNmae === 'admin';

        if (!canEdit) {
            req.flash('error', 'You do not have permission to edit this account');
            return res.redirect('/register/login');
        }

        // Check if new email already exists
        const emailTaken = await emailExists(email);
        if (emailTaken && targetUser.email !== email) {
            req.flash('error', 'An account with this email already exists');
            return res.redirect(`/register/${targetUserId}/edit`);
        }

        await updateUser(targetUserId, name, email);

        if (currentUser.id === targetUserId) {
            req.session.user.name = name;
            req.session.user.email = email;
        }

        req.flash('success', 'Account updated successfully');
        res.reditect('/register/list');
    } catch (error) {
        console.error('Error updating account:', error);
        req.flash('error', 'An error occurred while updating the account');
        res.redirect(`/register/${targetUserId}/edit`);
    }
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

router.get('/:id/edit', requireLogin, showEditAccountForm);

router.post('/:id/edit', requireLogin, editValidation, processEditAccount);

export default router;