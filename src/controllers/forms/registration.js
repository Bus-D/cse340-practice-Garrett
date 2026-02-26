import { Router } from 'express';
import { validationResult } from 'express-validator';
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
import { registrationValidation, editValidation} from '../../middleware/validation/forms.js';

const router = Router();

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
const showEditAccountForm = async (req, res) => {
    const targetUserId = parseInt(req.params.id);
    const currentUser = req.session.user;

    const targetUser = await getUserById(targetUserId);

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

    res.render('forms/register/edit', {
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
        const canEdit = currentUser.id === targetUserId || currentUser.roleName === 'admin';

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
        res.redirect('/register/list');
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
        res.redirect('/register/list');
    } catch (error) {
        // TODO: Log the error to console
        // TODO: Redirect back to /register
        console.error('Error saving user:', error);
        res.redirect('/register');
    }
};
/**
 * Process Account Deletion
 */
const processDeleteAccount = async (req, res) => {
    const targetUserId = parseInt(req.params.id);
    const currentUser = req.session.user;

    if (currentUser.roleName !== 'admin') {
        req.flash('error', 'You do not have permission to delete accounts.');
        return res.redirect('/register/list');
    }

    if (currentUser.id === targetUserId && currentUser.roleName === 'admin') {
        req.flash('error', 'You cannot delete your own account');
        return res.redirect('/register/list');
    }

    try {
        const deleted = await deleteUser(targetUserId);

        if (deleted) {
            req.flash('success', 'Account successfully deleted');
        } else {
            req.flash('error', 'User not found or user already deleted');
        }
    } catch(error) {
        console.error('Error deleting User:', error);
        req.flash('error', 'An error occured while deleting the account');
    }

    res.redirect('/register/list');
}

/**
 * Display all registered users.
 */
const showAllUsers = async (req, res) => {
    // Initialize users as empty array
    let users = [];

    try {
        users = await getAllUsers();

    } catch (error) {
        console.error('Error retrieving user list:', error);
    }

    res.render('forms/register/list', {
        title: 'Registered Users',
        users,
        user: req.session && req.session.user ? req.session.user : null
    })
};

router.get('/', showRegistrationForm);

router.post('/', registrationValidation, processRegistration);

router.get('/list', showAllUsers);

router.get('/:id/edit', requireLogin, showEditAccountForm);

router.post('/:id/edit', requireLogin, editValidation, processEditAccount);

router.post('/:id/delete', requireLogin, processDeleteAccount);

export default router;