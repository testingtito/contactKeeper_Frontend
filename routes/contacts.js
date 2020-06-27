// user registration
// bring in the express so that we can use the router.
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const Contact = require('../models/Contact');

// @route   GET api/contacts
// @desc    Get all users contacts
// @access  private
router.get('/', auth,
  async (req, res) => {
    const contacts = await Contact.find({ user: req.user.id }).sort({ date: -1 })
    res.json(contacts)
  });

// @route   POST api/contacts
// @desc    Add new contact
// @access  private
router.post('/',
  [
    auth,
    [check('name', 'Name is required').not().isEmpty()]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    const { name, email, phone, type } = req.body;
    try {
      const newContact = new Contact({
        name,
        email,
        phone,
        type,
        user: req.user.id
      })
      // save to the database
      const contact = await newContact.save();
      res.json(contact);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

// @route   PUT api/contacts/:id
// @desc    Update contact
// @access  private
router.put('/:id', auth,
  async (req, res) => {
    const { name, email, phone, type } = req.body;

    // Build contact object based on the fields that are submitted.
    // basically we want to check to see if these are submitted.
    const contactFields = {};
    if (name) contactFields.name = name;
    if (email) contactFields.email = email;
    if (phone) contactFields.phone = phone;
    if (type) contactFields.type = type;

    try {
      let contact = await Contact.findById(req.params.id);

      if (!contact) return res.status(404).json({ msg: 'Contact not found' });

      // Make sure user owns
      if (contact.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'not authorized' })
      }

      // actual update
      contact = await Contact.findByIdAndUpdate(req.params.id,
        { $set: contactFields },
        { new: true }
      )
      res.json(contact); // send with updated contact
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

// @route   DELETE api/contacts
// @desc    Delete a contact
// @access  private
router.delete('/:id', auth,
  async (req, res) => {
    try {
      let contact = await Contact.findById(req.params.id);

      if (!contact)
        return res.status(404).json({ msg: 'Contact not found' });

      // Make sure user owns. We don't want to delete someone else's contact
      if (contact.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'Not authorized' })
      }
      await Contact.findByIdAndRemove(req.paras.id);
      res.json({ msg: 'Contact removed' });
    } catch (err) {
      console.log(err.message);
      res.status(500).send('Server Error');
    }
  })

module.exports = router;