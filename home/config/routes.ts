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
    path: '/dashboard',
    name: 'Dashboard',
    access: 'canDashboard',
    icon: 'TableOutlined',
    component: './Dashboard',
  },
 
  {
    path: '/transactions',
    name: 'Transactions',
    access: 'canTransactionsList',
    icon: 'ReconciliationOutlined',
    component: './transaction',
  },
  {
    path: '/transaction/blockchainIntegration',
    access:"canBlockchain",
    component: './transaction/components/BlockchainIntegration',
    hideInMenu: true
  },
  
  {
    path: '/transaction/detail',
    access: 'canTransactionsList',
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
        key: 'Triggered Alerts',
        name: 'Triggered Alerts',
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
    path: '/InformationPage',
    name: 'Information Page',
    access: 'canJettyList',
    // access: 'canAdmin',
    icon: 'InfoCircleOutlined',
    component: './system/jetty',
    className: "dddddddd",
    //component: './IdentityAccessManagement',
    routes: [
      {
        path: '/InformationPage',
        redirect: '/IdentityAccessManagement/jetty',
      },

      {
        name: 'Jetty',
        icon: 'idcard',
        onclick: () => {
          alert(1)
        },
        path: '/InformationPage/jetty',
        component: './system/jetty',
      }

    ]
  },

      {
        name: 'Summary of All Transactions',
        hideInMenu: true,
        key: 'Summary of All Transactions',
        path: '/Report/ReportSummary',
        component: './report/reportSummary',
      },
     
  {
    path: '/report',
    key:'Report',
    name: 'Report',
    icon: 'FileZipOutlined',
    component: './report',
    access: 'canReportList',
   
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
        name: 'Organizations List',
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
      },
        {
        name: 'Permissions',
        icon: 'solution',
          path: '/UserAccessControl/Permissions',
        component: './system/permission',
      },

      
    ]
  },
  
  

  {
    path: '/AuditLog',
    name: 'Audit log',
    access: 'canAdmin',
    icon: 'SolutionOutlined',
    //component: './IdentityAccessManagement',
    routes: [
      {
        path: '/AuditLog',
        redirect: '/AuditLog/flow',
      },

      {
        name: 'Super User Activity Log',
        icon: 'table',
        path: '/AuditLog/SuperUserActivityLog',
        component: './system/operlog/SuperUserActivity',
      }
     
     /*,
      {
        name: 'Product Type',
        icon: 'table',
        path: '/IdentityAccessManagement/producttype',
        component: './system/producttype',
      },
      {
        name: 'Terminal',
        icon: 'solution',
        path: '/SystemManagement/terminal',
        component: './system/terminal',
      }*/,
      {
        name: 'Login log',
        icon: 'bars',
        path: '/AuditLog/loginlog',
        component: './system/loginlog',
      },
      {
        name: 'User Activity Log',
        icon: 'bars',
        path: '/AuditLog/operlog',
        component: './system/operlog',
      },
      {
        name: 'API Activity Log',
        icon: 'bars',
        path: '/AuditLog/APIActivity',
        component: './system/operlog/APIActivity',
      }

      /*,
      {
        name: 'Security Settings',
        icon: 'safetyCertificate',
        path: '/SystemManagement/sysconfig',
        component: './system/sysconfig',
      }*/
      
    ]
  },
  
  {
    path: '/SystemConfiguration',
    name: 'System Configuration',
    access: 'canAdmin',
    icon: 'SolutionOutlined',
    //component: './IdentityAccessManagement',
    routes: [
      {
        path: '/SystemConfiguration',
        redirect: '/SystemConfiguration/flow',
      },
      {
        name: 'Transaction Flow',
        icon: 'ApartmentOutlined',
        path: '/SystemConfiguration/flow',
        component: './system/flow',
      },
      {
        name: 'Interface Data',
        icon: 'safetyCertificate',
        path: '/SystemConfiguration/interfacedata',
        component: './system/interfacedata',
      },
      {
        name: 'Security Settings',
        icon: 'safetyCertificate',
        path: '/SystemConfiguration/sysconfig',
        component: './system/sysconfig',
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
    redirect: '/dashboard',
  },
  
  {
    path: '*',
    layout: false,
    redirect: '/dashboard',
  },
];
