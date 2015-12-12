import Ember from 'ember';

const {
  run,
  Logger,
  get,
  RSVP
} = Ember;

export default Ember.Object.extend({
  onlineStore: null,
  offlineStore: null,

  timer: null,

  sync() {
    Logger.debug('ember-offline-sync: syncing ...');

    this._processPendingChanges()
      .then(() => {
        this.timer = run.later(this, function() {
          this.sync();
        }, 1000);
      });
  },

  stop() {
    this.timer.cancel();
  },

  _processPendingChanges() {
    return this._getPendingChanges()
        .then(pendingChanges => {

          return new RSVP.Promise((resolve) => {

            let self = this;

            function processNextPendingChange() {
              if (pendingChanges.length === 0) {
                resolve();
              } else {
                let change = pendingChanges.shift();

                self._commitPendingChange(change).then(processNextPendingChange);
              }
            }

            processNextPendingChange();
          });

        });
  },

  _getPendingChanges() {
    let offlineStore = get(this, 'offlineStore');

    return offlineStore.findAll('pending-change').then(pendingChanges => {
      return pendingChanges.sortBy('createdAt');
    });
  },

  _commitPendingChange(pendingChange) {

    let onlineStore = get(this, 'onlineStore'),
        offlineStore = get(this, 'offlineStore'),
        operation = get(pendingChange, 'operation'),
        modelName = get(pendingChange, 'modelName'),
        recordHash = get(pendingChange, 'serialized');

    let promise = null;
    let id = recordHash.id;

    delete recordHash.id;

    if (operation === 'POST') {
      let newRecord = onlineStore.createRecord(modelName, recordHash);
      promise = newRecord.save().then(remoteRecord => {
        //update local record with remote record
        return offlineStore.findRecord(modelName, id).then(offlineRecord => {
          offlineRecord.set('id', remoteRecord.get('id'));
          return offlineRecord.save();
        });
      });
    } else if (operation === 'PUT') {
      promise = onlineStore.findRecord(modelName, id).then(record => {
        Object.keys(recordHash).forEach(key => {
          record.set('key', recordHash[key]);
        });
        return record.save();
      }).catch(() => {
        Logger.error('no record found for PUT operation');
      });
    } else if (operation === 'DELETE'){

    } else {
      throw new Error('unknown sync operation: ', operation);
    }

    return promise.then(() => {
      Logger.debug('_commitPendingChange success', pendingChange);
      return pendingChange.destroyRecord();
    });
  },

  _handleCreate() {

  },

  _handleUpdate() {

  },

  handleDelete() {

  }
});
