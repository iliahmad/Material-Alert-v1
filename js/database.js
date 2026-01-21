// ============================================
// KONFIGURASI DATABASE
// ============================================

// Nama database
const DB_NAME = 'material_alert_db';
const DB_VERSION = 1;

// Inisialisasi database IndexedDB
let db;

// ============================================
// FUNGSI UTAMA DATABASE
// ============================================

// Inisialisasi database
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
            console.log('Database berhasil dibuka');
            updateConnectionStatus(true);
            
            // Cek apakah database sudah memiliki data
            checkAndSeedData().then(() => {
                resolve();
            }).catch(error => {
                console.error('Error seeding data:', error);
                resolve(); // Tetap resolve meski seeding gagal
            });
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Hapus object store yang lama jika ada
            if (db.objectStoreNames.contains('provinces')) db.deleteObjectStore('provinces');
            if (db.objectStoreNames.contains('cities')) db.deleteObjectStore('cities');
            if (db.objectStoreNames.contains('material_categories')) db.deleteObjectStore('material_categories');
            if (db.objectStoreNames.contains('materials')) db.deleteObjectStore('materials');
            if (db.objectStoreNames.contains('material_prices')) db.deleteObjectStore('material_prices');
            if (db.objectStoreNames.contains('price_reminders')) db.deleteObjectStore('price_reminders');
            
            // Buat object store untuk provinces
            const provinceStore = db.createObjectStore('provinces', { keyPath: 'id', autoIncrement: true });
            provinceStore.createIndex('name', 'name', { unique: true });
            
            // Buat object store untuk cities
            const cityStore = db.createObjectStore('cities', { keyPath: 'id', autoIncrement: true });
            cityStore.createIndex('province_id', 'province_id', { unique: false });
            cityStore.createIndex('name', 'name', { unique: false });
            
            // Buat object store untuk material_categories
            const categoryStore = db.createObjectStore('material_categories', { keyPath: 'id', autoIncrement: true });
            categoryStore.createIndex('name', 'name', { unique: true });
            
            // Buat object store untuk materials
            const materialStore = db.createObjectStore('materials', { keyPath: 'id', autoIncrement: true });
            materialStore.createIndex('category_id', 'category_id', { unique: false });
            materialStore.createIndex('name', 'name', { unique: false });
            
            // Buat object store untuk material_prices
            const priceStore = db.createObjectStore('material_prices', { keyPath: 'id', autoIncrement: true });
            priceStore.createIndex('material_id', 'material_id', { unique: false });
            priceStore.createIndex('city_id', 'city_id', { unique: false });
            priceStore.createIndex('price_date', 'price_date', { unique: false });
            
            // Buat object store untuk price_reminders
            const reminderStore = db.createObjectStore('price_reminders', { keyPath: 'id', autoIncrement: true });
            reminderStore.createIndex('material_id', 'material_id', { unique: false });
            reminderStore.createIndex('city_id', 'city_id', { unique: false });
            
            console.log('Database schema berhasil dibuat');
        };
    });
}

// Seed data awal jika database kosong
async function checkAndSeedData() {
    const transaction = db.transaction(['provinces'], 'readonly');
    const store = transaction.objectStore('provinces');
    const countRequest = store.count();
    
    return new Promise((resolve) => {
        countRequest.onsuccess = (event) => {
            if (event.target.result === 0) {
                console.log('Database kosong, menambahkan data awal...');
                seedInitialData().then(resolve);
            } else {
                console.log('Database sudah memiliki data');
                resolve();
            }
        };
    });
}

// Data awal sesuai dengan schema.sql
async function seedInitialData() {
    try {
        // Tambahkan provinsi
        const provinces = [
            { id: 1, name: 'Jawa Barat', created_at: new Date().toISOString() },
            { id: 2, name: 'Jawa Tengah', created_at: new Date().toISOString() },
            { id: 3, name: 'Jawa Timur', created_at: new Date().toISOString() },
            { id: 4, name: 'DKI Jakarta', created_at: new Date().toISOString() }
        ];
        
        for (const province of provinces) {
            await addRecord('provinces', province);
        }
        
        // Tambahkan kota
        const cities = [
            { province_id: 1, name: 'Bandung', created_at: new Date().toISOString() },
            { province_id: 1, name: 'Bogor', created_at: new Date().toISOString() },
            { province_id: 2, name: 'Semarang', created_at: new Date().toISOString() },
            { province_id: 3, name: 'Surabaya', created_at: new Date().toISOString() },
            { province_id: 4, name: 'Jakarta Pusat', created_at: new Date().toISOString() },
            { province_id: 4, name: 'Jakarta Selatan', created_at: new Date().toISOString() }
        ];
        
        for (const city of cities) {
            await addRecord('cities', city);
        }
        
        // Tambahkan kategori material
        const categories = [
            { id: 1, name: 'Bahan Bangunan', created_at: new Date().toISOString() },
            { id: 2, name: 'Cat & Pelapis', created_at: new Date().toISOString() },
            { id: 3, name: 'Pipa & Fitting', created_at: new Date().toISOString() }
        ];
        
        for (const category of categories) {
            await addRecord('material_categories', category);
        }
        
        // Tambahkan material
        const materials = [
            { category_id: 1, name: 'Semen Tiga Roda', unit: 'sak', created_at: new Date().toISOString() },
            { category_id: 1, name: 'Bata Merah Press', unit: 'buah', created_at: new Date().toISOString() },
            { category_id: 2, name: 'Cat Tembok Avitex', unit: 'kaleng', created_at: new Date().toISOString() },
            { category_id: 3, name: 'Pipa PVC 3"', unit: 'batang', created_at: new Date().toISOString() }
        ];
        
        for (const material of materials) {
            await addRecord('materials', material);
        }
        
        // Tambahkan beberapa harga contoh
        const prices = [
            { material_id: 1, city_id: 1, price: 65000, price_date: '2023-10-01', source: 'Pasar Induk Bandung', notes: 'Harga normal', created_at: new Date().toISOString() },
            { material_id: 2, city_id: 1, price: 850, price_date: '2023-10-01', source: 'Pasar Induk Bandung', notes: 'Bata merah press', created_at: new Date().toISOString() },
            { material_id: 3, city_id: 5, price: 245000, price_date: '2023-10-01', source: 'Toko Bangunan Jaya', notes: 'Cat tembok Avitex', created_at: new Date().toISOString() },
            { material_id: 4, city_id: 3, price: 120000, price_date: '2023-10-01', source: 'Toko Pipa Sentosa', notes: 'Pipa PVC 3 inch', created_at: new Date().toISOString() }
        ];
        
        for (const price of prices) {
            await addRecord('material_prices', price);
        }
        
        console.log('Data awal berhasil ditambahkan');
    } catch (error) {
        console.error('Error seeding data:', error);
    }
}

