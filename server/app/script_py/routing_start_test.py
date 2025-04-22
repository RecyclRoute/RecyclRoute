from routing import run_routing

run_routing(
    input_json="client/public/data/polygon_custom.json", 
    input_gpkg="client/src/data/SWISSTLM3D_no_height.gpkg", 
    start_node_coord_3857=(7.585881, 47.5506036),
    output_dir="client/public/data"
)
