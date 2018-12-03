const debug = require("debug")("app:adminAuth");
function adminAuth(req, res, next) {
  try {
    if (!req.user.isAdmin)
      return res.status(401).send("access denied. admin only have permission");
    next();
  } catch (err) {
    debug("error in admin auth middleware");
    next(err);
  }
}

module.exports = adminAuth;
