import React, { useState, useEffect, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconMapPin, IconTarget } from "@tabler/icons-react";

// Fix Leaflet default markers in React
// Work around the webpack issue with Leaflet default icon paths
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (lat: number, lng: number) => void;
  initialLocation?: { lat: number; lng: number };
  title?: string;
  description?: string;
}

// Component to handle map clicks
const MapClickHandler = ({ 
  onLocationClick 
}: { 
  onLocationClick: (lat: number, lng: number) => void 
}) => {
  useMapEvents({
    click: (e) => {
      onLocationClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export const LocationPickerDialog: React.FC<LocationPickerDialogProps> = ({
  isOpen,
  onClose,
  onLocationSelect,
  initialLocation = { lat: -32.7566776, lng: 116.3817349 }, // Perth, Australia default
  title = "Select Location",
  description = "Click on the map to select a location, or enter coordinates manually. Location is automatically saved.",
}) => {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [manualLat, setManualLat] = useState(initialLocation.lat.toString());
  const [manualLng, setManualLng] = useState(initialLocation.lng.toString());
  const [mapCenter, setMapCenter] = useState([initialLocation.lat, initialLocation.lng] as [number, number]);
  // const [mapZoom, setMapZoom] = useState(13);

  // Update state when dialog opens with new initial location
  useEffect(() => {
    if (isOpen && initialLocation) {
      setSelectedLocation(initialLocation);
      setManualLat(initialLocation.lat.toString());
      setManualLng(initialLocation.lng.toString());
      setMapCenter([initialLocation.lat, initialLocation.lng]);
    }
  }, [isOpen, initialLocation]);

  // Update location internally only
  const handleLocationUpdate = useCallback((lat: number, lng: number) => {
    const roundedLat = Math.round(lat * 1000000) / 1000000;
    const roundedLng = Math.round(lng * 1000000) / 1000000;
    
    setSelectedLocation({ lat: roundedLat, lng: roundedLng });
    setManualLat(roundedLat.toString());
    setManualLng(roundedLng.toString());
  }, []);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    handleLocationUpdate(lat, lng);
  }, [handleLocationUpdate]);

  const handleManualCoordinateChange = useCallback((lat: string, lng: string) => {
    const numLat = parseFloat(lat);
    const numLng = parseFloat(lng);
    
    // Validate coordinates
    if (!isNaN(numLat) && !isNaN(numLng) && 
        numLat >= -90 && numLat <= 90 && 
        numLng >= -180 && numLng <= 180) {
      handleLocationUpdate(numLat, numLng);
    }
  }, [handleLocationUpdate]);

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

  const handleClose = () => {
    // Update parent with final location when closing
    onLocationSelect(selectedLocation.lat, selectedLocation.lng);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconMapPin className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Manual Coordinate Input */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={manualLat}
                onChange={(e) => {
                  setManualLat(e.target.value);
                  handleManualCoordinateChange(e.target.value, manualLng);
                }}
                placeholder="Enter latitude"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={manualLng}
                onChange={(e) => {
                  setManualLng(e.target.value);
                  handleManualCoordinateChange(manualLat, e.target.value);
                }}
                placeholder="Enter longitude"
              />
            </div>
          </div>

          {/* Current Location Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCurrentLocation}
              className="flex items-center gap-2"
            >
              <IconTarget className="h-4 w-4" />
              Use Current Location
            </Button>
          </div>

          {/* Map */}
          <div className="h-96 w-full rounded-lg overflow-hidden border">
            <MapContainer
              center={mapCenter}
              // zoom={mapZoom}
              style={{ height: "100%", width: "100%" }}
              key={`${mapCenter[0]}-${mapCenter[1]}`} // Only re-render when center changes
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapClickHandler onLocationClick={handleMapClick} />
              <Marker position={[selectedLocation.lat, selectedLocation.lng]} />
            </MapContainer>
          </div>

          {/* Selected Coordinates Display */}
          <div className="text-sm text-muted-foreground text-center">
            Selected: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
};