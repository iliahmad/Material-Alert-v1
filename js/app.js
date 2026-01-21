// ============================================
// MAIN APPLICATION
// ============================================

document.addEventListener('DOMContentLoaded', async function() {
    console.log('MATERIAL ALERT - Loading application...');
    
    try {
        // Initialize database
        await window.database.initDatabase();
        
        // Load initial data
        await window.utils.loadSelectOptions();
        
        // Setup event listeners
        setupEventListeners();
        
        // Load dashboard data
        await loadDashboard();
        
        console.log('MATERIAL ALERT - Application loaded successfully!');
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        window.utils.showNotification('Gagal menginisialisasi aplikasi. Silakan refresh halaman.', 'error');
    }
});

function setupEventListeners() {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            const navMenu = document.getElementById('navMenu');
            navMenu.classList.toggle('show');
        });
    }
    
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            window.utils.navigateToPage(page);
            
            // If navigating to results, load saved search
            if (page === 'results') {
                const criteria = window.utils.getSearchCriteria();
                if (criteria) {
                    window.utils.displaySearchCriteria(criteria);
                    loadResultsPage(criteria);
                } else {
                    window.utils.navigateToPage('search');
                }
            }
        });
    });
    
    // Province change events
    const provinceSelect = document.getElementById('province');
    if (provinceSelect) {
        provinceSelect.addEventListener('change', function() {
            window.utils.updateCityOptions('province', 'city');
        });
    }
    
    const searchProvinceSelect = document.getElementById('searchProvince');
    if (searchProvinceSelect) {
        searchProvinceSelect.addEventListener('change', function() {
            window.utils.updateCityOptions('searchProvince', 'searchCity');
        });
    }
    
    // Material form submission
    const materialForm = document.getElementById('materialForm');
    if (materialForm) {
        materialForm.addEventListener('submit', handleMaterialSubmit);
    }
    
    // Search button
    const searchButton = document.getElementById('searchButton');
    if (searchButton) {
        searchButton.addEventListener('click', handleSearch);
    }
    
    // Back to search button
    const backToSearchBtn = document.getElementById('backToSearch');
    if (backToSearchBtn) {
        backToSearchBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.utils.navigateToPage('search');
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const navMenu = document.getElementById('navMenu');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        
        if (navMenu && navMenu.classList.contains('show') && 
            !navMenu.contains(event.target) && 
            !mobileMenuBtn.contains(event.target)) {
            navMenu.classList.remove('show');
        }
    });
}

