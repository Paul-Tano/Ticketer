const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/admin/concerts',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log(res.statusCode, body));
});
req.write(JSON.stringify({
  title: "Test", description: "Desc", band_id: "69fbf04d1c3898227fd2469b", genre_id: "69fbf0df1c3898227fd246a4", date: "2026-07-01", time: "14:00", location: "Paris", price: 10000, availableTickets: 100, totalTickets: 100, image: "test.jpg"
}));
req.end();
