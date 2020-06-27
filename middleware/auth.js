const jwt = require('jsonwebtoken');
const config = require('config'); // need to access default.json file

// whenever you have middleware function after you do what you want to do,
// you need to call this 'next' function which just says move on to the next piece of middleware.
module.exports = function (req, res, next) {
  // Get the token from the header, 'x-auth-token'은 key to the token
  const token = req.header('x-auth-token');

  // check if not token (this is only going to pertain to protected routes)
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" })
  }
  try {
    // verify the token
    const decoded = jwt.verify(token, config.get('jwtSecret'));
    // once it gets verified, the object(payload) is put into decoded.
    // now we want to take the payload(그 중에서도 user) out which we only have the user id.
    // But we're gonna assign that user to the request object so that we will have access to the inside the route.
    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(400).json({ msg: 'Token is not valid' })
  }
}