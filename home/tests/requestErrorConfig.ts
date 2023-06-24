import type { RequestOptions } from '@@/plugin-request/request';
import type { RequestConfig } from '@umijs/max';
import { message, notification } from 'antd';
import { formatMessage } from '@umijs/max';
import { history,useModel } from '@umijs/max';
import { outLogin } from '@/services/ant-design-pro/api';
import { stringify } from 'querystring';
const loginOut = async () => {

  
   //await outLogin();

  localStorage.setItem('token', "");
  const { search, pathname } = window.location;
  const urlParams = new URL(window.location.href).searchParams;
  /** 此方法会跳转到 redirect 参数所在的位置 */
  const redirect = urlParams.get('redirect');
  // Note: There may be security issues, please note
  if (window.location.pathname !== '/user/login' && !redirect) {
    history.replace({
      pathname: '/user/login',
      search: 'redirect=/'
    });
  }
};
// 错误处理方案： 错误类型
enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}
// 与后端约定的响应数据格式
interface ResponseStructure {
  success: boolean;
  data: any;
  errorCode?: number;
  errorMessage?: string;
  showType?: ErrorShowType;
}

/**
 * @name 错误处理
 * pro 自带的错误处理， 可以在这里做自己的改动
 * @doc https://umijs.org/docs/max/request#配置
 */
export const errorConfig: RequestConfig = {
  // 错误处理： umi@3 的错误处理方案。
  errorConfig: {
    // 错误抛出
    errorThrower: (res) => {
      var { success, data, errorCode, errorMessage, showType } =
        res as unknown as ResponseStructure;
      if (!success) {
       
         errorMessage = formatMessage({ id: 'pages.error.' + errorCode })
        const error: any = new Error(errorMessage);
        error.name = 'BizError';
        
       
        error.info = { errorCode, errorMessage, showType, data };
        throw error; // 抛出自制的错误
      }
    },
    // 错误接收及处理
    errorHandler: (error: any, opts: any) => {
     
      if (opts?.skipErrorHandler) throw error;
      // 我们的 errorThrower 抛出的错误。
      if (error.name === 'BizError') {
        const errorInfo: ResponseStructure | undefined = error.info;
        if (errorInfo) {
         
          const { errorMessage, errorCode } = errorInfo;

          if (errorCode == 1005 || errorCode == 1011) {

            if (localStorage.getItem('token')) {
             
              message.warning(errorMessage );
              loginOut()
            }
            
            //const { initialState, setInitialState } = useModel('@@initialState');
            //setInitialState((s) => ({ ...s, currentUser: undefined }));
           
          
              
          
           
         
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
        // Axios 的错误
        // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
        message.error(`Response status:${error.response.status}`);
      } else if (error.request) {
        // 请求已经成功发起，但没有收到响应
        // \`error.request\` 在浏览器中是 XMLHttpRequest 的实例，
        // 而在node.js中是 http.ClientRequest 的实例
        message.error('None response! Please retry.');
      } else {
        // 发送请求时出了点问题
        message.error('Request error, please retry.');
      }
    },
  },

  // 请求拦截器
  requestInterceptors: [
    (config: RequestOptions) => {
      // 拦截请求配置，进行个性化处理。
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
      console.log("sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss")
      console.log(config)
      const url = config?.url?.concat('');
      return { ...config, url };
    },
  ],

  // 响应拦截器
  responseInterceptors: [
    (response) => {
      // 拦截响应数据，进行个性化处理
      const { data } = response as unknown as ResponseStructure;

      if (data?.success === false) {
        //message.error('请求失败！');
      }
      return response;
    },
  ],
};
