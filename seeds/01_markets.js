var seeder = require('knex-csv-seeder').seeder.seed;

exports.seed = seeder({
  table: 'markets',
  file: 'data/markets.csv'
})