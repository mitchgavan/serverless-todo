const mongoose = require('mongoose');
const validator = require('validator');
const bluebird = require('bluebird');
const TodoModel = require('./model/Todo');

mongoose.Promise = bluebird;

const mongoString = 'mongodb://localhost/todomvc';

const createErrorResponse = (statusCode, message) => ({
  statusCode: statusCode || 501,
  headers: { 'Content-Type': 'text/plain' },
  body: message || 'Incorrect Id',
});

module.exports.todo = (event, context, callback) => {
  const db = mongoose.connect(mongoString).connection;
  const id = event.pathParameters.id;

  if (!validator.isAlphanumeric(id)) {
    callback(null, createErrorResponse(400, 'Incorrect Id'));
    db.close();
    return;
  }

  db.once('open', () => {
    TodoModel
      .find({ _id: id })
      .then((todo) => {
        callback(null, { statusCode: 200, body: JSON.stringify(todo) });
      })
      .catch((err) => {
        callback(null, createErrorResponse(err.statusCode, err.message));
      })
      .finally(() => {
        // Close db connection or node event loop won't exit, and lamda will timeout
        db.close();
      });
  });
};

module.exports.createTodo = (event, context, callback) => {
  const db = mongoose.connect(mongoString).connection;
  const data = JSON.parse(event.body);
  
  const todo = new TodoModel({
    title: data.title,
    completed: data.completed,
  });

  const errors = todo.validateSync();

  if (errors) {
    console.log(errors);
    callback(null, createErrorResponse(400, 'Incorrect todo data'));
    db.close();
    return;
  }

  db.once('open', () => {
    todo
      .save()
      .then(() => {
        callback(null, {
          statusCode: 200,
          body: JSON.stringify({ 
            id: todo['_id']
          }),
        });
      })
      .catch((err) => {
        callback(null, createErrorResponse(err.statusCode, err.message));
      })
      .finally(() => {
        db.close();
      });
  });
};

module.exports.deleteTodo = (event, context, callback) => {
  const db = mongoose.connect(mongoString).connection;
  const id = event.pathParameters.id;

  if (!validator.isAlphanumeric(id)) {
    callback(null, createErrorResponse(400, 'Incorrect ID'));
    db.close();
    return;
  }

  db.once('open', () => {
    TodoModel
      .remove({ _id: id })
      .then(() => {
        callback(null, { statusCode: 200, body: JSON.stringify('Ok') });
      })
      .catch((err) => {
        callback(null, createErrorResponse(err.statusCode, err.message));
      })
      .finally(() => {
        db.close();
      });
  });

};

module.exports.updateTodo = (event, context, callback) => {
  const db = mongoose.connect(mongoString).connection;
  const data = JSON.parse(event.body);
  const id = event.pathParameters.id;

  if (!validator.isAlphanumeric) {
    callback(null, createErrorResponse(400, 'Incorrect Id'));
    db.close();
    return;
  }

  const todo = new TodoModel({
    _id: id,
    title: data.title,
    completed: data.completed,
  });

  const errors = todo.validateSync();

  if (errors) {
    callback(null, createErrorResponse(400, 'Incorrect parameter'));
    db.close();
    return;
  }

  db.once('open', () => {
    TodoModel
      .findByIdAndUpdate(id, todo)
      .then(() => {
        callback(null, { statusCode: 200, body: JSON.stringify('Ok') });
      })
      .catch((err) => {
        callback(null, createErrorResponse(err.statusCode, err.message));
      })
      .finally(() => {
        db.close();
      });
  });

};
