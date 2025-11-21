import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

function ClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect({ lat: e.latlng.lat, lon: e.latlng.lng });
    }
  });
  return null;
}

export default function MapPicker({ initialLat = -34.6, initialLon = -58.4, zoom = 12, selected, onSelect, interactive = true, height = '300px' }) {
  const [position, setPosition] = useState(selected || (initialLat && initialLon ? { lat: initialLat, lon: initialLon } : null));

  useEffect(() => {
    if (selected) setPosition(selected);
  }, [selected]);

  return (
    <MapContainer center={[initialLat, initialLon]} zoom={zoom} style={{ height: height, width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {interactive && <ClickHandler onSelect={(coords) => { setPosition(coords); onSelect && onSelect(coords); }} />}
      {position && <Marker position={[position.lat, position.lon]} icon={markerIcon} />}
    </MapContainer>
  );
}
