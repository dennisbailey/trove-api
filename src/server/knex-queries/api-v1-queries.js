var knex = require('../../../db/knex');

module.exports = {
  
  // *** Flexible Queries *** //
  
  getAll: function (table) { return knex(table); },
  
  
  // *** /markets Queries *** //
  
  
  // *** /messages Queries *** //
  getMessages: function(marketID) { return knex('messages')
                                           .where('market_id', marketID)
                                           .orderBy('dt', 'desc') }

};
