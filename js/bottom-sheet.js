// ==================== 底部面板互動模組 ====================
// 負責 Bottom Sheet 拖曳互動、分頁切換、POI 列表渲染、搜尋功能

const BottomSheet = (function () {
    'use strict';

    // ---------- 模組變數 ----------
    let sheet = null;              // Bottom Sheet DOM 元素
    let handle = null;             // 拖曳手把
    let currentHeight = 15;        // 目前高度 (vh%)
    let startY = 0;                // 拖曳起始 Y 座標
    let startHeight = 0;           // 拖曳起始高度
    let isDragging = false;        // 是否正在拖曳
    let selectedPoiId = null;      // 選中的 POI ID

    // 吸附高度 (vh%)
    const SNAP_COLLAPSED = 15;
    const SNAP_HALF = 45;
    const SNAP_FULL = 88;

    // ---------- 初始化 ----------
    function init() {
        sheet = document.getElementById('bottomSheet');
        handle = document.getElementById('sheetHandle');

        if (!sheet || !handle) return;

        // 綁定拖曳事件
        bindDragEvents();

        // 綁定分頁切換
        bindTabNav();

        // 綁定快捷按鈕
        bindQuickAccess();

        // 綁定搜尋功能
        bindSearch();

        // 綁定 POI 列表返回
        bindPOIList();

        // 載入熱門服務
        renderHotServices();

        // 載入燈區分類
        renderZones();

        // 綁定 Info 頁面
        bindInfoPage();
    }

    // ---------- 拖曳事件 ----------
    function bindDragEvents() {
        // Touch 事件（手機）
        handle.addEventListener('touchstart', onDragStart, { passive: true });
        document.addEventListener('touchmove', onDragMove, { passive: false });
        document.addEventListener('touchend', onDragEnd);

        // Mouse 事件（桌面）
        handle.addEventListener('mousedown', onDragStart);
        document.addEventListener('mousemove', onDragMove);
        document.addEventListener('mouseup', onDragEnd);
    }

    function onDragStart(e) {
        isDragging = true;
        startY = getEventY(e);
        startHeight = currentHeight;
        sheet.classList.add('dragging');
    }

    function onDragMove(e) {
        if (!isDragging) return;
        e.preventDefault();

        var deltaY = startY - getEventY(e);
        var deltaVH = (deltaY / window.innerHeight) * 100;
        var newHeight = Math.min(SNAP_FULL, Math.max(SNAP_COLLAPSED, startHeight + deltaVH));

        currentHeight = newHeight;
        sheet.style.height = newHeight + 'vh';
        updateControlPositions(newHeight);
    }

    function onDragEnd() {
        if (!isDragging) return;
        isDragging = false;
        sheet.classList.remove('dragging');

        // 吸附到最接近的高度
        snapToNearest();
    }

    function getEventY(e) {
        return e.touches ? e.touches[0].clientY : e.clientY;
    }

    // ---------- 吸附到最近高度 ----------
    function snapToNearest() {
        var distances = [
            { height: SNAP_COLLAPSED, dist: Math.abs(currentHeight - SNAP_COLLAPSED) },
            { height: SNAP_HALF, dist: Math.abs(currentHeight - SNAP_HALF) },
            { height: SNAP_FULL, dist: Math.abs(currentHeight - SNAP_FULL) }
        ];

        distances.sort(function (a, b) { return a.dist - b.dist; });
        setHeight(distances[0].height);
    }

    // ---------- 設定面板高度 ----------
    function setHeight(vh) {
        currentHeight = vh;
        sheet.style.height = vh + 'vh';
        updateControlPositions(vh);
    }

    // ---------- 更新地圖控制按鈕位置 ----------
    function updateControlPositions(sheetHeight) {
        var leftControls = document.getElementById('mapControlsLeft');
        var rightControls = document.getElementById('mapControlsRight');
        var viewBtn = document.getElementById('viewLocationBtn');

        var bottomOffset = sheetHeight + 2; // vh + 間距

        if (leftControls) leftControls.style.bottom = 'calc(' + bottomOffset + 'vh + 8px)';
        if (rightControls) rightControls.style.bottom = 'calc(' + bottomOffset + 'vh + 8px)';
        if (viewBtn) viewBtn.style.bottom = 'calc(' + bottomOffset + 'vh + 8px)';
    }

    // ---------- 分頁切換 ----------
    function bindTabNav() {
        var tabNav = document.getElementById('tabNav');
        if (!tabNav) return;

        tabNav.addEventListener('click', function (e) {
            var btn = e.target.closest('.tab-nav-item');
            if (!btn) return;

            var targetTab = btn.getAttribute('data-tab');

            // 「燈會介紹」分頁 → 打開全頁面
            if (targetTab === 'tabInfo') {
                openInfoPage();
                return;
            }

            // 切換 active 狀態
            tabNav.querySelectorAll('.tab-nav-item').forEach(function (item) {
                item.classList.remove('active');
            });
            btn.classList.add('active');

            // 切換內容面板
            document.querySelectorAll('.tab-pane').forEach(function (pane) {
                pane.classList.remove('active');
            });
            var targetPane = document.getElementById(targetTab);
            if (targetPane) targetPane.classList.add('active');

            // 展開面板到半高
            if (currentHeight < SNAP_HALF) {
                setHeight(SNAP_HALF);
            }
        });
    }

    // ---------- 快捷按鈕 ----------
    function bindQuickAccess() {
        var quickAccess = document.getElementById('quickAccess');
        if (!quickAccess) return;

        quickAccess.addEventListener('click', function (e) {
            var btn = e.target.closest('.quick-btn');
            if (!btn) return;

            var category = btn.getAttribute('data-category');
            if (!category) return;

            showPOIList(category);
        });
    }

    // ---------- 顯示 POI 列表 ----------
    function showPOIList(category) {
        var pois = POIData.getByCategory(category);
        var catInfo = POIData.CATEGORIES[category];
        if (!catInfo) return;

        // 更新標題
        var title = document.getElementById('poiListTitle');
        if (title) {
            title.textContent = catInfo.label + '(' + pois.length + '處)';
        }

        // 渲染列表
        var listBody = document.getElementById('poiListBody');
        if (!listBody) return;

        listBody.innerHTML = '';
        selectedPoiId = pois.length > 0 ? pois[0].id : null;

        pois.forEach(function (poi, index) {
            var item = document.createElement('div');
            item.className = 'poi-item' + (index === 0 ? ' selected' : '');
            item.setAttribute('data-poi-id', poi.id);

            var isFav = POIData.isFavorited(poi.id);

            item.innerHTML =
                '<span class="poi-num">' + (index + 1) + '</span>' +
                '<div class="poi-info">' +
                '<div class="poi-name">' + poi.name + '</div>' +
                '<div class="poi-floor">' + poi.floor + '</div>' +
                '</div>' +
                '<button class="poi-fav' + (isFav ? ' favorited' : '') + '" data-poi-id="' + poi.id + '">' +
                (isFav ? '★ 已收藏' : '收藏') +
                '</button>';

            // 點擊 POI 項目
            item.addEventListener('click', function (e) {
                // 如果點到收藏按鈕，不處理選中
                if (e.target.closest('.poi-fav')) return;

                // 取消之前的選中
                listBody.querySelectorAll('.poi-item').forEach(function (el) {
                    el.classList.remove('selected');
                });
                item.classList.add('selected');
                selectedPoiId = poi.id;

                // 地圖對焦
                MapCore.focusPOI(poi);
            });

            listBody.appendChild(item);
        });

        // 綁定收藏按鈕
        listBody.querySelectorAll('.poi-fav').forEach(function (favBtn) {
            favBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                var poiId = favBtn.getAttribute('data-poi-id');
                var isNowFav = POIData.toggleFavorite(poiId);
                favBtn.classList.toggle('favorited', isNowFav);
                favBtn.textContent = isNowFav ? '★ 已收藏' : '收藏';
            });
        });

        // 在地圖上顯示標記
        MapCore.showPOIMarkers(category);

        // 顯示 POI 列表面板
        var poiListView = document.getElementById('poiListView');
        if (poiListView) {
            poiListView.classList.add('visible');
        }

        // 收合 Bottom Sheet
        setHeight(SNAP_COLLAPSED);
    }

    // ---------- POI 列表返回 ----------
    function bindPOIList() {
        // 返回按鈕
        var backBtn = document.getElementById('poiBackBtn');
        if (backBtn) {
            backBtn.addEventListener('click', closePOIList);
        }

        // 導航按鈕（去這裡）
        var navFab = document.getElementById('navigateFab');
        if (navFab) {
            navFab.addEventListener('click', function () {
                if (!selectedPoiId) return;
                var poi = POIData.getById(selectedPoiId);
                if (poi) {
                    MapCore.focusPOI(poi);
                    // 嘗試開啟 Google Maps 導航
                    var url = 'https://www.google.com/maps/dir/?api=1&destination=' + poi.lat + ',' + poi.lng + '&travelmode=walking';
                    window.open(url, '_blank');
                }
            });
        }
    }

    function closePOIList() {
        var poiListView = document.getElementById('poiListView');
        if (poiListView) {
            poiListView.classList.remove('visible');
        }
        MapCore.clearPOIMarkers();
        MapCore.resetView();
    }

    // ---------- 搜尋功能 ----------
    function bindSearch() {
        var searchInput = document.getElementById('searchInput');
        var searchResults = document.getElementById('searchResults');
        if (!searchInput || !searchResults) return;

        var debounceTimer = null;

        searchInput.addEventListener('input', function () {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(function () {
                var keyword = searchInput.value.trim();
                if (!keyword) {
                    searchResults.classList.remove('visible');
                    searchResults.innerHTML = '';
                    return;
                }

                var results = POIData.search(keyword);
                renderSearchResults(results);
            }, 250);
        });

        // 點擊搜尋列時展開面板
        searchInput.addEventListener('focus', function () {
            if (currentHeight < SNAP_HALF) {
                setHeight(SNAP_HALF);
            }
        });

        // 點擊空白處關閉搜尋結果
        document.addEventListener('click', function (e) {
            if (!e.target.closest('.search-container') && !e.target.closest('.search-results')) {
                searchResults.classList.remove('visible');
            }
        });
    }

    function renderSearchResults(results) {
        var searchResults = document.getElementById('searchResults');
        if (!searchResults) return;

        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-result-item"><i class="bi bi-exclamation-circle"></i> 查無結果</div>';
            searchResults.classList.add('visible');
            return;
        }

        searchResults.innerHTML = '';
        results.forEach(function (poi) {
            var item = document.createElement('div');
            item.className = 'search-result-item';
            item.innerHTML = '<i class="bi bi-geo-alt"></i> ' + poi.name + ' <small style="color: var(--text-muted);">(' + poi.floor + ')</small>';

            item.addEventListener('click', function () {
                MapCore.focusPOI(poi);
                searchResults.classList.remove('visible');
                document.getElementById('searchInput').value = poi.name;

                // 收合面板
                setHeight(SNAP_COLLAPSED);
            });

            searchResults.appendChild(item);
        });

        searchResults.classList.add('visible');
    }

    // ---------- 渲染熱門服務 ----------
    function renderHotServices() {
        var grid = document.getElementById('serviceGrid');
        if (!grid) return;

        grid.innerHTML = '';

        POIData.HOT_SERVICES.forEach(function (svc) {
            var pois = POIData.getByCategory(svc.category);
            var card = document.createElement('div');
            card.className = 'service-card';
            card.innerHTML =
                '<div class="card-icon" style="background: ' + svc.color + '20; color: ' + svc.color + ';">' +
                '<i class="bi ' + svc.icon + '"></i>' +
                '</div>' +
                '<div class="card-text">' +
                '<div class="card-title">' + svc.label + '</div>' +
                '<div class="card-count">' + (pois.length > 0 ? pois.length + ' 處' : '即將開放') + '</div>' +
                '</div>';

            card.addEventListener('click', function () {
                if (pois.length > 0) {
                    showPOIList(svc.category);
                }
            });

            grid.appendChild(card);
        });
    }

    // ---------- 渲染燈區分類 ----------
    function renderZones() {
        var list = document.getElementById('zoneList');
        if (!list) return;

        list.innerHTML = '';

        POIData.ZONES.forEach(function (zone) {
            var card = document.createElement('div');
            card.className = 'zone-card';
            card.innerHTML =
                '<div class="zone-color" style="background: ' + zone.color + ';"></div>' +
                '<div class="zone-info">' +
                '<div class="zone-name">' + zone.name + '</div>' +
                '<div class="zone-desc">' + zone.desc + '</div>' +
                '</div>' +
                '<div class="zone-arrow"><i class="bi bi-chevron-right"></i></div>';

            card.addEventListener('click', function () {
                // 地圖定位到該燈區
                MapCore.getMap().setView([zone.lat, zone.lng], 18, { animate: true });
                setHeight(SNAP_COLLAPSED);
            });

            list.appendChild(card);
        });
    }

    // ---------- 燈會介紹頁面 ----------
    function bindInfoPage() {
        var infoBackBtn = document.getElementById('infoBackBtn');
        if (infoBackBtn) {
            infoBackBtn.addEventListener('click', closeInfoPage);
        }

        var showOnMapBtn = document.getElementById('showOnMapBtn');
        if (showOnMapBtn) {
            showOnMapBtn.addEventListener('click', function () {
                closeInfoPage();
                MapCore.resetView();
            });
        }
    }

    function openInfoPage() {
        var infoPage = document.getElementById('infoPage');
        if (infoPage) {
            infoPage.classList.add('visible');
        }
    }

    function closeInfoPage() {
        var infoPage = document.getElementById('infoPage');
        if (infoPage) {
            infoPage.classList.remove('visible');
        }
    }

    // ---------- 公開 API ----------
    return {
        init: init,
        setHeight: setHeight,
        showPOIList: showPOIList,
        closePOIList: closePOIList,
        openInfoPage: openInfoPage,
        closeInfoPage: closeInfoPage
    };

})();

// ==================== 應用程式進入點 ====================
document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // 初始化地圖
    MapCore.init();

    // 初始化 GPS 定位
    GeoLocation.init();

    // 初始化底部面板
    BottomSheet.init();
});
