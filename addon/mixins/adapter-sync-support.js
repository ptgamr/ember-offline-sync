import Ember from 'ember';

export default Ember.Mixin.create({
  createRecord(store, type, snapshot) {
    console.log('AdapterSyncSupport: createRecord', type.modelName);
    this._createSyncOperation('POST', store, type, snapshot);
    return this._super(...arguments);
  },

  updateRecord(store, type, snapshot) {
    console.log('AdapterSyncSupport: updateRecord');
    this._createSyncOperation('PUT', store, type, snapshot);
    return this._super(...arguments);
  },

  deleteRecord(store, type, snapshot) {
    console.log('AdapterSyncSupport: deleteRecord');
    this._createSyncOperation('DELETE', store, type, snapshot);
    return this._super(...arguments);
  },

  _createSyncOperation(operation, store, type, snapshot) {
    if (type.modelName !== 'sync-operation') {
      let serializer = store.serializerFor(type.modelName);
      let recordHash = serializer.serialize(snapshot, {includeId: true});

      if (operation === 'POST' && recordHash.id) {
        return;
      }

      let syncOperation = store.createRecord('sync-operation', {
        modelName: type.modelName,
        serialized: recordHash,
        operation: operation,
        createdAt: Date.now()
      });

      syncOperation.save();
    }
  }
});
