import math
import requests

def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculates haversine distance in kilometers between two GPS coordinates."""
    R = 6371.0 # Earth radius in kilometers
    
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c

def fetch_openstreetmap_hospitals(lat: float, lng: float, radius_km: float = 15.0) -> list[dict]:
    """Fallback query to OpenStreetMap Overpass API for hospitals near given lat/lng."""
    try:
        radius_m = radius_km * 1000
        overpass_url = "https://overpass-api.de/api/interpreter"
        query = f"""
        [out:json][timeout:10];
        (
          node["amenity"="hospital"](around:{radius_m},{lat},{lng});
          way["amenity"="hospital"](around:{radius_m},{lat},{lng});
        );
        out center 15;
        """
        response = requests.post(overpass_url, data={"data": query}, timeout=4.0)
        if response.status_code == 200:
            data = response.json()
            results = []
            for element in data.get("elements", []):
                tags = element.get("tags", {})
                e_lat = element.get("lat") or element.get("center", {}).get("lat")
                e_lng = element.get("lon") or element.get("center", {}).get("lng")
                if e_lat and e_lng:
                    dist = haversine_distance(lat, lng, e_lat, e_lng)
                    name = tags.get("name", "Local Healthcare Center")
                    has_burn = "burn" in name.lower() or "trauma" in name.lower()
                    results.append({
                        "id": element.get("id"),
                        "name": name,
                        "type": "Hospital / Medical Center",
                        "city": tags.get("addr:city", "Nearby"),
                        "lat": e_lat,
                        "lng": e_lng,
                        "phone": tags.get("phone", "+91 1800 111 222"),
                        "address": tags.get("addr:full") or tags.get("addr:street", "OpenStreetMap Location"),
                        "has_burn_unit": has_burn,
                        "distance_km": round(dist, 2),
                        "doctors": []
                    })
            results.sort(key=lambda x: x["distance_km"])
            return results
    except Exception as e:
        print(f"OSM Overpass fallback error: {e}")
        
    return []
