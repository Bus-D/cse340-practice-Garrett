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
    INSERT INTO users (name, email, password, role_id)
    VALUES (
        $1,
        $2, 
        $3,
        (SELECT id FROM roles WHERE role_name = 'user'))
    RETURNING id, name, email, created_at
    `;

    const result = await db.query(query, [name, email, hashedPassword]);
    return result.rows[0];
};

/**
 * Retrieve a sinlge user with role info
 */
const getUserById = async (id) => {
    const query = `
        SELECT
            users.id,
            users.name,
            users.email,
            users.created_at,
            roles.role_name AS "roleName"
        FROM users
        INNER JOIN roles ON users.role_id = roles.id
        WHERE users.id = $1
    `;
        const result = await db.query(query, [id]);
        return result.rows[0] || null;
}

const updateUser = async (id, name, email) => {
    const query = `
        UPDATE users
        SET
            name = $1,
            email = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING id, name, email, updated_at
    `;
    const result = await db.query(query, [name, email, id]);
    return result.rows[0] || null;
    
}

const deleteUser = async (id) => {
    const query = 'DELETE FROM users WHERE id = $1';
    const result = db.query(query, [id]);
    return result.rowCount > 0;
}


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

export { 
    emailExists, 
    saveUser, 
    getAllUsers, 
    getUserById, 
    updateUser, 
    deleteUser 
};