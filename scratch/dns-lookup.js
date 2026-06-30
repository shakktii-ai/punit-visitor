const https = require('https');

const url = 'https://cloudflare-dns.com/dns-query?name=cluster0.ek18u.mongodb.net&type=TXT';
const options = {
  headers: {
    'Accept': 'application/dns-json'
  }
};

https.get(url, options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('DNS Over HTTPS Response:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.error('Failed to parse response:', e);
    }
  });
}).on('error', (err) => {
  console.error('Error fetching DNS:', err);
});
