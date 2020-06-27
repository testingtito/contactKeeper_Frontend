// auth's gonna have 2 routes
// one is going to be just get the logged in user and
// one is going to be actually log in the user and get the token.

// bring in the express so that we can use the router.
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../models/User');
const auth = require('../middleware/auth'); //we use it to pass the 2nd parameter\

// @route   GET api/auth
// @desc    Get logged in user
// @access  private
// '/' pertains api/users
router.get('/', auth,
  async (req, res) => {
    try {
      // Get the user from the DB. if we send the correct token and we're logged in, this 'req' object will have a user object attach to it with the current logged in user id so we can pass in req.user.id and don't include password.
      const user = await User.findById(req.user.id).select('-password');
      res.json(user);
    } catch (err) {
      console.log(err.message);
      res.status(500).send('Server Error')
    }
  });

// @route   POST api/auth
// @desc    Auth user & get token
// @access  public
// '/' pertains api/users
router.post('/',
  [
    check('email', 'Please include a vlaid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email: email });
      if (!user) {
        return res.status(400).json({ msg: 'Invalid Credentials' })
      }
      // if there is a user, we want to continue to check the pwd because up to this point, we only check the email.
      // 여기서 password는 plain text, user.password는 db에 있는 hash version (returns true or false)
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }

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