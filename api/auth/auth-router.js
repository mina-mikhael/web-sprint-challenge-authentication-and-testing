const router = require("express").Router();
//====== model imports==========
const { add } = require("./auth_model");
//====== middleware imports ====
const { checkPayload, checkUsernameExists, checkUsernameFree } = require("./auth-middlewares");
//====== auth imports ==========
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { BCRYPT_ROUNDS, JWT_SECRET } = require("../secrets");
//////////// end of imports /////////////

/*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.
    DO NOT EXCEED 2^8 ROUNDS OF HASHING!

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */
router.post("/register", checkPayload, checkUsernameFree, async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const hash = bcrypt.hashSync(password, BCRYPT_ROUNDS);

    const result = await add({ username, password: hash });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

/*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */

router.post("/login", checkPayload, checkUsernameExists, (req, res, next) => {
  function tokenBuilder(user) {
    const payload = {
      subject: user.id,
      username: user.username,
    };

    const options = {
      expiresIn: "1d",
    };

    return jwt.sign(payload, JWT_SECRET, options);
  }

  try {
    if (bcrypt.compareSync(req.body.password, req.user.password)) {
      const token = tokenBuilder(req.user);
      res.json({ message: `welcome, ${req.user.username}`, token });
    } else {
      next({ status: 401, message: "invalid credentials" });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
