
exports.up = function(knex, Promise) {
  return knex.schema.createTable('markets', function(table) {
    table.increments('id'),
    table.integer('fmid').unique(),
    table.string('market_name'),
    table.string('website'),
    table.string('facebook'),
    table.string('twitter'),
    table.string('youtube'),
    table.string('street'),
    table.string('city'),
    table.string('county'),
    table.string('state'),
    table.string('zip'),
    table.string('season_dt'),
    table.string('season_time'),
    table.float('lat').defaultTo(0),
    table.float('lng').defaultTo(0),
    table.string('dt_update')
  })
  
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('markets');
};
