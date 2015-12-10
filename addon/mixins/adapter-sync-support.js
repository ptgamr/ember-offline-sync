import Ember from 'ember';

export default Ember.Mixin.create({
  createRecord() {
    console.log('AdapterSyncSupport: createRecord');
    return this._super(...arguments);
  },

  updateRecord() {
    console.log('AdapterSyncSupport: updateRecord');
    return this._super(...arguments);
  },

  deleteRecord() {
    console.log('AdapterSyncSupport: deleteRecord');
    return this._super(...arguments);
  }
});
