// Bring in JWT to access its token method/functionality.
const jwt = require("jsonwebtoken");
// Bring in our User model to reference
const User = require("../models/user.model");

// Build our middleware function (function expression format here)
const validateSession = async (req, res, next) => {
  // Middleware still has access to the request, response, and requires the next() function to move past it.
  //* remember the timeLog() helper within the ToDo_List

  try {
    //1. Take token provided by request object (headers.authorization)
    // Good idea to just check with a console.log that it's working.
    const token = req.headers.authorization;
    // console.log("token: ", token)
    // console.log(token);

    //2. Check the status of token. (expired?)
    // JWT .verify(string, secret)
    const decodedToken = jwt.verify(token, process.env.JWT);
    // console.log(decodedToken);
    // Our decodedToken makes the user ID and token exp available
    // { id: '643c35ebd988f8c5035402d5', iat: 1682279579, exp: 1682365979 }

    //3. Provide response - if valid, generate a variable that holds user info.
    // use the .findById() to check for user that matches token user ID
const user = await User.findById(decodedToken.id);
if (!user) throw Error("User not found.");

    // Creating a new key within our req (request) object to store our use information
    req.user = user;

    return next(); // moves us onto our routes/endpoint
  } catch (err) {
    res.json({ message: err.message });
  }
};
// Export the function
module.exports = validateSession;
