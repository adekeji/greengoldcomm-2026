import pkg from 'pg';
const { Pool } = pkg;

// Connect to PostgreSQL using the DATABASE_URL environment variable 
// (Cloud Run uses this for Cloud SQL connections)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on('connect', async (client) => {
    console.log('Connected to the PostgreSQL database.');

    // Create necessary tables using Postgres syntax (SERIAL instead of AUTOINCREMENT)
    await client.query(`CREATE TABLE IF NOT EXISTS contacts (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`).catch(err => console.error('Error creating contacts table:', err.message));

    await client.query(`CREATE TABLE IF NOT EXISTS freelancers (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      skills TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`).catch(err => console.error('Error creating freelancers table:', err.message));
});

// Create a wrapper to keep compatibility with existing SQLite db.all and db.run methods
const db = {
    all: async (sql, params, callback) => {
        try {
            const res = await pool.query(sql, params);
            callback(null, res.rows);
        } catch (err) {
            callback(err, null);
        }
    },
    run: async function (sql, params, callback) => {
        try {
            // Convert SQLite parameter markers (?) to PostgreSQL markers ($1, $2, etc.)
            let pgSql = sql;
            let i = 1;
            while (pgSql.includes('?')) {
                pgSql = pgSql.replace('?', '$' + i);
                i++;
            }
            
            // If it's an insert, add RETURNING id to get the last inserted ID
            if (pgSql.trim().toUpperCase().startsWith('INSERT') && !pgSql.toUpperCase().includes('RETURNING')) {
                pgSql += ' RETURNING id';
            }

            const res = await pool.query(pgSql, params);
            
            // Mock SQLite's "this.lastID" behavior
            const context = { lastID: (res.rows && res.rows.length > 0) ? res.rows[0].id : 0 };
            if (callback) {
                callback.call(context, null, res);
            }
        } catch (err) {
            if (callback) {
                callback(err);
            }
        }
    }
};

export default db;
