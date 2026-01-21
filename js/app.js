// ============================================
// LOGIKA UTAMA APLIKASI
// ============================================

// Inisialisasi aplikasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Aplikasi MATERIAL ALERT dimuat...');
    
    try {
        // Inisialisasi database
        await initDatabase();
        
        // Setup event listeners
        setupEventListeners();
        
        // Muat data awal
        await loadInitialData();
        
        // Tampilkan versi aplikasi di console
        console.log('MATERIAL ALERT v1.0 - Siap digunakan');
        
    } catch (error) {
        console.error('Gagal menginisialisasi aplikasi:', error);
        showNotification('Gagal menginisialisasi aplikasi. Silakan refresh halaman.', 'error');
    }
});

// Muat data awal
async function loadInitialData() {
    try {
        // Muat opsi dropdown
        await loadSelectOptions();
        
        // Update dashboard
        await updateDashboard();
        
    } catch (error) {
        console.error('Error loading initial data:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            const navMenu = document.getElementById('navMenu');
            if (navMenu) {
                navMenu.classList.toggle('show');
            }
        });
    }
    
    // Tutup mobile menu ketika klik di luar
    document.addEventListener('click', function(event) {
        const navMenu = document.getElementById('navMenu');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        
        if (navMenu && navMenu.classList.contains('show') && 
            !navMenu.contains(event.target) && 
            !mobileMenuBtn.contains(event.target)) {
            navMenu.classList.remove('show');
        }
    });
    
    // Page navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetPage = this.getAttribute('data-page');
            navigateToPage(targetPage);
            
            // Jika halaman hasil dimuat, tampilkan data
            if (targetPage === 'results') {
                const criteria = getSearchCriteria();
                if (criteria) {
                    displaySearchCriteria(criteria);
                    loadResultsPage(criteria);
                } else {
                    // Jika tidak ada kriteria, kembali ke halaman pencarian
                    navigateToPage('search');
                }
            }
        });
    });
    
    // Update kota ketika provinsi berubah
    const provinceSelect = document.getElementById('province');
    if (provinceSelect) {
        provinceSelect.addEventListener('change', function() {
            updateCityOptions('province', 'city');
        });
    }
    
    const searchProvinceSelect = document.getElementById('searchProvince');
    if (searchProvinceSelect) {
        searchProvinceSelect.addEventListener('change', function() {
            updateCityOptions('searchProvince', 'searchCity');
        });
    }
    
    // Validasi input harga
    const unitPriceInput = document.getElementById('unitPrice');
    if (unitPriceInput) {
        unitPriceInput.addEventListener('input', function() {
            if (this.value < 0) this.value = 0;
        });
    }
    
    // Form submission untuk input material baru
    const materialForm = document.getElementById('materialForm');
    if (materialForm) {
        materialForm.addEventListener('submit', handleMaterialSubmit);
    }
    
    // Pencarian material
    const searchButton = document.getElementById('searchButton');
    if (searchButton) {
        searchButton.addEventListener('click', handleSearch);
    }
    
    // Tombol kembali dari hasil ke pencarian
    const backToSearchBtn = document.getElementById('backToSearch');
    if (backToSearchBtn) {
        backToSearchBtn.addEventListener('click', function(e) {
            e.preventDefault();
            navigateToPage('search');
        });
    }
    
    // Handle tombol reset form
    const resetButtons = document.querySelectorAll('button[type="reset"]');
    resetButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Reset tanggal ke hari ini
            const priceDateInput = document.getElementById('priceDate');
            if (priceDateInput) {
                priceDateInput.valueAsDate = new Date();
            }
        });
    });
}

