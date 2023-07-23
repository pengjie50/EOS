/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access(initialState: { currentUser?: API.CurrentUser } | undefined) {
  const { currentUser } = initialState ?? {};

  
  return {
    canAdmin: (currentUser && currentUser.role_type === 'Super') || false,
    canDashboard: () => {
      if (currentUser && currentUser.permissions.some((a) => {
        return a == 'dashboard' || a == 'dashboard_company' || a == 'dashboard_tab'
      }) || currentUser?.role_type === 'Super') {
        return true
      } else {
        return false
      }
    },
    dashboard_tab: () => {

     
     
      if (currentUser && currentUser?.permissions.some((a) => {
        return a == 'dashboard_tab'
      })) {
        return true
      } else {
        return false
      }
     

    },
    canBlockchain: () => {

      if ((currentUser && currentUser.permissions.some((a) => {
        return a == 'blockchain'
      }) || currentUser?.role_type === 'Super')) {
        return true
      } else {
        return false
      }


      
    },
    alertrule_list_tab: () => {

      if (currentUser && currentUser.permissions.some((a) => {
        return a == 'alertrule_list_tab'
      })) {
        return true
      } else {
        return false
      }
      
    },
    transactions_list_tab: () => {
      if (currentUser && currentUser.permissions.some((a) => {
        return a == 'transactions_list_tab'
      })) {
        return true
      } else {
        return false
      }
      
    },

    jetty_list_tab: () => {
      if (currentUser && currentUser.permissions.some((a) => {
        return a == 'jetty_list_tab'
      })) {
        return true
      } else {
        return false
      }
     
    },

    alert_list_tab: () => {
      if (currentUser && currentUser.permissions.some((a) => {
        return a == 'alert_list_tab'
      })) {
        return true
      } else {
        return false
      }
     
    },
    canInterfacedataAdd: () => {
      if ((currentUser && currentUser.permissions.some((a) => {
        return a == 'interfacedata_add'
      })) || currentUser?.role_type === 'Super') {
        return true
      } else {
        return false
      }
     
    },
    canInterfacedataList: () => {
      if ((currentUser && currentUser.permissions.some((a) => {
        return a == 'interfacedata_list'
      })) || currentUser?.role_type === 'Super') {
        return true
      } else {
        return false
      }
     
    },
    canInterfacedataDel: () => {
      if ((currentUser && currentUser.permissions.some((a) => {
        return a == 'interfacedata_del'
      })) || currentUser?.role_type === 'Super') {
        return true
      } else {
        return false
      }
      
    },

    canInterfacedataMod: () => {
      if ((currentUser && currentUser.permissions.some((a) => {
        return a == 'interfacedata_mod'
      })) || currentUser?.role_type === 'Super') {
        return true
      } else {
        return false
      }
      
    },
    canJettyAdd: () => {
      if ((currentUser && currentUser.permissions.some((a) => {
        return a == 'jetty_add'
      })) || currentUser?.role_type === 'Super') {
        return true
      } else {
        return false
      }
     
    },
    canJettyList: () => {
      if ((currentUser && currentUser.permissions.some((a) => {
        return a == 'jetty' || a == 'jetty_list' || a == 'jetty_list_terminal'
      })) || currentUser?.role_type === 'Super') {
        return true
      } else {
        return false
      }
      
    },
    canJettyDel: () => {
      if ((currentUser && currentUser.permissions.some((a) => {
        return a == 'jetty_del'
      })) || currentUser?.role_type === 'Super') {
        return true
      } else {
        return false
      }
      
    },

    canJettyMod: () => {
      if ((currentUser && currentUser.permissions.some((a) => {
        return a == 'jetty_mod'
      })) || currentUser?.role_type === 'Super') {
        return true
      } else {
        return false
      }
     
    },
    canAlertruleAdd: () => {
      if ((currentUser && currentUser.permissions.some((a) => {
        return a == 'alertrule_add'
      })) || currentUser?.role_type === 'Super') {
        return true
      } else {
        return false
      }
     
    },
    canAlertruleList: () => {
      if ((currentUser && currentUser.permissions.some((a) => {
        return a == 'alertrule' || a == 'alertrule_list' || a == 'alertrule_list_company' || a == 'alertrule_list_tab'
      })) || currentUser?.role_type === 'Super') {
        return true
      } else {
        return false
      }
      
    },
    canAlertruleDel: () => {
      if ((currentUser && currentUser.permissions.some((a) => {
        return a == 'alertrule_del'
      })) || currentUser?.role_type === 'Super') {
        return true
      } else {
        return false
      }
      
    },
    
    canAlertruleMod: () => {
      if ((currentUser && currentUser.permissions.some((a) => {
        return a == 'alertrule_mod'
      })) || currentUser?.role_type === 'Super') {
        return true
      } else {
        return false
      }
      
    },


    canAlertDel: () => {
      if ((currentUser && currentUser.permissions.some((a) => {
        return a == 'alert_del'
      })) || currentUser?.role_type === 'Super') {
        return true
      } else {
        return false
      }
      
    },

    canAlertMod: () => {
      if ((currentUser && currentUser.permissions.some((a) => {
        return a == 'alert_mod'
      })) || currentUser?.role_type === 'Super') {
        return true
      } else {
        return false
      }
      
    },

    canTransactionsList: () => {
      if ((currentUser && currentUser.permissions.some((a) => {
        return a == 'transactions' || a == 'transactions_list' || a == 'transactions_list_company' || a == 'transactions_list_tab'
      })) || currentUser?.role_type === 'Super') {
        return true
      } else {
        return false
      }
     
    },

    canAlertList: () => {
      if ((currentUser && currentUser.permissions.some((a) => {
        return a == 'alert' || a == 'alert_list' || a == 'alert_list_company' || a == 'alert_list_tab'
      })) || currentUser?.role_type === 'Super') {
        return true
      } else {
        return false
      }
     
    },
    canReportDel: () => {
      if ((currentUser && currentUser.permissions.some((a) => {
        return a == 'report_del'
      })) || currentUser?.role_type === 'Super') {
        return true
      } else {
        return false
      }
      
    },
    canReportTemplateDel: () => {
      if ((currentUser && currentUser.permissions.some((a) => {
        return a == 'reportTemplate_del'
      })) || currentUser?.role_type === 'Super') {
        return true
      } else {
        return false
      }
     
    },

    canReportTemplateMod: () => {
      if ((currentUser && currentUser.permissions.some((a) => {
        return a == 'reportTemplate_mod'
      })) || currentUser?.role_type === 'Super') {
        return true
      } else {
        return false
      }
     
    },
    canReportTemplateList: () => {
      if ((currentUser && currentUser.permissions.some((a) => {
        return a == 'reporttemplate_list'
      })) || currentUser?.role_type === 'Super') {
        return true
      } else {
        return false
      }
      
    },
    
    canReportAdd: () => {
      if ((currentUser && currentUser.permissions.some((a) => {
        return a == 'report_add'
      })) || currentUser?.role_type === 'Super') {
        return true
      } else {
        return false
      }
     
    },
    canReportAddWithTemplate: () => {
      if ((currentUser && currentUser.permissions.some((a) => {
        return a == 'report_add_template'
      })) || currentUser?.role_type === 'Super') {
        return true
      } else {
        return false
      }
      
    },

    canReportList: () => {
      if ((currentUser && currentUser.permissions.some((a) => {
        return a == 'report' || a == 'report_list'
      })) || currentUser?.role_type === 'Super') {
        return true
      } else {
        return false
      }
      
    },


    canEOSTools: () => {
      
      var a= currentUser && currentUser.permissions.some((a) => {
        return a == 'alert' || a == 'alert_list' || a == 'alert_list_company' || a == 'alert_list_tab'
      }) || currentUser?.role_type === 'Super' || false


      var b =  currentUser && currentUser.permissions.some((a) => {
        return a == 'alertrule' || a == 'alertrule_list' || a == 'alertrule_list_company' || a == 'alertrule_list_tab'
      }) || false

      if (a || b) {
        return true
      } else {
        return false
      }
     

    },
  };
}
