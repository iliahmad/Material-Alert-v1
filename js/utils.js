// ============================================
// UTILITY FUNCTIONS
// ============================================

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

// Update connection status
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

// Show notification
function showNotification(message, type = 'success') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

// Navigate to page
function navigateToPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show target page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Update active nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-page') === pageId) {
            item.classList.add('active');
        }
    });
    
    // Close mobile menu if open
    const navMenu = document.getElementById('navMenu');
    if (navMenu && navMenu.classList.contains('show')) {
        navMenu.classList.remove('show');
    }
}

// Toggle results nav
function toggleResultsNav(show) {
    const resultsNav = document.getElementById('resultsNav');
    if (resultsNav) {
        resultsNav.style.display = show ? 'flex' : 'none';
    }
}

// Save search criteria to session storage
function saveSearchCriteria(criteria) {
    sessionStorage.setItem('lastSearchCriteria', JSON.stringify(criteria));
}

// Get search criteria from session storage
function getSearchCriteria() {
    const saved = sessionStorage.getItem('lastSearchCriteria');
    return saved ? JSON.parse(saved) : null;
}

// Validate form
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

// Load select options
async function loadSelectOptions() {
    try {
        const [categories, provinces] = await Promise.all([
            window.database.getAllRecords('material_categories'),
            window.database.getAllRecords('provinces')
        ]);
        
        // Load categories
        const categorySelect = document.getElementById('materialCategory');
        const searchCategorySelect = document.getElementById('searchCategory');
        
        if (categorySelect && searchCategorySelect) {
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
        
        // Load provinces
        const provinceSelect = document.getElementById('province');
        const searchProvinceSelect = document.getElementById('searchProvince');
        
        if (provinceSelect && searchProvinceSelect) {
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
        
        // Set today's date
        const today = new Date().toISOString().split('T')[0];
        const priceDateInput = document.getElementById('priceDate');
        if (priceDateInput) {
            priceDateInput.value = today;
            priceDateInput.max = today;
        }
        
    } catch (error) {
        console.error('Error loading select options:', error);
    }
}

// Update city options based on selected province
async function updateCityOptions(provinceSelectId, citySelectId) {
    const provinceSelect = document.getElementById(provinceSelectId);
    const citySelect = document.getElementById(citySelectId);
    
    if (!provinceSelect || !citySelect) return;
    
    const provinceId = provinceSelect.value;
    
    // Clear current options except first
    while (citySelect.options.length > 1) {
        citySelect.remove(1);
    }
    
    if (provinceId) {
        try {
            const cities = await window.database.getRecordsByIndex('cities', 'province_id', parseInt(provinceId));
            
            citySelect.disabled = false;
            
            cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city.id;
                option.textContent = city.name;
                citySelect.appendChild(option);
            });
            
        } catch (error) {
            console.error('Error loading cities:', error);
            citySelect.disabled = true;
            citySelect.innerHTML = '<option value="">Error loading cities</option>';
        }
    } else {
        citySelect.disabled = true;
        citySelect.innerHTML = '<option value="">Pilih provinsi terlebih dahulu</option>';
    }
}

// Display search criteria
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

// ============================================
// EXPORT UTILITIES
// ============================================

window.utils = {
    formatCurrency,
    formatDate,
    showNotification,
    navigateToPage,
    toggleResultsNav,
    saveSearchCriteria,
    getSearchCriteria,
    validateForm,
    loadSelectOptions,
    updateCityOptions,
    displaySearchCriteria,
    updateConnectionStatus
};