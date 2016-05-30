var seeder = require('knex-csv-seeder').seeder.seed;

exports.seed = seeder({
  table: 'zip_codes',
  file: 'data/zips.csv'
})