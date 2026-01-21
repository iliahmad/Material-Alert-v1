// ============================================
// DATABASE MATERIAL ALERT - INDONESIA LENGKAP
// ============================================

const DB_NAME = 'material_alert_db';
const DB_VERSION = 2;
let db = null;

// Data lengkap Indonesia
const INDONESIA_PROVINCES = [
    { id: 1, name: 'Aceh' },
    { id: 2, name: 'Sumatera Utara' },
    { id: 3, name: 'Sumatera Barat' },
    { id: 4, name: 'Riau' },
    { id: 5, name: 'Jambi' },
    { id: 6, name: 'Sumatera Selatan' },
    { id: 7, name: 'Bengkulu' },
    { id: 8, name: 'Lampung' },
    { id: 9, name: 'Kepulauan Bangka Belitung' },
    { id: 10, name: 'Kepulauan Riau' },
    { id: 11, name: 'DKI Jakarta' },
    { id: 12, name: 'Jawa Barat' },
    { id: 13, name: 'Jawa Tengah' },
    { id: 14, name: 'DI Yogyakarta' },
    { id: 15, name: 'Jawa Timur' },
    { id: 16, name: 'Banten' },
    { id: 17, name: 'Bali' },
    { id: 18, name: 'Nusa Tenggara Barat' },
    { id: 19, name: 'Nusa Tenggara Timur' },
    { id: 20, name: 'Kalimantan Barat' },
    { id: 21, name: 'Kalimantan Tengah' },
    { id: 22, name: 'Kalimantan Selatan' },
    { id: 23, name: 'Kalimantan Timur' },
    { id: 24, name: 'Kalimantan Utara' },
    { id: 25, name: 'Sulawesi Utara' },
    { id: 26, name: 'Sulawesi Tengah' },
    { id: 27, name: 'Sulawesi Selatan' },
    { id: 28, name: 'Sulawesi Tenggara' },
    { id: 29, name: 'Gorontalo' },
    { id: 30, name: 'Sulawesi Barat' },
    { id: 31, name: 'Maluku' },
    { id: 32, name: 'Maluku Utara' },
    { id: 33, name: 'Papua Barat' },
    { id: 34, name: 'Papua' },
    { id: 35, name: 'Papua Tengah' },
    { id: 36, name: 'Papua Pegunungan' },
    { id: 37, name: 'Papua Selatan' },
    { id: 38, name: 'Papua Barat Daya' }
];

