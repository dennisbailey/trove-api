var seeder = require('knex-csv-seeder').seeder.seed;

exports.seed = seeder({
  table: 'images',
  file: 'data/faker/images.csv'
})