// Fungsi umum untuk menambah data
function addRecord(storeName, data) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.add(data);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// Fungsi umum untuk mendapatkan semua data
function getAllRecords(storeName) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// Fungsi untuk mendapatkan data dengan filter
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

// Fungsi untuk mendapatkan data berdasarkan ID
function getRecordById(storeName, id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(id);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// Fungsi untuk mencari material dengan kriteria
async function searchMaterials(criteria) {
    try {
        const allMaterials = await getAllRecords('materials');
        let filteredMaterials = allMaterials;
        
        // Filter berdasarkan nama material
        if (criteria.materialName) {
            filteredMaterials = filteredMaterials.filter(m => 
                m.name.toLowerCase().includes(criteria.materialName.toLowerCase())
            );
        }
        
        // Filter berdasarkan kategori
        if (criteria.categoryId) {
            filteredMaterials = filteredMaterials.filter(m => 
                m.category_id === parseInt(criteria.categoryId)
            );
        }
        
        // Jika ada filter provinsi atau kota
        if (criteria.provinceId || criteria.cityId) {
            // Dapatkan semua harga
            const allPrices = await getAllRecords('material_prices');
            
            // Filter harga berdasarkan kota
            let filteredPriceIds = allPrices;
            
            if (criteria.cityId) {
                filteredPriceIds = filteredPriceIds.filter(p => 
                    p.city_id === parseInt(criteria.cityId)
                );
            } else if (criteria.provinceId) {
                // Filter berdasarkan provinsi
                const citiesInProvince = await getRecordsByIndex('cities', 'province_id', parseInt(criteria.provinceId));
                const cityIdsInProvince = citiesInProvince.map(c => c.id);
                filteredPriceIds = filteredPriceIds.filter(p => 
                    cityIdsInProvince.includes(p.city_id)
                );
            }
            
            // Dapatkan material_id dari harga yang difilter
            const materialIdsFromPrices = [...new Set(filteredPriceIds.map(p => p.material_id))];
            
            // Filter material berdasarkan material_id yang memiliki harga di lokasi yang dicari
            filteredMaterials = filteredMaterials.filter(m => 
                materialIdsFromPrices.includes(m.id)
            );
        }
        
        return filteredMaterials;
        
    } catch (error) {
        console.error('Error searching materials:', error);
        return [];
    }
}

// Fungsi untuk mendapatkan detail material lengkap
async function getMaterialDetails(materialId) {
    try {
        // Dapatkan material
        const material = await getRecordById('materials', materialId);
        if (!material) return null;
        
        // Dapatkan kategori
        const categories = await getRecordsByIndex('material_categories', 'id', material.category_id);
        const category = categories.length > 0 ? categories[0] : null;
        
        // Dapatkan semua harga untuk material ini
        const prices = await getRecordsByIndex('material_prices', 'material_id', materialId);
        
        // Untuk setiap harga, dapatkan detail kota dan provinsi
        const priceDetails = [];
        
        for (const price of prices) {
            // Dapatkan kota
            const cities = await getRecordsByIndex('cities', 'id', price.city_id);
            const city = cities.length > 0 ? cities[0] : null;
            
            // Dapatkan provinsi
            let province = null;
            if (city) {
                const provinces = await getRecordsByIndex('provinces', 'id', city.province_id);
                province = provinces.length > 0 ? provinces[0] : null;
            }
            
            priceDetails.push({
                price: price,
                city: city,
                province: province,
                formattedPrice: formatCurrency(price.price)
            });
        }
        
        return {
            material: material,
            category: category,
            prices: priceDetails
        };
        
    } catch (error) {
        console.error('Error getting material details:', error);
        return null;
    }
}

// Fungsi untuk mendapatkan harga terbaru untuk material di suatu kota
async function getLatestPrice(materialId, cityId = null) {
    try {
        let prices;
        
        if (cityId) {
            // Dapatkan harga untuk material di kota tertentu
            const materialPrices = await getRecordsByIndex('material_prices', 'material_id', materialId);
            prices = materialPrices.filter(p => p.city_id === cityId);
        } else {
            // Dapatkan semua harga untuk material
            prices = await getRecordsByIndex('material_prices', 'material_id', materialId);
        }
        
        if (prices.length === 0) return null;
        
        // Ambil harga terbaru berdasarkan tanggal
        const latestPrice = prices.reduce((latest, current) => {
            return new Date(current.price_date) > new Date(latest.price_date) ? current : latest;
        });
        
        return latestPrice;
        
    } catch (error) {
        console.error('Error getting latest price:', error);
        return null;
    }
}