// Handle submit form material
async function handleMaterialSubmit(e) {
    e.preventDefault();
    
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="loading"></div> Menyimpan...';
    submitBtn.disabled = true;
    
    try {
        // Ambil data dari form
        const formData = {
            materialName: document.getElementById('materialName').value,
            categoryId: document.getElementById('materialCategory').value,
            unitPrice: document.getElementById('unitPrice').value,
            unit: document.getElementById('unit').value,
            provinceId: document.getElementById('province').value,
            cityId: document.getElementById('city').value,
            priceDate: document.getElementById('priceDate').value,
            source: document.getElementById('source').value
        };
        
        // Validasi form
        const errors = validateForm(formData);
        if (errors.length > 0) {
            showNotification(errors.join(', '), 'error');
            return;
        }
        
        // 1. Cek apakah material sudah ada
        let materialId;
        const allMaterials = await getAllRecords('materials');
        const existingMaterial = allMaterials.find(m => 
            m.name.toLowerCase() === formData.materialName.toLowerCase() && 
            m.category_id === parseInt(formData.categoryId)
        );
        
        if (existingMaterial) {
            // Gunakan material yang sudah ada
            materialId = existingMaterial.id;
        } else {
            // Buat material baru
            const newMaterial = {
                category_id: parseInt(formData.categoryId),
                name: formData.materialName,
                unit: formData.unit,
                created_at: new Date().toISOString()
            };
            
            materialId = await addRecord('materials', newMaterial);
        }
        
        // 2. Simpan harga material
        const newPrice = {
            material_id: materialId,
            city_id: parseInt(formData.cityId),
            price: parseFloat(formData.unitPrice),
            price_date: formData.priceDate,
            source: formData.source || null,
            notes: 'Data input dari aplikasi',
            created_at: new Date().toISOString()
        };
        
        await addRecord('material_prices', newPrice);
        
        // Tampilkan pesan sukses
        const successAlert = document.getElementById('saveSuccessAlert');
        const saveMessage = document.getElementById('saveMessage');
        saveMessage.textContent = `Data "${formData.materialName}" berhasil disimpan ke dalam sistem MATERIAL ALERT.`;
        successAlert.style.display = 'flex';
        
        // Reset form
        this.reset();
        document.getElementById('priceDate').valueAsDate = new Date();
        
        // Update dashboard
        await updateDashboard();
        
        // Tampilkan notifikasi
        showNotification('Data material berhasil disimpan!', 'success');
        
        // Scroll ke alert
        successAlert.scrollIntoView({ behavior: 'smooth' });
        
        // Sembunyikan alert setelah 5 detik
        setTimeout(() => {
            successAlert.style.display = 'none';
        }, 5000);
        
    } catch (error) {
        console.error('Error saving material:', error);
        showNotification('Terjadi kesalahan saat menyimpan data. Silakan coba lagi.', 'error');
    } finally {
        // Kembalikan tombol ke keadaan semula
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Handle pencarian material
async function handleSearch() {
    const searchBtn = this;
    const originalText = searchBtn.innerHTML;
    searchBtn.innerHTML = '<div class="loading"></div> Mencari...';
    searchBtn.disabled = true;
    
    try {
        // Ambil kriteria pencarian
        const criteria = {
            materialName: document.getElementById('searchMaterialName').value,
            categoryId: document.getElementById('searchCategory').value,
            provinceId: document.getElementById('searchProvince').value,
            cityId: document.getElementById('searchCity').value
        };
        
        // Simpan kriteria pencarian
        saveSearchCriteria(criteria);
        
        // Pindah ke halaman hasil
        navigateToPage('results');
        
        // Tampilkan kriteria pencarian
        displaySearchCriteria(criteria);
        
        // Muat hasil pencarian
        await loadResultsPage(criteria);
        
        // Tampilkan tombol hasil di navigasi
        toggleResultsNav(true);
        
    } catch (error) {
        console.error('Error searching materials:', error);
        showNotification('Terjadi kesalahan saat mencari data.', 'error');
    } finally {
        // Kembalikan tombol ke keadaan semula
        searchBtn.innerHTML = originalText;
        searchBtn.disabled = false;
    }
}

// Muat halaman hasil dengan data
async function loadResultsPage(criteria) {
    const resultsContainer = document.getElementById('resultsContainer');
    const noResultsMessage = document.getElementById('noResultsMessage');
    
    if (!resultsContainer || !noResultsMessage) return;
    
    // Tampilkan loading
    resultsContainer.innerHTML = '<div class="loading" style="margin: 20px auto; display: block;"></div>';
    noResultsMessage.style.display = 'none';
    
    try {
        // Cari material berdasarkan kriteria
        const materials = await searchMaterials(criteria);
        
        // Jika tidak ada hasil
        if (materials.length === 0) {
            resultsContainer.innerHTML = '';
            noResultsMessage.style.display = 'flex';
            return;
        }
        
        // Tampilkan hasil
        let html = '';
        
        for (const material of materials) {
            // Dapatkan kategori
            const categories = await getRecordsByIndex('material_categories', 'id', material.category_id);
            const categoryName = categories.length > 0 ? categories[0].name : 'Tidak diketahui';
            
            // Dapatkan harga terbaru
            const latestPrice = await getLatestPrice(material.id);
            
            if (latestPrice) {
                // Dapatkan kota
                const cities = await getRecordsByIndex('cities', 'id', latestPrice.city_id);
                const cityName = cities.length > 0 ? cities[0].name : 'Tidak diketahui';
                
                // Dapatkan provinsi
                let provinceName = 'Tidak diketahui';
                if (cities.length > 0) {
                    const provinces = await getRecordsByIndex('provinces', 'id', cities[0].province_id);
                    provinceName = provinces.length > 0 ? provinces[0].name : 'Tidak diketahui';
                }
                
                html += `
                    <div class="result-card">
                        <h3 class="result-title">${material.name}</h3>
                        <div class="result-details">
                            <div class="result-item">
                                <span class="result-label">Kategori</span>
                                <span class="result-value">${categoryName}</span>
                            </div>
                            <div class="result-item">
                                <span class="result-label">Provinsi</span>
                                <span class="result-value">${provinceName}</span>
                            </div>
                            <div class="result-item">
                                <span class="result-label">Kabupaten/Kota</span>
                                <span class="result-value">${cityName}</span>
                            </div>
                            <div class="result-item">
                                <span class="result-label">Harga Satuan</span>
                                <span class="result-price">${formatCurrency(latestPrice.price)} / ${material.unit}</span>
                            </div>
                        </div>
                        <div class="result-item" style="margin-top: 10px;">
                            <span class="result-label">Terakhir diperbarui</span>
                            <span class="result-value">${formatDate(latestPrice.price_date)}</span>
                        </div>
                    </div>
                `;
            }
        }
        
        resultsContainer.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading results page:', error);
        resultsContainer.innerHTML = '';
        noResultsMessage.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <div>Terjadi kesalahan saat memuat data. Silakan coba lagi.</div>
        `;
        noResultsMessage.style.display = 'flex';
    }
}

// Update dashboard dengan data dari database
async function updateDashboard() {
    try {
        // Hitung total material
        const materials = await getAllRecords('materials');
        document.getElementById('totalMaterials').textContent = materials.length;
        
        // Hitung total lokasi (kota)
        const cities = await getAllRecords('cities');
        document.getElementById('totalLocations').textContent = cities.length;
        
        // Hitung total harga
        const prices = await getAllRecords('material_prices');
        document.getElementById('totalPrices').textContent = prices.length;
        
        // Hitung total alert (placeholder)
        document.getElementById('totalAlerts').textContent = Math.floor(Math.random() * 10) + 1;
        
        // Tampilkan material terbaru
        await displayRecentMaterials(materials.slice(0, 5));
        
    } catch (error) {
        console.error('Error updating dashboard:', error);
    }
}

// Tampilkan material terbaru di dashboard
async function displayRecentMaterials(materials) {
    const tbody = document.querySelector('#recentMaterials tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    for (const material of materials) {
        try {
            // Dapatkan nama kategori
            const categories = await getRecordsByIndex('material_categories', 'id', material.category_id);
            const categoryName = categories.length > 0 ? categories[0].name : 'Tidak diketahui';
            
            // Dapatkan harga terbaru untuk material ini
            const latestPrice = await getLatestPrice(material.id);
            
            if (latestPrice) {
                // Dapatkan nama kota
                const cities = await getRecordsByIndex('cities', 'id', latestPrice.city_id);
                const cityName = cities.length > 0 ? cities[0].name : 'Tidak diketahui';
                
                // Dapatkan nama provinsi
                let provinceName = 'Tidak diketahui';
                if (cities.length > 0) {
                    const provinces = await getRecordsByIndex('provinces', 'id', cities[0].province_id);
                    provinceName = provinces.length > 0 ? provinces[0].name : 'Tidak diketahui';
                }
                
                // Tambahkan baris ke tabel
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${material.name}</td>
                    <td>${categoryName}</td>
                    <td>${provinceName}</td>
                    <td>${cityName}</td>
                    <td>${formatCurrency(latestPrice.price)}</td>
                `;
                tbody.appendChild(row);
            }
        } catch (error) {
            console.error('Error displaying material:', error);
        }
    }
}