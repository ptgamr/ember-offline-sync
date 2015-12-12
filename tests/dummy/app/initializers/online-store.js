import DS from 'ember-data';

const OnlineStore = DS.Store.extend({
  adapterFor() {
    return this.container.lookup('adapter:online-adapter');
  },
  serializerFor() {
   return this.container.lookup('serializer:online-serializer');
 }
});

export function initialize(/* container, application */) {
  const application = arguments[1] || arguments[0];

  application.register('store:online', OnlineStore);

  application.inject('route', 'onlineStore', 'store:online');
  application.inject('controller', 'onlineStore', 'store:online');
}

export default {
  name: 'online-store',
  initialize: initialize
};
