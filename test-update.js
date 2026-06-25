const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/admin/concerts',
  method: 'GET'
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    const match = body.match(/\/admin\/concerts\/([a-f0-9]{24})\/edit/);
    if(match) {
      console.log("Found ID:", match[1]);
    } else {
      console.log("No concert found");
    }
  });
});
req.end();
