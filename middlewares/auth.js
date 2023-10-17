function auth(req, res, next) {
  if (req.user?.id) return next();
  return res.sendStatus(401);
}

module.exports = auth;

// Get the req.user object.
// If the req.user object is defined and the req.user.id property is not empty, then the user is authenticated.
// Otherwise, the user is not authenticated.
// If the user is authenticated, the auth() function calls the next() function to continue processing the request. Otherwise, the auth() function sends a 401 Unauthorized response.

// Here is a more detailed explanation of each step:

// Step 1: Get the req.user object.

// The req.user object is set by the authentication() middleware function. If the user is authenticated, the req.user object will contain the authenticated user object. Otherwise, the req.user object will be undefined.

// Step 2: If the req.user object is defined and the req.user.id property is not empty, then the user is authenticated.

// The req.user.id property contains the ID of the authenticated user. If the req.user.id property is not empty, then the user is authenticated.

// Step 3: Otherwise, the user is not authenticated.

// If the req.user object is undefined or the req.user.id property is empty, then the user is not authenticated.

// If the user is authenticated, the auth() function calls the next() function to continue processing the request. Otherwise, the auth() function sends a 401 Unauthorized response.

// This is just a basic example of how to check if a user is authenticated in Node.js. You may need to modify the code to fit your specific needs. For example, you may want to add additional validation steps or handle different types of errors.
