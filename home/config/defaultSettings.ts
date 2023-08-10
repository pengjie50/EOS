import { ProLayoutProps } from '@ant-design/pro-components';

/**
 * @name
 */
const Settings: ProLayoutProps & {
  pwa?: boolean;
  logo?: string;
} = {
  navTheme: 'light',
  colorPrimary: '#5000B9',
  
  layout: 'mix',
 // splitMenus: true, // Cutting menu
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  title: 'EOS - Efficiency Optimization System',
  pwa: true,
  logo: '/logo.png',
  iconfontUrl: '',
  siderWidth: 280,
  token: {
   
    
   /* header: {
      colorHeaderTitle:"#fff",
      colorTextRightActionsItem:"#fff",
      colorBgHeader:'#5000B9' ,
    },
    sider: {
      colorTextCollapsedButtonHover:"#000",
      colorTextMenuItemHover:"#fff",
      colorBgMenuItemHover:"#000"


    }*/
    // Refer to the TS declaration, demo in the document, and modify the style through token
    //https://procomponents.ant.design/components/layout#%E9%80%9A%E8%BF%87-token-%E4%BF%AE%E6%94%B9%E6%A0%B7%E5%BC%8F
  },
};

export default Settings;




