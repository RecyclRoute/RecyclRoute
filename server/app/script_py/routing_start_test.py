from routing import run_routing

run_routing(
    input_json="client/public/data/polygon_custom.json", 
    input_gpkg="client/src/data/SWISSTLM3D_no_height.gpkg", 
    start_node_coord_3857=(7.645041246899751, 47.52233114051978),
    output_dir="client/public/data"
)