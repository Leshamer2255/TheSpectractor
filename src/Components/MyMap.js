import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw'; 
import 'leaflet-draw/dist/leaflet.draw.css'; 
import './MyMap.css'; 

const customLocations = [
  { id: 1, name: "Custom Location 1", position: [48.8566, 2.3522], info: "This is Paris" },
  { id: 2, name: "Custom Location 2", position: [40.7128, -74.0060], info: "This is New York" },
  { id: 3, name: "Custom Location 3", position: [35.6895, 139.6917], info: "This is Tokyo" },
];

const animatedDivIcon = L.divIcon({
  className: 'blinking-marker', 
  html: "<div class='pulse-marker'></div>",
  iconSize: [24, 24], 
  iconAnchor: [12, 12],
  popupAnchor: [1, -24],
});

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MyMap = () => {
  const [countries, setCountries] = useState([]);
  const [activeLocation, setActiveLocation] = useState(null);
  const [countryBorders, setCountryBorders] = useState(null); 
  const ws = useRef(null); 

  useEffect(() => {
    ws.current = new WebSocket('ws://127.0.0.1:54678'); 

    ws.current.onopen = () => {
      console.log('WebSocket connection established');
    };
  
    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'response_data') {
        handleWebSocketResponse(message);
      }
      if (message.type === 'incoming_event') {
        handleIncomingEvent(message);
      }
    };
  
    ws.current.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };
  
    ws.current.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };
  
    return () => {
      ws.current.close();
    };
  }, []);
  

  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all')
      .then((response) => response.json())
      .then((data) => {
        const countryMarkers = data.map((country) => ({
          id: country.cca3,
          name: country.name.common,
          position: [country.latlng[0], country.latlng[1]],
          info: `Population: ${country.population}`,
          borders: country.borders || [],
          capital: country.capital?.[0] || 'N/A',
          population: country.population,
          area: country.area,
          timezones: country.timezones,
          languages: Object.values(country.languages || {}).join(', '),
          currencies: Object.values(country.currencies || {}).map(curr => curr.name).join(', '),
          currencySymbols: Object.values(country.currencies || {}).map(curr => curr.symbol).join(', '),
          region: country.region,
          subregion: country.subregion,
          tld: country.tld?.[0] || 'N/A',
          flagUrl: country.flags?.svg,
        }));
        setCountries(countryMarkers);
      });
  }, []);

  const handleMarkerClick = (country) => {
    setActiveLocation(country);
  
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const message = {
        type: 'request_data',
        request_id: 'unique-request-id', 
        data: {
          info_type: 'political',   
          country: country.id,
          time_period: 'last_24h'  
        }
      };
  
      ws.current.send(JSON.stringify(message)); 
    } else {
      console.log('WebSocket is not open.');
    }
  
    if (country.borders.length) {
      const bordersLayer = L.geoJSON(country.borders);
      setCountryBorders(bordersLayer);
    } else {
      setCountryBorders(null); 
    }
  };

  const handleWebSocketResponse = (message) => {
    if (message.status === 'success') {
      const { events } = message.data;
      const updatedInfo = events.map(event => `${event.title}: ${event.description}`).join('\n');
      
      setActiveLocation(prev => ({
        ...prev,
        info: updatedInfo, 
      }));
    }
  };

  const handleIncomingEvent = (message) => {
    console.log('Real-time event:', message.data);
  };

  return (
    <MapContainer center={[51.505, -0.09]} zoom={2} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      {countryBorders && <CountryBorders bordersLayer={countryBorders} />}

      {countries.map((country) => (
        <Marker
          key={country.id}
          position={country.position}
          icon={animatedDivIcon} 
          draggable={true}
          eventHandlers={{
            click: () => {
              handleMarkerClick(country);
            },
          }}
        >
          {activeLocation && activeLocation.id === country.id && (
            <Popup
              position={country.position}
              onClose={() => setActiveLocation(null)}
            >
              <div>
                <h3>{country.name} ({country.officialName})</h3>
                <p><strong>Capital:</strong> {country.capital}</p>
                <p><strong>Population:</strong> {country.population}</p>
                <p><strong>Area:</strong> {country.area} km²</p>
                <p><strong>Timezones:</strong> {country.timezones.join(', ')}</p>
                <p><strong>Languages:</strong> {country.languages}</p>
                <p><strong>Currencies:</strong> {country.currencies} ({country.currencySymbols})</p>
                <p><strong>Region:</strong> {country.region}, {country.subregion}</p>
                <p><strong>Top-level domain:</strong> {country.tld}</p>
                <img src={country.flagUrl} alt={`${country.name} flag`} style={{ width: '100px' }} />
              </div>
            </Popup>
          )}
        </Marker>
      ))}

      {customLocations.map((location) => (
        <Marker
          key={location.id}
          position={location.position}
          icon={animatedDivIcon} 
          draggable={true}
          eventHandlers={{
            click: () => {
              setActiveLocation(location);
            },
          }}
        >
          {activeLocation && activeLocation.id === location.id && (
            <Popup
              position={location.position}
              onClose={() => setActiveLocation(null)}
            >
              <div>
                <h3>{location.name}</h3>
                <p>{location.info}</p>
              </div>
            </Popup>
          )}
        </Marker>
      ))}
    </MapContainer>
  );
};

const CountryBorders = ({ bordersLayer }) => {
  const map = useMap();
  
  useEffect(() => {
    bordersLayer.addTo(map);
    
    return () => {
      bordersLayer.removeFrom(map); 
    };
  }, [bordersLayer, map]);

  return null;
};

export default MyMap;


