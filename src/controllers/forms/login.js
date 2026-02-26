import { validationResult } from 'express-validator';
import { findUserByEmail, verifyPassword } from '../../models/forms/login.js';
import { Router } from 'express';
import { loginValidation } from '../../middleware/validation/forms.js';

const router = Router();

/**
 * Display Login Form
 */
const showLoginForm = (req, res) => {
    res.render('forms/login/form', {
        title: 'User Login'
    })
};

/**
 * Process Login
 */
const processLogin = async (req, res) => {
    console.log('Login Attempt:', req.body);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.error('Login Errors:', errors);

        return res.redirect('/login');
    }

    // Extract email and password
    const {email, password} = req.body;

    try {
        const foundUser = await findUserByEmail(email);

        if (!foundUser) {
            console.log(`This account does not exist. Please try again`);
            res.redirect('/login');
            return;
        }

        const verifiedPassword = await verifyPassword(password, foundUser.password);

        if (!verifiedPassword) {
            console.log('Invalid password. Please try again');
            res.redirect('/login');
            return;
        }

        // SECURITY: remove password from user before storing session
        delete foundUser.password;

        req.session.user = foundUser;

        res.redirect('/dashboard');
        return;

    } catch (error) {
        console.error('Login error:', error);

        res.redirect('/login');
    }
}

/**
 * Handle User Logout
 */
const processLogout = (req, res) => {
    // Check is there is a session object in the request
    if (!req.session) {
        // If no session, nothing to destroy. Return to home page
        return res.redirect('/');
    }

    req.session.destroy((error) => {
        if (error) {
            console.error('Error destroying session:', error)

            // clear cookie so client doesn't keep sending ivalid session ID
            res.clearCookie('connect.sid');


            return res.redirect('/');
        }

        res.clearCookie('connect.sid');

        res.redirect('/');
    });
};

/**
 * Display dashboard
 * Requires login
 */
const showDashboard = (req, res) => {
    const user = req.session.user;
    const sessionData = req.session;

    if (user && user.password) {
        console.error('Security Error: password found in user object');
        delete user.password;
    }
    if (sessionData.user && sessionData.user.password) {
        console.error('Security Error: password found in sessionData.user')
    }

    res.render('dashboard', {
        title: 'Dashboard',
        sessionData,
        user
    });
}

router.get('/', showLoginForm);
router.post('/', loginValidation, processLogin);

export default router;
export { processLogout, showDashboard };