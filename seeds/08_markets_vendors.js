var seeder = require('knex-csv-seeder').seeder.seed;

exports.seed = seeder({
  table: 'markets_vendors',
  file: 'data/markets_vendors/combined.csv'
})