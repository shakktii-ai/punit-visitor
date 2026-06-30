const mongoose = require('mongoose');

const uri = 'mongodb://vercel-admin-user-67abb3d6d4cafb788107ade9:gsICFuCERkWJaDq7@cluster0-shard-00-00.ek18u.mongodb.net:27017,cluster0-shard-00-01.ek18u.mongodb.net:27017,cluster0-shard-00-02.ek18u.mongodb.net:27017/visitor?ssl=true&replicaSet=atlas-10ovpx-shard-0&authSource=admin';

console.log('Connecting to MongoDB...');
mongoose.connect(uri)
  .then(() => {
    console.log('Connected successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection failed:', err);
    process.exit(1);
  });
