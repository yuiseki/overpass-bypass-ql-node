export type BypassQuery = {
  key: string;
  source: string;
  query: string;
  asValue: string;
};

export type OverpassBypassQueryParsed = {
  overpassQuery: string;
  bypassQueries: BypassQuery[];
  bypassedOverpassQuery: string;
};

const parseBypassQuery = (lines: string[]): BypassQuery => {
  let key = '';
  let source = '';
  let bypassQuery = '';
  lines.forEach((line) => {
    // key and source line contains '=' and 'external'
    // example:
    //   fuga = external "sqlite://tests/db/fuga.sqlite3" {
    // key: fuga
    // source: "sqlite://tests/db/fuga.sqlite3"
    if (line.includes('=') && line.includes('external')) {
      const keyAndSource = line.split('=');
      key = keyAndSource[0].trim();
      // remove "external" and "{" and double quote
      source = keyAndSource[1].trim().replace('external', '').replace('{', '').replace(/"/g, '').trim();
      return;
    }
  });
  const queryLinesString = lines.join('\n');
  // extract query from '{' to '}'
  bypassQuery = queryLinesString.substring(queryLinesString.indexOf('{') + 1, queryLinesString.lastIndexOf('}')).trim();
  let bypassQueryAsValue = `${key} = 'external "${source}" { ${bypassQuery} };'`;
  // if stringAsValue contains $(), convert it to text concat
  if (bypassQueryAsValue.includes('$')) {
    // replace $(id()) to ' + id() + '
    // replace $(t["name"]) to ' + t["name"] + '
    bypassQueryAsValue = bypassQueryAsValue.replace(/\$\((.*)\)/g, "' + $1 + '");
  }
  // add original indent to bypassQueryAsValue
  // lines does not contain /*, so count index of any string without whitespace
  const indent = lines[0].substring(0, lines[0].search(/\S/));
  bypassQueryAsValue = indent + bypassQueryAsValue;
  // bypassQueryAsValue must finish with , (comma)
  bypassQueryAsValue = bypassQueryAsValue + ',';

  return {
    key: key,
    source: source,
    query: bypassQuery,
    asValue: bypassQueryAsValue,
  };
};

// OverpassBypassQuery -> OverpassBypassQueryParsed
export const parse = (query: string): OverpassBypassQueryParsed => {
  // extract SQL queries from OverpassBypassQuery
  const bypassQueries: BypassQuery[] = [];
  const bypassedQueryLines: string[] = [];
  if (query.includes('@overpass-bypass-ql')) {
    // extract bypassQueries from '/* @overpass-bypass-ql' to '@overpass-bypass-ql */'
    // example:
    /*
      \/* @overpass-bypass-ql
      fuga = external "sqlite://tests/db/fuga.sqlite3" {
        select COUNT(*) from fuga;
      };
      @overpass-bypass-ql *\/
    */
    /*
      key: fuga,
      source: "sqlite://tests/db/fuga.sqlite3",
      query: "select COUNT(*) from fuga;"
    */
    // Note: bypassQueries may be multiple
    const queryLines = query.split('\n');
    const bypassQueriesLines: string[][] = [];
    let bypassQueryLines: string[] = [];
    let isBypassQuery = false;
    queryLines.forEach((line) => {
      if (line.includes('/* @overpass-bypass-ql')) {
        isBypassQuery = true;
        return;
      }
      if (isBypassQuery) {
        if (line.includes('@overpass-bypass-ql */')) {
          isBypassQuery = false;
          bypassQueriesLines.push(bypassQueryLines);
          const bypassQuery = parseBypassQuery(bypassQueryLines);
          bypassQueries.push(bypassQuery);
          bypassQueryLines = [];
          bypassedQueryLines.push(bypassQuery.asValue);
          return;
        }
        bypassQueryLines.push(line);
      } else {
        bypassedQueryLines.push(line);
      }
    });
  }

  const bypassedOverpassQuery = bypassedQueryLines.join('\n');

  return {
    overpassQuery: query,
    bypassQueries: bypassQueries,
    bypassedOverpassQuery: bypassedOverpassQuery,
  };
};

