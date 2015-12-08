import SyncStore from 'ember-offline-sync/ember-offline-sync/sync-store';

export function initialize(/* container, application */) {
  const application = arguments[1] || arguments[0];
  application.register('lib:syncStore', SyncStore);

  application.inject('route', 'syncStore', 'lib:syncStore');
  application.inject('controller', 'syncStore', 'lib:syncStore');
}

export default {
  name: 'sync-store',
  initialize: initialize
};
