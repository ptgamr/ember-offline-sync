import Ember from 'ember';
// import SynchronizationQueue from './synchronization-queue';
// import SynchronizationJob from './synchronization-job';

const {get, set} = Ember;

export default Ember.Object.extend({
  onlineStore: null,
  offlineStore: null,

  findRecord(type, id) {
    // return new Ember.RSVP.Promise((resolve, reject) => {
    //   let offlinePromise = this.offlineStore.findRecord(type, id),
    //       onlinePromise = this.onlineStore.findRecord(type, id);
    //
    //   let isResolved = false,
    //       offlineNotFound = false,
    //       onlineNotFound = false;
    //
    //   let recordWrapper = RecordWrapper.create({
    //     syncStore: this,
    //     recordType: type
    //   });
    //
    //   offlinePromise
    //     .then(record => {
    //       if (!isResolved) {
    //         isResolved = true;
    //         recordWrapper.set('content', record);
    //         resolve(recordWrapper);
    //       }
    //     })
    //     .catch(error => {
    //       offlineNotFound = true;
    //
    //       if (offlineNotFound && onlineNotFound) {
    //         reject(error);
    //       }
    //     });
    //
    //   onlinePromise
    //     .then(record => {
    //
    //       // promise has not been resolved
    //       // means that localRecord is not found
    //       // we push the remoteRecord into offlineStore
    //       if (!isResolved) {
    //         recordWrapper.set('content', record);
    //         resolve(recordWrapper);
    //
    //         this.offlineStore.pushPayload(type, record.serialize());
    //       }
    //     })
    //     .catch(error => {
    //       onlineNotFound = true;
    //
    //       if (offlineNotFound && onlineNotFound) {
    //         reject(error);
    //       }
    //     });
    // });
  },

  findAll(type) {
    let offlinePromise = this.offlineStore.findAll(type),
        onlinePromise = this.onlineStore.findAll(type);

    onlinePromise.then(records => {
      records.forEach(record => {
        this.offlineStore.findRecord(type, get(record, 'id'))
          .catch(() => {
            // let offlineAdapter = this.offlineStore.adapterFor(type);
            // offlineAdapter
            //   .createRecord(this.offlineStore, this.offlineStore.modelFor(type), record._createSnapshot())
            //   .then(() => {
            //     console.log('push record to offline store', record.serialize({includeId: true}));
            //     this.offlineStore.didSaveRecord(record._internalModel);
            //   });

            // let tobeSave = this.offlineStore.createRecord('todo', {title: 'hehehe'});
            // tobeSave.save();
          });
      });
    });

    return offlinePromise;
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
