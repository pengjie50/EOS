/**

*Routing configuration for @ name umi

*@ description only supports configuration of path, component, routes, redirect, wrappers, name, and icon

*@ param path only supports two types of placeholder configurations. The first is in the form of a dynamic parameter: id, and the second is the * wildcard character, which can only appear at the end of the routing string.

*The React component path used for rendering after matching the location and path of the @ param component configuration. It can be an absolute path or a relative path. If it is a relative path, it will start from src/pages.

*Param routes configure sub routes, usually used when adding layout components to multiple paths.

*@ param redirect Configure Route Jump

*Param wrappers configure the packaging components of the routing component, which can combine more functions for the current routing component. For example, it can be used for routing level permission verification

*@ param name: Configure the title of the route. By default, read the value of menu.xxxx in the internationalization file menu.ts. If the name is configured as login, read the value of menu.login in menu.ts as the title

*The @ param icon is used to configure the routing icon, with reference to its values https://ant.design/components/icon-cn Please note to remove the style suffix and case. If you want to configure the icon as<StepBackwardOutlined/>, the value should be stepBackward or StepBackward. If you want to configure the icon as<UserOutlined/>, the value should be user or User

*@ doc https://umijs.org/docs/guides/routes

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
    access: "canBlockchain",
    component: './transaction/components/BlockchainIntegration',
    hideInMenu: true
  },
  {
    path: '/EOSInstructionManualGuide',
    component: './EOSInstructionManualGuide',
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

    routes: [
      {
        path: '/threshold',
        redirect: '/threshold/alert',
      },

      {
        name: 'Summary',
        key: 'Summary',
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
    icon: 'InfoCircleOutlined',
    component: './system/jetty',
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
    key: 'Report',
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
      },
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



    ]
  },

  {
    path: '/SystemConfiguration',
    name: 'System Configuration',
    access: 'canAdmin',
    icon: 'SolutionOutlined',

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
