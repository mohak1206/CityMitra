import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation, ChevronRight, Map as MapIcon } from "lucide-react";
import { StatusBadge, IssueTypeTag } from "../ui";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Default center (Mumbai) - [lat, lng] for Leaflet
const DEFAULT_CENTER = [19.076, 72.8777];

// Status colors for markers
const statusColors = {
  open: "#EAB308",
  "in-progress": "#3B82F6",
  flagged: "#EF4444",
  resolved: "#22C55E",
  pending: "#6B7280",
};

// Fix Leaflet default icon
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Create custom numbered icon
const createNumberedIcon = (number, color) => {
  return L.divIcon({
    className: "custom-numbered-marker",
    html: `<div style="
      background: ${color};
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
      border: 3px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    ">${number}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

// Map bounds fitter component
function MapFitter({ issues, flyToIssue }) {
  const map = useMap();
  
  useEffect(() => {
    if (issues.length > 0) {
      const validIssues = issues.filter(i => i.location?.lat && i.location?.lng);
      if (validIssues.length > 0) {
        const bounds = L.latLngBounds(validIssues.map(i => [i.location.lat, i.location.lng]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }
  }, [issues, map]);

  // Fly to specific issue when selected
  useEffect(() => {
    if (flyToIssue?.location?.lat && flyToIssue?.location?.lng) {
      map.flyTo([flyToIssue.location.lat, flyToIssue.location.lng], 16, {
        duration: 1.5
      });
    }
  }, [flyToIssue, map]);
  
  return null;
}

export default function MapView({ issues, onSelectIssue, onOpenIssue }) {
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [activeMarker, setActiveMarker] = useState(null);
  const [flyToIssue, setFlyToIssue] = useState(null);

  // Single click: focus on map (fly to location)
  const handleSingleClick = useCallback((issue) => {
    setSelectedIssue(issue);
    setFlyToIssue(issue);
  }, []);

  // Double click: open issue detail
  const handleDoubleClick = useCallback((issue) => {
    setSelectedIssue(issue);
    onOpenIssue?.(issue);
  }, [onOpenIssue]);

  // Handle marker click
  const handleMarkerClick = (issue, index) => {
    setActiveMarker(index);
    setSelectedIssue(issue);
    onSelectIssue(issue);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative bg-cream border-2 border-cream-muted shadow-paper overflow-hidden h-[600px]"
        >
          {/* Map Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-slate/90 via-slate/60 to-transparent p-4 pointer-events-none">
            <div className="flex items-center gap-2 pointer-events-auto">
              <div className="w-8 h-8 bg-blueprint/20 backdrop-blur-sm flex items-center justify-center">
                <MapIcon className="w-4 h-4 text-blueprint" />
              </div>
              <span className="font-display text-sm font-semibold text-cream">
                Interactive Map ({issues.length} issues)
              </span>
            </div>
          </div>

          {/* Leaflet Map */}
          <MapContainer
            center={DEFAULT_CENTER}
            zoom={12}
            style={{ width: '100%', height: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapFitter issues={issues} flyToIssue={flyToIssue} />
            {issues.map((issue, index) => {
              if (!issue.location?.lat || !issue.location?.lng) return null;
              const color = statusColors[issue.status] || statusColors.open;
              return (
                <Marker
                  key={issue.id}
                  position={[issue.location.lat, issue.location.lng]}
                  icon={createNumberedIcon(index + 1, color)}
                  eventHandlers={{
                    click: () => handleMarkerClick(issue, index),
                  }}
                >
                  <Popup>
                    <div className="p-2 min-w-[200px]">
                      <strong className="text-slate">Issue #{index + 1}</strong>
                      <p className="text-sm text-slate-muted mt-1">
                        {issue.type || "Unknown"} - {issue.status}
                      </p>
                      <p className="text-xs text-slate-muted/70 mt-1">
                        {issue.location.address?.substring(0, 30) || "No address"}...
                      </p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Issue count badge */}
          <div className="absolute bottom-4 left-4 bg-slate/90 backdrop-blur-sm px-4 py-2 border border-cream/20 z-[1000]">
            <span className="font-display text-sm text-cream">
              <span className="font-bold">{issues.filter(i => i.location?.lat).length}</span> plotted
            </span>
          </div>

          {/* Legend - moved to top-right to avoid overlap */}
          <div className="absolute top-16 right-4 bg-cream/95 backdrop-blur-sm p-3 border border-cream-muted z-[2000] shadow-lg">
            <div className="text-xs font-display text-slate mb-2 font-semibold">Status</div>
            <div className="space-y-1">
              {Object.entries(statusColors).map(([status, color]) => (
                <div key={status} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs text-slate-muted capitalize">{status}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <SidePanel
        issues={issues}
        onSingleClick={handleSingleClick}
        onDoubleClick={handleDoubleClick}
        selectedIssue={selectedIssue}
      />
    </div>
  );
}

function SidePanel({ issues, onSingleClick, onDoubleClick, selectedIssue }) {
  const [clickTimer, setClickTimer] = useState(null);
  const [lastClickIssue, setLastClickIssue] = useState(null);

  const handleClick = (issue) => {
    if (clickTimer && lastClickIssue?.id === issue.id) {
      // Double click detected
      clearTimeout(clickTimer);
      setClickTimer(null);
      setLastClickIssue(null);
      onDoubleClick(issue);
    } else {
      // Single click - wait to see if it's a double click
      setLastClickIssue(issue);
      const timer = setTimeout(() => {
        onSingleClick(issue);
        setClickTimer(null);
        setLastClickIssue(null);
      }, 250); // 250ms delay to detect double click
      setClickTimer(timer);
    }
  };

  return (
    <div className="lg:col-span-1">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative bg-cream border-2 border-cream-muted h-[600px] overflow-hidden flex flex-col shadow-paper"
      >
        {/* Header */}
        <div className="p-5 border-b-2 border-cream-muted">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 flex items-center justify-center">
              <Navigation className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-slate">
                Issues List
              </h3>
              <p className="text-slate-muted font-body text-xs">
                Click to focus • Double-click to open
              </p>
            </div>
          </div>
        </div>

        {/* Issues list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <AnimatePresence>
            {issues.map((issue, index) => (
              <motion.button
                key={issue.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleClick(issue)}
                whileHover={{ x: 4 }}
                className={`group w-full text-left p-3 bg-cream border-2 transition-all duration-200 ${
                  selectedIssue?.id === issue.id 
                    ? 'border-blueprint bg-blueprint/5' 
                    : 'border-cream-muted hover:border-blueprint/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Number badge */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{
                      backgroundColor:
                        statusColors[issue.status] || statusColors.open,
                    }}
                  >
                    {index + 1}
                  </div>

                  <div className="relative w-14 h-14 shrink-0">
                    <img
                      src={issue.imageUrl || "https://via.placeholder.com/150"}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 border border-cream-muted" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <IssueTypeTag type={issue.type} size="sm" />
                    <p className="text-slate text-sm mt-1.5 line-clamp-1 font-body">
                      {issue.location?.address || "Unknown Location"}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <StatusBadge status={issue.status} size="sm" />
                      <span className="text-xs text-slate-muted font-display">
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-muted opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                </div>
              </motion.button>
            ))}
          </AnimatePresence>

          {issues.length === 0 && (
            <div className="text-center py-8 text-slate-muted">
              <p>No issues to display</p>
              <p className="text-sm mt-2">
                Submit a report to see it on the map
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
