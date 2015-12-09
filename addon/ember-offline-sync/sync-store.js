import Ember from 'ember';
// import SynchronizationQueue from './synchronization-queue';
// import SynchronizationJob from './synchronization-job';
import RecordWrapper from './record-wrapper';

const {get, set} = Ember;

export default Ember.Object.extend({
  onlineStore: null,
  offlineStore: null,

  findRecord(type, id) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let offlinePromise = this.offlineStore.findRecord(type, id),
          onlinePromise = this.onlineStore.findRecord(type, id);

      let isResolved = false,
          offlineNotFound = false,
          onlineNotFound = false;

      let recordWrapper = RecordWrapper.create({
        syncStore: this,
        recordType: type
      });

      offlinePromise
        .then(record => {
          if (!isResolved) {
            isResolved = true;
            recordWrapper.set('content', record);
            resolve(recordWrapper);
          }
        })
        .catch(error => {
          offlineNotFound = true;

          if (offlineNotFound && onlineNotFound) {
            reject(error);
          }
        });

      onlinePromise
        .then(record => {

          // promise has not been resolved
          // means that localRecord is not found
          // we push the remoteRecord into offlineStore
          if (!isResolved) {
            recordWrapper.set('content', record);
            resolve(recordWrapper);

            this.offlineStore.pushPayload(type, record.serialize());
          }
        })
        .catch(error => {
          onlineNotFound = true;

          if (offlineNotFound && onlineNotFound) {
            reject(error);
          }
        });
    });
  },

  findAll(type) {
    let offlinePromise = this.offlineStore.findAll(type).then(this._wrapRecords.bind(this, type)),
        onlinePromise = this.onlineStore.findAll(type).then(this._wrapRecords.bind(this, type));

    let resultsStream = Ember.ArrayProxy.create();

    offlinePromise
      .then(this._addRecordsToStream.bind(this, resultsStream))
      .then(() => onlinePromise)
      .then(this._addRecordsToStream.bind(this, resultsStream))
      .then(onlineRecords => {
        onlineRecords.forEach(recordWrapper => {
          let record  = get(recordWrapper, 'content');
          this.offlineStore.findRecord(type, get(record, 'id'))
            .catch(() => {
              console.log('push record to offline store', record.serialize({includeId: true}));
              let offlineAdapter = this.offlineStore.adapterFor(type);
              offlineAdapter.createRecord(this.offlineStore, this.offlineStore.modelFor(type), record._createSnapshot());
            });
        });
      })
      .catch(error => {
        console.error('findAll()', error);
      });

    return resultsStream;
  },

  query() {

  },

  createRecord() {

  },

  deleteRecord() {

  },

  destroyRecord() {

  },

  sync() {

  },

  flushPendingChange(/*pendingChange*/) {

  },

  _wrapRecords(type, records) {
    return records.map(record => {
      return RecordWrapper.create({
        syncStore: this,
        recordType: type,
        content: record
      });
    });
  },

  _addRecordsToStream(resultsStream, recordWrappers) {
    let recordsInStream = get(resultsStream, 'content');

    if (recordsInStream) {
      let recordIds = recordsInStream.mapBy('id');
      let recordsToAdd = recordWrappers.filter(recordWrapper => {
        let id = get(recordWrapper, 'id');
        return recordIds.indexOf(id) === -1;
      });

      recordsInStream.pushObjects(recordsToAdd);
    } else {
      set(resultsStream, 'content', recordWrappers);
    }

    return recordWrappers;
  }
});
