import { dbConnect } from './backend/lib/mongodb.js';
import Series from './backend/models/Series.js';
await dbConnect();
await Series.deleteMany({});
await Series.insertMany([
  { title: 'Solo Leveling', description: 'Action/Fantasy', cover: '/uploads/covers/solo.jpg', status: 'Complete', chapters: [{number:1,title:'Ch1',images:['/uploads/covers/solo.jpg']}]},
  { title: 'Tower of God', description: 'Adventure', cover: '/uploads/covers/tog.jpg', status: 'OnGoing', chapters: [{number:1,title:'Ch1',images:['/uploads/covers/tog.jpg']}]},
  { title: 'Eleceed', description: 'Action', cover: '/uploads/covers/eleceed.jpg', status: 'OnGoing', chapters: [{number:1,title:'Ch1',images:['/uploads/covers/eleceed.jpg']}]}
]);
console.log('seed done'); process.exit(0);
