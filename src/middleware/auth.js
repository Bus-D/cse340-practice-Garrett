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

export { requireLogin };