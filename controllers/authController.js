const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

async function register(req, res) {
  const { userName, email, firstName, lastName, password, passwordConfirm } =
    req.body;

  if (
    !userName ||
    !email ||
    !firstName ||
    !lastName ||
    !password ||
    !passwordConfirm
  )
    return res.status(422).json({ message: "Invalid fields" });

  // CHECH MATCHING BETWEEN PASSWORD AND PASSWORDCONFIRM
  if (password !== passwordConfirm)
    return res.status(422).json({ message: "Password do not match" });
  // CHECK USER IS EXIST IN DATABASE
  const user = await User.findOne({ email }).exec();
  if (user) return res.sendStatus(409);

  try {
    const hashPassword = await bcrypt.hash(password, 10);

    await User.create({
      email,
      userName,
      password: hashPassword,
      firstName,
      lastName,
    });

    return res.sendStatus(201);
  } catch (error) {
    return res.status(400).json({ message: "could not register" });
  }
}

async function login(req, res) {
  //1) check if the email and password exist
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(422).json({ message: "Invalid fields" });

  //2) fetch specific user
  const user = await User.findOne({ email }).exec();
  if (!user) return res.sendStatus(401);

  // 3) match password
  const match = await bcrypt.compare(password, user.password);

  // 4) if the password is not match
  if (!match)
    return res.status(401).json({ message: "Email or Password is incorect" });

  // 5) create token
  const accesstoken = jwt.sign(
    {
      // first param is indecting a some information about the user you can use an id of user but here i will put username
      id: user.id,
    },
    // secand para is access token secret
    process.env.ACCESS_TOKEN_SECRET,
    // third param is an expiration period
    { expiresIn: "1800s" } // the token expired after 30 minutes
  );

  // 6) create refresh token
  const refreshToken = jwt.sign(
    {
      // first param is indecting a some information about the user you can use an id of user but here i will put username
      id: user.id,
    },
    // secand para is access token secret
    process.env.REFRESH_SECRET_TOKEN,
    // third param is an expiration period
    { expiresIn: "1d" } // the token expired after one day
  );

  // 7) save the refesh token in database
  user.refresh_token = refreshToken;
  await user.save();

  // 8) create a cookie --- httpOnly means that javascript can not access this token it will be in cookie and will expired after 1 day

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.json({ access_token: accesstoken });
}

async function logout(req, res) {
  // 1) first you need to get our cookies
  const cookies = req.cookies;
  // 2) check if the cookies have a refrsh token
  // لو مفيش refresh token معني كدا ان الuser معملش login اصلا
  if (!cookies.refresh_token) return res.sendStatus(204);
  // 3) now we have a refresh_token
  const refreshToken = cookies.refresh_token;
  // 4) find the user in database depend on refresh token
  const user = await User.findOne({ refresh_token: refreshToken }).exec();
  // 5) if there is not user hold this token clear the cookie and return response
  if (!user) {
    res.clearCookie("refresh_token", { httpOnly: true });
    return res.sendStatus(204);
  }
  // 6) if the user exist in database we will make it's value is null
  // if there is not refresh token that means that user logged out
  user.refresh_token = null;
  await user.save();

  // 7) after save the user i will clear the cookie and send a response
  cookies.clearCookie("refresh_token", { httpOnly: true });
  res.sendStatus(204);
}

/*
1-Get the cookies from the request.
2-Check if the cookies have a refresh token. If not, return a 401 Unauthorized response.
3-Find the user in the database based on the refresh token.
4-If the user does not exist, return a 401 Unauthorized response.
5-Verify the refresh token using the secret token. If the refresh token is invalid, return a 403 6-Forbidden response.
7-Generate a new access token using the user's ID and the access token secret token.
8-Set the expiration time of the access token to 1800 seconds (30 minutes).
9-Send the new access token back to the client.
*/

async function refresh(req, res) {
  //Step 1: Get the cookies from the request
  //The req.cookies object contains all of the cookies that were sent with the request. To get the cookies, we can simply access the req.cookies object.
  const cookies = req.cookies;
  //Step 2: Check if the cookies have a refresh token
  //If the cookies do not have a refresh token, it means that the user is not logged in. In this case, we can return a 401 Unauthorized response.
  if (!cookies.refresh_token) return res.sendStatus(401);

  const refreshToken = cookies.refresh_token;

  //Step 3: Find the user in the database based on the refresh token
  //We can use the User.findOne() method to find the user in the database based on the refresh token. The User.findOne() method takes a filter object as an argument. The filter object specifies the conditions that the user must meet in order to be considered a match. In this case, the filter object specifies that the refresh_token field must be equal to the specified value
  const user = await User.findOne({ refresh_token: refreshToken }).exec();

  //Step 4: If the user does not exist, return a 401 Unauthorized response
  //If the user does not exist in the database, it means that the refresh token is invalid. In this case, we can return a 401 Unauthorized response.
  if (!user) return res.sendStatus(401);

  //Step 5: Verify the refresh token using the secret token
  /*We can use the jwt.verify() method to verify the refresh token using the secret token. The jwt.verify() method takes three arguments: the token to verify, the secret token, and a callback function. The callback function is called with the error and the decoded token if the token is valid.
  If the refresh token is invalid, the jwt.verify() method will return an error. In this case, we can return a 403 Forbidden response. */
  jwt.verify(refreshToken, process.env.REFRESH_SECRET_TOKEN, (err, decoded) => {
    if (err || user.id !== decoded.id) return res.sendStatus(403);
    //Step 6: Generate a new access token using the user's ID and the access token secret token
    /*We can use the jwt.sign() method to generate a new access token using the user's ID and the access token secret token. The jwt.sign() method takes three arguments: the payload, the secret token, and an options object. The payload is the data that will be encoded into the token. In this case, the payload is the user's ID. The secret token is used to sign the token. The options object is used to specify the expiration time of the token. */
    const accesstoken = jwt.sign(
      { id: decoded.id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1800s" }
    );
    //Step 8: Send the new access token back to the client

    res.json({ access_token: accesstoken });
  });
}

async function user(req, res) {
  const user = req.user;
  return res.status(200).json(user);
}

module.exports = { register, login, refresh, logout, user };
