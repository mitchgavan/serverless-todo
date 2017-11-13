const mongoose = require('mongoose');
const validator = require('validator');

const model = mongoose.model('Todo', {
  title: {
    type: String,
    required: true,
    validate: {
      validator(title) {
        return validator.isAlphanumeric(title);
      },
    },
  },
  completed: {
    type: Boolean,
  },
});
