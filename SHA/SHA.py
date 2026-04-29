from depot.maps import MapGen
import os

shanghai = MapGen("SHA", [120.847025,30.675824,121.966090,31.872376], "./shanghai-latest.osm.pbf", ".", RAM=24, places_suffix="CN", cities=["prefecture-level_city", "district"], suburbs=["subdistrict", "county", "county-level_city"], neighborhoods=["town", "township", "neighbourhood", "village"], building_index_filter_size=50, building_tile_filter_size=50, building_index_simplification=2, building_tile_simplification=1, buildings_geojson="./SHA/buildings.geojson")
shanghai.run_all()