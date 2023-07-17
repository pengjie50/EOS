import type { RequestOptions } from '@@/plugin-request/request';
import type { RequestConfig } from '@umijs/max';
import { message, notification } from 'antd';
import { formatMessage } from '@umijs/max';
import { history, useModel } from '@umijs/max';
import { outLogin } from '@/services/ant-design-pro/api';
import { stringify } from 'querystring';
const loginOut = async () => {


  //await outLogin();

  localStorage.setItem('token', "");
  const { search, pathname } = window.location;
  const urlParams = new URL(window.location.href).searchParams;
  /** This method will jump to the location where the redirect parameter is located */
  const redirect = urlParams.get('redirect');
  // Note: There may be security issues, please note
  if (window.location.pathname !== '/user/login' && !redirect) {
    history.replace({
      pathname: '/user/login',
      search: 'redirect=/'
    });
  }
};
// Error handling scheme: Error type
enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}
// Response data format agreed with backend
interface ResponseStructure {
  success: boolean;
  data: any;
  errorCode?: number;
  errorMessage?: string;
  showType?: ErrorShowType;
}


export const errorConfig: RequestConfig = {
  // Error handling: umi@3 Error handling scheme for.
  errorConfig: {
    // Error thrown
    errorThrower: (res) => {
      var { success, data, errorCode, errorMessage, showType } =
        res as unknown as ResponseStructure;
      if (!success) {

        errorMessage = formatMessage({ id: 'pages.error.' + errorCode })
        const error: any = new Error(errorMessage);
        error.name = 'BizError';


        error.info = { errorCode, errorMessage, showType, data };
        throw error; // Throw homemade errors
      }
    },
    // Error reception and handling
    errorHandler: (error: any, opts: any) => {

      if (opts?.skipErrorHandler) throw error;
      // The error thrown by our errorThrower.
      if (error.name === 'BizError') {
        const errorInfo: ResponseStructure | undefined = error.info;
        if (errorInfo) {

          const { errorMessage, errorCode } = errorInfo;

          if (errorCode == 1005 || errorCode == 1011) {

            if (localStorage.getItem('token')) {

              message.warning(errorMessage);
              loginOut()
            }

           
            return
          }

          switch (errorInfo.showType) {
            case ErrorShowType.SILENT:
              // do nothing
              break;
            case ErrorShowType.WARN_MESSAGE:
              message.warning(errorMessage);
              break;
            case ErrorShowType.ERROR_MESSAGE:

              message.error(errorMessage);
              break;
            case ErrorShowType.NOTIFICATION:
              notification.open({
                description: errorMessage,
                message: errorCode,
              });
              break;
            case ErrorShowType.REDIRECT:
              // TODO: redirect
              break;
            default:
              message.error(errorMessage);
          }
        }
      } else if (error.response) {
        // Axios 
        // he request was successfully issued and the server responded with a status code, but the status code exceeded the range of 2xx
        message.error(`Response status:${error.response.status}`);
      } else if (error.request) {
        // The request has been successfully initiated, but no response has been received
        // \`error.request\` In the browser, it is an instance of XMLHttpRequest,
        // In node.js, it is an instance of HTTP. ClientRequest
        message.error('None response! Please retry.');
      } else {
        // There was a problem sending the request
        message.error('Request error, please retry.');
      }
    },
  },

  // request interceptor
  requestInterceptors: [
    (config: RequestOptions) => {
      // Intercept request configuration for personalized processing.
      if (config.data && config.data.hasFilters) {
        delete config.data.hasFilters
        var filters = [{ groupOp: 'AND', rules: [] }]



        for (var k in config.data) {

          if (k != "current" && k != "pageSize" && k != "filter" && k != "sorter") {


            if (typeof config.data[k] == "object" && config.data[k].field) {
              filters[0].rules.push(config.data[k])
              delete config.data[k]
              continue
            }

            var a = {}
            a.field = k
            a.op = 'like'
            a.data = config.data[k]
            filters[0].rules.push(a)
            delete config.data[k]
          }

        }


        if (config.data.sorter) {
          for (var k in config.data.sorter) {
            config.data.order = []
            config.data.order.push([k, config.data.sorter[k] == "descend" ? 'desc' : 'asc'])
          }
          delete config.data.sorter
        }


        if (config.data.current && config.data.pageSize) {
          config.data.page = config.data.current
          config.data.limit = config.data.pageSize
        }
        if (filters[0]?.rules.length == 0) {
          filters.shift()
        }
        if (filters[1]?.rules.length == 0) {
          filters.pop()
        }
        config.data.filters = filters
      }

      if (config.url != "/api/user/login" && config.url != "/api/user/retrievePassword" && config.url != "/api/user/modifyPassword") {
        config.headers.authorization = localStorage.getItem('token');
      }

      const url = config?.url?.concat('');
      return { ...config, url };
    },
  ],


  responseInterceptors: [
    (response) => {

      const { data } = response as unknown as ResponseStructure;

      if (data?.success === false) {

      }
      return response;
    },
  ],
};
