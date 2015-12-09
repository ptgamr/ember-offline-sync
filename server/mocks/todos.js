module.exports = function(app) {
  var express = require('express');
  var todosRouter = express.Router();

  todosRouter.get('/', function(req, res) {
    res.send({
      'todos': [
        // {id: 1, title: 'todo 1', isDone: true},
        // {id: 2, title: 'todo 2', isDone: true},
        // {id: 3, title: 'todo 3', isDone: true},
        // {id: 4, title: 'todo 4', isDone: true},
        // {id: 5, title: 'todo 5', isDone: true},
        // {id: 6, title: 'todo 6', isDone: true},
      ]
    });
  });

  todosRouter.post('/', function(req, res) {
    res.status(201).end();
  });

  todosRouter.get('/:id', function(req, res) {
    res.send({
      'todos': {
        id: req.params.id
      }
    });
  });

  todosRouter.put('/:id', function(req, res) {
    res.send({
      'todos': {
        id: req.params.id
      }
    });
  });

  todosRouter.delete('/:id', function(req, res) {
    res.status(204).end();
  });

  app.use('/api/todos', todosRouter);
};
