// ============================================
// FUNGSI UTILITAS
// ============================================

// Format mata uang
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

// Format tanggal
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
}

// Update status koneksi database
function updateConnectionStatus(isConnected) {
    const statusElement = document.getElementById('connectionStatus');
    const dbStatusElement = document.getElementById('dbStatus');
    
    if (statusElement && dbStatusElement) {
        if (isConnected) {
            statusElement.className = 'connection-status online';
            dbStatusElement.textContent = 'Terhubung';
        } else {
            statusElement.className = 'connection-status offline';
            dbStatusElement.textContent = 'Terputus';
        }
    }
}

// Tampilkan notifikasi
function showNotification(message, type = 'success') {
    // Hapus notifikasi sebelumnya jika ada
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Buat elemen notifikasi
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
        <span>${message}</span>
    `;
    
    // Tambahkan CSS untuk notifikasi
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            border-left: 4px solid #26a269;
        }
        .notification.success {
            border-left-color: #26a269;
        }
        .notification.error {
            border-left-color: #c01c28;
        }
        .notification.warning {
            border-left-color: #e5a50a;
        }
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    // Hapus notifikasi setelah 5 detik
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
            if (style.parentNode) {
                style.remove();
            }
        }, 300);
    }, 5000);
}

// Validasi form
function validateForm(formData) {
    const errors = [];
    
    if (!formData.materialName || formData.materialName.trim() === '') {
        errors.push('Nama material harus diisi');
    }
    
    if (!formData.categoryId) {
        errors.push('Kategori harus dipilih');
    }
    
    if (!formData.unitPrice || formData.unitPrice <= 0) {
        errors.push('Harga satuan harus diisi dan lebih dari 0');
    }
    
    if (!formData.unit) {
        errors.push('Satuan harus dipilih');
    }
    
    if (!formData.provinceId) {
        errors.push('Provinsi harus dipilih');
    }
    
    if (!formData.cityId) {
        errors.push('Kabupaten/Kota harus dipilih');
    }
    
    if (!formData.priceDate) {
        errors.push('Tanggal harga berlaku harus diisi');
    }
    
    return errors;
}

// Muat opsi untuk select dropdown
async function loadSelectOptions() {
    try {
        // Muat kategori untuk form input
        const categories = await getAllRecords('material_categories');
        const categorySelect = document.getElementById('materialCategory');
        const searchCategorySelect = document.getElementById('searchCategory');
        
        if (categorySelect && searchCategorySelect) {
            // Kosongkan opsi kecuali opsi pertama
            while (categorySelect.options.length > 1) categorySelect.remove(1);
            while (searchCategorySelect.options.length > 1) searchCategorySelect.remove(1);
            
            categories.forEach(category => {
                const option1 = document.createElement('option');
                option1.value = category.id;
                option1.textContent = category.name;
                categorySelect.appendChild(option1);
                
                const option2 = document.createElement('option');
                option2.value = category.id;
                option2.textContent = category.name;
                searchCategorySelect.appendChild(option2);
            });
        }
        
        // Muat provinsi untuk form input
        const provinces = await getAllRecords('provinces');
        const provinceSelect = document.getElementById('province');
        const searchProvinceSelect = document.getElementById('searchProvince');
        
        if (provinceSelect && searchProvinceSelect) {
            // Kosongkan opsi kecuali opsi pertama
            while (provinceSelect.options.length > 1) provinceSelect.remove(1);
            while (searchProvinceSelect.options.length > 1) searchProvinceSelect.remove(1);
            
            provinces.forEach(province => {
                const option1 = document.createElement('option');
                option1.value = province.id;
                option1.textContent = province.name;
                provinceSelect.appendChild(option1);
                
                const option2 = document.createElement('option');
                option2.value = province.id;
                option2.textContent = province.name;
                searchProvinceSelect.appendChild(option2);
            });
        }
        
        // Set tanggal default ke hari ini
        const priceDateInput = document.getElementById('priceDate');
        if (priceDateInput) {
            priceDateInput.valueAsDate = new Date();
            priceDateInput.max = new Date().toISOString().split('T')[0];
        }
        
    } catch (error) {
        console.error('Error loading options:', error);
    }
}

// Update opsi kota berdasarkan provinsi yang dipilih
async function updateCityOptions(provinceSelectId, citySelectId) {
    const provinceSelect = document.getElementById(provinceSelectId);
    const citySelect = document.getElementById(citySelectId);
    
    if (!provinceSelect || !citySelect) return;
    
    const provinceId = provinceSelect.value;
    
    // Kosongkan opsi saat ini kecuali opsi pertama
    while (citySelect.options.length > 1) {
        citySelect.remove(1);
    }
    
    if (provinceId) {
        try {
            const cities = await getRecordsByIndex('cities', 'province_id', parseInt(provinceId));
            
            cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city.id;
                option.textContent = city.name;
                citySelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading cities:', error);
        }
    }
}

// Navigasi antar halaman
function navigateToPage(pageId) {
    // Sembunyikan semua halaman
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.remove('active');
    });
    
    // Tampilkan halaman yang dipilih
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Update menu navigasi
    document.querySelectorAll('.nav-item').forEach(navItem => {
        if (navItem.getAttribute('data-page') === pageId) {
            navItem.classList.add('active');
        } else {
            navItem.classList.remove('active');
        }
    });
    
    // Sembunyikan mobile menu jika terbuka
    const navMenu = document.getElementById('navMenu');
    if (navMenu) {
        navMenu.classList.remove('show');
    }
}

// Tampilkan/ sembunyikan tombol hasil di navigasi
function toggleResultsNav(show) {
    const resultsNav = document.getElementById('resultsNav');
    if (resultsNav) {
        resultsNav.style.display = show ? 'flex' : 'none';
    }
}

// Simpan data pencarian ke session storage
function saveSearchCriteria(criteria) {
    sessionStorage.setItem('lastSearchCriteria', JSON.stringify(criteria));
}

// Ambil data pencarian dari session storage
function getSearchCriteria() {
    const saved = sessionStorage.getItem('lastSearchCriteria');
    return saved ? JSON.parse(saved) : null;
}

// Tampilkan kriteria pencarian
function displaySearchCriteria(criteria) {
    const criteriaContainer = document.getElementById('searchCriteria');
    if (!criteriaContainer) return;
    
    let html = '<h3><i class="fas fa-filter"></i> Kriteria Pencarian</h3><div class="criteria-items">';
    
    if (criteria.materialName) {
        html += `<div class="criteria-badge"><i class="fas fa-tag"></i> Nama: ${criteria.materialName}</div>`;
    }
    
    if (criteria.categoryId) {
        const categorySelect = document.getElementById('searchCategory');
        if (categorySelect) {
            const selectedOption = categorySelect.querySelector(`option[value="${criteria.categoryId}"]`);
            if (selectedOption) {
                html += `<div class="criteria-badge"><i class="fas fa-layer-group"></i> Kategori: ${selectedOption.textContent}</div>`;
            }
        }
    }
    
    if (criteria.provinceId) {
        const provinceSelect = document.getElementById('searchProvince');
        if (provinceSelect) {
            const selectedOption = provinceSelect.querySelector(`option[value="${criteria.provinceId}"]`);
            if (selectedOption) {
                html += `<div class="criteria-badge"><i class="fas fa-map"></i> Provinsi: ${selectedOption.textContent}</div>`;
            }
        }
    }
    
    if (criteria.cityId) {
        const citySelect = document.getElementById('searchCity');
        if (citySelect) {
            const selectedOption = citySelect.querySelector(`option[value="${criteria.cityId}"]`);
            if (selectedOption) {
                html += `<div class="criteria-badge"><i class="fas fa-city"></i> Kota: ${selectedOption.textContent}</div>`;
            }
        }
    }
    
    if (!criteria.materialName && !criteria.categoryId && !criteria.provinceId && !criteria.cityId) {
        html += '<div class="criteria-badge"><i class="fas fa-search"></i> Semua Material</div>';
    }
    
    html += '</div>';
    criteriaContainer.innerHTML = html;
}