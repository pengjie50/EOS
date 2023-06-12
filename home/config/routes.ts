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
        component: './User/Login',
      }
    ],
  },
  {
    path: '/Dashboard',
    name: 'Dashboard',
    icon: 'TableOutlined',
    component: './Dashboard',
  },

  {
    path: '/Transactions',
    name: 'Transactions',
    icon: 'ReconciliationOutlined',
    component: './transaction',
  },
  {
    path: '/transaction/blockchainIntegration',
    component: './transaction/components/BlockchainIntegration',
    hideInMenu: true
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
    icon: 'FileExclamationOutlined',
    //component: './EOSTools',
    routes: [
      {
        path: '/threshold',
        redirect: '/threshold/alert',
      },
      /*{
        name: 'Create New',
        access: 'canAlertruleAdd',
        icon: 'ControlOutlined',
        path: '/threshold/createAlertRule',
        component: './alertrule',
      },*/
      {
        name: 'Summary',
        key:'Summary',
        access: 'canAlertruleList',
        icon: 'ControlOutlined',
        path: '/threshold/alertRule',
        component: './alertrule',
      },
      {
        key: 'View Triggered Alerts',
        name: 'View Triggered Alerts',
        access: 'canAlertList',
        icon: 'AlertOutlined',
        path: '/threshold/alert',
        component: './alert'
      },
      {
        key: 'View Triggered Alerts Noread',
        name: 'View Triggered Alerts Noread',
        access: 'canAlertList',
        hideInMenu: true,
        icon: 'AlertOutlined',
        path: '/threshold/alertNoread',
        component: './alert'
      }
     
    ]
  },
  {
    path: '/Report',
    name: 'Report',
    icon: 'FileZipOutlined',
    routes: [
      {
        path: '/Report',
        redirect: '/Report/ReportList',
      },
      {
        name: 'Report History',
        key: 'Report History',
        hideInMenu: true,
        path: '/Report/ReportList',
        component: './report',
      },
      {
        name: 'Summary of All Transactions',
        hideInMenu: true,
        key: 'Summary of All Transactions',
        path: '/Report/ReportSummary',
        component: './report/reportSummary',
      },
      {
        name: 'Create New Report',
        key: 'Create New Report',
        path: '/Report/add',
       hideInMenu: true,
        component: './report/components/CreateForm',
      },
      {
        name: 'Report Detail',
        key: 'Report Detail',
        path: '/Report/Detail',
        hideInMenu: true,
        component: './report/components/DetailForm',
      }
   ]
   
  },
 
   {
     path: '/UserAccessControl',
     name: 'User Access Control',
     access: 'canAdmin',
     icon: 'SolutionOutlined',
    //component: './IdentityAccessManagement',
    routes: [
      {
        path: '/UserAccessControl',
        redirect: '/UserAccessControl/company',
      },
      {
        name: 'Company',
        icon: 'table',
        path: '/UserAccessControl/company',
        component: './system/company',
      },
      {
        name: 'Roles',
        icon: 'idcard',
        path: '/UserAccessControl/RoleList',
        component: './system/role',
      },
      {
        name: 'Users',
        icon: 'user',
        path: '/UserAccessControl/Users',
        component: './system/user',
      }

      
    ]
  },



  {
    path: '/SystemManagement',
    name: 'System Management',
    access: 'canAdmin',
    icon: 'SettingOutlined',
    //component: './IdentityAccessManagement',
    routes: [
      {
        path: '/SystemManagement',
        redirect: '/SystemManagement/Permissions',
      },
     
      {
        name: 'Permissions',
        icon: 'solution',
        path: '/SystemManagement/Permissions',
        component: './system/permission',
      },
     
    
     
      {
        name: 'Flow',
        icon: 'ApartmentOutlined',
        path: '/SystemManagement/flow',
        component: './system/flow',
      }/*,
      {
        name: 'Product Type',
        icon: 'table',
        path: '/IdentityAccessManagement/producttype',
        component: './system/producttype',
      }*/,
      {
        name: 'Terminal',
        icon: 'solution',
        path: '/SystemManagement/terminal',
        component: './system/terminal',
      },
      {
        name: 'Login log',
        icon: 'bars',
        path: '/SystemManagement/loginlog',
        component: './system/loginlog',
      },
      {
        name: 'Operation Log',
        icon: 'bars',
        path: '/SystemManagement/operlog',
        component: './system/operlog',
      },
      {
        name: 'Security Settings',
        icon: 'safetyCertificate',
        path: '/SystemManagement/sysconfig',
        component: './system/sysconfig',
      }
      
    ]
  },
  {
    path: '/InformationPage',
    name: 'Information Page',
    access: 'canJettyList',
   // access: 'canAdmin',
    icon: 'InfoCircleOutlined',
    //component: './IdentityAccessManagement',
    routes: [
      {
        path: '/InformationPage',
        redirect: '/IdentityAccessManagement/jetty',
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
    hideInMenu: true,
    // icon: 'smile',
    //component: './EOSTools',
    routes: [
      {
        name: 'Personal Center',
        path: '/account/center',
        component: './account/center'

      },
      {
        name: 'My User Profile',
        path: '/account/baseSettings',
        component: './account/settings/components/base'

      },
      {
        name: 'Change Password',
        path: '/account/modPassword',
        component: './account/settings/components/modPassword'
      
      },
      {
        name: 'Filter Of Timestamps',
        path: '/account/filterOfTimestamps',
        component: './account/filterOfTimestamps'

      }

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
