const cafeCoordinates = {
    "Simple Kaffa 興波咖啡": [25.0441, 121.5303],
    "Fika Fika Cafe": [25.0531, 121.5350],
    "豆舖咖啡館": [24.9930, 121.3000],
    "SIDRA 栖爪咖啡": [24.9600, 121.2250],
    "ML coffee 慕光咖啡工作室": [24.9530, 121.2290],
    "Jo's Corner Café": [25.0000, 121.2950],
    "著手咖啡 Coffee Intro (中壢內壢店)": [24.9750, 121.2600],
    "拾事咖啡 SEIZE THE DAY": [24.9680, 121.2400],
    "暖空咖啡 Warm air Kafe": [24.9580, 121.2100],
    "墨咖啡 Ink Coffee": [24.8050, 120.9700],
    "The Factory Mojocoffee": [24.1500, 120.6650],
    "著手咖啡 Coffee Intro": [24.1550, 120.6600],
    "存憶 Cafe Bar": [22.9980, 120.2000],
    "馤咖啡。食作": [22.6250, 120.3100]
  };
  
  const map = L.map('map', { zoomControl: false });
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  
  L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=zh-TW&scale=2', {
      attribution: '&copy; <a href="https://www.google.com/maps">Google Maps</a>',
      maxZoom: 20
  }).addTo(map);
  
  const mapBounds = L.latLngBounds();
  
  Object.keys(cafeCoordinates).forEach(cafe => {
      const coords = cafeCoordinates[cafe];
      mapBounds.extend(coords);
      
      const marker = L.circleMarker(coords, {
          color: '#ffffff',
          fillColor: '#e74c3c',
          fillOpacity: 0.9,
          radius: 10,
          weight: 3
      }).addTo(map);
      
      marker.bindPopup(`<b>${cafe}</b>`);
      
      marker.on('mouseover', function () {
          this.openPopup();
      });
      
      marker.on('mouseout', function () {
          this.closePopup();
      });
      
      marker.on('click', function () {
          window.location.href = `index.html?search=${encodeURIComponent(cafe)}`;
      });
  });
  
  if (mapBounds.isValid()) {
      map.fitBounds(mapBounds, { padding: [50, 50] });
  }
