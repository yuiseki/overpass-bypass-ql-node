import { executeExternalQuerySqlite } from './executor/sqlite';
import { OverpassBypassQueryParsed } from './parse';

export const executeExternalQuery = async (source: string, query: string): Promise<string> => {
  const protocol = source.split('://')[0];
  switch (protocol) {
    case 'sqlite':
      return await executeExternalQuerySqlite(source, query);
    default:
      throw new Error('unknown protocol:' + protocol);
  }
};

export const interpreter = async (query: OverpassBypassQueryParsed): Promise<string> => {
  // call overpass api by query.byPassedOverpassQuery
  const overpassQuery = query.bypassedOverpassQuery;
  const overpassResponse = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: overpassQuery,
  });
  if (!overpassResponse.ok) {
    throw new Error('overpass api call failed');
  }
  const overpassResponseJson = await overpassResponse.json();
  // for overpassResponseJson.elements
  for (const element of overpassResponseJson.elements) {
    // did element has tag?
    if (!element.tags) {
      continue;
    }
    // for keys of element.tags
    for (const key of Object.keys(element.tags)) {
      // is element.tags[key] has external query?
      if (element.tags[key].includes('external')) {
        //console.log(element.tags[key]);
        // detect source
        // source is like 'sqlite://tests/db/fuga.sqlite3'
        // extract from external "sqlite://tests/db/fuga.sqlite3" { ...
        // keyword external and {
        const source = element.tags[key].split('external')[1].split('{')[0].trim().replace(/"/g, '');
        // detect query
        // query is like 'select COUNT(*) from fuga;'
        // extract from external "sqlite://tests/db/fuga.sqlite3" { select COUNT(*) from fuga; };
        // keyword { and };
        const query = element.tags[key].split('{')[1].split('}')[0].trim();
        element.tags[key] = await executeExternalQuery(source, query);
      }
    }
    console.log(element.tags);
  }

  return '';
};

