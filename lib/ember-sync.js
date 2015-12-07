import Ember from 'ember';
import StoreInitMixin from './ember-sync/store-initialization-mixin';
import Queue          from './ember-sync/queue';
import Query          from './ember-sync/query';
import Persistence    from './ember-sync/persistence';
import QueueModel     from './ember-sync/ember-sync-queue-model';

export default Ember.Object.extend(
  StoreInitMixin, {

  onError: function() { },

  /**
   *
   * This is called when a record is added from an online or offline store and
   * pushed to the results array. This will be triggered when using the find,
   * findAll, or query methods
   *
   * @method onRecordAddded
   */
  onRecordAdded: function(record, type) {
    this.embedThisIntoRecord(record, type);
  },

  queueModel: QueueModel,
  /**
   * Pushes pending record to the server.
   *
   * Whenever you create, updates or deletes a record, a `job` is create in a
   * `queue` in the offline database. Once the internet is available, this queue
   * will be processed and those records will be synchronized with the remote
   * server.
   *
   * This should be called from the ApplicationRoute, e.g.
   *
   *     App.ApplicationRoute = Ember.Route.extend({
   *       init: function() {
   *         this._super();
   *
   *         var emberSync = EmberSync.API.create({container: this});
   *         emberSync.synchronizeOnline();
   *       }
   *     });
   *
   * It will keep running forever (unless otherwise commanded).
   *
   * @method synchronizeOnline
   */
  synchronizeOnline: function() {
    Queue.create({
      offlineStore: this.offlineStore,
      onlineStore:  this.onlineStore,
      onError:      this.get('onError')
    }).process();
  },

  /**
   * Finds a record both offline and online, returning the first to be found.
   * If an online record is found, it is then pushed into the offline store,
   * which should automatically update the references to the original record
   * (if this was changed).
   *
   * Use this just like regular store's `find()`.
   *
   * @method find
   * @param {string} type
   * @param {object} query
   * @return {Promise}
   */
  find: function(type, query) {
    var _this = this;
    var syncQuery = Query.create({
      onlineStore:  this.onlineStore,
      offlineStore: this.offlineStore,
      onError:      this.get('onError'),
      onRecordAdded: function(record) {
        _this.onRecordAdded(record, type);
      }
    });
    return syncQuery.find(type, query);
  },

  /**
   * Finds all records both offline and online, returning the first to be found.
   * If online records are found, they are then pushed into the offline store,
   * which should automatically update the references to the original records
   * (if they were changed).
   *
   * Use this just like regular store's `findAll()`.
   *
   * @method findAll
   * @param {string} type
   * @param {object} query
   * @return {Promise}
   */
  findAll: function(type) {
    return this.find(type);
  },

  /**
   * Queries both online and offline stores simultaneously, returning values
   * asynchronously into a stream of results (Ember.A()).
   *
   * The records found online are stored into the offline store.
   *
   * Use this just like regular store's `query()`. Remember, though, it
   * doesn't return a Promise, but you can use `.then()` even so.
   *
   * @method query
   * @param {string} type
   * @param {object} query
   * @return {Ember.A}
   */
  query: function(type, query) {
    var _this = this;
    var syncQuery = Query.create({
      onlineStore:  this.onlineStore,
      offlineStore: this.offlineStore,
      onError:      this.get('onError'),
      onRecordAdded:     function(record) {
        _this.onRecordAdded(record, type);
      }
    });
    return syncQuery.query(type, query);
  },

  createRecord: function(type, properties) {
    var record;

    if (properties) {
      record = this.offlineStore.createRecord(type, properties);
    } else {
      record = this.offlineStore.createRecord(type);
    }

    this.embedThisIntoRecord(record, type, properties);
    return record;
  },

  deleteRecord: function(type, record) {
    record.deleteRecord();
    this.embedThisIntoRecord(record, type);
    return record;
  },

  embedThisIntoRecord: function(record, type, properties) {
    var _this = this;

    record.emberSync = Ember.Object.create({
      init: function() {
        this.set('emberSync',  _this);
        this.set('record',     record);
        this.set('recordType', type);
      },

      save: function() {
        var persistence = Persistence.create({
          onlineStore:  this.get('emberSync.onlineStore'),
          offlineStore: this.get('emberSync.offlineStore'),
          onError:      _this.get('onError')
        });

        return persistence.save(this.get('record'));
      }
    });
  }
});
