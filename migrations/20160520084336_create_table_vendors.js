
exports.up = function(knex, Promise) {
  return knex.schema.createTable('vendors', function(table) {
    table.increments('id'),
    table.string('vendor_name'),
    table.integer('category_id').references('categories', 'id')
  })
  
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('vendors');
};