var seeder = require('knex-csv-seeder').seeder.seed;

exports.seed = seeder({
  table: 'messages',
  file: 'data/faker/messages.csv'
})