// Sample kota/kabupaten (untuk demo, bisa ditambah)
const INDONESIA_CITIES = [
    // Aceh (1)
    { id: 1, province_id: 1, name: 'Kota Banda Aceh' },
    { id: 2, province_id: 1, name: 'Kota Sabang' },
    { id: 3, province_id: 1, name: 'Kab. Aceh Besar' },
    { id: 4, province_id: 1, name: 'Kab. Pidie' },
    
    // Sumatera Utara (2)
    { id: 5, province_id: 2, name: 'Kota Medan' },
    { id: 6, province_id: 2, name: 'Kota Pematang Siantar' },
    { id: 7, province_id: 2, name: 'Kab. Deli Serdang' },
    { id: 8, province_id: 2, name: 'Kab. Karo' },
    
    // Sumatera Barat (3)
    { id: 9, province_id: 3, name: 'Kota Padang' },
    { id: 10, province_id: 3, name: 'Kota Bukittinggi' },
    { id: 11, province_id: 3, name: 'Kab. Agam' },
    { id: 12, province_id: 3, name: 'Kab. Tanah Datar' },
    
    // Riau (4)
    { id: 13, province_id: 4, name: 'Kota Pekanbaru' },
    { id: 14, province_id: 4, name: 'Kota Dumai' },
    { id: 15, province_id: 4, name: 'Kab. Kampar' },
    { id: 16, province_id: 4, name: 'Kab. Siak' },
    
    // Jambi (5)
    { id: 17, province_id: 5, name: 'Kota Jambi' },
    { id: 18, province_id: 5, name: 'Kab. Muaro Jambi' },
    { id: 19, province_id: 5, name: 'Kab. Batanghari' },
    
    // Sumatera Selatan (6)
    { id: 20, province_id: 6, name: 'Kota Palembang' },
    { id: 21, province_id: 6, name: 'Kab. Musi Banyuasin' },
    
    // Bengkulu (7)
    { id: 22, province_id: 7, name: 'Kota Bengkulu' },
    
    // Lampung (8)
    { id: 23, province_id: 8, name: 'Kota Bandar Lampung' },
    { id: 24, province_id: 8, name: 'Kab. Lampung Selatan' },
    
    // Bangka Belitung (9)
    { id: 25, province_id: 9, name: 'Kota Pangkal Pinang' },
    
    // Kepulauan Riau (10)
    { id: 26, province_id: 10, name: 'Kota Batam' },
    
    // DKI Jakarta (11)
    { id: 27, province_id: 11, name: 'Jakarta Pusat' },
    { id: 28, province_id: 11, name: 'Jakarta Selatan' },
    { id: 29, province_id: 11, name: 'Jakarta Barat' },
    { id: 30, province_id: 11, name: 'Jakarta Timur' },
    { id: 31, province_id: 11, name: 'Jakarta Utara' },
    
    // Jawa Barat (12)
    { id: 32, province_id: 12, name: 'Kota Bandung' },
    { id: 33, province_id: 12, name: 'Kota Bogor' },
    { id: 34, province_id: 12, name: 'Kota Bekasi' },
    { id: 35, province_id: 12, name: 'Kota Depok' },
    { id: 36, province_id: 12, name: 'Kab. Bandung' },
    { id: 37, province_id: 12, name: 'Kab. Bogor' },
    { id: 38, province_id: 12, name: 'Kab. Bekasi' },
    
    // Jawa Tengah (13)
    { id: 39, province_id: 13, name: 'Kota Semarang' },
    { id: 40, province_id: 13, name: 'Kota Surakarta' },
    { id: 41, province_id: 13, name: 'Kab. Semarang' },
    { id: 42, province_id: 13, name: 'Kab. Klaten' },
    
    // DI Yogyakarta (14)
    { id: 43, province_id: 14, name: 'Kota Yogyakarta' },
    { id: 44, province_id: 14, name: 'Kab. Sleman' },
    { id: 45, province_id: 14, name: 'Kab. Bantul' },
    
    // Jawa Timur (15)
    { id: 46, province_id: 15, name: 'Kota Surabaya' },
    { id: 47, province_id: 15, name: 'Kota Malang' },
    { id: 48, province_id: 15, name: 'Kab. Sidoarjo' },
    { id: 49, province_id: 15, name: 'Kab. Malang' },
    
    // Banten (16)
    { id: 50, province_id: 16, name: 'Kota Tangerang' },
    { id: 51, province_id: 16, name: 'Kota Serang' },
    { id: 52, province_id: 16, name: 'Kab. Tangerang' },
    
    // Bali (17)
    { id: 53, province_id: 17, name: 'Kota Denpasar' },
    { id: 54, province_id: 17, name: 'Kab. Badung' },
    
    // NTB (18)
    { id: 55, province_id: 18, name: 'Kota Mataram' },
    
    // NTT (19)
    { id: 56, province_id: 19, name: 'Kota Kupang' },
    
    // Kalimantan Barat (20)
    { id: 57, province_id: 20, name: 'Kota Pontianak' },
    
    // Kalimantan Tengah (21)
    { id: 58, province_id: 21, name: 'Kota Palangka Raya' },
    
    // Kalimantan Selatan (22)
    { id: 59, province_id: 22, name: 'Kota Banjarmasin' },
    
    // Kalimantan Timur (23)
    { id: 60, province_id: 23, name: 'Kota Samarinda' },
    { id: 61, province_id: 23, name: 'Kota Balikpapan' },
    
    // Kalimantan Utara (24)
    { id: 62, province_id: 24, name: 'Kota Tarakan' },
    
    // Sulawesi Utara (25)
    { id: 63, province_id: 25, name: 'Kota Manado' },
    
    // Sulawesi Tengah (26)
    { id: 64, province_id: 26, name: 'Kota Palu' },
    
    // Sulawesi Selatan (27)
    { id: 65, province_id: 27, name: 'Kota Makassar' },
    
    // Sulawesi Tenggara (28)
    { id: 66, province_id: 28, name: 'Kota Kendari' },
    
    // Gorontalo (29)
    { id: 67, province_id: 29, name: 'Kota Gorontalo' },
    
    // Sulawesi Barat (30)
    { id: 68, province_id: 30, name: 'Kab. Mamuju' },
    
    // Maluku (31)
    { id: 69, province_id: 31, name: 'Kota Ambon' },
    
    // Maluku Utara (32)
    { id: 70, province_id: 32, name: 'Kota Ternate' },
    
    // Papua Barat (33)
    { id: 71, province_id: 33, name: 'Kota Sorong' },
    
    // Papua (34)
    { id: 72, province_id: 34, name: 'Kota Jayapura' }
];

