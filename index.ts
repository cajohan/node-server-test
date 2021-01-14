import * as http from 'http';
import {IncomingMessage, ServerResponse} from 'http';
import * as p from 'path';
import * as url from 'url';
import * as fs from 'fs';

const server = http.createServer();
const publicDir = p.resolve(__dirname, 'public'); //__dirname为当前目录，这里是把两个参数合成一个的绝对路径
let cacheAge = 3600 * 24 * 365;

server.on('request', (request: IncomingMessage, response: ServerResponse) => {
  const {method, url: path, headers} = request;
  console.log(path);
  const {pathname, search} = url.parse(path);

  if (method !== 'GET') {
    response.statusCode = 405;
    response.end();
    return;
  }
  // response.setHeader('Content-Type', 'text/html;charset=utf-8');
  let filename = pathname.substr(1);
  if (filename === '') {
    filename = 'index.html';
  }
  fs.readFile(p.resolve(publicDir, filename), (error, data) => {
    if (error) {
      console.log(error);
      if (error.errno === -4058) {
        response.statusCode = 404;
        fs.readFile(p.resolve(publicDir, '404.html'), (error, data) => {
          response.end(data);
        });
        response.end();
      } else {
        response.statusCode = 500;
        response.end('服务器出错啦');
      }

    } else {
      //添加缓存
      response.setHeader('Cache-Control', `public,max-age=${cacheAge}`);
      //返回文件内容
      response.end(data);
    }
  });
});

server.listen(8888);



