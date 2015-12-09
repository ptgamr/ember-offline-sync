import DS from 'ember-data';

const OnlineSerializer = DS.RESTSerializer.extend();
const OnlineAdapter = DS.RESTAdapter.extend({
  namespace: 'api',
  serializer: OnlineSerializer.create()
});

const OnlineStore = DS.Store.extend({
  adapterFor() {
    return this.container.lookup('adapter:_ember_offline_sync_online_adapter');
  },
  serializerFor() {
   return this.container.lookup('serializer:_ember_offline_sync_online_serializer');
 }
});

export function initialize(/* container, application */) {
  const application = arguments[1] || arguments[0];
  application.register('store:online', OnlineStore);
  application.register('adapter:_ember_offline_sync_online_adapter', OnlineAdapter);
  application.register('serializer:_ember_offline_sync_online_serializer', OnlineSerializer);

  application.inject('route', 'onlineStore', 'store:online');
  application.inject('controller', 'onlineStore', 'store:online');
}

export default {
  name: 'online-store',
  initialize: initialize
};
