import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    createTodo() {
      let title = this.get('title');

      if (title) {
        let newTodo = this.store.createRecord('todo', {
          title: title,
          isDone: false
        });

        newTodo.save();

        this.set('title', '');
      }
    },

    deleteTodo(todo) {
      todo.destroyRecord();
    }
  }
});
