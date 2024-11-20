import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Icon } from 'react-leaflet';
import L from 'leaflet'; 
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import location from './../assets/location.png';

function Main() {
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3009/places')
      .then((response) => {
        setPlaces(response.data);
      })
      .catch((error) => console.error('Error al cargar los lugares:', error));
  }, []);

  const customIcon = new L.Icon({
    iconUrl: {location},
    iconSize: [25, 41], 
    iconAnchor: [12, 41], 
    popupAnchor: [1, -34], 
  });

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer center={[-16.398755, -71.536763]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {places.map((place) => (
          place.coordinates && (
            <Marker 
              key={place.id} 
              position={[place.coordinates.x, place.coordinates.y]}
              icon={customIcon} // Usa el icono personalizado aquí
            >
              <Popup>
                <strong>{place.name}</strong><br />
                {place.description}<br />
                Dirección: {place.address}
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
}

export default Main;
