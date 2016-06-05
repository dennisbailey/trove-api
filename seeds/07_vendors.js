var seeder = require('knex-csv-seeder').seeder.seed;

exports.seed = seeder({
  table: 'vendors',
  file: 'data/faker/vendors_seed.csv'
})