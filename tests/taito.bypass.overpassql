      [out:json][timeout:30000];
      area["name"="台東区"]->.here;

      nwr["amenity"="police"](area.here)->.polices;
      nwr["amenity"="hospital"](area.here)->.hospitals;
      nwr["amenity"="school"](area.here)->.schools;
      nwr["leisure"="park"](area.here)->.parks;

      rel(pivot.area.here)->.temp;
      .temp out body;
      .temp >;
      out skel;

      relation.temp;
      convert relation
        ::id = id(),
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
        number_of_polices = polices.count(nwr),
        number_of_hospitals = hospitals.count(nwr),
        number_of_schools = schools.count(nwr),
        number_of_parks = parks.count(nwr);

      out geom;