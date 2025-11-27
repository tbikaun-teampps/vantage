import React, { useState, useCallback, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconTarget } from "@tabler/icons-react";
import { useCanAdmin } from "@/hooks/useUserCompanyRole";

// Fix Leaflet default markers in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface InlineLocationMapProps {
  location: { lat: number; lng: number };
  onLocationChange?: (lat: number, lng: number) => void;
  height?: string;
}

// Component to handle map shift+clicks
const MapClickHandler = ({
  onLocationClick,
}: {
  onLocationClick: (lat: number, lng: number) => void;
}) => {
  useMapEvents({
    click: (e) => {
      if (e.originalEvent.shiftKey) {
        // Prevent all event propagation
        e.originalEvent.preventDefault();
        e.originalEvent.stopPropagation();
        e.originalEvent.stopImmediatePropagation();
        L.DomEvent.stop(e);

        onLocationClick(e.latlng.lat, e.latlng.lng);
        return false;
      }
    },
  });

  return null;
};

export const InlineLocationMap: React.FC<InlineLocationMapProps> = ({
  location,
  onLocationChange,
  height = "300px",
}) => {
  const userCanAdmin = useCanAdmin();
  const [manualLat, setManualLat] = useState(location.lat.toString());
  const [manualLng, setManualLng] = useState(location.lng.toString());

  // Update internal state when location prop changes
  useEffect(() => {
    setManualLat(location.lat.toString());
    setManualLng(location.lng.toString());
  }, [location]);

  // Define handleLocationUpdate first
  const handleLocationUpdate = useCallback(
    (lat: number, lng: number) => {
      const roundedLat = Math.round(lat * 1000000) / 1000000;
      const roundedLng = Math.round(lng * 1000000) / 1000000;

      setManualLat(roundedLat.toString());
      setManualLng(roundedLng.toString());

      // Immediately update the parent with new coordinates
      if (onLocationChange) {
        onLocationChange(roundedLat, roundedLng);
      }
    },
    [onLocationChange]
  );

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      handleLocationUpdate(lat, lng);
    },
    [handleLocationUpdate]
  );

  const handleManualCoordinateChange = useCallback(
    (lat: string, lng: string) => {
      const numLat = parseFloat(lat);
      const numLng = parseFloat(lng);

      // Validate coordinates
      if (
        !isNaN(numLat) &&
        !isNaN(numLng) &&
        numLat >= -90 &&
        numLat <= 90 &&
        numLng >= -180 &&
        numLng <= 180
      ) {
        handleLocationUpdate(numLat, numLng);
      }
    },
    [handleLocationUpdate]
  );

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          handleLocationUpdate(lat, lng);
        },
        (error) => {
          console.error("Error getting current location:", error);
        }
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Map */}
      <div
        className="w-full rounded-lg overflow-hidden border relative"
        style={{ height }}
      >
        <MapContainer
          center={[location.lat, location.lng]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          key={`${location.lat}-${location.lng}`} // Re-center when location changes
          maxBounds={[
            [-90, -180],
            [90, 180],
          ]}
          maxBoundsViscosity={1.0}
          worldCopyJump={false}
          doubleClickZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            noWrap={true}
          />
          <MapClickHandler onLocationClick={handleMapClick} />
          <Marker position={[location.lat, location.lng]} />
        </MapContainer>

        {/* Always show shift+click hint */}
        {userCanAdmin && (
          <div className="absolute bottom-2 left-2 bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 px-3 py-1 rounded-md text-sm font-medium flex items-center gap-2 z-[9999]">
            <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-white dark:bg-gray-800 border rounded">
              Shift
            </kbd>
            + click to set location
          </div>
        )}
      </div>

      {/* Controls - always editable */}
      {userCanAdmin && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            {/* Latitude Input */}
            <div className="flex-1 min-w-[120px] space-y-1">
              <Label htmlFor="latitude" className="text-xs">
                Latitude
              </Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={manualLat}
                onChange={(e) => {
                  setManualLat(e.target.value);
                  handleManualCoordinateChange(e.target.value, manualLng);
                }}
                className="h-8 text-xs font-mono"
              />
            </div>

            {/* Longitude Input */}
            <div className="flex-1 min-w-[120px] space-y-1">
              <Label htmlFor="longitude" className="text-xs">
                Longitude
              </Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={manualLng}
                onChange={(e) => {
                  setManualLng(e.target.value);
                  handleManualCoordinateChange(manualLat, e.target.value);
                }}
                className="h-8 text-xs font-mono"
              />
            </div>

            {/* Current Location Button */}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleCurrentLocation}
              className="flex items-center gap-1 h-8 px-2"
            >
              <IconTarget className="h-3 w-3" />
              Current
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Shift+click on the map or edit coordinates directly. Changes will be
            saved when you click "Save Changes".
          </p>
        </div>
      )}
    </div>
  );
};
