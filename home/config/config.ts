// https://umijs.org/config/
import { defineConfig } from '@umijs/max';
import { base } from 'antd-mobile/es/locales/base';
import { join } from 'path';
import defaultSettings from './defaultSettings';
import proxy from './proxy';
import routes from './routes';

const { REACT_APP_ENV = 'dev' } = process.env;

export default defineConfig({
    // Multiple tab layout, just configure the following two items
  keepalive: ['/dashboard', '/report', '/transactions', '/threshold/alert', '/threshold/alertRule','/InformationPage/jetty'],
  tabsLayout: {},

  /**
   * @name Enable hash mode
   * @description Include the hash suffix in the product after building. Usually used for incremental publishing and to avoid browser loading cache.
   * @doc https://umijs.org/docs/api/config#hash
   */
  hash: false,
  history: { type: 'hash' },// The default is browser
  /**
   * @name Compatibility settings
   * @description Setting up IE11 may not be perfectly compatible, you need to check all the dependencies you use
   * @doc https://umijs.org/docs/api/config#targets
   */
   /*targets: {
     ie: 11,
   },*/
  /**
   * @name Routing configuration, files not introduced in the routing will not be compiled
   * @description Only supports configuration of path, component, routes, redirect, wrappers, and title
   * @doc https://umijs.org/docs/guides/routes
   */
  // umi routes: https://umijs.org/docs/routing
  routes,
  /**
   * @name Theme configuration
   * @description Although it's called a theme, it's actually just a variable setting for less
   * @doc Antd's Theme Settings https://ant.design/docs/react/customize-theme-cn
   * @doc Theme configuration of umihttps://umijs.org/docs/api/config#theme
   */
  theme: {
   
    // If you don't want configProvide to dynamically set the theme, you need to set this to default
    // Only when set to variable can configProvide be used to dynamically set the main color tone
    'root-entry-name': 'variable',
  },
  /**
   * @name moment Internationalization configuration for
   * @description If there is no requirement for internationalization, opening it can reduce the package size of JavaScript
   * @doc https://umijs.org/docs/api/config#ignoremomentlocale
   */
  ignoreMomentLocale: true,
  /**
  *@ name proxy configuration
  *@ description can allow your local server to proxy to your server, so you can access the server's data
  *Please note that the following agents can only be used during local development and cannot be used after building.
  *Introduction to @ doc Agent https://umijs.org/docs/guides/proxy
  *@ doc proxy configuration https://umijs.org/docs/api/config#proxy
  */
  proxy: proxy[REACT_APP_ENV as keyof typeof proxy],
  /**
   * @name Quick Hot Update Configuration
   * @descriptionA good hot update component that can keep the state when updating
   */
  fastRefresh: true,
  //============== The following are all plugin configurations for max ===============
  /**
   * @name Data flow plugin
   * @@doc https://umijs.org/docs/max/data-flow
   */
  model: {},
  /**
   * A global initial data flow that can be used to share data between plugins
   * @description It can be used to store some global data, such as user information, or some global states. The global initial state is created at the beginning of the entire Umi project.
   * @doc https://umijs.org/docs/max/data-flow#%E5%85%A8%E5%B1%80%E5%88%9D%E5%A7%8B%E7%8A%B6%E6%80%81
   */
  initialState: {},
  /**
   * @name layout plug-in unit
   * @doc https://umijs.org/docs/max/layout-menu
   */
  title: 'EOS',
  layout: {
    locale: true,
    ...defaultSettings,
  },
  /**
   * @name moment2dayjs plug-in unit
   * @description Replace the moment in the project with dayjs
   * @doc https://umijs.org/docs/max/moment2dayjs
   */
  moment2dayjs: {
    preset: 'antd',
    plugins: ['duration'],
  },
  /**
   * @name Internationalization plugin
   * @doc https://umijs.org/docs/max/i18n
   */
  locale: {
    // default zh-CN
    default: 'en-US',
    antd: true,
    // default true, when it is true, will use `navigator.language` overwrite default
    baseNavigator: false,
  },
  /**
   * @name antd plugin
   * @description Built in babel import plugin
   * @doc https://umijs.org/docs/max/antd#antd
   */
  antd: {},
  /**
   * @name Network Request Configuration
   * @description It provides a unified network request and error handling solution based on Axios and Ahooks' useRequests.
   * @doc https://umijs.org/docs/max/request
   */
  request: {},
  /**
   * @name Permission plugin
   * @description The permission plugin based on initialState must be opened first
   * @doc https://umijs.org/docs/max/access
   */
  access: {},
  /**
   * @name <head> Additional script in
   * @descriptionConfigure additional scripts in<head>
   */
  headScripts: [
    // Resolve the issue of white screen during first loading
    { src: '/scripts/loading.js', async: true },
  ],
  //================Pro plugin configuration =================
  presets: ['umi-presets-pro'],
  /**
   * @name openAPI Configuration of plugins
   * @description Generating serve and mock based on the OpenAPI specification can reduce a lot of boilerplate code
   * @doc https://pro.ant.design/zh-cn/docs/openapi/
   */
  openAPI: [
    {
      requestLibPath: "import { request } from '@umijs/max'",
      // Or use an online version
      // schemaPath: "https://gw.alipayobjects.com/os/antfincdn/M%24jrzTTYJN/oneapi.json"
      schemaPath: join(__dirname, 'oneapi.json'),
      mock: false,
    },
    {
      requestLibPath: "import { request } from '@umijs/max'",
      schemaPath: 'https://gw.alipayobjects.com/os/antfincdn/CA1dOm%2631B/openapi.json',
      projectName: 'swagger',
    },
  ],
  mfsu: {
    strategy: 'normal',
  },
  requestRecord: {},
});
