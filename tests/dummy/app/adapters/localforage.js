import LFAdapter from 'ember-localforage-adapter/adapters/localforage';
import AdapterSyncSupport from 'ember-offline-sync/mixins/adapter-sync-support';

export default LFAdapter.extend(AdapterSyncSupport, {
  caching: 'none'
});
