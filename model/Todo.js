const mongoose = require('mongoose');
const validator = require('validator');

const model = mongoose.model('Todo', {
  title: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
  },
});

module.exports = model;
