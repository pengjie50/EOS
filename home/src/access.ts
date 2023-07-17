/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access(initialState: { currentUser?: API.CurrentUser } | undefined) {
  const { currentUser } = initialState ?? {};

  
  return {
    canAdmin: currentUser && currentUser.role_type === 'Super',
    canDashboard: () => {
      return currentUser && currentUser.permissions.some((a) => {
        return a == 'dashboard' || a == 'dashboard_company' || a == 'dashboard_tab'
      }) || currentUser?.role_type === 'Super'
    },
    dashboard_tab: () => {
      return currentUser && currentUser.permissions.some((a) => {
        return a == 'dashboard_tab'
      }) 
    },
    canBlockchain: () => {
      return currentUser && currentUser.permissions.some((a) => {
        return a == 'blockchain'
      }) || currentUser?.role_type === 'Super'
    },
    alertrule_list_tab: () => {
      return currentUser && currentUser.permissions.some((a) => {
        return a == 'alertrule_list_tab'
      })
    },
    transactions_list_tab: () => {
     
      return currentUser && currentUser.permissions.some((a) => {
        return a == 'transactions_list_tab'
      })
    },

    jetty_list_tab: () => {

      return currentUser && currentUser.permissions.some((a) => {
        return a == 'jetty_list_tab'
      })
    },

    alert_list_tab: () => {
     
      return currentUser && currentUser.permissions.some((a) => {
        return a == 'alert_list_tab'
      })
    },
    canInterfacedataAdd: () => {
      return currentUser && currentUser.permissions.some((a) => {
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
      return currentUser  && currentUser.permissions.some((a) => {
        return a == 'interfacedata_mod'
      }) || currentUser?.role_type === 'Super'
    },
    canJettyAdd: () => {
      return currentUser && currentUser.permissions.some((a) => {
        return a == 'jetty_add'
      }) || currentUser?.role_type === 'Super'
    },
    canJettyList: () => {
      return currentUser && currentUser.permissions.some((a) => {
        return a == 'jetty' || a == 'jetty_list' || a == 'jetty_list_terminal'
      }) || currentUser?.role_type === 'Super'
    },
    canJettyDel: () => {
      return currentUser && currentUser.permissions.some((a) => {
        return a == 'jetty_del'
      }) || currentUser?.role_type === 'Super'
    },

    canJettyMod: () => {
      return currentUser  && currentUser.permissions.some((a) => {
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
        return a == 'alertrule' || a == 'alertrule_list' || a == 'alertrule_list_company' || a == 'alertrule_list_tab'
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

    canTransactionsList: () => {
      
      return currentUser && currentUser.permissions.some((a) => {
        return a == 'transactions' || a == 'transactions_list' || a == 'transactions_list_company' || a == 'transactions_list_tab'
      }) || currentUser?.role_type === 'Super'
    },

    canAlertList: () => {
      return currentUser && currentUser.permissions.some((a) => {
        return a == 'alert' || a == 'alert_list' || a == 'alert_list_company' || a == 'alert_list_tab'
      }) || currentUser?.role_type === 'Super'
    },
    canReportDel: () => {
      return currentUser && currentUser.permissions.some((a) => {
        return a == 'report_del'
      }) || currentUser?.role_type === 'Super'
    },
    canReportTemplateDel: () => {
      return currentUser && currentUser.permissions.some((a) => {
        return a == 'reportTemplate_del'
      }) || currentUser?.role_type === 'Super'
    },

    canReportTemplateMod: () => {
      return currentUser && currentUser.permissions.some((a) => {
        return a == 'reportTemplate_mod'
      }) || currentUser?.role_type === 'Super'
    },
    canReportTemplateList: () => {
      return currentUser && currentUser.permissions.some((a) => {
        return a == 'reporttemplate_list'
      }) || currentUser?.role_type === 'Super'
    },
    
    canReportAdd: () => {
      return currentUser && currentUser.permissions.some((a) => {
        return a == 'report_add'
      }) || currentUser?.role_type === 'Super'
    },
    canReportAddWithTemplate: () => {
      return currentUser && currentUser.permissions.some((a) => {
        return a == 'report_add_template'
      }) || currentUser?.role_type === 'Super'
    },

    canReportList: () => {
      return currentUser && currentUser.permissions.some((a) => {
        return a == 'report' || a == 'report_list' 
      }) || currentUser?.role_type === 'Super'
    },


    canEOSTools: () => {

      var a= currentUser && currentUser.permissions.some((a) => {
        return a == 'alert' || a == 'alert_list' || a == 'alert_list_company' || a == 'alert_list_tab'
      }) || currentUser?.role_type === 'Super'


      var b =  currentUser && currentUser.permissions.some((a) => {
        return a == 'alertrule' || a == 'alertrule_list' || a == 'alertrule_list_company' || a == 'alertrule_list_tab'
      }) 
      return a || b

    },
  };
}
