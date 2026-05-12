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
  
  const cafeDetails = {
    "Simple Kaffa 興波咖啡": { address: "台北市中正區忠孝東路二段27號", phone: "02-3322-1888" },
    "Fika Fika Cafe": { address: "台北市中山區伊通街33號一樓", phone: "02-2507-0633" },
    "豆舖咖啡館": { address: "桃園市桃園區大興西路二段322號", phone: "03-358-2921" },
    "SIDRA 栖爪咖啡": { address: "桃園市桃園區慈文路635巷27號", phone: "請見粉專公告" },
    "ML coffee 慕光咖啡工作室": { address: "桃園市桃園區慈德街", phone: "請見粉專公告" },
    "Jo's Corner Café": { address: "桃園市桃園區國強一街135號", phone: "03-360-1566" },
    "著手咖啡 Coffee Intro (中壢內壢店)": { address: "桃園市中壢區大華路", phone: "請見粉專公告" },
    "拾事咖啡 SEIZE THE DAY": { address: "桃園市中壢區福星六街67號1樓", phone: "03-453-6456" },
    "暖空咖啡 Warm air Kafe": { address: "桃園市中壢區中光路31號", phone: "請見粉專公告" },
    "墨咖啡 Ink Coffee": { address: "新竹市東區林森路180號", phone: "03-522-0608" },
    "The Factory Mojocoffee": { address: "台中市西區精誠六街22號", phone: "04-2328-9448" },
    "著手咖啡 Coffee Intro": { address: "台中市西區向上北路224號", phone: "04-2301-1733" },
    "存憶 Cafe Bar": { address: "台南市中西區國華街三段211號", phone: "0928-090-000" },
    "馤咖啡。食作": { address: "高雄市左營區文康路74巷58號", phone: "07-350-0000" }
  };

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
      
      const details = cafeDetails[cafe] || { address: '暫無資料', phone: '暫無資料' };
      const popupHtml = `
        <div style="font-family: 'Noto Sans TC', sans-serif; min-width: 150px; padding: 5px;">
            <b style="font-size: 1.1rem; color: #cda25b; margin-bottom: 5px; display: block;">${cafe}</b>
            <div style="font-size: 0.9rem; color: #555; margin-bottom: 5px;">
                📍 ${details.address}
            </div>
            <div style="font-size: 0.9rem; color: #555; margin-bottom: 10px;">
                📞 ${details.phone}
            </div>
            <a href="index.html?search=${encodeURIComponent(cafe)}" style="display: block; text-align: center; background: #cda25b; color: white; text-decoration: none; padding: 6px; border-radius: 4px; font-weight: bold;">查看單品咖啡</a>
        </div>
      `;
      
      marker.bindPopup(popupHtml);
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
              width: 150px; 
              height: 210px; 
              border: 2px solid #cda25b; 
              border-radius: 8px; 
              box-shadow: 0 4px 10px rgba(0,0,0,0.3);
              position: relative;
              overflow: hidden;">
              <img src="${targetCoffee.poster}" style="
                  width: 100%;
                  height: 100%;
                  object-fit: cover;
                  object-position: center;
                  transform: scale(1.18);
                  display: block;">
              <div style="
                  position: absolute; 
                  bottom: 0; 
                  left: 0; 
                  right: 0; 
                  background: rgba(0,0,0,0.8); 
                  color: white; 
                  font-size: 13px; 
                  text-align: center; 
                  padding: 6px 4px; 
                  white-space: normal;
                  line-height: 1.3;">
                  ${targetCoffee.name}
              </div>
          </div>`,
          iconSize: [150, 210],
          iconAnchor: [75, 105]
      });
      
      L.marker(posterCenter, { icon: posterIcon, interactive: false }).addTo(map);
      
      // 讓地圖對焦在這些目標和縮圖上
      const targetBounds = L.latLngBounds(targetCoords);
      targetBounds.extend(posterCenter);
      map.fitBounds(targetBounds, { padding: [80, 80] });
  } else if (mapBounds.isValid()) {
      map.fitBounds(mapBounds, { padding: [50, 50] });
  }
