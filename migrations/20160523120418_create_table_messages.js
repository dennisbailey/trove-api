exports.up = function(knex, Promise) {
  return knex.schema.createTable('messages', function(table) {
    table.increments('id'),
    table.integer('market_id').references('markets', 'id'),
    table.integer('category_id').references('categories', 'id'),
    table.string('msg'),
    table.string('img'),
    table.boolean('vendor').defaultTo(false),
//     table.integer('vendor_id').defaultTo(0),
    table.dateTime('dt').notNullable().defaultTo(knex.raw('now()'))
  })
  
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('messages');
};