async function loadDashboard() {
    try {
        const stats = await window.database.getDashboardStats();
        
        if (stats) {
            // Update stats cards
            const statsCards = document.getElementById('statsCards');
            if (statsCards) {
                statsCards.innerHTML = `
                    <div class="card">
                        <div class="card-icon blue">
                            <i class="fas fa-boxes"></i>
                        </div>
                        <h3 class="card-title">Total Material</h3>
                        <div class="card-value">${stats.totalMaterials}</div>
                        <p class="card-desc">Material terdaftar</p>
                    </div>
                    
                    <div class="card">
                        <div class="card-icon green">
                            <i class="fas fa-map-marker-alt"></i>
                        </div>
                        <h3 class="card-title">Lokasi</h3>
                        <div class="card-value">${stats.totalLocations}</div>
                        <p class="card-desc">Kota/Kabupaten</p>
                    </div>
                    
                    <div class="card">
                        <div class="card-icon orange">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <h3 class="card-title">Update Harga</h3>
                        <div class="card-value">${stats.totalPrices}</div>
                        <p class="card-desc">Data harga tersimpan</p>
                    </div>
                    
                    <div class="card">
                        <div class="card-icon purple">
                            <i class="fas fa-bell"></i>
                        </div>
                        <h3 class="card-title">Provinsi</h3>
                        <div class="card-value">${stats.totalProvinces}</div>
                        <p class="card-desc">Seluruh Indonesia</p>
                    </div>
                `;
            }
            
            // Load recent materials
            await loadRecentMaterials();
        }
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

async function loadRecentMaterials() {
    try {
        const materials = await window.database.getAllRecords('materials');
        const recentMaterials = materials.slice(0, 5); // Get first 5
        
        const tbody = document.getElementById('recentMaterials');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        for (const material of recentMaterials) {
            // Get category
            const category = await window.database.getRecordById('material_categories', material.category_id);
            
            // Get latest price
            const prices = await window.database.getRecordsByIndex('material_prices', 'material_id', material.id);
            const latestPrice = prices.length > 0 
                ? prices.reduce((latest, current) => 
                    new Date(current.price_date) > new Date(latest.price_date) ? current : latest
                  )
                : null;
            
            let cityName = 'Tidak ada data';
            let provinceName = '';
            
            if (latestPrice) {
                const city = await window.database.getRecordById('cities', latestPrice.city_id);
                if (city) {
                    cityName = city.name;
                    const province = await window.database.getRecordById('provinces', city.province_id);
                    provinceName = province ? province.name : '';
                }
            }
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${material.name}</td>
                <td>${category ? category.name : 'Tidak diketahui'}</td>
                <td>${provinceName}</td>
                <td>${cityName}</td>
                <td>${latestPrice ? window.utils.formatCurrency(latestPrice.price) : 'Tidak ada harga'}</td>
            `;
            
            tbody.appendChild(row);
        }
        
    } catch (error) {
        console.error('Error loading recent materials:', error);
    }
}

async function handleMaterialSubmit(e) {
    e.preventDefault();
    
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="loading"></div> Menyimpan...';
    submitBtn.disabled = true;
    
    try {
        // Get form data
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
        
        // Validate
        const errors = window.utils.validateForm(formData);
        if (errors.length > 0) {
            window.utils.showNotification(errors.join(', '), 'error');
            return;
        }
        
        // Check if material exists
        const allMaterials = await window.database.getAllRecords('materials');
        let materialId;
        
        const existingMaterial = allMaterials.find(m => 
            m.name.toLowerCase() === formData.materialName.toLowerCase() && 
            m.category_id === parseInt(formData.categoryId)
        );
        
        if (existingMaterial) {
            materialId = existingMaterial.id;
        } else {
            // Create new material
            const newMaterial = {
                category_id: parseInt(formData.categoryId),
                name: formData.materialName,
                unit: formData.unit,
                created_at: new Date().toISOString()
            };
            
            // Get next ID
            const maxId = allMaterials.reduce((max, m) => Math.max(max, m.id || 0), 0);
            newMaterial.id = maxId + 1;
            
            materialId = await window.database.addRecord('materials', newMaterial);
        }
        
        // Save price
        const newPrice = {
            material_id: materialId,
            city_id: parseInt(formData.cityId),
            price: parseFloat(formData.unitPrice),
            price_date: formData.priceDate,
            source: formData.source || null,
            notes: 'Data input dari aplikasi',
            created_at: new Date().toISOString()
        };
        
        await window.database.addRecord('material_prices', newPrice);
        
        // Show success
        const successAlert = document.getElementById('saveSuccessAlert');
        const saveMessage = document.getElementById('saveMessage');
        
        saveMessage.textContent = `Data "${formData.materialName}" berhasil disimpan!`;
        successAlert.style.display = 'flex';
        
        // Reset form
        this.reset();
        document.getElementById('priceDate').value = new Date().toISOString().split('T')[0];
        
        // Show notification
        window.utils.showNotification('Data material berhasil disimpan!', 'success');
        
        // Reload dashboard
        await loadDashboard();
        
        // Hide success alert after 5 seconds
        setTimeout(() => {
            successAlert.style.display = 'none';
        }, 5000);
        
    } catch (error) {
        console.error('Error saving material:', error);
        window.utils.showNotification('Terjadi kesalahan saat menyimpan data', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

async function handleSearch() {
    const searchBtn = this;
    const originalText = searchBtn.innerHTML;
    searchBtn.innerHTML = '<div class="loading"></div> Mencari...';
    searchBtn.disabled = true;
    
    try {
        // Get search criteria
        const criteria = {
            materialName: document.getElementById('searchMaterialName').value,
            categoryId: document.getElementById('searchCategory').value,
            provinceId: document.getElementById('searchProvince').value,
            cityId: document.getElementById('searchCity').value
        };
        
        // Save criteria
        window.utils.saveSearchCriteria(criteria);
        
        // Navigate to results page
        window.utils.navigateToPage('results');
        window.utils.toggleResultsNav(true);
        
        // Display criteria
        window.utils.displaySearchCriteria(criteria);
        
        // Load results
        await loadResultsPage(criteria);
        
    } catch (error) {
        console.error('Error searching:', error);
        window.utils.showNotification('Terjadi kesalahan saat mencari data', 'error');
    } finally {
        searchBtn.innerHTML = originalText;
        searchBtn.disabled = false;
    }
}

async function loadResultsPage(criteria) {
    const resultsContainer = document.getElementById('resultsContainer');
    const noResultsMessage = document.getElementById('noResultsMessage');
    
    if (!resultsContainer || !noResultsMessage) return;
    
    // Show loading
    resultsContainer.innerHTML = '<div class="loading" style="margin: 20px auto; display: block;"></div>';
    noResultsMessage.style.display = 'none';
    
    try {
        // Search materials
        const materials = await window.database.searchMaterials(criteria);
        
        if (materials.length === 0) {
            resultsContainer.innerHTML = '';
            noResultsMessage.style.display = 'flex';
            return;
        }
        
        // Get material details
        const materialDetails = await window.database.getMaterialDetails(materials.map(m => m.id));
        
        // Display results
        let html = '';
        
        for (const detail of materialDetails) {
            if (!detail.material || !detail.category) continue;
            
            const priceText = detail.latestPrice 
                ? window.utils.formatCurrency(detail.latestPrice.price)
                : 'Tidak ada harga';
            
            const cityText = detail.city ? detail.city.name : 'Tidak diketahui';
            const provinceText = detail.province ? detail.province.name : '';
            const dateText = detail.latestPrice ? window.utils.formatDate(detail.latestPrice.price_date) : '';
            
            html += `
                <div class="result-card">
                    <h3 class="result-title">${detail.material.name}</h3>
                    <div class="result-details">
                        <div class="result-item">
                            <span class="result-label">Kategori</span>
                            <span class="result-value">${detail.category.name}</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Provinsi</span>
                            <span class="result-value">${provinceText}</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Kabupaten/Kota</span>
                            <span class="result-value">${cityText}</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Harga Satuan</span>
                            <span class="result-price">${priceText} / ${detail.material.unit}</span>
                        </div>
                    </div>
                    ${dateText ? `
                    <div class="result-item" style="margin-top: 10px;">
                        <span class="result-label">Terakhir diperbarui</span>
                        <span class="result-value">${dateText}</span>
                    </div>
                    ` : ''}
                </div>
            `;
        }
        
        resultsContainer.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading results:', error);
        resultsContainer.innerHTML = '';
        noResultsMessage.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <div>Terjadi kesalahan saat memuat data. Silakan coba lagi.</div>
        `;
        noResultsMessage.style.display = 'flex';
    }
}