[out:json];

area["name:en"="Tokyo"]->.tokyo_area;
(
  rel(area.tokyo_area)["admin_level"="7"];
);
map_to_area;

foreach->.r(
  nwr["amenity"="police"](area.r)->.polices;
  nwr["amenity"="hospital"](area.r)->.hospitals;
  nwr["amenity"="school"](area.r)->.schools;
  nwr["leisure"="park"](area.r)->.parks;

  rel(pivot.area.r)->.temp;
  .temp out body;
  .temp >;
  out skel;

  relation.temp;
  convert relation
  ::id = id(),
  ::=::,
  /* @overpass-bypass-ql
  number_of_affected_people = external "sqlite://tests/db/earthquake.sqlite3" {
    select COUNT(*) from "people"
    where status="affected" and "osm_id"=$(id());
  };
  @overpass-bypass-ql */
  /* @overpass-bypass-ql
  number_of_injured_people = external "sqlite://tests/db/earthquake.sqlite3" {
    select COUNT(*) from "people"
    where status="injured" and "osm_id"=$(id());
  };
  @overpass-bypass-ql */
  /* @overpass-bypass-ql
  number_of_dead_people = external "sqlite://tests/db/earthquake.sqlite3" {
    select COUNT(*) from "people"
    where status="dead" and "osm_id"=$(id());
  };
  @overpass-bypass-ql */
  /* @overpass-bypass-ql
  number_of_collapsed_buildings = external "sqlite://tests/db/earthquake.sqlite3" {
    select COUNT(*) from "buildings"
    where status="collapsed" and "osm_id"=$(id());
  };
  @overpass-bypass-ql */
  /* @overpass-bypass-ql
  number_of_damaged_buildings = external "sqlite://tests/db/earthquake.sqlite3" {
    select COUNT(*) from "buildings"
    where status="damaged" and "osm_id"=$(id());
  };
  @overpass-bypass-ql */
  /* @overpass-bypass-ql
  number_of_possibly_damaged_buildings = external "sqlite://tests/db/earthquake.sqlite3" {
    select COUNT(*) from "buildings"
    where status="possibly_damaged" and "osm_id"=$(id());
  };
  @overpass-bypass-ql */
  number_of_polices = polices.count(nwr),
  number_of_hospitals = hospitals.count(nwr),
  number_of_schools = schools.count(nwr),
  number_of_parks = parks.count(nwr);

  out;
);

out geom;
