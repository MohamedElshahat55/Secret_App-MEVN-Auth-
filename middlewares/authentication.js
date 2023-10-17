const jwt = require("jsonwebtoken");
const User = require("../models/user");

function authentication(req, res, next) {
  //Step 1: Get the authorization header from the request
  /*The authorization header is used to send authentication credentials to the server. The authorization header is typically sent in the format "Bearer <token>", where <token> is the JWT.*/
  const authHeader = req.headers.authorization || req.headers.Authorization;
  //Step 2: If the authorization header starts with "Bearer", then the request is authenticated using a JSON Web Token (JWT).
  /*A JWT is a type of digital token that is used to authenticate users. JWTs are signed by the server using a secret token. This ensures that the JWT cannot be tampered with.*/
  if (authHeader?.startsWith("Bearer")) {
    const token = authHeader.split(" ")[1];
    //Step 3: Verify the JWT using the access token secret token.

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
      //If the JWT is invalid, the jwt.verify() method will return an error. In this case, we can skip the next steps and call the next() function to continue processing the request.
      if (err) {
        req.user = {};
        return next();
      }
      //Step 4: Find the user in the database based on the decoded user ID.
      /*The decoded user ID is the ID of the user that is encoded in the JWT. We can use the User.findById() method to find the user in the database based on the decoded user ID*/
      const user = await User.findById(decoded.id)
        .select({ password: 0, refresh_token: 0 })
        .exec();
      //Step 5: Set the req.user object to the user object if the user was found in the database.
      if (user) {
        /* The toObject() method on a Mongoose document converts the document to a plain object. The getters: true option tells Mongoose to call any getters that are defined on the document's schema before converting the document to a plain object.*/
        req.user = user.toObject({ getters: true });
        // Step 6: Otherwise, set the req.user object to an empty object.
        /*If the user was not found in the database, it means that the JWT is invalid. In this case, we can set the req.user object to an empty object. */
      } else {
        req.user = {};
      }
      //Step 7: Call the next() function to continue processing the request.
      return next();
    });
  } else {
    req.user = {};
    /*Once we have finished authenticating the user, we need to call the next() function to continue processing the request. */
    return next();
  }
}

module.exports = authentication;

/*
1-Get the authorization header from the request.
2-If the authorization header starts with "Bearer", then the request is authenticated using a JSON Web Token (JWT).
3-Verify the JWT using the access token secret token.
4-If the JWT is valid, find the user in the database based on the decoded user ID.
5-Set the req.user object to the user object if the user was found in the database.
6-Otherwise, set the req.user object to an empty object.
7-Call the next() function to continue processing the request.
*/
