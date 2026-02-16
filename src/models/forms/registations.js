import db from '../db.js';

/**
 * Check if email already is registered
 * 
 * @param {string} email - The email to check
 * @returns {Promise<boolean>} True if exists, false otherwise
 */

const emailExists = async(email) => {
    const query = `
        SELECT EXISTS(SELECT 1 FROM users WHERE email =  $1) as exists
    `;
    const result = await db.query( query, [email]);
    return result.rows[0].exists;
};

/**
 * Save a user to the database
 * 
 * @param {string} name - Users full name
 * @param {string} email - Users email
 * @param {string} hashedPassword - Bcyrpt hased password
 * @return {Promise<Object>} Newly created user profile without password
 */

const saveUser = async (name, email, hashedPassword) => {
    const query = `
    INSERT INTO users (name, email, password)
    VALUES ($1, $2, $3)
    RETURNING id, name, email, created_at
    `;

    const result = await db.query(query, [name, email, hashedPassword]);
    return result.rows[0];
};

/**
 * Returns all registed Users
 * 
 * @returns {Promise<Array>} Array of user records without passwords
 */

const getAllUsers = async () => {
    const query = `
    SELECT id, name, email, created_at
    FROM users
    ORDER BY created_at DESC
    `;

    const result = await db.query(query);
    return result.rows;
};

export { emailExists, saveUser, getAllUsers };