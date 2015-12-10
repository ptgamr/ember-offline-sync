import DS from 'ember-data';
import AdapterSyncSupport from 'ember-offline-sync/mixins/adapter-sync-support';

export default DS.LSAdapter.extend(AdapterSyncSupport, {
    namespace: 'ember-offline-sync'
});