const MATERIAL_CATEGORIES = [
    { id: 1, name: 'Bahan Bangunan' },
    { id: 2, name: 'Cat & Pelapis' },
    { id: 3, name: 'Pipa & Fitting' },
    { id: 4, name: 'Besi & Baja' },
    { id: 5, name: 'Kayu' },
    { id: 6, name: 'Kaca & Aluminium' },
    { id: 7, name: 'Atap & Genteng' },
    { id: 8, name: 'Sanitasi' },
    { id: 9, name: 'Listrik' },
    { id: 10, name: 'Peralatan Kerja' }
];

const SAMPLE_MATERIALS = [
    { id: 1, category_id: 1, name: 'Semen Portland', unit: 'sak' },
    { id: 2, category_id: 1, name: 'Bata Merah Press', unit: 'buah' },
    { id: 3, category_id: 1, name: 'Bata Ringan (Hebel)', unit: 'm³' },
    { id: 4, category_id: 1, name: 'Pasir Pasang', unit: 'm³' },
    { id: 5, category_id: 1, name: 'Split (Batu Pecah)', unit: 'm³' },
    { id: 6, category_id: 2, name: 'Cat Tembok Vinilex', unit: 'kaleng' },
    { id: 7, category_id: 2, name: 'Cat Besi', unit: 'kaleng' },
    { id: 8, category_id: 2, name: 'Cat Kayu', unit: 'kaleng' },
    { id: 9, category_id: 3, name: 'Pipa PVC ¾"', unit: 'batang' },
    { id: 10, category_id: 3, name: 'Pipa PVC 1"', unit: 'batang' },
    { id: 11, category_id: 3, name: 'Pipa PVC 2"', unit: 'batang' },
    { id: 12, category_id: 4, name: 'Besi Beton 8mm', unit: 'batang' },
    { id: 13, category_id: 4, name: 'Besi Beton 10mm', unit: 'batang' },
    { id: 14, category_id: 4, name: 'Besi Hollow 40x40', unit: 'batang' },
    { id: 15, category_id: 5, name: 'Kayu Meranti 5x10', unit: 'm' },
    { id: 16, category_id: 6, name: 'Kaca Bening 3mm', unit: 'm²' },
    { id: 17, category_id: 7, name: 'Genteng Beton', unit: 'buah' },
    { id: 18, category_id: 8, name: 'Kloset Duduk', unit: 'buah' },
    { id: 19, category_id: 9, name: 'Kabel NYY 2x2.5', unit: 'm' },
    { id: 20, category_id: 10, name: 'Palu', unit: 'buah' }
];

// ============================================
// DATABASE FUNCTIONS
// ============================================

function initDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = (event) => {
            console.error('Database error:', event.target.error);
            updateConnectionStatus(false);
            reject(event.target.error);
        };
        
        request.onsuccess = (event) => {
            db = event.target.result;
            console.log('Database opened successfully');
            updateConnectionStatus(true);
            
            // Seed data jika database kosong
            checkAndSeedData().then(() => {
                console.log('Database ready');
                resolve();
            }).catch(error => {
                console.error('Error seeding data:', error);
                resolve(); // Tetap resolve meski seeding error
            });
        };
        
        request.onupgradeneeded = (event) => {
            db = event.target.result;
            
            // Hapus store lama jika ada
            if (db.objectStoreNames.contains('provinces')) db.deleteObjectStore('provinces');
            if (db.objectStoreNames.contains('cities')) db.deleteObjectStore('cities');
            if (db.objectStoreNames.contains('material_categories')) db.deleteObjectStore('material_categories');
            if (db.objectStoreNames.contains('materials')) db.deleteObjectStore('materials');
            if (db.objectStoreNames.contains('material_prices')) db.deleteObjectStore('material_prices');
            
            // Buat object stores
            const provinceStore = db.createObjectStore('provinces', { keyPath: 'id' });
            provinceStore.createIndex('name', 'name', { unique: true });
            
            const cityStore = db.createObjectStore('cities', { keyPath: 'id' });
            cityStore.createIndex('province_id', 'province_id', { unique: false });
            
            const categoryStore = db.createObjectStore('material_categories', { keyPath: 'id' });
            categoryStore.createIndex('name', 'name', { unique: true });
            
            const materialStore = db.createObjectStore('materials', { keyPath: 'id' });
            materialStore.createIndex('category_id', 'category_id', { unique: false });
            
            const priceStore = db.createObjectStore('material_prices', { keyPath: 'id', autoIncrement: true });
            priceStore.createIndex('material_id', 'material_id', { unique: false });
            priceStore.createIndex('city_id', 'city_id', { unique: false });
            priceStore.createIndex('price_date', 'price_date', { unique: false });
            
            console.log('Database schema created');
        };
    });
}

async function checkAndSeedData() {
    try {
        const transaction = db.transaction(['provinces'], 'readonly');
        const store = transaction.objectStore('provinces');
        const countRequest = store.count();
        
        const count = await new Promise((resolve, reject) => {
            countRequest.onsuccess = () => resolve(countRequest.result);
            countRequest.onerror = reject;
        });
        
        if (count === 0) {
            console.log('Seeding database with initial data...');
            await seedInitialData();
        }
    } catch (error) {
        console.error('Error checking database:', error);
        throw error;
    }
}

async function seedInitialData() {
    try {
        console.log('Seeding provinces...');
        for (const province of INDONESIA_PROVINCES) {
            await addRecord('provinces', {
                ...province,
                created_at: new Date().toISOString()
            });
        }
        
        console.log('Seeding cities...');
        for (const city of INDONESIA_CITIES) {
            await addRecord('cities', {
                ...city,
                created_at: new Date().toISOString()
            });
        }
        
        console.log('Seeding categories...');
        for (const category of MATERIAL_CATEGORIES) {
            await addRecord('material_categories', {
                ...category,
                created_at: new Date().toISOString()
            });
        }
        
        console.log('Seeding materials...');
        for (const material of SAMPLE_MATERIALS) {
            await addRecord('materials', {
                ...material,
                created_at: new Date().toISOString()
            });
        }
        
        console.log('Seeding sample prices...');
        // Tambahkan harga sample untuk beberapa material di beberapa kota
        const samplePrices = [
            { material_id: 1, city_id: 32, price: 65000, price_date: '2024-01-15', source: 'Pasar Induk Bandung', notes: 'Harga normal' },
            { material_id: 1, city_id: 33, price: 63000, price_date: '2024-01-14', source: 'Toko Bangunan Bogor' },
            { material_id: 1, city_id: 46, price: 67000, price_date: '2024-01-16', source: 'Supplier Surabaya' },
            { material_id: 2, city_id: 32, price: 850, price_date: '2024-01-15', source: 'Pasar Induk Bandung' },
            { material_id: 6, city_id: 27, price: 125000, price_date: '2024-01-14', source: 'Toko Cat Jakarta' },
            { material_id: 12, city_id: 32, price: 42000, price_date: '2024-01-15', source: 'Toko Besi Bandung' }
        ];
        
        for (const price of samplePrices) {
            await addRecord('material_prices', {
                ...price,
                created_at: new Date().toISOString()
            });
        }
        
        console.log('Database seeded successfully!');
        
    } catch (error) {
        console.error('Error seeding data:', error);
        throw error;
    }
}

