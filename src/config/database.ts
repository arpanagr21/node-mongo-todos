const buildMongoUri = (): string => {
  const host = process.env.MONGO_HOST || 'localhost';
  const port = process.env.MONGO_PORT || '27017';
  const database = process.env.MONGO_DATABASE || 'tt';
  const username = process.env.MONGO_USERNAME;
  const password = process.env.MONGO_PASSWORD;

  if (username && password) {
    return `mongodb://${username}:${password}@${host}:${port}/${database}?authSource=admin`;
  }

  return `mongodb://${host}:${port}/${database}`;
};

export const databaseConfig = {
  uri: process.env.MONGO_URI || buildMongoUri(),
};
