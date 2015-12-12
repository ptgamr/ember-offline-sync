import Ember from 'ember';
const {
  set
} = Ember;

export function initialize(application) {
  let syncStore = application.lookup('store:syncStore');
  let offlineStore = application.lookup('service:store');
  let onlineStore = application.lookup('store:online');

  set(syncStore, 'offlineStore', offlineStore);
  set(syncStore, 'onlineStore', onlineStore);
}

export default {
  name: 'setupSyncStore',
  initialize: initialize
};