// ============================================
// CRUD OPERATIONS
// ============================================

function addRecord(storeName, data) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.add(data);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

function getAllRecords(storeName) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

function getRecordsByIndex(storeName, indexName, value) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const index = store.index(indexName);
        const request = index.getAll(value);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

function getRecordById(storeName, id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(id);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

async function searchMaterials(criteria) {
    try {
        let allMaterials = await getAllRecords('materials');
        
        // Filter by material name
        if (criteria.materialName) {
            allMaterials = allMaterials.filter(m => 
                m.name.toLowerCase().includes(criteria.materialName.toLowerCase())
            );
        }
        
        // Filter by category
        if (criteria.categoryId) {
            allMaterials = allMaterials.filter(m => 
                m.category_id === parseInt(criteria.categoryId)
            );
        }
        
        // If location filters exist, we need to check prices
        if (criteria.cityId || criteria.provinceId) {
            const allPrices = await getAllRecords('material_prices');
            let filteredPriceMaterialIds = [];
            
            if (criteria.cityId) {
                filteredPriceMaterialIds = allPrices
                    .filter(p => p.city_id === parseInt(criteria.cityId))
                    .map(p => p.material_id);
            } else if (criteria.provinceId) {
                // Get cities in this province
                const citiesInProvince = await getRecordsByIndex('cities', 'province_id', parseInt(criteria.provinceId));
                const cityIdsInProvince = citiesInProvince.map(c => c.id);
                
                filteredPriceMaterialIds = allPrices
                    .filter(p => cityIdsInProvince.includes(p.city_id))
                    .map(p => p.material_id);
            }
            
            // Filter materials that have prices in the filtered locations
            allMaterials = allMaterials.filter(m => 
                filteredPriceMaterialIds.includes(m.id)
            );
        }
        
        return allMaterials;
        
    } catch (error) {
        console.error('Error searching materials:', error);
        return [];
    }
}

async function getMaterialDetails(materialIds) {
    try {
        const details = [];
        
        for (const materialId of materialIds) {
            const material = await getRecordById('materials', materialId);
            if (!material) continue;
            
            // Get category
            const category = await getRecordById('material_categories', material.category_id);
            
            // Get latest price
            const prices = await getRecordsByIndex('material_prices', 'material_id', materialId);
            const latestPrice = prices.length > 0 
                ? prices.reduce((latest, current) => 
                    new Date(current.price_date) > new Date(latest.price_date) ? current : latest
                  )
                : null;
            
            // Get city and province for latest price
            let city = null;
            let province = null;
            
            if (latestPrice) {
                city = await getRecordById('cities', latestPrice.city_id);
                if (city) {
                    province = await getRecordById('provinces', city.province_id);
                }
            }
            
            details.push({
                material,
                category,
                latestPrice,
                city,
                province
            });
        }
        
        return details;
        
    } catch (error) {
        console.error('Error getting material details:', error);
        return [];
    }
}

async function getDashboardStats() {
    try {
        const [materials, cities, prices, categories, provinces] = await Promise.all([
            getAllRecords('materials'),
            getAllRecords('cities'),
            getAllRecords('material_prices'),
            getAllRecords('material_categories'),
            getAllRecords('provinces')
        ]);
        
        return {
            totalMaterials: materials.length,
            totalLocations: cities.length,
            totalPrices: prices.length,
            totalCategories: categories.length,
            totalProvinces: provinces.length,
            lastUpdate: prices.length > 0 
                ? new Date(Math.max(...prices.map(p => new Date(p.created_at)))) 
                : new Date()
        };
        
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        return null;
    }
}

// ============================================
// EXPORT FUNCTIONS
// ============================================

window.database = {
    initDatabase,
    getAllRecords,
    getRecordsByIndex,
    getRecordById,
    addRecord,
    searchMaterials,
    getMaterialDetails,
    getDashboardStats
};