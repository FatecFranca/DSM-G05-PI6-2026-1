const http = require('http');

const data = JSON.stringify({
  email: 'admin@commodities.com',
  password: 'admin123'
});

const options = {
  hostname: 'localhost',
  port: 3333,
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, res => {
  let responseBody = '';
  res.on('data', chunk => responseBody += chunk);
  res.on('end', () => console.log(responseBody));
});

req.on('error', e => console.error(e));
req.write(data);
req.end();
