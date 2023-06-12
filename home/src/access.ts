/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access(initialState: { currentUser?: API.CurrentUser } | undefined) {
  const { currentUser } = initialState ?? {};
  return {
    canAdmin: currentUser && currentUser.role_name === 'super',
    canJettyAdd: () => {
      return currentUser && currentUser.permissions.some((a) => {
        return a == 'jetty_add'
      }) || currentUser?.role_name === 'super'
    },
    canJettyList: () => {
      return currentUser && currentUser.permissions.some((a) => {
        return a == 'jetty_list'
      }) || currentUser?.role_name === 'super'
    },
    canJettyDel: () => {
      return currentUser && currentUser.permissions.some((a) => {
        return a == 'jetty_del'
      }) || currentUser?.role_name === 'super'
    },

    canJettyMod: () => {
      return currentUser && currentUser.permissions.some((a) => {
        return a == 'jetty_mod'
      }) || currentUser?.role_name === 'super'
    },
    canAlertruleAdd: () => {
      return currentUser && currentUser.permissions.some((a) => {
        return a == 'alertrule_add' 
      }) || currentUser?.role_name === 'super'
    },
    canAlertruleList: () => {
      return currentUser && currentUser.permissions.some((a) => {
        return a == 'alertrule_list' 
      }) || currentUser?.role_name === 'super'
    },
    canAlertruleDel: () => {
      return currentUser && currentUser.permissions.some((a) => {
        return a == 'alertrule_del' 
      }) || currentUser?.role_name === 'super'
    },
    
    canAlertruleMod: () => {
      return currentUser && currentUser.permissions.some((a) => {
        return a == 'alertrule_mod' 
      }) || currentUser?.role_name === 'super'
    },


    canAlertDel: () => {
      return currentUser && currentUser.permissions.some((a) => {
        return a == 'alert_del'
      }) || currentUser?.role_name === 'super'
    },

    canAlertMod: () => {
      return currentUser && currentUser.permissions.some((a) => {
        return a == 'alert_mod'
      }) || currentUser?.role_name === 'super'
    },



    canAlertList: () => {
      return currentUser && currentUser.permissions.some((a) => {
        return a == 'alert_list'
      }) || currentUser?.role_name === 'super'
    },
    canEOSTools: () => {

      var a= currentUser && currentUser.permissions.some((a) => {
        return a == 'alert_list'
      }) || currentUser?.role_name === 'super'


      var b =  currentUser && currentUser.permissions.some((a) => {
        return a == 'alertrule_list'
      }) 
      return a || b

    },
  };
}
