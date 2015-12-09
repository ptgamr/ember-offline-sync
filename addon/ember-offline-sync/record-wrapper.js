import Ember from 'ember';

/**
 * Proxy access to a record via content property
 *
 * @param  {[type]} {                         syncStore:    null [description]
 * @param  {[type]} recordType: null          [description]
 * @param  {[type]} save(       [description]
 * @return {[type]}             [description]
 */
export default Ember.ObjectProxy.extend({

  syncStore: null,
  recordType: null,

  save() {

    this.get('content').save();

    console.log('RecordWrapper: save()', this.get('content').toJSON());
  }
});
