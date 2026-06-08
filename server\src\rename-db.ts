import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/music-platform';

async function renameDb() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db!;
  const collections = await db.listCollections().toArray();

  for (const col of collections) {
    const name = col.name;
    const collection = db.collection(name);
    const docs = await collection.find({}).toArray();
    let updated = 0;

    for (const doc of docs) {
      const update: Record<string, unknown> = {};
      let changed = false;

      for (const [key, value] of Object.entries(doc)) {
        if (typeof value === 'string' && value.includes('MusicApp')) {
          update[key] = value.replaceAll('MusicApp', 'Aacoustix');
          changed = true;
        }
      }

      if (changed) {
        await collection.updateOne({ _id: doc._id }, { $set: update });
        updated++;
      }
    }

    if (updated > 0) {
      console.log(`  ${name}: ${updated} document(s) updated`);
    }
  }

  console.log('Done!');
  await mongoose.disconnect();
}

renameDb().catch(err => { console.error(err); process.exit(1); });
