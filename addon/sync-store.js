import Ember from 'ember';
import Synchronizer from './synchronizer';

const {
  on,
  computed,
  observer,
  get,
  set
} = Ember;

export default Ember.Object.extend({
  onlineStore: null,
  offlineStore: null,
  synchronizer: null,

  storeReady: on('init', computed('onlineStore', 'offlineStore', function() {
    return !!get(this, 'onlineStore') & !!get(this, 'offlineStore');
  })),

  initQueueWhenStoreReady: on('init', observer('storeReady', function() {
    if (get(this, 'storeReady') && !get(this, 'synchronizer')) {
      let synchronizer = Synchronizer.create({
        onlineStore: get(this, 'onlineStore'),
        offlineStore: get(this, 'offlineStore')
      });
      set(this, 'synchronizer', synchronizer);
      synchronizer.sync();
    }
  })),

  findRecord(/* type, id */) {

  },

  /**
   * Resolved using offlineStore, background fetch from the onineStore
   *
   * @param  {String} type
   * @return {RecordArray}
   */
  findAll(type) {
    let offlinePromise = this.offlineStore.findAll(type),
        onlinePromise = this.onlineStore.findAll(type);

    onlinePromise.then(records => {
      records.forEach(record => {
        this.offlineStore.findRecord(type, record.get('id'))
          .catch(() => {
            let tobeSave = this.offlineStore.createRecord('todo', record.serialize({includeId: true}));
            tobeSave.save();
          });
      });
    });

    return offlinePromise;
  },

  query() {

  },

  /**
   * Proxy to offlineStore.createRecord
   *
   * @param  {String} modelName
   * @param  {Object} inputProperties
   * @return {DS.Model} record
   */
  createRecord(modelName, inputProperties) {
    return this.offlineStore.createRecord(modelName, inputProperties);
  },

  /**
   * Proxy to offlineStore.deleteRecord
   *
   * @param  {DS.Model} record
   * @return
   */
  deleteRecord(record) {
    return this.offlineStore.deleteRecord(record);
  },

  /**
   * Proxy to offlineStore.unloadRecord
   *
   * @param  {DS.Model} record
   * @return
   */
  unloadRecord(record) {
    return this.offlineStore.unloadRecord(record);
  },

  sync() {

  },

  flushPendingChange(/*pendingChange*/) {

  }
});
