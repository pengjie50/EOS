/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access(initialState: { currentUser?: API.CurrentUser } | undefined) {
  const { currentUser } = initialState ?? {};

  
  return {
    canAdmin: currentUser && currentUser.role_type === 'Super',
    canInterfacedataAdd: () => {
      return currentUser && currentUser?.role_type != "Trader" && currentUser.permissions.some((a) => {
        return a == 'interfacedata_add'
      }) || currentUser?.role_type === 'Super'
    },
    canInterfacedataList: () => {
      return currentUser && currentUser.permissions.some((a) => {
        return a == 'interfacedata_list'
      }) || currentUser?.role_type === 'Super'
    },
    canInterfacedataDel: () => {
      return currentUser && currentUser.permissions.some((a) => {
        return a == 'interfacedata_del'
      }) || currentUser?.role_type === 'Super'
    },

    canInterfacedataMod: () => {
      return currentUser && currentUser?.role_type == "Super" && currentUser.permissions.some((a) => {
        return a == 'interfacedata_mod'
      }) || currentUser?.role_type === 'Super'
    },
    canJettyAdd: () => {
      return currentUser &&  currentUser?.role_type != "Trader" && currentUser.permissions.some((a) => {
        return a == 'jetty_add'
      }) || currentUser?.role_type === 'Super'
    },
    canJettyList: () => {
      return currentUser && currentUser.permissions.some((a) => {
        return a == 'jetty_list'
      }) || currentUser?.role_type === 'Super'
    },
    canJettyDel: () => {
      return currentUser && currentUser.permissions.some((a) => {
        return a == 'jetty_del'
      }) || currentUser?.role_type === 'Super'
    },

    canJettyMod: () => {
      return currentUser && currentUser?.role_type == "Super" && currentUser.permissions.some((a) => {
        return a == 'jetty_mod'
      }) || currentUser?.role_type === 'Super'
    },
    canAlertruleAdd: () => {
      return currentUser && currentUser.permissions.some((a) => {
        return a == 'alertrule_add' 
      }) || currentUser?.role_type === 'Super'
    },
    canAlertruleList: () => {
      return currentUser && currentUser.permissions.some((a) => {
        return a == 'alertrule_list' 
      }) || currentUser?.role_type === 'Super'
    },
    canAlertruleDel: () => {
      return currentUser && currentUser.permissions.some((a) => {
        return a == 'alertrule_del' 
      }) || currentUser?.role_type === 'Super'
    },
    
    canAlertruleMod: () => {
      return currentUser && currentUser.permissions.some((a) => {
        return a == 'alertrule_mod' 
      }) || currentUser?.role_type === 'Super'
    },


    canAlertDel: () => {
      return currentUser && currentUser.permissions.some((a) => {
        return a == 'alert_del'
      }) || currentUser?.role_type === 'Super'
    },

    canAlertMod: () => {
      return currentUser && currentUser.permissions.some((a) => {
        return a == 'alert_mod'
      }) || currentUser?.role_type === 'Super'
    },



    canAlertList: () => {
      return currentUser && currentUser.permissions.some((a) => {
        return a == 'alert_list'
      }) || currentUser?.role_type === 'Super'
    },
    canEOSTools: () => {

      var a= currentUser && currentUser.permissions.some((a) => {
        return a == 'alert_list'
      }) || currentUser?.role_type === 'Super'


      var b =  currentUser && currentUser.permissions.some((a) => {
        return a == 'alertrule_list'
      }) 
      return a || b

    },
  };
}
