var seeder = require('knex-csv-seeder').seeder.seed;

exports.seed = seeder({
  table: 'categories',
  file: 'data/categories.csv'
})