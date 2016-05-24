var knex = require('../../../db/knex');

module.exports = {
  
  // *** Flexible Queries *** //
  
  getAllFrom: function (table) { return knex(table); },
  
  
  // *** /markets Queries *** //
  
  
  // *** /messages Queries *** //
  getMessagesFor: function(marketID) { return knex('messages')
                                              .where('market_id', marketID)
                                              .orderBy('dt', 'desc') },
                                              
  postMessage: function(payload) { return knex('messages')
                                          .insert(payload) }

};
