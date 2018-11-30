const config = require("config");
const jwt = require("jsonwebtoken");
const debug = require("debug")("app:authorizeFunction");

function auth(req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("access denied unauthorised user");

  try {
    const access = jwt.verify(token, config.get("jwtSecretKey"));

    req.user = access;
    next();
  } catch (ex) {
    res.status(401).send("access denied invalid user");
  }
}

module.exports = auth;
