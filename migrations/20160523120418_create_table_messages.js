exports.up = function(knex, Promise) {
  return knex.schema.createTable('messages', function(table) {
    table.increments('id'),
    table.integer('fmid').references('markets', 'fmid'),
    table.integer('category').references('categories', 'id'),
    table.string('msg'),
    table.string('img'),
    table.boolean('vendor'),
    table.integer('vendor_id'),
    table.dateTime('dt').notNullable().defaultTo(knex.raw('now()'))
  })
  
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('messages');
};