import Database from 'better-sqlite3';

export const executeExternalQuerySqlite = async (source: string, query: string): Promise<string> => {
  const currentDir = process.cwd();
  const dbPath = source.split('://')[1];
  // consider absolute path
  const dbAbsolutePath = currentDir + '/' + dbPath;
  console.info(dbAbsolutePath);
  const db = new Database(dbAbsolutePath);
  console.info(query);
  const result = db.prepare(query).get();
  console.info(result);
  if (query.includes('COUNT')) {
    // @ts-expect-error: TS18046: because 'result' is of type 'unknown'.
    return result['COUNT(*)'] as unknown;
  }
  // @ts-expect-error: TS18046: because 'result' is of type 'unknown'.
  return result;
};

