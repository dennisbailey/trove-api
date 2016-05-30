exports.up = function(knex, Promise) {
  return knex.schema.createTable('zip_codes', function(table) {
    table.string('zip').unique(),
    table.float('lat')
    table.float('lng')
  })
  
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('zip_codes');
};