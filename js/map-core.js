// ==================== 地圖核心模組 ====================
// 負責 Leaflet 地圖初始化、圖層管理、標記管理、燈區覆蓋層

const MapCore = (function () {
    'use strict';

    // ---------- 模組變數 ----------
    let map = null;               // Leaflet 地圖實例
    let standardLayer = null;     // 標準地圖圖層
    let satelliteLayer = null;    // 衛星地圖圖層
    let currentLayer = 'standard'; // 目前使用的圖層
    let poiMarkers = [];          // POI 標記陣列
    let zonePolygons = [];        // 燈區多邊形陣列
    let poiLayerGroup = null;     // POI 標記圖層群組
    let zoneLayerGroup = null;    // 燈區多邊形圖層群組

    // ---------- 修正 Leaflet 預設圖示路徑 ----------
    function fixLeafletIcons() {
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'img/marker-icon-2x.png',
            iconUrl: 'img/marker-icon.png',
            shadowUrl: 'img/marker-shadow.png'
        });
    }

    // ---------- 初始化地圖 ----------
    function init() {
        fixLeafletIcons();

        // 建立地圖，中心點為龍港國小
        map = L.map('map', {
            center: [POIData.CENTER.lat, POIData.CENTER.lng],
            zoom: 18,
            zoomControl: false,       // 使用自訂縮放按鈕
            attributionControl: true,
            maxZoom: 19,
            minZoom: 10
        });

        // 標準圖層 (OpenStreetMap)
        standardLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19
        });

        // 衛星圖層 (Esri World Imagery — 免費衛星圖磚)
        satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '&copy; Esri',
            maxZoom: 18
        });

        // 預設使用標準圖層
        standardLayer.addTo(map);

        // 建立圖層群組
        poiLayerGroup = L.layerGroup().addTo(map);
        zoneLayerGroup = L.layerGroup().addTo(map);

        // 繪製燈區覆蓋層
        drawZoneOverlays();

        // 綁定地圖控制按鈕事件
        bindControls();

        return map;
    }

    // ---------- 繪製燈區多邊形覆蓋層 ----------
    function drawZoneOverlays() {
        zoneLayerGroup.clearLayers();
        zonePolygons = [];

        POIData.ZONES.forEach(function (zone) {
            if (!zone.bounds || zone.bounds.length < 3) return;

            var polygon = L.polygon(zone.bounds, {
                color: zone.color,
                weight: 2,
                opacity: 0.7,
                fillColor: zone.color,
                fillOpacity: 0.2,
                smoothFactor: 1
            });

            // 加入燈區標籤
            polygon.bindTooltip(zone.name, {
                permanent: true,
                direction: 'center',
                className: 'zone-label',
                offset: [0, 0]
            });

            // 點擊事件：顯示燈區資訊
            polygon.on('click', function () {
                showZonePopup(zone);
            });

            polygon.addTo(zoneLayerGroup);
            zonePolygons.push({ zone: zone, polygon: polygon });
        });
    }

    // ---------- 顯示燈區彈出資訊 ----------
    function showZonePopup(zone) {
        var popup = L.popup()
            .setLatLng([zone.lat, zone.lng])
            .setContent(
                '<div style="font-family: var(--font-family); min-width: 150px;">' +
                '<strong style="color: ' + zone.color + ';">' + zone.name + '</strong>' +
                '<p style="margin: 4px 0 0; font-size: 0.85rem; color: #555;">' + zone.desc + '</p>' +
                '</div>'
            )
            .openOn(map);
    }

    // ---------- 顯示 POI 標記 ----------
    function showPOIMarkers(category) {
        clearPOIMarkers();

        var pois = POIData.getByCategory(category);
        var catInfo = POIData.CATEGORIES[category];

        pois.forEach(function (poi, index) {
            // 建立自訂圖示
            var markerHtml =
                '<div class="marker-pin" style="background: ' + (catInfo ? catInfo.color : '#4A90D9') + ';">' +
                '<i class="bi ' + (catInfo ? catInfo.icon : 'bi-geo-alt-fill') + '"></i>' +
                '</div>';

            var customIcon = L.divIcon({
                html: markerHtml,
                className: 'custom-marker',
                iconSize: [30, 30],
                iconAnchor: [15, 30],
                popupAnchor: [0, -30]
            });

            var marker = L.marker([poi.lat, poi.lng], { icon: customIcon });

            // 彈出資訊
            marker.bindPopup(
                '<div style="font-family: var(--font-family); min-width: 120px;">' +
                '<strong>' + poi.name + '</strong>' +
                '<p style="margin: 4px 0 0; font-size: 0.8rem; color: #888;">' + poi.floor + '</p>' +
                '<p style="margin: 4px 0 0; font-size: 0.8rem; color: #555;">' + poi.desc + '</p>' +
                '</div>'
            );

            // 編號標記
            var numIcon = L.divIcon({
                html: '<div class="marker-cluster" style="background: ' + (catInfo ? catInfo.color : '#4A90D9') + ';">' + (index + 1) + '</div>',
                className: 'custom-marker',
                iconSize: [36, 36],
                iconAnchor: [18, 18]
            });

            marker.setIcon(numIcon);
            marker.addTo(poiLayerGroup);
            poiMarkers.push(marker);
        });

        // 如果有 POI，調整地圖視角以包含所有標記
        if (pois.length > 0) {
            var group = L.featureGroup(poiMarkers);
            map.fitBounds(group.getBounds().pad(0.2));
        }
    }

    // ---------- 清除 POI 標記 ----------
    function clearPOIMarkers() {
        poiLayerGroup.clearLayers();
        poiMarkers = [];
    }

    // ---------- 對焦單一 POI ----------
    function focusPOI(poi) {
        if (!poi) return;
        map.setView([poi.lat, poi.lng], 18, { animate: true });
    }

    // ---------- 回到燈區中心 ----------
    function resetView() {
        map.setView([POIData.CENTER.lat, POIData.CENTER.lng], 18, { animate: true });
        clearPOIMarkers();
    }

    // ---------- 圖層切換 ----------
    function toggleLayer() {
        if (currentLayer === 'standard') {
            map.removeLayer(standardLayer);
            satelliteLayer.addTo(map);
            currentLayer = 'satellite';
            return '2D';
        } else {
            map.removeLayer(satelliteLayer);
            standardLayer.addTo(map);
            currentLayer = 'standard';
            return '2D';
        }
    }

    // ---------- 綁定地圖控制按鈕 ----------
    function bindControls() {
        // 放大
        var zoomInBtn = document.getElementById('zoomInBtn');
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', function () {
                map.zoomIn();
            });
        }

        // 縮小
        var zoomOutBtn = document.getElementById('zoomOutBtn');
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', function () {
                map.zoomOut();
            });
        }

        // 圖層切換
        var layerToggleBtn = document.getElementById('layerToggleBtn');
        if (layerToggleBtn) {
            layerToggleBtn.addEventListener('click', function () {
                if (currentLayer === 'standard') {
                    map.removeLayer(standardLayer);
                    satelliteLayer.addTo(map);
                    currentLayer = 'satellite';
                    layerToggleBtn.textContent = '地圖';
                } else {
                    map.removeLayer(satelliteLayer);
                    standardLayer.addTo(map);
                    currentLayer = 'standard';
                    layerToggleBtn.textContent = '2D';
                }
            });
        }

        // 指北針
        var compassBtn = document.getElementById('compassBtn');
        if (compassBtn) {
            compassBtn.addEventListener('click', function () {
                // 重置地圖旋轉（Leaflet 不支援旋轉，此為提示按鈕）
                map.setView(map.getCenter(), map.getZoom());
            });
        }

        // 樓層切換（UI 模擬）
        var floorUp = document.getElementById('floorUp');
        var floorDown = document.getElementById('floorDown');
        var floorCurrent = document.getElementById('floorCurrent');
        var currentFloor = 1;
        var maxFloor = 2;
        var minFloor = 1;

        if (floorUp) {
            floorUp.addEventListener('click', function () {
                if (currentFloor < maxFloor) {
                    currentFloor++;
                    floorCurrent.textContent = currentFloor + 'F';
                }
            });
        }

        if (floorDown) {
            floorDown.addEventListener('click', function () {
                if (currentFloor > minFloor) {
                    currentFloor--;
                    floorCurrent.textContent = currentFloor + 'F';
                }
            });
        }

        // 查看位置/查看燈區按鈕
        var viewLocationBtn = document.getElementById('viewLocationBtn');
        if (viewLocationBtn) {
            viewLocationBtn.addEventListener('click', function () {
                if (viewLocationBtn.textContent === '查看我的位置') {
                    // 觸發 GPS 定位
                    if (typeof GeoLocation !== 'undefined') {
                        GeoLocation.locate();
                    }
                } else {
                    // 回到燈區
                    resetView();
                    viewLocationBtn.textContent = '查看我的位置';
                }
            });
        }
    }

    // ---------- 取得地圖實例 ----------
    function getMap() {
        return map;
    }

    // ---------- 公開 API ----------
    return {
        init: init,
        getMap: getMap,
        showPOIMarkers: showPOIMarkers,
        clearPOIMarkers: clearPOIMarkers,
        focusPOI: focusPOI,
        resetView: resetView,
        toggleLayer: toggleLayer,
        drawZoneOverlays: drawZoneOverlays
    };

})();
