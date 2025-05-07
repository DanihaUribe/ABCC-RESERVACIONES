const db = require('../config/db'); 
const UserModel = {

  async findByUsername(username) {
    const result = await db.query('SELECT * FROM user_table WHERE username = $1', [username]);
    return result.rows[0];
  },

  async findById(id) {
    const result = await db.query('SELECT * FROM user_table WHERE user_id = $1', [id]);
    return result.rows[0];
  },

  async create({ username, passwordHash, userRole }) {
    const result = await db.query(
      `INSERT INTO user_table (username, password_hash, user_role) 
       VALUES ($1, $2, $3) RETURNING *`,
      [username, passwordHash, userRole]
    );
    return result.rows[0];
  }

};

module.exports = UserModel;
