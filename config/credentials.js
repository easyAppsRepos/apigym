const credentials = () => ({
  database: {
    hostname: 'test',
    name: 'test',
    port: 3306,
    username: 'test',
    password: 'test',
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
