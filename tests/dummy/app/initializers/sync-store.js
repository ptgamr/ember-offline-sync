import SyncStore from 'ember-offline-sync/sync-store';
import SyncOperationModel from 'ember-offline-sync/models/sync-operation';

export function initialize(/* container, application */) {
  const application = arguments[1] || arguments[0];
  application.register('store:syncStore', SyncStore);
  application.register('model:sync-operation', SyncOperationModel);

  application.inject('route', 'syncStore', 'store:syncStore');
  application.inject('controller', 'syncStore', 'store:syncStore');
}

export default {
  name: 'sync-store',
  initialize: initialize
};
