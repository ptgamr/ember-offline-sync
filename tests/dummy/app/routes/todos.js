import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    return this.syncStore.findAll('todo');
    //return this.store.findAll('todo');
  }
});
