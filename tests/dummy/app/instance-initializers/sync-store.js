export function initialize(application) {
  let syncStore = application.lookup('store:syncStore');
  let offlineStore = application.lookup('service:store');
  let onlineStore = application.lookup('store:online');

  syncStore.offlineStore = offlineStore;
  syncStore.onlineStore = onlineStore;
}

export default {
  name: 'setupSyncStore',
  initialize: initialize
};
