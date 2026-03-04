// ==================== GPS 定位模組 ====================
// 使用 Geolocation API 取得使用者位置，顯示藍點標記與精準度圓圈

const GeoLocation = (function () {
    'use strict';

    // ---------- 模組變數 ----------
    let watchId = null;            // watchPosition ID
    let userMarker = null;         // 使用者位置標記（藍點）
    let accuracyCircle = null;     // 精準度圓圈
    let isTracking = false;        // 是否正在追蹤位置
    let lastPosition = null;       // 最後取得的位置

    // ---------- 藍點圖示 ----------
    function createBlueDotIcon() {
        return L.divIcon({
            html: '<div class="gps-blue-dot"><div class="gps-pulse"></div></div>',
            className: '',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        });
    }

    // ---------- 定位（單次） ----------
    function locate() {
        if (!navigator.geolocation) {
            alert('您的瀏覽器不支援 GPS 定位功能');
            return;
        }

        // 更新按鈕狀態
        var gpsBtn = document.getElementById('gpsBtn');
        if (gpsBtn) gpsBtn.classList.add('active');

        navigator.geolocation.getCurrentPosition(
            onPositionSuccess,
            onPositionError,
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }

    // ---------- 開始追蹤位置 ----------
    function startTracking() {
        if (!navigator.geolocation) return;
        if (isTracking) return;

        isTracking = true;

        var gpsBtn = document.getElementById('gpsBtn');
        if (gpsBtn) gpsBtn.classList.add('tracking');

        watchId = navigator.geolocation.watchPosition(
            onPositionSuccess,
            onPositionError,
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 5000
            }
        );
    }

    // ---------- 停止追蹤位置 ----------
    function stopTracking() {
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            watchId = null;
        }
        isTracking = false;

        var gpsBtn = document.getElementById('gpsBtn');
        if (gpsBtn) gpsBtn.classList.remove('tracking');
    }

    // ---------- 定位成功回呼 ----------
    function onPositionSuccess(position) {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        var accuracy = position.coords.accuracy; // 公尺

        lastPosition = { lat: lat, lng: lng, accuracy: accuracy };

        var map = MapCore.getMap();
        if (!map) return;

        // 移動地圖到使用者位置
        map.setView([lat, lng], 18, { animate: true });

        // 更新或建立藍點標記
        if (userMarker) {
            userMarker.setLatLng([lat, lng]);
        } else {
            userMarker = L.marker([lat, lng], {
                icon: createBlueDotIcon(),
                zIndexOffset: 1000
            }).addTo(map);
        }

        // 更新或建立精準度圓圈
        if (accuracyCircle) {
            accuracyCircle.setLatLng([lat, lng]);
            accuracyCircle.setRadius(accuracy);
        } else {
            accuracyCircle = L.circle([lat, lng], {
                radius: accuracy,
                className: 'gps-accuracy-circle',
                weight: 2,
                fillOpacity: 0.08
            }).addTo(map);
        }

        // 更新按鈕文字
        var viewLocationBtn = document.getElementById('viewLocationBtn');
        if (viewLocationBtn) {
            viewLocationBtn.textContent = '查看燈區地圖';
        }

        // 更新 GPS 按鈕狀態
        var gpsBtn = document.getElementById('gpsBtn');
        if (gpsBtn) {
            gpsBtn.classList.remove('active');
            gpsBtn.classList.add('tracking');
        }
    }

    // ---------- 定位失敗回呼 ----------
    function onPositionError(error) {
        var message = '';
        switch (error.code) {
            case error.PERMISSION_DENIED:
                message = '定位權限被拒絕，請在瀏覽器設定中允許定位。';
                break;
            case error.POSITION_UNAVAILABLE:
                message = '無法取得目前位置資訊。';
                break;
            case error.TIMEOUT:
                message = '定位請求逾時，請稍後再試。';
                break;
            default:
                message = '定位發生未知錯誤。';
        }

        console.warn('GPS 定位失敗：', message);

        // 更新按鈕狀態
        var gpsBtn = document.getElementById('gpsBtn');
        if (gpsBtn) {
            gpsBtn.classList.remove('active');
            gpsBtn.classList.remove('tracking');
        }

        // 輕量提示（不使用 alert 打斷體驗）
        showToast(message);
    }

    // ---------- 輕量提示 Toast ----------
    function showToast(message) {
        // 建立 Toast 元素
        var toast = document.createElement('div');
        toast.style.cssText = [
            'position: fixed',
            'top: 60px',
            'left: 50%',
            'transform: translateX(-50%)',
            'background: rgba(0,0,0,0.8)',
            'color: #fff',
            'padding: 10px 20px',
            'border-radius: 8px',
            'font-size: 0.85rem',
            'z-index: 9999',
            'transition: opacity 0.3s',
            'pointer-events: none',
            'max-width: 80vw',
            'text-align: center',
            'font-family: var(--font-family)'
        ].join(';');
        toast.textContent = message;
        document.body.appendChild(toast);

        // 3 秒後淡出
        setTimeout(function () {
            toast.style.opacity = '0';
            setTimeout(function () {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // ---------- 移除使用者位置標記 ----------
    function clearUserPosition() {
        var map = MapCore.getMap();
        if (map && userMarker) {
            map.removeLayer(userMarker);
            userMarker = null;
        }
        if (map && accuracyCircle) {
            map.removeLayer(accuracyCircle);
            accuracyCircle = null;
        }
    }

    // ---------- 初始化（綁定 GPS 按鈕） ----------
    function init() {
        var gpsBtn = document.getElementById('gpsBtn');
        if (gpsBtn) {
            gpsBtn.addEventListener('click', function () {
                if (isTracking) {
                    stopTracking();
                    clearUserPosition();
                    var viewLocationBtn = document.getElementById('viewLocationBtn');
                    if (viewLocationBtn) viewLocationBtn.textContent = '查看我的位置';
                } else {
                    locate();
                    startTracking();
                }
            });
        }
    }

    // ---------- 公開 API ----------
    return {
        init: init,
        locate: locate,
        startTracking: startTracking,
        stopTracking: stopTracking,
        clearUserPosition: clearUserPosition,
        getLastPosition: function () { return lastPosition; }
    };

})();
