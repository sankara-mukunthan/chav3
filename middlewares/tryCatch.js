const debug = require("debug")("app:tryCatch");
module.exports = function(handler) {
  console.log(handler);
  return async (req, res, next) => {
    try {
      await handler(req, res);
    } catch (ex) {
      debug("error in api", ex.message);
      next(ex);
    }
  };
};
