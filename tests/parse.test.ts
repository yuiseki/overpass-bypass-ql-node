import { parse } from '../src/parse';

describe('parse', () => {
  test('return OverpassBypassQueryParsed type', async () => {
    const res = parse('hoge');
    expect(res).toHaveProperty('overpassQuery');
    expect(res).toHaveProperty('bypassQueries');
    expect(res.overpassQuery).toBe('hoge');
    expect(res.bypassQueries).toStrictEqual([]);
  });
  test('return bypassQueries', async () => {
    const query = `
[out:json][timeout:30000];
area["name"="台東区"]->.here;

rel(pivot.area.here)->.temp;
.temp out body;
.temp >;
out skel;

relation.temp;
convert relation
  ::id=id(),
  ::=::,
  /* @overpass-bypass-ql
  number_of_fuga = external "sqlite://tests/db/fuga.sqlite3" {
    select COUNT(*) from fuga where osm_id = $(id());
  };
  @overpass-bypass-ql */
  /* @overpass-bypass-ql
  number_of_piyo = external "sqlite://tests/db/piyo.sqlite3" {
    select COUNT(*) from piyo where name = "$(t["name"])";
  };
  @overpass-bypass-ql */
  id=id();

out geom;
    `;
    const res = parse(query);
    expect(res).toHaveProperty('overpassQuery');
    expect(res).toHaveProperty('bypassQueries');
    expect(res.overpassQuery).toBe(query);
    expect(res.bypassQueries.length).toBe(2);
    expect(res.bypassQueries[0].key).toBe('number_of_fuga');
    expect(res.bypassQueries[0].source).toBe('sqlite://tests/db/fuga.sqlite3');
    expect(res.bypassQueries[0].query).toBe('select COUNT(*) from fuga where osm_id = $(id());');
    expect(res.bypassQueries[0].asValue).toBe(
      "  number_of_fuga = 'external \"sqlite://tests/db/fuga.sqlite3\" { select COUNT(*) from fuga where osm_id = ' + id() + '; };',",
    );
    expect(res.bypassQueries[1].key).toBe('number_of_piyo');
    expect(res.bypassQueries[1].source).toBe('sqlite://tests/db/piyo.sqlite3');
    expect(res.bypassQueries[1].query).toBe('select COUNT(*) from piyo where name = "$(t["name"])";');
    expect(res.bypassQueries[1].asValue).toBe(
      '  number_of_piyo = \'external "sqlite://tests/db/piyo.sqlite3" { select COUNT(*) from piyo where name = "\' + t["name"] + \'"; };\',',
    );
    expect(res.bypassedOverpassQuery).toBe(`
[out:json][timeout:30000];
area["name"="台東区"]->.here;

rel(pivot.area.here)->.temp;
.temp out body;
.temp >;
out skel;

relation.temp;
convert relation
  ::id=id(),
  ::=::,
  number_of_fuga = 'external "sqlite://tests/db/fuga.sqlite3" { select COUNT(*) from fuga where osm_id = ' + id() + '; };',
  number_of_piyo = 'external "sqlite://tests/db/piyo.sqlite3" { select COUNT(*) from piyo where name = "' + t["name"] + '"; };',
  id=id();

out geom;
    `);
  });
});

