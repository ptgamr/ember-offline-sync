import Ember from 'ember';

export default Ember.Mixin.create({
  createRecord(/* store, type, snapshot */) {
    console.log('AdapterSyncSupport: createRecord');
    return this._super(...arguments);
  },

  updateRecord(/* store, type, snapshot */) {
    console.log('AdapterSyncSupport: updateRecord');
    return this._super(...arguments);
  },

  deleteRecord(/* store, type, snapshot */) {
    console.log('AdapterSyncSupport: deleteRecord');
    return this._super(...arguments);
  }
});
