import DS from 'ember-data';

const OnlineAdapter = DS.RESTAdapter.extend({
  namespace: 'api'
});

const OnlineStore = DS.Store.extend({
  adapterFor() {
    let adapter = this.container.lookup('adapter:_ember_offline_sync');
    adapter.set('store', this);
    return adapter;
  }
});

export function initialize(/* container, application */) {
  const application = arguments[1] || arguments[0];
  application.register('store:online', OnlineStore);
  application.register('adapter:_ember_offline_sync', OnlineAdapter);

  application.inject('route', 'onlineStore', 'store:online');
  application.inject('controller', 'onlineStore', 'store:online');
}

export default {
  name: 'online-store',
  initialize: initialize
};
