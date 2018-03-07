const credentials = () => ({
  database: {
    hostname: 'gymappdb.c4uf417lot1h.us-east-2.rds.amazonaws.com',
    name: 'gymAppDB',
    port: 3306,
    username: 'adminGymDB',
    password: 'adminGymDB',
    pool: {
      max: 5,
      min: 0,
      idle: 10000
    }
  },
  server: {
    port: 3000,
    routes: Object.freeze([
      { uri: '/', module: './src/publication/publicationRouter' },
    ])
  }
});

module.exports = credentials();
