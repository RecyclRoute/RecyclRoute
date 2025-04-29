from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from server.app.script_py.routing import run_routing
import json
import tempfile

# Initialize FastAPI app
# use Command "uvicorn server.app.main2:app --reload --port 7999" to startup
app = FastAPI()

# Add CORS middleware to allow requests from your frontend
origins = [
    "http://localhost:3000", "http://localhost:8000"  # Your React app running locally
    # You can add other origins here if needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows access from the frontend origin
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],  # Added DELETE here too
    allow_headers=["*"],  # Allow all headers
)

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI!"}




@app.post("/dummy")
async def dummy_endpoint(request: Request):
    data = await request.json()

    # Extract geometries from request
    polygon_geojson = data.get("polygon_geometry")
    point = data.get("point_geometry", {}).get("coordinates")

    if not polygon_geojson or not point:
        return {"error": "Missing polygon or point geometry in the request."}

    # Save polygon to temporary GeoJSON file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".json", mode="w") as tmp_file:
        json.dump(polygon_geojson, tmp_file)
        tmp_file_path = tmp_file.name

    # Call routing function with dynamic input
    result = run_routing(
        input_json=tmp_file_path,
        input_gpkg="client/src/data/SWISSTLM3D_no_height.gpkg",
        start_node_coord_3857=tuple(point),  # expecting (x, y)
        output_dir="client/public/data"
    )

    return {
        "status": "Routing completed",
        "input_polygon_file": tmp_file_path,
        "point_used": point,
        "routing_result": result  # optional, if run_routing returns anything
    }

@app.get("/test")
async def run_default_routing():
    result = run_routing(
        input_json="client/public/data/polygon_custom.json", 
        input_gpkg="client/src/data/SWISSTLM3D_no_height.gpkg", 
        start_node_coord_3857=(7.585881, 47.5506036),
        output_dir="client/public/data"
    )

    return {
        "status": "done",
    }


