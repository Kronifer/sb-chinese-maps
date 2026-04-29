from depot.maps import MapGen
import os

guangzhou = MapGen("CAN", [112.953752,22.562874,114.053920,23.933623], "./guangdong-260418.osm.pbf", ".", RAM=16, places_suffix="CN", cities=["prefecture-level_city", "county", "county-level_city"], suburbs=["district"], neighborhoods=["subdistrict", "town", "township"], building_index_filter_size=70, building_tile_filter_size=50)

buildings_geojson = os.path.join(guangzhou.city_dir, "buildings.geojson")
cleaned_json = os.path.join(guangzhou.city_dir, "buildings_cleaned.json")

mapshaper_cmd = (
    f"node --max-old-space-size={guangzhou.RAM} $(which mapshaper) "
    f"{buildings_geojson} -proj {guangzhou.epsg} -snap 0.5 -clean "
    f"-filter 'this.area > {guangzhou.building_index_filter_size}' "
    f"-simplify dp interval=2 -proj wgs84 "
    f"-o precision=0.00001 {cleaned_json}"
)
guangzhou._run_command(mapshaper_cmd)
guangzhou._convert_to_game_format(cleaned_json)

guangzhou.generate_pmtiles()
guangzhou.add_labels()