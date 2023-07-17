// app/middleware/error_handler.js
module.exports = () => {
  return async function errorHandler(ctx, next) {

    try {
      await next();
    } catch (err) {
      // All exceptions will trigger an error event on the app, and the framework will record an error log
      ctx.app.emit('error', err, ctx);

      const status = err.status || 500;
      // The detailed error content of 500 errors in the production environment is not returned to the client as it may contain sensitive information
      const error = status === 500 && ctx.app.config.env === 'prod'
        ? err.message
        : err.message;

      // Read out various attributes from the error object and set them in the response
      ctx.body = { code:1000,message: error};
      if (status === 422) {

        ctx.body.detail = err.errors;
      }
      ctx.status = status;
    }
  };
};
