const config = require("config");

function auth(req, res, next) {
  try {
    next();
  } catch (err) {
    debug("error in middleware authorize : ", err.message);
  }
}
