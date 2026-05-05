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
  
  const highlightData = localStorage.getItem('mapHighlightCoffee');
  let targetCoffee = null;
  if (highlightData) {
      try {
          targetCoffee = JSON.parse(highlightData);
          localStorage.removeItem('mapHighlightCoffee');
      } catch(e) {}
  }

  const mapBounds = L.latLngBounds();
  const targetCoords = [];
  
  Object.keys(cafeCoordinates).forEach(cafe => {
      const coords = cafeCoordinates[cafe];
      mapBounds.extend(coords);
      
      const isTarget = targetCoffee && targetCoffee.cafes.includes(cafe);
      if (isTarget) targetCoords.push(coords);
      
      const marker = L.circleMarker(coords, {
          color: '#ffffff',
          fillColor: isTarget ? '#e74c3c' : (targetCoffee ? '#aaaaaa' : '#e74c3c'),
          fillOpacity: isTarget ? 1.0 : (targetCoffee ? 0.6 : 0.9),
          radius: isTarget ? 10 : (targetCoffee ? 6 : 10),
          weight: isTarget ? 3 : (targetCoffee ? 1 : 3)
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
  
  if (targetCoffee && targetCoords.length > 0) {
      let centerLat = 0, centerLng = 0;
      targetCoords.forEach(c => {
          centerLat += c[0];
          centerLng += c[1];
      });
      centerLat /= targetCoords.length;
      centerLng /= targetCoords.length;
      
      // 稍微將縮圖放到偏上方
      const posterCenter = [centerLat + 0.15, centerLng];
      
      // 畫指引線
      targetCoords.forEach(c => {
          L.polyline([posterCenter, c], {
              color: '#cda25b',
              weight: 2,
              opacity: 0.8,
              dashArray: '5, 5'
          }).addTo(map);
      });
      
      // 顯示縮圖
      const posterIcon = L.divIcon({
          className: 'coffee-poster-icon',
          html: `<div style="
              width: 80px; 
              height: 110px; 
              background-image: url('${targetCoffee.poster}'); 
              background-size: cover; 
              background-position: center; 
              border: 2px solid #cda25b; 
              border-radius: 8px; 
              box-shadow: 0 4px 10px rgba(0,0,0,0.3);
              position: relative;">
              <div style="
                  position: absolute; 
                  bottom: 0; 
                  left: 0; 
                  right: 0; 
                  background: rgba(0,0,0,0.7); 
                  color: white; 
                  font-size: 10px; 
                  text-align: center; 
                  padding: 2px; 
                  border-bottom-left-radius: 6px; 
                  border-bottom-right-radius: 6px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;">
                  ${targetCoffee.name}
              </div>
          </div>`,
          iconSize: [80, 110],
          iconAnchor: [40, 55]
      });
      
      L.marker(posterCenter, { icon: posterIcon, interactive: false }).addTo(map);
      
      // 讓地圖對焦在這些目標和縮圖上
      const targetBounds = L.latLngBounds(targetCoords);
      targetBounds.extend(posterCenter);
      map.fitBounds(targetBounds, { padding: [80, 80] });
  } else if (mapBounds.isValid()) {
      map.fitBounds(mapBounds, { padding: [50, 50] });
  }
