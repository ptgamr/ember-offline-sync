import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel() {
    this.syncStore.onlineStore = this.onlineStore;
    this.syncStore.offlineStore = this.store;
  },
  model() {
    return this.syncStore.findAll('todo');
    //return this.store.findAll('todo');
  }
});
