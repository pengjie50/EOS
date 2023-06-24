import React, { useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Input, Upload, message } from 'antd';
import { FormattedMessage, useIntl } from '@umijs/max';
import { isPC } from "@/utils/utils";
import  {
  ProFormDependency,
  ProFormFieldSet,
  ProFormSelect,
  ProFormText,
  ProCard,
  PageContainer,
  ProFormTextArea,
  ProForm
} from '@ant-design/pro-components';
import { useRequest } from 'umi';
import { queryCurrent } from '../../../system/user/service';


import { updateUser, uploadFile, checkEmail } from '../../../system/user/service';
import { currentUser } from '../../../../services/ant-design-pro/api';



const validatorPhone = (rule: any, value: string[], callback: (message?: string) => void) => {
  if (!value[0]) {
    callback('Please input your area code!');
  }
  if (!value[1]) {
    callback('Please input your phone number!');
  }
  callback();
};

// 参考链接：https://www.jianshu.com/p/f356f050b3c9
const handleBeforeUpload = (file) => {
  console.log('smyhvae handleBeforeUpload file:' + JSON.stringify(file));
  console.log('smyhvae handleBeforeUpload file.file:' + JSON.stringify(file.file));
  console.log('smyhvae handleBeforeUpload file type:' + JSON.stringify(file.type));

  //限制图片 格式、size、分辨率
  const isJPG = file.type === 'image/jpeg';
  const isJPEG = file.type === 'image/jpeg';
  const isGIF = file.type === 'image/gif';
  const isPNG = file.type === 'image/png';
  const isLt2M = file.size / 1024 / 1024 < 1;
  if (!(isJPG || isJPEG || isPNG)) {
    Modal.error({
      title: 'Only images in JPG, JPEG, and PNG formats can be uploaded~',
    });
  } else if (!isLt2M) {
    Modal.error({
      title: 'The image exceeds the 1M limit and cannot be uploaded~',
    });
  }
  return (isJPG || isJPEG || isPNG) && isLt2M;
};
// checkImageWH  返回一个promise  检测通过返回resolve  失败返回reject阻止图片上传
const checkImageWH=(file)=>{
  return new Promise(function (resolve, reject) {
    let filereader = new FileReader();
    filereader.onload = (e) => {
      let src = e.target.result;
      const image = new Image();
      image.onload = function () {
        // 获取图片的宽高
        file.width = this.width;
        file.height = this.height;
        resolve();
      };
      image.onerror = reject;
      image.src = src;
    };
    filereader.readAsDataURL(file);
  });
}
// 头像组件 方便以后独立，增加裁剪之类的功能
const AvatarView = ({ useravatar, userid, username }: { useravatar: string; userid: string; username: string }) => {
  const [fileList, setFileList] = useState([]);
  const getAvatarURL = () => {
    if (useravatar) {
     
      return useravatar
    
    } else {
      const url = 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png';
      return url;
    }
    return '';
  };


  const [avatar, setAvatar] = useState(getAvatarURL());

  const onChange=(info)=> {
    const { status } = info.file;
    setFileList([])
   
    if (status !== 'removed') {
     // setFileList([ info.fileList[info.fileList.length - 1]])
       
      onPreview(info.fileList[info.fileList.length - 1])
    }
  }



  
  const onPreview = async (file: { originFileObj: Blob; }) => {
    let src="" ;
    if (!src) {
      src = await new Promise(resolve => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }


    if (file.originFileObj) {
      const formData = new FormData();
      formData.append('files', file.originFileObj) //文件上传格式
    
      uploadFile(formData).then(res => {
        new Promise((resolve, _) => {
          resolve(res)
        }).then(savedfile => {
         
          updateUser({
            id: userid,
            avatar: savedfile.data,
          }).then(() => {
           
            message.success(<FormattedMessage
              id="pages.modifySuccessful"
              defaultMessage="Modify is successful"
            />);
          })
         
        })
      })

    } 

    setAvatar(src);
   
  };

  return (<>
    <div style={{ width: "100%", textAlign: "center" }}></div>
    <div className="my-font-size" style={{ width: "100%", textAlign: "center", position: "relative", lineHeight:"350px" }}>
      {/*<img style={{ width: "200px" }} src={avatar} alt="avatar" />*/}
      <div style={{ color: "#000", display: "inline-block",  width: "200px", backgroundColor: "#b0deff", borderRadius: "50%", top: 0, right: 0, fontSize: 100, fontWeight: "bolder", height: '200px', lineHeight: '180px', textAlign: 'center' }}>

        {username.slice(0,2).toUpperCase()}
      </div>
    </div>

   
    
      <ProCard layout="center">

        <Upload style={{ width: "100%", textAlign: "center" }} showUploadList={false} action=""

          fileList={fileList}
          onChange={onChange}
        >
          <div>
          {/*<Button>
              <UploadOutlined />
              <FormattedMessage
                id="pages.userSet.uploadAvatar"
                defaultMessage="Upload Avatar"
              />
            </Button>*/ }
          </div>
        </Upload>
      </ProCard>

    
  </>)
};

const BaseView: React.FC = () => {
  const { data: currentUser, loading } = useRequest(() => {
    return queryCurrent();
  });
  const intl = useIntl();
  const [isMP, setIsMP] = useState<boolean>(!isPC());
  const emailCheck = (rule: any, value: any, callback: (arg0: string | undefined) => void) => {

    if (currentUser?.email == value) {
      callback(undefined);
    }
    checkEmail({ email: value }).then((res) => {
      if (res.data == true) {

        callback(intl.formatMessage({
          id: 'pages.user.emailIsUse',
          defaultMessage: 'This email is already in use',
        }))
      } else {
        callback(undefined); // 必须返回一个callback
      }
    });




  }

  const handleFinish = async (values: { [key: string]: any; } | undefined) => {
    if (values) {
      values.id = currentUser?.id
    }
    
    await updateUser({ ...values });
    message.success(<FormattedMessage
      id="pages.modifySuccessfulX"
      defaultMessage="User Profile modified successfully"
    />);
   // message.success('更新基本信息成功');
  };
  return (
    <PageContainer header={{
     
      breadcrumb: {},
    }}>
      <ProCard style={{ marginBlockStart: 8 }} gutter={8} wrap={isMP ? true : false}>
        {loading ? null : (
        
          [ <ProCard colSpan={isMP?24:12}>
          
        
            <ProForm
              autoFocusFirstInput={false}
              validateTrigger={['onBlur']}
              layout="vertical"
              onFinish={handleFinish}
              submitter={{
                searchConfig: {
                  submitText: <FormattedMessage
                    id="pages.update"
                    defaultMessage="Modify"
                  />,
                },
                render: (_, dom) => null//dom[1],
              }}
              initialValues={{
                ...currentUser
               
              }}
              hideRequiredMark
            >
             
             
             
              <ProFormText
                disabled={true}
                name="email"
                rules={[
                
                  {
                    pattern: /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/, message: (
                      <FormattedMessage
                        id="pages.user.rules.incorrectEmailFormat"
                        defaultMessage="Incorrect email format"
                      />
                    )
                  },
                  { validator: emailCheck }
                ]}
                label={<FormattedMessage
                  id="pages.user.xxx"
                  defaultMessage="Email Address"
                />}

              />
              <ProFormText
                disabled={true }
                name="role_name"
                label={<FormattedMessage
                  id="pages.user.xxx"
                  defaultMessage="Assigned User Profile"
                />}

              />

              <ProFormText
                disabled={true}
                name="company_name"
                label={<FormattedMessage
                  id="pages.user.xxx"
                  defaultMessage="Organization Name "
                />}

              />
              
            </ProForm>
          </ProCard>
             ,<ProCard colSpan={isMP ? 24 : 12}>
               <AvatarView useravatar={currentUser?.avatar} userid={currentUser?.id} username={currentUser?.username}  />
          </ProCard>]
        
      )}
      </ProCard>
      </PageContainer>
  );
};

export default BaseView;
