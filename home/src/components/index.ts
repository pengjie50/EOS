/**
 * 这个文件作为组件的目录
 * 目的是统一管理对外输出的组件，方便分类
 */
/**
 * 布局组件
 */
import Footer from './Footer';
import { Question, SelectLang,Alert } from './RightContent';
import { AvatarDropdown, AvatarName } from './RightContent/AvatarDropdown';
import { createFromIconfontCN } from '@ant-design/icons'
import iconurl from '../../public/iconfont/iconfont'
var SvgIcon =createFromIconfontCN({
  // 该地址为iconfont中的项目地址，根据实际进行修改
  scriptUrl: iconurl
});
export { Footer, Question, SelectLang, AvatarDropdown, AvatarName, Alert, SvgIcon };
