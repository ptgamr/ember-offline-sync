import SyncStore from 'ember-offline-sync/sync-store';

export function initialize(/* container, application */) {
  const application = arguments[1] || arguments[0];
  application.register('store:syncStore', SyncStore);

  application.inject('route', 'syncStore', 'store:syncStore');
  application.inject('controller', 'syncStore', 'store:syncStore');
}

export default {
  name: 'sync-store',
  initialize: initialize
};
