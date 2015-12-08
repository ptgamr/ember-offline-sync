import Ember from 'ember';
import EmberSyncQueueModel from 'ember-offline-sync/ember-sync/ember-sync-queue-model';
import EmberSync from 'ember-offline-sync';
import {module, test} from 'qunit';

var subject,
    onlineStore, offlineStore;

module("Unit - Lib/EmberSync", {
  setup: function() {

    offlineStore = Ember.Object.create();
    onlineStore = Ember.Object.create();

    subject = EmberSync.create({
      offlineStore: offlineStore,
      onlineStore:  onlineStore
    });
  }
});

test("#queueModel - returns the queue model", (assert) => {
  assert.equal(subject.queueModel, EmberSyncQueueModel, "queue model is returned");
});
