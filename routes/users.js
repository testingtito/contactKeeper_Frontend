// user registration
const express = require('express')
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

// including user model and we can use that within our routes.
const User = require('../models/User');

// @route   POST api/users
// @desc    Register a user
// @access  public
// '/' pertains api/users
router.post('/',
  [
    check('name', 'Please add name').not().isEmpty(),
    check('email', 'Please add valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ]
  ,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    const { name, email, password } = req.body;
    try {
      let user = await User.findOne({ email: email });
      if (user) {
        return res.status(400).json({ msg: 'User already exists' })
      }

      user = new User({
        name,
        email,
        password
      });

      // so far we simply created a new user. It's not in DB  yet.
      // Before wwe save it to the DB, we need to encrypt the pwd.
      const salt = await bcrypt.genSalt(10);
      // 현재까지 password는 plain text version
      user.password = await bcrypt.hash(password, salt);
      // This gives a hash version of pwd

      await user.save(); // save it to the DB
      const payload = {
        user: {
          id: user.id // this is all we want to send in the payload
        }
      }
      // to generate a token, we have to sign in
      jwt.sign(payload, config.get('jwtSecret'), {
        expiresIn: 360000 // 보통은 3600(1시간)
      }, (err, token) => {
        if (err) throw err;
        res.json({ token }) // this whole thing returns a token
      })
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

module.exports = router;