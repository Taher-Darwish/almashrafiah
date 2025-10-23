// Unit Detail Page JavaScript
import { db, getDoc, doc } from './firebase-config.js';
import { lightbox } from './lightbox.js';

// Get unit and project IDs from URL
const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get('projectId');
const unitId = urlParams.get('unitId');

let currentLang = localStorage.getItem('preferredLanguage') || 'ar';

// Load and display unit
async function loadUnit() {
    if (!projectId || !unitId) {
        showError('الوحدة غير موجودة');
        return;
    }

    try {
        // Load project first
        const projectDoc = await getDoc(doc(db, 'projects', projectId));
        
        if (!projectDoc.exists()) {
            showError('المشروع غير موجود');
            return;
        }

        const project = { id: projectDoc.id, ...projectDoc.data() };
        
        // Find unit in project's units array
        const unit = project.units?.find(u => u.id === unitId);
        
        if (!unit) {
            showError('الوحدة غير موجودة');
            return;
        }

        displayUnit(unit, project);
    } catch (error) {
        console.error('Error loading unit:', error);
        showError('حدث خطأ في تحميل الوحدة');
    }
}

function displayUnit(unit, project) {
    const lang = currentLang;
    
    // Get localized content
    const unitName = unit[`name_${lang}`] || unit.name_ar;
    const description = unit[`description_${lang}`] || unit.description_ar;
    const projectTitle = project[`title_${lang}`] || project.title_ar;
    
    const statusText = {
        ar: { available: 'متاح', sold: 'مباع', reserved: 'محجوز' },
        en: { available: 'Available', sold: 'Sold', reserved: 'Reserved' }
    };
    
    const content = document.getElementById('unit-content');
    
    content.innerHTML = `
        <!-- Breadcrumb -->
        <div class="unit-breadcrumb">
            <a href="index.html#our-projects">${lang === 'ar' ? 'المشاريع' : 'Projects'}</a>
            <i class="fas fa-chevron-${lang === 'ar' ? 'left' : 'right'}"></i>
            <a href="project.html?id=${project.id}">${projectTitle}</a>
            <i class="fas fa-chevron-${lang === 'ar' ? 'left' : 'right'}"></i>
            <span>${unitName}</span>
        </div>

        <!-- Unit Hero -->
        <div class="unit-hero">
            <img src="${unit.mainImage || project.mainImage}" alt="${unitName}">
            <div class="unit-hero-overlay">
                <span class="unit-status status-${unit.status}">${statusText[lang][unit.status]}</span>
                <h1 class="unit-title">${unitName}</h1>
                <div class="unit-price">${unit.price || 'السعر عند الطلب'}</div>
                <div class="unit-info-quick">
                    ${unit.area ? `
                    <div class="quick-info-item">
                        <i class="fas fa-ruler-combined"></i>
                        <span>${unit.area} ${lang === 'ar' ? 'م²' : 'm²'}</span>
                    </div>
                    ` : ''}
                    ${unit.bedrooms ? `
                    <div class="quick-info-item">
                        <i class="fas fa-bed"></i>
                        <span>${unit.bedrooms} ${lang === 'ar' ? 'غرف نوم' : 'Bedrooms'}</span>
                    </div>
                    ` : ''}
                    ${unit.bathrooms ? `
                    <div class="quick-info-item">
                        <i class="fas fa-bath"></i>
                        <span>${unit.bathrooms} ${lang === 'ar' ? 'حمامات' : 'Bathrooms'}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>

        <!-- Unit Content -->
        <div class="unit-content">
            <!-- Description -->
            <div class="unit-description">
                <h2>${lang === 'ar' ? 'وصف الوحدة' : 'Unit Description'}</h2>
                <p>${description}</p>
                
                ${unit.features && unit.features.length > 0 ? `
                <h2 style="margin-top: 30px;">${lang === 'ar' ? 'المميزات' : 'Features'}</h2>
                <div class="features-list">
                    ${unit.features.map(feature => `
                        <div class="feature-item">
                            <i class="fas fa-check-circle"></i>
                            <span>${feature}</span>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
            </div>

            <!-- Specifications -->
            <div class="unit-specs">
                <h3>${lang === 'ar' ? 'المواصفات' : 'Specifications'}</h3>
                
                ${unit.area ? `
                <div class="spec-item">
                    <span class="spec-label">
                        <i class="fas fa-ruler-combined"></i>
                        ${lang === 'ar' ? 'المساحة' : 'Area'}
                    </span>
                    <span class="spec-value">${unit.area} ${lang === 'ar' ? 'م²' : 'm²'}</span>
                </div>
                ` : ''}
                
                ${unit.bedrooms ? `
                <div class="spec-item">
                    <span class="spec-label">
                        <i class="fas fa-bed"></i>
                        ${lang === 'ar' ? 'غرف النوم' : 'Bedrooms'}
                    </span>
                    <span class="spec-value">${unit.bedrooms}</span>
                </div>
                ` : ''}
                
                ${unit.bathrooms ? `
                <div class="spec-item">
                    <span class="spec-label">
                        <i class="fas fa-bath"></i>
                        ${lang === 'ar' ? 'الحمامات' : 'Bathrooms'}
                    </span>
                    <span class="spec-value">${unit.bathrooms}</span>
                </div>
                ` : ''}
                
                ${unit.living_rooms ? `
                <div class="spec-item">
                    <span class="spec-label">
                        <i class="fas fa-couch"></i>
                        ${lang === 'ar' ? 'المجالس' : 'Living Rooms'}
                    </span>
                    <span class="spec-value">${unit.living_rooms}</span>
                </div>
                ` : ''}
                
                ${unit.kitchen ? `
                <div class="spec-item">
                    <span class="spec-label">
                        <i class="fas fa-utensils"></i>
                        ${lang === 'ar' ? 'المطبخ' : 'Kitchen'}
                    </span>
                    <span class="spec-value">${unit.kitchen}</span>
                </div>
                ` : ''}
                
                ${unit.parking ? `
                <div class="spec-item">
                    <span class="spec-label">
                        <i class="fas fa-car"></i>
                        ${lang === 'ar' ? 'المواقف' : 'Parking'}
                    </span>
                    <span class="spec-value">${unit.parking}</span>
                </div>
                ` : ''}
                
                ${unit.floor ? `
                <div class="spec-item">
                    <span class="spec-label">
                        <i class="fas fa-layer-group"></i>
                        ${lang === 'ar' ? 'الدور' : 'Floor'}
                    </span>
                    <span class="spec-value">${unit.floor}</span>
                </div>
                ` : ''}
                
                <div class="spec-item">
                    <span class="spec-label">
                        <i class="fas fa-info-circle"></i>
                        ${lang === 'ar' ? 'الحالة' : 'Status'}
                    </span>
                    <span class="spec-value">${statusText[lang][unit.status]}</span>
                </div>
            </div>
        </div>

        ${unit.floorPlan ? `
        <!-- Floor Plan -->
        <div class="floor-plans">
            <h2>${lang === 'ar' ? 'مخطط الطابق' : 'Floor Plan'}</h2>
            <div class="floor-plan-wrapper" onclick="window.floorPlanLightbox()">
                <img src="${unit.floorPlan}" alt="Floor Plan" class="floor-plan-image">
                <div class="floor-plan-overlay">
                    <i class="fas fa-search-plus"></i>
                    <p>${lang === 'ar' ? 'اضغط للتكبير' : 'Click to enlarge'}</p>
                </div>
            </div>
        </div>
        ` : ''}

        <!-- Gallery -->
        ${unit.images && unit.images.length > 0 ? `
        <div class="unit-gallery">
            <h2>${lang === 'ar' ? 'معرض الصور' : 'Gallery'}</h2>
            <div class="gallery-images">
                ${unit.images.map((img, index) => `
                    <div class="gallery-item" onclick="window.unitGalleryLightbox(${index})">
                        <img src="${img}" alt="${unitName}">
                        <div class="gallery-overlay">
                            <i class="fas fa-search-plus"></i>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        <!-- Contact CTA -->
        <div class="contact-cta">
            <h2>${lang === 'ar' ? 'هل أنت مهتم بهذه الوحدة؟' : 'Interested in this unit?'}</h2>
            <p>${lang === 'ar' ? 'تواصل معنا الآن للحصول على المزيد من التفاصيل أو لحجز معاينة' : 'Contact us now for more details or to schedule a viewing'}</p>
            <div class="cta-buttons">
                <a href="https://wa.me/966555606477?text=${encodeURIComponent('مرحباً، أنا مهتم بـ ' + unitName)}" class="btn btn-primary" target="_blank">
                    <i class="fab fa-whatsapp"></i>
                    ${lang === 'ar' ? 'واتساب' : 'WhatsApp'}
                </a>
                <a href="index.html#contact" class="btn btn-secondary">
                    <i class="fas fa-phone"></i>
                    ${lang === 'ar' ? 'اتصل بنا' : 'Contact Us'}
                </a>
                ${unit.pdfFile ? `
                <a href="${unit.pdfFile}" target="_blank" class="btn btn-secondary" download>
                    <i class="fas fa-file-pdf"></i>
                    ${lang === 'ar' ? 'تحميل ملف الوحدة' : 'Download Unit PDF'}
                </a>
                ` : ''}
            </div>
        </div>
    `;

    // Setup floor plan lightbox
    if (unit.floorPlan) {
        window.floorPlanLightbox = () => {
            lightbox.open([unit.floorPlan], 0, [lang === 'ar' ? 'مخطط الطابق' : 'Floor Plan']);
        };
    }

    // Setup gallery lightbox
    if (unit.images && unit.images.length > 0) {
        window.unitGalleryLightbox = (index) => {
            const captions = unit.images.map(() => unitName);
            lightbox.open(unit.images, index, captions);
        };
    }
}

function showError(message) {
    const content = document.getElementById('unit-content');
    content.innerHTML = `
        <div style="text-align: center; padding: 100px 20px;">
            <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: var(--error-color); margin-bottom: 20px;"></i>
            <h2 style="color: var(--error-color);">${message}</h2>
            <a href="index.html#our-projects" class="btn btn-primary" style="margin-top: 20px;">
                العودة إلى المشاريع
            </a>
        </div>
    `;
}

// Language toggle
document.getElementById('lang-toggle')?.addEventListener('click', () => {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('preferredLanguage', currentLang);
    
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.getElementById('lang-toggle').textContent = currentLang === 'ar' ? 'EN' : 'ع';
    
    loadUnit();
});

// Mobile menu toggle
document.getElementById('nav-toggle')?.addEventListener('click', () => {
    document.getElementById('nav-menu')?.classList.toggle('active');
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.getElementById('lang-toggle').textContent = currentLang === 'ar' ? 'EN' : 'ع';
    
    loadUnit();
});
