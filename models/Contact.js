const mongoose = require('mongoose');

const ContactSchema = mongoose.Schema({
  // We need to create a relationship between contacts and users because each user has its own set of contacts.
  //it's not like every user that logs in just has this single list of contact, they all have ach individual set. So we're gonna say that user is gonna be part of this schema.
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  type: {
    type: String,
    default: 'personal' // personal or professional
  },
  date: {
    type: Date,
    default: Date.now
  },
})

module.exports = mongoose.model('contact', ContactSchema)