/**
 * Flash Message Middleware
 * 
 * Provides temporary message storage that survives redirects but is consumed on render.
 * Messages are stored in the session and organized by type (success, error, warning, info).
 * 
 * Usage in controllers:
 *   req.flash('success', 'Message text')  // Store a message
 *   req.flash('error')                    // Get all error messages
 *   req.flash()                           // Get all messages (all types)
 */

/**
 * Initialize Flash Storage and Provide Access Methods
 */
const flashMiddleware = (req, res, next) => {
    // Track if flash messages were saved
    let sessionNeedsSaved = false;

    // Override res.redirect to save session before redirecting
    const orginalRedirect = res.redirect.bind(res);
    res.redirect = (...args) => {
        if (sessionNeedsSaved && req.session) {
            req.session.save(() => {
                orginalRedirect.apply(res, args);
            })
        } else {
            orginalRedirect.apply(res, args);
        }
    };

    /**
    * The flash function handles both setting and getting messages
    * - Called with 2 args (type, message): stores a new message
    * - Called with 1 arg (type): retrieves and clears messages of that type
    * - Called with 0 args: retrieves and clears all messages
    */
    req.flash = function(type, message) {
        // Guard: If session doesn't exists (after session.destroy()),
        // Return early to prevent errors.
        if (!req.session) {
            if (type && message) {
                return;
            }
            return { success: [], error: [], warning: [], info: [] };
        }

        // Intialize flash storage if not exists
        if (!req.session.flash) {
            req.session.flash = {
                success: [],
                error: [],
                warning: [],
                info: []
            };
        }

        // SETTING: Two args mean storing a message
        if (type && message) {
            // Ensure type exists
            if (!req.session.flash[type]) {
                req.session.flash[type] = [];
            }
            // Add message to the appropriate type
            req.session.flash[type].push(message);
            // Set that session needs saved
            sessionNeedsSaved = true;
            return;
        }

        // GETTING ONE TYPE: If no message, retrieve the type to display message of that type
        if (type && !message) {
            const messages = req.session.flash[type] || [];
            // Clear this type after retrieving the message
            req.session.flash[type] = [];
            return messages;
        }

        // GETTING ALL: get all types and messages
        const allMessages = req.session.flash || {
            success: [],
            error: [],
            warning: [],
            info: []
        };

        // Clear all messages after retrival
        req.session.flash = {
            success: [],
            error: [],
            warning: [],
            info: []
        };

        return allMessages;
    };

    next();
}

const flashLocals = (res, req, next) => {
    res.locals.flash = req.flash;
    next();
};

/**
 * Combine both functions into single function
 * that calls in correct order
 */
const flash = (res, req, next) => {
    flashMiddleware(req, res, () => {
        flashLocals(req, res, next);
    });
};

export default flash;