const { findBy } = require("./auth_model");

async function checkUsernameFree(req, res, next) {
  const { username } = req.body;
  const user = await findBy({ username });
  if (!user) {
    next();
  } else {
    next({ status: 422, message: "username taken" });
  }
}

async function checkUsernameExists(req, res, next) {
  const { username } = req.body;
  const user = await findBy({ username });
  if (user) {
    req.user = user;
    next();
  } else {
    next({ status: 401, message: "Invalid credentials" });
  }
}

function checkPayload(req, res, next) {
  const { username, password } = req.body;
  if (!password || !password.trim() || !username || !username.trim()) {
    next({ status: 400, message: "username and password required" });
  } else {
    next();
  }
}

module.exports = {
  checkPayload,
  checkUsernameExists,
  checkUsernameFree,
};
