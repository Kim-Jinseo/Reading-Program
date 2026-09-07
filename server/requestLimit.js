// One shared, atomic counter operation on the normal path. MongoDB's _id
// uniqueness handles concurrent first requests across server instances.
export async function consumeRequest(collection, id, maximum, expiresAt) {
  const update = { $inc: { count: 1 }, $setOnInsert: { expiresAt } };
  const options = { upsert: true, returnDocument: 'after', includeResultMetadata: false, projection: { count: 1 } };
  let row;
  try {
    row = await collection.findOneAndUpdate({ _id: id }, update, options);
  } catch (error) {
    if (error.code !== 11000) throw error;
    row = await collection.findOneAndUpdate({ _id: id }, update, { ...options, upsert: false });
  }
  return Number.isSafeInteger(row?.count) && row.count > 0 && row.count <= maximum;
}
