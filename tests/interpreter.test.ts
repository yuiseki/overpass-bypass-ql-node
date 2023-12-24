import { parse } from '../src/parse';
import { interpreter } from '../src/interpreter';

describe('interpreter', () => {
  test('return string', async () => {
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
    select COUNT(*) from piyo where osm_id = $(id());
  };
  @overpass-bypass-ql */
  id=id();

out geom;
    `;
    const parsedQuery = parse(query);
    expect(parsedQuery).toHaveProperty('overpassQuery');
    const res = await interpreter(parsedQuery);
    expect(res).toBe('');
  });
});

