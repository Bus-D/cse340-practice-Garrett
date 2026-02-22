/**
 * Middleware to require auth for protected Routes
 * Redirects to login page if not logged in
 * Set res.locals.isLoggedIn = true for authenticated requests
 */

const requireLogin = (req, res, next) => {
    if (req.session && req.session.user) {
        res.locals.isLoggedIn = true;
        next();
    } else {
        res.redirect('/login');
    }
};

/**
 * Middleware factory to require specific role for route access
 * Returns middleware that checks if user has the required role
 * 
 * @param {string} roleName - The role name required (e.g., 'admin', 'user')
 * @returns {Function} Express middleware function
 */
const requireRole = (roleName) => {
    return (req, res, next) => {
        if (!req.session || req.session.user) {
            req.flash('error', 'You must be logged in to see this page');
            res.redirect('/login');
        }

        if (req.session.roleName !== roleName) {
            req.flash('error', 'You do not have permissions to see this page');
            res.redirect('/');
        }

        next();
    }
}

export { requireLogin, requireRole };