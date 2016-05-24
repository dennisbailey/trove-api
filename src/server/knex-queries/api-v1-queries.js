var knex = require('../../../db/knex');

module.exports = {
  
  getAll: function (table) { return knex(table); }

};
