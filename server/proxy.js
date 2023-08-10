// proxy.js
const httpProxy = require('http-proxy');  
const minimist = require('minimist');  
const args = minimist(process.argv.slice(2))
  
const target = 'https://eosuat.southeastasia.cloudapp.azure.com/'; // 要转发到的HTTPS目标服务器  
const port = 80; 
//const target = args['target']
//const port = args['port']
  
httpProxy.createProxyServer({  
  target,  
  secure: false, // 是否使用安全连接  
  changeOrigin: true // 是否改变请求头中的 Origin  
}).on('error', (err) => {  
  console.error('Proxy error:', err);  
}).listen(port);