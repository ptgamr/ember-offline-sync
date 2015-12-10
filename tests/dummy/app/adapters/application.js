// import DS from 'ember-data';
// import AdapterSyncSupport from 'ember-offline-sync/mixins/adapter-sync-support';
//
// export default DS.LSAdapter.extend(AdapterSyncSupport, {
//     namespace: 'ember-offline-sync',
//     coalesceFindRequests: false
// });


import LFAdapter from 'ember-localforage-adapter/adapters/localforage';
import AdapterSyncSupport from 'ember-offline-sync/mixins/adapter-sync-support';

export default LFAdapter.extend(AdapterSyncSupport, {
  coalesceFindRequests: false,
  caching: 'none'
});
