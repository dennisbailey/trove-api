
exports.up = function(knex, Promise) {
  return knex.schema.createTable('markets_vendors', function(table) {
    table.integer('fmid').references('markets', 'fmid'),
    table.integer('vendor_id').references('vendors', 'id')
  })
  
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('markets_vendors');
};