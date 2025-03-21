import { history } from '@umijs/max';
import { Button, Result } from 'antd';
import React from 'react';

const UnAccessPage: React.FC = () => (
  <Result
    status="403"
    title="403"
    subTitle="Sorry, you do not have access to this page."
    extra={
      <Button type="primary" onClick={() => history.back()}>
        Go Back
      </Button>
    }
  />
);

export default UnAccessPage;
