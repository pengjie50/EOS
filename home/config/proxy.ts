/**
 * @name Proxy configuration
 * @see Proxy cannot take effect in the production environment, so there is no configuration for the production environment here
 * -------------------------------
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 *
 * @doc https://umijs.org/docs/guides/proxy
 */
export default {
   //If you need to customize the local development server, please uncomment and adjust as needed
  dev: {
    // localhost:8000/api/** -> https://preview.pro.ant.design/api/**
    '/api/': {
      // Address to be represented
      target: 'http://127.0.0.1:7001',
      //Configured this to be able to proxy from HTTP to HTTPS
      //Functions that rely on origin may require this, such as cookies
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },

  /**
   * @name Detailed proxy configuration
   * @doc https://github.com/chimurai/http-proxy-middleware
   */
  test: {
    // localhost:8000/api/** -> https://preview.pro.ant.design/api/**
    '/api/': {
      //target: 'https://proapi.azurewebsites.net',
      target: 'http://127.0.0.1:7001',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
  pre: {
    '/api/': {
      target: 'http://127.0.0.1:7001',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
};
