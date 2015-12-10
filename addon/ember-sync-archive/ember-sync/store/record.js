import Ember from 'ember';

export default Ember.Object.extend({
  store: null,
  snapshot: null,

  init: function() {
    this.set('collection', {});
    this._super();
  },
  /**
   * This method will get a snapshot and will return an object with:
   *
   *   * main record serialized
   *   * belongsTo records serialized
   *   * hasMany records serialized
   *
   * The format is the following:
   *
   *   {
   *     'cart': [{
   *       'id': 1,
   *       'customer': 2,
   *     }],
   *     'customer': [{
   *       'id': 2,
   *       'name': 'Alex'
   *     }]
   *   }
   *
   * where the object key is the record's modelName.
   *
   * That way, when we have something to push into the store, we can use this
   * to figure out everything related to the main record.
   *
   * @method pushableCollection
   * @public
   * @return {object}
   */
  pushableCollection: function() {
    var mainRecordType = this._snapshot().modelName,
        serializedMainRecord = this.serialize(this._snapshot());

    /**
     * Pushing associations.
     */
    this._serializeAssociations();

    /**
     * Pushes main record.
     */
    serializedMainRecord = this.setDateObjectsInsteadOfDateString(this._snapshot(), serializedMainRecord);
    this.get('collection')[mainRecordType] = [];
    this.get('collection')[mainRecordType].push(serializedMainRecord);

    return this.get('collection');
  },

  serialize: function(snapshot) {
    var type = snapshot.modelName;
    return this._serializer(type).serialize(snapshot, { includeId: true });
  },

  /**
   * This method will get every association, serialize it and push into
   * `this.get('collection')`. It will mutate the object's collection property.
   *
   * @method _serializeAssociations
   * @private
   */
  _serializeAssociations: function() {
    var _this = this,
        snapshot = this._snapshot();

    snapshot.eachRelationship(function(name, relationship) {
      var hasManyRecords = null;

      var pushToCollection = function(snapshot) {
        var serialized = _this.serialize(snapshot),
            type = snapshot.modelName;

        _this.setDateObjectsInsteadOfDateString(snapshot, serialized);

        if (!_this.get('collection')[type]) {
          _this.get('collection')[type] = [];
        }

        _this.get('collection')[type].push(serialized);
      };

      /**
       * Will push belongsTo assocs to the final collection.
       */
      if (relationship.kind === "belongsTo") {
        pushToCollection(snapshot.belongsTo(name));
      }
      /**
       * Pushes hasMany associations into the final collection.
       */
      else if (relationship.kind === "hasMany") {
        hasManyRecords = snapshot.hasMany(name);

        for (var record in hasManyRecords) {
          if (hasManyRecords.hasOwnProperty(record)) {
            pushToCollection(hasManyRecords[record]);
          }
        }
      }
    });
  },

  setDateObjectsInsteadOfDateString: function(snapshot, serialized) {
    var _this = this;
    // Only valid for JSONAPI... may need to get users to implement a custom
    // serializer method to define the path to the attributes hash?
    var serializedAttrs = serialized.data.attributes;

    if (!snapshot) {
      throw "No snapshot defined";
    }

    snapshot.eachAttribute(function(attr, details) {
      attr = _this._serializer(snapshot.modelName).keyForAttribute(attr);
      if (details.type === "date" && typeof serializedAttrs[attr]) {
        if (serializedAttrs[attr]) {
          serializedAttrs[attr] = new Date(Date.parse(serializedAttrs[attr]));
        } else {
          console.log('there is no ' + attr + ' in ' + JSON.stringify(serializedAttrs));
          throw "WAT?";
          //serialized[attr] = new Date(Date.parse(fakeRecord.get('createdAt')));
        }
      }
    });

    return serialized;
  },

  _store: function() {
    return this.get('store');
  },

  _type: function() {
    return this.get('type');
  },

  _snapshot: function() {
    return this.get('snapshot');
  },

  _serializer: function(type) {
    return this._store().serializerFor(type);
  }
});
