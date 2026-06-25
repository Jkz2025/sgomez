import { useState } from 'react';
import { X, MapPin, Search, Navigation } from 'lucide-react';

const GoogleMaps = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mapUrl, setMapUrl] = useState('https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.9384368745!2d-74.072092!3d4.710989!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM4wNycwMC42NSJOIDTCsDAyJzU1LjUiVw!5e0!3m2!1ses!2sco!4v1620000000000!5m2!1ses!2sco');


const api = import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY;
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const encodedQuery = encodeURIComponent(searchQuery);
      setMapUrl(`https://www.google.com/maps/embed/v1/search?key=${api}&q=${encodedQuery}`);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapUrl(`https://www.google.com/maps/embed/v1/view?key=${api}&center=${latitude},${longitude}&zoom=15`);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('No se pudo obtener tu ubicación');
        }
      );
    } else {
      alert('Geolocalización no soportada en este navegador');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card w-full max-w-6xl h-[90vh] flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold gradient-text flex items-center">
              <MapPin className="w-6 h-6 mr-2" />
              Google Maps
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-blue-200" />
            </button>
          </div>

          <div className="flex gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar ubicación..."
                className="input-field flex-1"
              />
              <button type="submit" className="gradient-button px-4 py-2 rounded-lg">
                <Search className="w-5 h-5" />
              </button>
            </form>
            <button
              onClick={getCurrentLocation}
              className="gradient-button px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Navigation className="w-5 h-5" />
              <span className="hidden md:inline">Mi Ubicación</span>
            </button>
          </div>
        </div>

        <div className="flex-1 p-4">
          <div className="w-full h-full rounded-xl overflow-hidden bg-white/5">
            <iframe
              src={mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Maps"
            />
          </div>
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4">
            <p className="text-blue-200 text-sm">
              <strong className="text-white">Nota:</strong> Para usar la búsqueda y geolocalización completa, 
              necesitas configurar tu API Key de Google Maps en el componente. 
              Actualmente se muestra un mapa de ejemplo de Bogotá, Colombia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleMaps;
