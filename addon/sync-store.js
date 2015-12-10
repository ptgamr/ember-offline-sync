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
        this.offlineStore.findRecord(type, record.get('id'))
          .catch(err => {
            console.log(err);
            let tobeSave = this.offlineStore.createRecord('todo', record.serialize({includeId: true}));
            tobeSave.save();
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

  }
});
