
exports.up = function(knex, Promise) {
  return knex.schema.createTable('markets_categories', function(table) {
    table.integer('fmid').references('markets', 'fmid'),
    table.string('category_id').references('categories', 'id')
  })
  
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('markets_categories');
};