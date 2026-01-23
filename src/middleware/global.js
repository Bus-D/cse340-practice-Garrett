// Time getter and greeter funciton
const getCurrentGreeting = () => {
    const currentHour = new Date().getHours();

    if (currentHour <12) {
        return 'Good Morning!';
    }

    if (currentHour < 18) {
        return 'Good Afternoon!';
    }

    return 'Good Evening!';
};

// Add local variables to res.locals for use in all templates
const addLocalVariables = (req, res, next) => {
    res.locals.currentYear = new Date().getFullYear();

    // Make NODE_ENV available to all templates
    res.locals.NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';

    // All req.query available
    res.locals.queryParams = { ...req.query };

    // Set greeting
    res.locals.greeting = `<p>${getCurrentGreeting()}</p>`

    // Randomly assign theme
    const themes = ['blue-theme', 'green-theme', 'red-theme'];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    res.locals.bodyClass = randomTheme;

    next();
}

export { addLocalVariables };
