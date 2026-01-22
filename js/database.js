// ============================
// DATABASE MATERIAL ALERT
// ============================

const materialDatabase = {
    // Data material
    materials: [
        {
            id: 1,
            name: "Semen Portland Tipe I",
            category: "Semen",
            unit: "Sak (40kg)",
            price: 65000,
            city: "Bandung",
            province: "Jawa Barat",
            date: "2024-01-15",
            source: "Pasar Induk"
        },
        {
            id: 2,
            name: "Besi Beton 10mm",
            category: "Besi",
            unit: "Batang (12m)",
            price: 120000,
            city: "Semarang",
            province: "Jawa Tengah",
            date: "2024-01-14",
            source: "Toko Besi Maju"
        },
        {
            id: 3,
            name: "Cat Tembok Vinilex",
            category: "Cat",
            unit: "Kaleng (5L)",
            price: 85000,
            city: "Surabaya",
            province: "Jawa Timur",
            date: "2024-01-16",
            source: "Toko Cat Sejahtera"
        },
        {
            id: 4,
            name: "Paku Beton 7cm",
            category: "Paku",
            unit: "Kg",
            price: 28500,
            city: "Bogor",
            province: "Jawa Barat",
            date: "2024-01-13",
            source: "Pasar Induk"
        },
        {
            id: 5,
            name: "Triplek 9mm",
            category: "Kayu",
            unit: "Lembar",
            price: 95000,
            city: "Malang",
            province: "Jawa Timur",
            date: "2024-01-12",
            source: "Toko Kayu Jaya"
        },
        {
            id: 6,
            name: "Bata Merah Press",
            category: "Bata",
            unit: "Buah",
            price: 1200,
            city: "Salatiga",
            province: "Jawa Tengah",
            date: "2024-01-11",
            source: "Pabrik Bata"
        },
        {
            id: 7,
            name: "Keramik 40x40",
            category: "Keramik",
            unit: "m²",
            price: 89000,
            city: "Cirebon",
            province: "Jawa Barat",
            date: "2024-01-10",
            source: "Toko Keramik Indah"
        }
    ],

    // Ambil semua kategori unik
    getAllCategories: function() {
        const categories = [...new Set(this.materials.map(item => item.category))];
        return categories.sort();
    },

    // Ambil semua provinsi unik
    getAllProvinces: function() {
        const provinces = [...new Set(this.materials.map(item => item.province))];
        return provinces.sort();
    },

    // Ambil kota berdasarkan provinsi
    getCitiesByProvince: function(province) {
        return [...new Set(this.materials
            .filter(item => item.province === province)
            .map(item => item.city))].sort();
    },

    // Ambil semua satuan unik
    getAllUnits: function() {
        const units = [...new Set(this.materials.map(item => item.unit))];
        return units.sort();
    },

    // Cari material berdasarkan kriteria
    searchMaterials: function(province = null, city = null, category = null, keyword = null) {
        return this.materials.filter(item => {
            let match = true;
            
            if (province && item.province !== province) match = false;
            if (city && item.city !== city) match = false;
            if (category && category !== "all" && item.category !== category) match = false;
            if (keyword && !item.name.toLowerCase().includes(keyword.toLowerCase())) match = false;
            
            return match;
        });
    },

    // Tambah material baru
    addMaterial: function(newMaterial) {
        const lastId = this.materials.length > 0 
            ? Math.max(...this.materials.map(m => m.id)) 
            : 0;
        
        const materialWithId = {
            id: lastId + 1,
            ...newMaterial
        };
        
        this.materials.push(materialWithId);
        return materialWithId;
    },

    // Ambil material by ID
    getMaterialById: function(id) {
        return this.materials.find(item => item.id === id);
    },

    // Update material
    updateMaterial: function(id, updatedData) {
        const index = this.materials.findIndex(item => item.id === id);
        if (index !== -1) {
            this.materials[index] = { ...this.materials[index], ...updatedData };
            return this.materials[index];
        }
        return null;
    },

    // Delete material
    deleteMaterial: function(id) {
        const index = this.materials.findIndex(item => item.id === id);
        if (index !== -1) {
            return this.materials.splice(index, 1)[0];
        }
        return null;
    },

    // Get statistics
    getStatistics: function() {
        return {
            totalMaterials: this.materials.length,
            totalCategories: this.getAllCategories().length,
            totalProvinces: this.getAllProvinces().length,
            averagePrice: Math.round(this.materials.reduce((sum, item) => sum + item.price, 0) / this.materials.length),
            newestMaterial: this.materials.reduce((newest, item) => 
                new Date(item.date) > new Date(newest.date) ? item : newest
            )
        };
    }
};

// Export untuk penggunaan di file lain
if (typeof module !== 'undefined' && module.exports) {
    module.exports = materialDatabase;
}