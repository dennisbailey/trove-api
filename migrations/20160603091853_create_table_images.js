exports.up = function(knex, Promise) {
  return knex.schema.createTable('images', function(table) {
    table.increments('id'),
    table.integer('market_id').references('markets', 'id'),
    table.string('img'),
    table.dateTime('dt').notNullable().defaultTo(knex.raw('now()'))
  })
  
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('images');
};