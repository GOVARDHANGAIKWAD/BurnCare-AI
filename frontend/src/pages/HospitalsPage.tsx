import React, { useState, useEffect } from 'react';
import { MapPin, Phone, ExternalLink, ShieldAlert, Search, User, Filter, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet marker icon URL issue in React bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Burn Unit Marker Icon
const burnUnitIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export const HospitalsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hospitals' | 'doctors'>('hospitals');
  const [userLat, setUserLat] = useState<number>(18.5204); // Default Pune coordinates
  const [userLng, setUserLng] = useState<number>(73.8567);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [cityFilter, setCityFilter] = useState<string>('');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('');

  useEffect(() => {
    // Attempt geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLat(pos.coords.latitude);
          setUserLng(pos.coords.longitude);
        },
        () => {
          console.log("Geolocation permission denied. Using default coordinates.");
        }
      );
    }
  }, []);

  useEffect(() => {
    fetchHospitals();
    fetchDoctors();
  }, [userLat, userLng]);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/hospitals/nearby?lat=${userLat}&lng=${userLng}&radius_km=30`);
      if (res.ok) {
        const data = await res.json();
        setHospitals(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      let url = '/api/doctors?';
      if (cityFilter) url += `city=${encodeURIComponent(cityFilter)}&`;
      if (specialtyFilter) url += `specialty=${encodeURIComponent(specialtyFilter)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setDoctors(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDoctors();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 flex items-center gap-3">
            <MapPin className="w-8 h-8 text-teal-400" />
            Nearby Burn Centers & Specialized Doctors
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Locate specialized burn trauma units and plastic surgeons sorted by distance.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-800/80 p-1.5 rounded-xl border border-slate-700 self-start">
          <button
            onClick={() => setActiveTab('hospitals')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'hospitals' ? 'bg-teal-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            Hospitals & Burn Units ({hospitals.length})
          </button>
          <button
            onClick={() => setActiveTab('doctors')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'doctors' ? 'bg-teal-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            Specialized Doctors
          </button>
        </div>
      </div>

      {activeTab === 'hospitals' ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-3 glass-panel p-4 rounded-2xl h-[480px] flex flex-col space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300 px-1">
              <span className="font-bold flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-teal-400" />
                Interactive Map Location
              </span>
              <span className="text-[11px] text-teal-400 font-semibold">
                ● Red markers indicate Burn Units
              </span>
            </div>

            <div className="flex-1 rounded-xl overflow-hidden border border-slate-800">
              <MapContainer center={[userLat, userLng]} zoom={11} scrollWheelZoom={false}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {hospitals.map((h) => (
                  <Marker
                    key={h.id}
                    position={[h.lat, h.lng]}
                    icon={h.has_burn_unit ? burnUnitIcon : undefined}
                  >
                    <Popup>
                      <div className="text-slate-900 font-sans p-1">
                        <div className="font-bold text-sm">{h.name}</div>
                        <div className="text-xs text-slate-600">{h.address || h.city}</div>
                        {h.has_burn_unit && (
                          <span className="inline-block mt-1 bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded">
                            Specialized Burn ICU Unit
                          </span>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          {/* Hospitals List */}
          <div className="lg:col-span-2 space-y-4 max-h-[480px] overflow-y-auto pr-1">
            {loading ? (
              <div className="text-center text-xs text-slate-400 py-12">Querying medical database & OSM API...</div>
            ) : (
              hospitals.map((h) => (
                <div key={h.id} className="glass-card p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-slate-100 text-sm">{h.name}</h3>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{h.address || h.city}</p>
                    </div>
                    {h.distance_km !== undefined && (
                      <span className="text-xs font-mono font-bold text-teal-400 bg-slate-900 px-2 py-1 rounded-md border border-slate-700 flex-shrink-0">
                        {h.distance_km} km
                      </span>
                    )}
                  </div>

                  {h.has_burn_unit && (
                    <div className="inline-flex items-center space-x-1 text-[11px] font-bold text-red-400 bg-red-950/50 px-2.5 py-1 rounded-md border border-red-500/30">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Specialized Burn ICU Unit</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 pt-2 border-t border-slate-800">
                    <a
                      href={`tel:${h.phone}`}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 border border-slate-700"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Hospital</span>
                    </a>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${h.lat},${h.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 font-bold rounded-xl text-xs flex items-center justify-center space-x-1 border border-teal-500/30"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Directions</span>
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Doctors Tab */
        <div className="space-y-6">
          <form onSubmit={handleFilterSubmit} className="glass-panel p-4 rounded-2xl flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Filter by city (e.g. Pune, Bengaluru, Mumbai)..."
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div className="min-w-[180px]">
              <select
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
              >
                <option value="">All Specialties</option>
                <option value="burn_specialist">Burn Specialist</option>
                <option value="plastic_surgery">Plastic & Reconstructive Surgery</option>
              </select>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              Filter Doctors
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((d) => (
              <div key={d.id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-teal-500/10 rounded-xl text-teal-400">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">{d.name}</h3>
                    <p className="text-xs text-teal-400 capitalize font-semibold">{d.specialty.replace('_', ' ')}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400">City: <span className="text-slate-200 font-semibold">{d.city}</span></p>
                <a
                  href={`tel:${d.phone}`}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold rounded-xl text-xs flex items-center justify-center space-x-2 border border-slate-700"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call {d.phone}</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
