from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from server.app.script_py.routing import run_routing
import json
import tempfile
import httpx

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





@app.post("/calculate")
async def calculate(request: Request):
    data = await request.json()

    print("Received data:", data)

    polygon_geojson = data.get("perimeter")
    point = data.get("point_geometry", {}).get("coordinates")
    project_name = data.get("name")  # ⬅️ Projektname für Benachrichtigung

    if not polygon_geojson or not point:
        return {"error": "Missing polygon or point geometry in the request."}

    wrapped_polygon = { "perimeter": polygon_geojson }

    with tempfile.NamedTemporaryFile(delete=False, suffix=".json", mode="w") as tmp_file:
        json.dump(wrapped_polygon, tmp_file)
        tmp_file_path = tmp_file.name

    print(f"Saved polygon file to: {tmp_file_path}")

    with open(tmp_file_path, "r") as f:
        print("Written JSON content:", f.read())

    result = run_routing(
        input_json=tmp_file_path,
        input_gpkg="client/src/data/SWISSTLM3D_no_height.gpkg",
        start_node_coord_3857=point,
        output_dir="client/public/data"
    )

    
    try:
        async with httpx.AsyncClient() as client:
            notify_response = await client.post(
                "http://localhost:8000/notifyCalculationDone",
                json={"project_name": project_name}
            )
            print(f"Benachrichtigung gesendet: {notify_response.status_code}")
    except Exception as e:
        print(f"Fehler beim Benachrichtigen: {e}")

    return {
        "status": "Routing completed",
        "input_polygon_file": tmp_file_path,
        "point_used": point,
        "routing_result": result
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
