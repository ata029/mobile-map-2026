// ==================== POI 資料模組 ====================
// 龍港國民小學校園設施資料

const POIData = (function () {
    'use strict';

    // ---------- 龍港國小中心座標 ----------
    const CENTER = { lat: 23.4845, lng: 120.1773 };

    // ---------- POI 分類定義 ----------
    const CATEGORIES = {
        classroom: { label: '教室', icon: 'bi-book-fill', color: '#3498db' },
        admin: { label: '行政辦公', icon: 'bi-building-fill', color: '#9b59b6' },
        restroom: { label: '廁所', icon: 'bi-sign-intersection-y-fill', color: '#2ecc71' },
        sports: { label: '運動設施', icon: 'bi-trophy-fill', color: '#e67e22' },
        entrance: { label: '出入口', icon: 'bi-door-open-fill', color: '#e74c3c' },
        facility: { label: '其他設施', icon: 'bi-gear-fill', color: '#1abc9c' }
    };

    // ---------- POI 資料庫（根據校園配置圖） ----------
    const POIS = [
        // ===== 教室 =====
        // 北排教室（由西到東）
        { id: 'c01', name: '桌球室', category: 'classroom', floor: '1F', lat: 23.48505, lng: 120.17615, desc: '桌球教室 / Table Tennis Room' },
        { id: 'c02', name: '社會教室', category: 'classroom', floor: '1F', lat: 23.48505, lng: 120.17635, desc: '社會領域教室 / Social Classroom' },
        { id: 'c03', name: '視聽教室', category: 'classroom', floor: '1F', lat: 23.48505, lng: 120.17655, desc: '多媒體視聽教室 / Audio-Visual Classroom' },
        { id: 'c04', name: '階梯教室', category: 'classroom', floor: '1F', lat: 23.48505, lng: 120.17675, desc: '階梯式教室 / Step Classroom' },
        { id: 'c05', name: '圖書教室', category: 'classroom', floor: '1F', lat: 23.48505, lng: 120.17700, desc: '圖書教學教室 / Library Classroom' },
        { id: 'c06', name: '圖書室', category: 'classroom', floor: '1F', lat: 23.48505, lng: 120.17720, desc: '圖書室 / Library' },
        { id: 'c07', name: '美勞教室', category: 'classroom', floor: '1F', lat: 23.48505, lng: 120.17810, desc: '美術勞作教室 / Arts Classroom' },
        { id: 'c08', name: '半途教室', category: 'classroom', floor: '1F', lat: 23.48505, lng: 120.17830, desc: '半途教室 / Mid-way Classroom' },

        // 南排教室（由西到東）
        { id: 'c09', name: '遊戲室', category: 'classroom', floor: '1F', lat: 23.48475, lng: 120.17615, desc: '幼兒遊戲室 / Play Room' },
        { id: 'c10', name: '幼乙班', category: 'classroom', floor: '1F', lat: 23.48475, lng: 120.17635, desc: '幼兒園乙班 / Kindergarten B' },
        { id: 'c11', name: '幼甲班', category: 'classroom', floor: '1F', lat: 23.48475, lng: 120.17650, desc: '幼兒園甲班 / Kindergarten A' },
        { id: 'c12', name: '一甲教室', category: 'classroom', floor: '1F', lat: 23.48475, lng: 120.17695, desc: '一年甲班 / 1A Classroom' },
        { id: 'c13', name: '二甲教室', category: 'classroom', floor: '1F', lat: 23.48475, lng: 120.17715, desc: '二年甲班 / 2A Classroom' },
        { id: 'c14', name: '三甲教室', category: 'classroom', floor: '1F', lat: 23.48475, lng: 120.17730, desc: '三年甲班 / 3A Classroom' },
        { id: 'c15', name: '四甲教室', category: 'classroom', floor: '1F', lat: 23.48475, lng: 120.17745, desc: '四年甲班 / 4A Classroom' },
        { id: 'c16', name: '五甲教室', category: 'classroom', floor: '1F', lat: 23.48475, lng: 120.17760, desc: '五年甲班 / 5A Classroom' },
        { id: 'c17', name: '六甲教室', category: 'classroom', floor: '1F', lat: 23.48475, lng: 120.17780, desc: '六年甲班 / 6A Classroom' },
        { id: 'c18', name: '日新教室', category: 'classroom', floor: '1F', lat: 23.48475, lng: 120.17800, desc: '日新教室 / Rixin Classroom' },

        // ===== 行政辦公 =====
        { id: 'a01', name: '教導室', category: 'admin', floor: '1F', lat: 23.48505, lng: 120.17740, desc: '教導處 / Teaching Office' },
        { id: 'a02', name: '校長室', category: 'admin', floor: '1F', lat: 23.48505, lng: 120.17755, desc: '校長辦公室 / Principal Office' },
        { id: 'a03', name: '辦公室', category: 'admin', floor: '1F', lat: 23.48505, lng: 120.17770, desc: '行政辦公室 / Office' },
        { id: 'a04', name: '輔導室', category: 'admin', floor: '1F', lat: 23.48505, lng: 120.17790, desc: '輔導處 / Counseling Office' },
        { id: 'a05', name: '資訊健康中心', category: 'admin', floor: '1F', lat: 23.48505, lng: 120.17690, desc: '資訊教育暨健康中心 / Info & Health Center' },

        // ===== 廁所 =====
        { id: 'r01', name: '北側廁所', category: 'restroom', floor: '1F', lat: 23.48505, lng: 120.17685, desc: '位於教室北排中段 / North restroom' },
        { id: 'r02', name: '南側廁所', category: 'restroom', floor: '1F', lat: 23.48475, lng: 120.17820, desc: '位於教室南排東端 / South restroom' },

        // ===== 運動設施 =====
        { id: 'sp1', name: '運動場', category: 'sports', floor: '1F', lat: 23.48455, lng: 120.17790, desc: '半圓式200公尺跑道 / Athletic Field (200m track)' },
        { id: 'sp2', name: '球場一', category: 'sports', floor: '1F', lat: 23.48405, lng: 120.17760, desc: '籃球場 / Basketball Court 1' },
        { id: 'sp3', name: '球場二', category: 'sports', floor: '1F', lat: 23.48405, lng: 120.17800, desc: '籃球場 / Basketball Court 2' },
        { id: 'sp4', name: '自有球場', category: 'sports', floor: '1F', lat: 23.48455, lng: 120.17625, desc: '有蓋球場 / Covered Playground' },
        { id: 'sp5', name: '兒童遊戲場', category: 'sports', floor: '1F', lat: 23.48470, lng: 120.17665, desc: '兒童遊樂設施區 / Children Playground' },
        { id: 'sp6', name: '司令台', category: 'sports', floor: '1F', lat: 23.48490, lng: 120.17840, desc: '司令台 / Commander\'s Platform' },

        // ===== 出入口 =====
        { id: 'en1', name: '校門', category: 'entrance', floor: '1F', lat: 23.48385, lng: 120.17690, desc: '正門 / Main Gate（往副瀨方向）' },
        { id: 'en2', name: '側門', category: 'entrance', floor: '1F', lat: 23.48385, lng: 120.17830, desc: '側門 / Side Door（往龍港方向）' },
        { id: 'en3', name: '後門（西）', category: 'entrance', floor: '1F', lat: 23.48530, lng: 120.17640, desc: '西側後門 / Back Door (West)' },
        { id: 'en4', name: '後門（東）', category: 'entrance', floor: '1F', lat: 23.48530, lng: 120.17720, desc: '東側後門 / Back Door (East)' },

        // ===== 其他設施 =====
        { id: 'f01', name: '廚房', category: 'facility', floor: '1F', lat: 23.48520, lng: 120.17750, desc: '學校廚房 / Kitchen' },
        { id: 'f02', name: '抽水站', category: 'facility', floor: '1F', lat: 23.48500, lng: 120.17855, desc: '抽水站 / Pumping Station' },
        { id: 'f03', name: '機車棚', category: 'facility', floor: '1F', lat: 23.48395, lng: 120.17740, desc: '機車停車場 / Motorcycle Parking' },
        { id: 'f04', name: '汽車棚', category: 'facility', floor: '1F', lat: 23.48395, lng: 120.17790, desc: '汽車停車場 / Car Parking Lot' },
        { id: 'f05', name: '垃圾場', category: 'facility', floor: '1F', lat: 23.48405, lng: 120.17610, desc: '垃圾集中場 / Dumping Grounds' },
        { id: 'f06', name: '眼源花架', category: 'facility', floor: '1F', lat: 23.48460, lng: 120.17615, desc: '花架 / Pergola' },
        { id: 'f07', name: '防風林', category: 'facility', floor: '1F', lat: 23.48520, lng: 120.17670, desc: '北側防風林 / Windbreak' }
    ];

    // ---------- 校園分區資料 ----------
    const ZONES = [
        {
            id: 'z1', name: '教學區（北排）', color: '#3498db',
            desc: '圖書室、社會教室、視聽教室、階梯教室等',
            lat: 23.48505, lng: 120.17710,
            bounds: [
                [23.48495, 120.17600], [23.48515, 120.17600],
                [23.48515, 120.17840], [23.48495, 120.17840]
            ]
        },
        {
            id: 'z2', name: '教學區（南排）', color: '#2ecc71',
            desc: '一至六年級教室、幼兒園',
            lat: 23.48475, lng: 120.17710,
            bounds: [
                [23.48465, 120.17600], [23.48485, 120.17600],
                [23.48485, 120.17830], [23.48465, 120.17830]
            ]
        },
        {
            id: 'z3', name: '運動區', color: '#e67e22',
            desc: '運動場、籃球場、200公尺跑道',
            lat: 23.48445, lng: 120.17790,
            bounds: [
                [23.48400, 120.17730], [23.48490, 120.17730],
                [23.48490, 120.17860], [23.48400, 120.17860]
            ]
        },
        {
            id: 'z4', name: '幼兒園區', color: '#e91e63',
            desc: '幼甲班、幼乙班、遊戲室',
            lat: 23.48475, lng: 120.17635,
            bounds: [
                [23.48465, 120.17605], [23.48485, 120.17605],
                [23.48485, 120.17665], [23.48465, 120.17665]
            ]
        },
        {
            id: 'z5', name: '行政區', color: '#9b59b6',
            desc: '校長室、教導室、辦公室、輔導室',
            lat: 23.48505, lng: 120.17765,
            bounds: [
                [23.48495, 120.17730], [23.48515, 120.17730],
                [23.48515, 120.17800], [23.48495, 120.17800]
            ]
        },
        {
            id: 'z6', name: '停車區', color: '#95a5a6',
            desc: '機車棚、汽車停車場',
            lat: 23.48395, lng: 120.17765,
            bounds: [
                [23.48385, 120.17720], [23.48405, 120.17720],
                [23.48405, 120.17810], [23.48385, 120.17810]
            ]
        },
        {
            id: 'z7', name: '農田 / 漁塭', color: '#27ae60',
            desc: '校園北側農田與漁塭區域',
            lat: 23.48545, lng: 120.17740
        },
        {
            id: 'z8', name: '防風林', color: '#2d6a4f',
            desc: '北側防風林帶',
            lat: 23.48525, lng: 120.17670
        }
    ];

    // ---------- 熱門服務 ----------
    const HOT_SERVICES = [
        { label: '教室', category: 'classroom', icon: 'bi-book-fill', color: '#3498db' },
        { label: '行政辦公', category: 'admin', icon: 'bi-building-fill', color: '#9b59b6' },
        { label: '廁所', category: 'restroom', icon: 'bi-sign-intersection-y-fill', color: '#2ecc71' },
        { label: '運動設施', category: 'sports', icon: 'bi-trophy-fill', color: '#e67e22' },
        { label: '出入口', category: 'entrance', icon: 'bi-door-open-fill', color: '#e74c3c' },
        { label: '其他設施', category: 'facility', icon: 'bi-gear-fill', color: '#1abc9c' }
    ];

    // ---------- 收藏管理（localStorage） ----------
    const STORAGE_KEY = 'school_map_favorites';

    function getFavorites() {
        try {
            var data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    function toggleFavorite(poiId) {
        var favs = getFavorites();
        var idx = favs.indexOf(poiId);
        if (idx > -1) {
            favs.splice(idx, 1);
        } else {
            favs.push(poiId);
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
        return idx === -1;
    }

    function isFavorited(poiId) {
        return getFavorites().indexOf(poiId) > -1;
    }

    function getByCategory(category) {
        return POIS.filter(function (p) { return p.category === category; });
    }

    function search(keyword) {
        if (!keyword || !keyword.trim()) return [];
        var kw = keyword.trim().toLowerCase();
        return POIS.filter(function (p) {
            return p.name.toLowerCase().indexOf(kw) > -1 ||
                p.desc.toLowerCase().indexOf(kw) > -1;
        });
    }

    function getById(id) {
        return POIS.find(function (p) { return p.id === id; }) || null;
    }

    return {
        CENTER: CENTER,
        CATEGORIES: CATEGORIES,
        POIS: POIS,
        ZONES: ZONES,
        HOT_SERVICES: HOT_SERVICES,
        getFavorites: getFavorites,
        toggleFavorite: toggleFavorite,
        isFavorited: isFavorited,
        getByCategory: getByCategory,
        search: search,
        getById: getById
    };

})();
