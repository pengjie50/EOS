/**
 * @name umi 的路由配置
 * @description 只支持 path,component,routes,redirect,wrappers,name,icon 的配置
 * @param path  path 只支持两种占位符配置，第一种是动态参数 :id 的形式，第二种是 * 通配符，通配符只能出现路由字符串的最后。
 * @param component 配置 location 和 path 匹配后用于渲染的 React 组件路径。可以是绝对路径，也可以是相对路径，如果是相对路径，会从 src/pages 开始找起。
 * @param routes 配置子路由，通常在需要为多个路径增加 layout 组件时使用。
 * @param redirect 配置路由跳转
 * @param wrappers 配置路由组件的包装组件，通过包装组件可以为当前的路由组件组合进更多的功能。 比如，可以用于路由级别的权限校验
 * @param name 配置路由的标题，默认读取国际化文件 menu.ts 中 menu.xxxx 的值，如配置 name 为 login，则读取 menu.ts 中 menu.login 的取值作为标题
 * @param icon 配置路由的图标，取值参考 https://ant.design/components/icon-cn， 注意去除风格后缀和大小写，如想要配置图标为 <StepBackwardOutlined /> 则取值应为 stepBackward 或 StepBackward，如想要配置图标为 <UserOutlined /> 则取值应为 user 或者 User
 * @doc https://umijs.org/docs/guides/routes
 */
export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './User/Login',
      },
      
      {
        name: 'adminlogin',
        path: '/user/adminlogin',
        component: './User/Login/admin',
      }
    ],
  },
  {
    path: '/Dashboard',
    name: 'Dashboard',
    icon: null,
    component: './Dashboard',
  },

  {
    path: '/Transactions',
    name: 'Transactions',
   // icon: 'smile',
    component: './transaction',
  },
  {
    path: '/transaction/detail',
    component: './transaction/components/Detail',
    hideInMenu: true
  },
  {
    path: '/threshold',
    access: 'canEOSTools',
    name: 'Threshold',
    // icon: 'smile',
    //component: './EOSTools',
    routes: [
      {
        path: '/threshold',
        redirect: '/threshold/alert',
      },
      {
        name: 'View alert rules',
        access: 'canAlertruleList',
        icon: 'ControlOutlined',
        path: '/threshold/alertRule',
        component: './alertrule',
      },
      {
        name: 'View triggered alerts',
        access: 'canAlertList',
        icon: 'AlertOutlined',
        path: '/threshold/alert',
        component: './alert'
      }
    ]
  },
  {
    path: '/Reports',
    name: 'Reports',
    // icon: 'smile',
    component: './Reports',
  },
  {
    path: '/IdentityAccessManagement',
    name: 'Identity Access Management',
    access: 'canAdmin',
    // icon: 'smile',
    //component: './IdentityAccessManagement',
    routes: [
      {
        path: '/IdentityAccessManagement',
        redirect: '/IdentityAccessManagement/RoleList',
      },
      {
        name: 'Company',
        icon: 'table',
        path: '/IdentityAccessManagement/company',
        component: './system/company',
      },
      {
        name: 'Permissions',
        icon: 'solution',
        path: '/IdentityAccessManagement/Permissions',
        component: './system/permission',
      },
      {
        name: 'Roles',
        icon: 'idcard',
        path: '/IdentityAccessManagement/RoleList',
        component: './system/role',
      },
      {
        name: 'Users',
        icon: 'user',
        path: '/IdentityAccessManagement/Users',
        component: './system/user',
      },
     
      {
        name: 'Flow',
        icon: 'ApartmentOutlined',
        path: '/IdentityAccessManagement/flow',
        component: './system/flow',
      },
      {
        name: 'Login log',
        icon: 'bars',
        path: '/IdentityAccessManagement/loginlog',
        component: './system/loginlog',
      },
      {
        name: 'Operation Log',
        icon: 'bars',
        path: '/IdentityAccessManagement/operlog',
        component: './system/operlog',
      },
      {
        name: 'Security Settings',
        icon: 'safetyCertificate',
        path: '/IdentityAccessManagement/sysconfig',
        component: './system/sysconfig',
      }
      
    ]
  },
  {
    path: '/InformationPage',
    name: 'Information Page',
   // access: 'canAdmin',
    // icon: 'smile',
    //component: './IdentityAccessManagement',
    routes: [
      {
        path: '/InformationPage',
        redirect: '/IdentityAccessManagement/jetty',
      },
      {
        name: 'Product Type',
        icon: 'table',
        path: '/InformationPage/producttype',
        component: './system/producttype',
      },
      {
        name: 'Terminal',
        icon: 'solution',
        path: '/InformationPage/terminal',
        component: './system/terminal',
      },
      {
        name: 'Jetty',
        icon: 'idcard',
        path: '/InformationPage/jetty',
        component: './system/jetty',
      }

    ]
  },

  {
    path: '/account',
    name: 'Profile & Setting',
    // icon: 'smile',
    //component: './EOSTools',
    routes: [
      {
        name: 'Personal Center',
        path: '/account/center',
        component: './account/center'

      },
      {
        name: 'Personal settings',
        path: '/account/settings',
        component: './account/settings'
        
      },
      
      {
        name: 'Filter Of Timestamps',
        path: '/account/filterOfTimestamps',
        component: './account/filterOfTimestamps'
      
      },

    ]
  },
 /* {
    path: '/admin',
    name: 'admin',
    icon: 'crown',
    access: 'canAdmin',
    routes: [
      {
        path: '/admin',
        redirect: '/admin/sub-page',
      },
      {
        path: '/admin/sub-page',
        name: 'sub-page',
        component: './Admin',
      },
    ],
  },*/
  
  {
    path: '/user/retrievePassword',
    layout: false,
    component: './account/settings/components/retrievePassword',
  },
  
  {
    path: '/',
    redirect: '/Dashboard',
  },
  
  {
    path: '*',
    layout: false,
    component: './404',
  },
];
