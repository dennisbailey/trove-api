module.exports = {

  development: {
    client: 'pg',
    connection: 'postgress://localhost/trove'
  },

  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL
  }
  
};
