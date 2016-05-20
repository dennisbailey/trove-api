var seeder = require('knex-csv-seeder').seeder.seed;

exports.seed = seeder({
  table: 'markets_categories',
  file: 'data/markets_categories.csv'
})