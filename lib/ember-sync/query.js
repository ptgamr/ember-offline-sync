import StoreInitMixin from './store-initialization-mixin';
import Persistence from './persistence';

export default Ember.Object.extend(
  StoreInitMixin, {

  onRecordAdded: function() { },

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
    var _this = this, offlineSearch, onlineSearch;

    if(!Ember.isNone(query)) {
      offlineSearch = this.offlineStore.query(type, query),
      onlineSearch  = this.onlineStore.query(type, query);
    } else {
      offlineSearch = this.offlineStore.findAll(type),
      onlineSearch  = this.onlineStore.findAll(type);
    }

    /**
     * In case query is empty, it means find() should return an Array.
     */
    if (!query) {
      return this.findStream(type, offlineSearch, onlineSearch);
    }

    return new Ember.RSVP.Promise(function(resolve, reject) {
      var isResolved = false,
          offlineNotFound, onlineNotFound;

      offlineSearch.then(function(record) {
        if (record.get('id') && !isResolved) {
          _this.onRecordAdded(record);
          resolve(record);
          isResolved = true;
        }
      }, function(error) {
        offlineNotFound = true;
        if (offlineNotFound && onlineNotFound) { reject(error); }
      });

      onlineSearch.then(function(record) {
        var id = record.get('id'),
            persistenceState = _this.offlineStore.find(type, id);

        var persistRecordOffline = function(onlineRecord) {
          var persistence = Persistence.create({
            onlineStore:  _this.onlineStore,
            offlineStore: _this.offlineStore,
          });
          persistence.persistRecordOffline(type, record);
        };

        persistenceState.then(persistRecordOffline, persistRecordOffline);
        if (!isResolved) {
          _this.onRecordAdded(record);
          resolve(record);
          isResolved = true;
        }
      }, function(error) {
        _this.get('onError');
        onlineNotFound = true;
        if (offlineNotFound && onlineNotFound) { reject(error); }
      });
    });
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
    var offlineSearch = this.offlineStore.query(type, query),
        onlineSearch  = this.onlineStore.query(type, query);

    return this.findStream(type, offlineSearch, onlineSearch);
  },

  /**
   * PRIVATE
   */

  /**
   * Creates an array of results from the offline store, which is
   * later updated with the results from the online store. 
   *
   * @method findStream
   * @param {string} type
   * @param {object} offlinePromise
   * @param {object} onlinePromise
   * @return {Ember.A}
   */
  findStream: function(type, offlinePromise, onlinePromise) {
    var _this = this,
        resultStream = Ember.A();

    offlinePromise.then(function(results) {
      results = _this.toArray(results);
      _this.addResultToResultStream(resultStream, results);
    });

    onlinePromise.then(function(results) {
      results = _this.toArray(results);
      _this.addResultToResultStream(resultStream, results);

      results.forEach(function(onlineResult) {
        var id = onlineResult.get('id'),
            persistenceState = _this.offlineStore.find(type, id);

        var persistRecordOffline = function(onlineRecord) {
          var persistence = Persistence.create({
            onlineStore:  _this.onlineStore,
            offlineStore: _this.offlineStore,
          });
          persistence.persistRecordOffline(type, onlineResult);
        };

        persistenceState.then(persistRecordOffline, persistRecordOffline);
      });
    }, function(error) {
      _this.get('onError')
    });

    return resultStream;
  },

  /**
   * Takes an array of the latest results and pushes into the result Stream.
   * This takes into account existing record.
   *
   * @method addResultToResultStream
   * @param {string} type
   * @param {DS.Model} record
   */
  addResultToResultStream: function(resultStream, results) {
    resultStream.set('isUpdating', true);
    var _this = this;
    if (results.get('length')) {
      // Improve performance for large datasets
      var resultsById = {};
      if (resultStream.get('length') !== 0) {
        resultStream.forEach(function (record) {
          if (record.get('id')) {
            resultsById[record.get('id')] = record;
          }
        });
      }

      results.forEach(function(record) {
        var id = record.get('id');

        if (id && !resultStream[id]) {
          _this.onRecordAdded(record);
          resultStream.pushObject(record);
        }
      });
    }
    resultStream.set('isUpdating', false);
    resultStream.set('isLoaded', true);
  },

  toArray: function(objectOrArray) {
    if (objectOrArray.get('id') && !objectOrArray.length) {
      objectOrArray = Ember.A([objectOrArray]);
    }
    return objectOrArray;
  }
});
