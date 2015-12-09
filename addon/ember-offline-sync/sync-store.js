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
    let offlinePromise = this.offlineStore.findAll(type),
        onlinePromise = this.onlineStore.findAll(type);

    let results = Ember.ArrayProxy.create();

    let isResolved = false;

    offlinePromise
      .then(this._wrapRecords.bind(this, type))
      .then(recordWrappers => {
        if (!isResolved) {
          isResolved = true;
          results.set('content', recordWrappers);
        }
      })
      .catch(error => {
        console.error('Offline findAll()', error);
      });

    onlinePromise
      .then(this._wrapRecords.bind(this, type))
      .then(recordsWrapper => {
        
        Ember.run.later(function() {
          if (!isResolved) {
            isResolved = true;
            results.set('content', recordsWrapper);
          }
        }, 100);

        recordsWrapper.forEach(recordWrapper => {
          let record  = get(recordWrapper, 'content');
          this.offlineStore.findRecord(type, get(record, 'id'))
            .catch(() => {
              console.log('push record to offline store', record.serialize({includeId: true}));
              let localRecord = this.offlineStore.createRecord('todo', record.serialize({includeId: true}));
              localRecord.save();
            });
        });
      })
      .catch(error => {
        console.error('Online findAll()', error);
      });

    return results;
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
  }
});
