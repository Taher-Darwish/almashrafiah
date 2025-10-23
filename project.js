// Project Detail Page JavaScript
import { db, getDocs, getDoc, doc, collection } from './firebase-config.js';
import { lightbox } from './lightbox.js';

// Get project ID from URL
const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get('id');

// i18n translations
const translations = {
    ar: {
        'brand.name': 'المشرفية',
        'nav.home': 'الرئيسية',
        'nav.about': 'من نحن',
        'nav.ourProjects': 'مشاريعنا',
        'nav.investment': 'مسارات الاستثمار',
        'nav.projects': 'التشييد والتشطيب',
        'nav.contact': 'اتصل بنا',
        'project.back': 'العودة إلى المشاريع',
        'project.loading': 'جاري تحميل تفاصيل المشروع...',
        'project.notFound': 'المشروع غير موجود',
        'project.description': 'وصف المشروع',
        'project.specs': 'المواصفات',
        'project.gallery': 'معرض الصور',
        'project.contact': 'هل أنت مهتم بهذا المشروع؟',
        'project.contactText': 'تواصل معنا الآن للحصول على المزيد من التفاصيل',
        'project.contactBtn': 'تواصل معنا',
        'project.downloadPDF': 'تحميل ملف المشروع',
        'status.available': 'متاح',
        'status.sold': 'مباع',
        'status.upcoming': 'قريباً',
        'spec.location': 'الموقع',
        'spec.area': 'المساحة',
        'spec.price': 'السعر',
        'spec.units': 'عدد الوحدات',
        'spec.deliveryDate': 'تاريخ التسليم',
        'spec.status': 'الحالة'
    },
    en: {
        'brand.name': 'Al-Mashrafiah',
        'nav.home': 'Home',
        'nav.about': 'About Us',
        'nav.ourProjects': 'Our Projects',
        'nav.investment': 'Investment Paths',
        'nav.projects': 'Construction & Finishing',
        'nav.contact': 'Contact Us',
        'project.back': 'Back to Projects',
        'project.loading': 'Loading project details...',
        'project.notFound': 'Project not found',
        'project.description': 'Project Description',
        'project.specs': 'Specifications',
        'project.gallery': 'Gallery',
        'project.contact': 'Interested in this project?',
        'project.contactText': 'Contact us now for more details',
        'project.contactBtn': 'Contact Us',
        'project.downloadPDF': 'Download Project PDF',
        'status.available': 'Available',
        'status.sold': 'Sold',
        'status.upcoming': 'Upcoming',
        'spec.location': 'Location',
        'spec.area': 'Area',
        'spec.price': 'Price',
        'spec.units': 'Units',
        'spec.deliveryDate': 'Delivery Date',
        'spec.status': 'Status'
    }
};

let currentLang = localStorage.getItem('preferredLanguage') || 'ar';

// Translation helper
function t(key) {
    return translations[currentLang][key] || key;
}

// Update page translations
function updatePageTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = t(key);
        if (translation) {
            el.textContent = translation;
        }
    });
}

// Load and display project
async function loadProject() {
    if (!projectId) {
        showError('project.notFound');
        return;
    }

    try {
        const projectDoc = await getDoc(doc(db, 'projects', projectId));
        
        if (!projectDoc.exists()) {
            showError('project.notFound');
            return;
        }

        const project = { id: projectDoc.id, ...projectDoc.data() };
        displayProject(project);
    } catch (error) {
        console.error('Error loading project:', error);
        showError('project.notFound');
    }
}

function displayProject(project) {
    const lang = currentLang;
    const t = (key) => translations[lang][key] || key;
    
    const content = document.getElementById('project-content');
    
    // Get localized content
    const title = project[`title_${lang}`] || project.title_ar;
    const description = project[`description_${lang}`] || project.description_ar;
    const location = project[`location_${lang}`] || project.location_ar;
    const warranty = project[`warranty_${lang}`] || project.warranty_ar;
    
    content.innerHTML = `
        <!-- Project Hero -->
        <div class="project-hero">
            <img src="${project.mainImage}" alt="${title}">
            <div class="project-hero-overlay">
                <span class="project-status status-${project.status}">${t('status.' + project.status)}</span>
                <h1 class="project-title">${title}</h1>
                <div class="project-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${location}</span>
                </div>
            </div>
            ${project.pdfFile ? `
            <a href="${project.pdfFile}" target="_blank" class="pdf-download-overlay" download>
                <i class="fas fa-file-pdf"></i>
                <span>${t('project.downloadPDF')}</span>
            </a>
            ` : ''}
        </div>

        <!-- Project Content -->
        <div class="project-content">
            <!-- Description -->
            <div class="project-description">
                <h2>${t('project.description')}</h2>
                <p>${description}</p>
            </div>

            ${warranty ? `
            <!-- Warranty -->
            <div class="project-description" style="background: #f8f9fa; border-left: 4px solid var(--primary-color);">
                <h2>${lang === 'ar' ? 'ضمانات المشروع' : 'Project Warranties'}</h2>
                <p style="white-space: pre-line;">${warranty}</p>
            </div>
            ` : ''}

            <!-- Specifications -->
            <div class="project-specs">
                <h3>${t('project.specs')}</h3>
                
                ${project.area ? `
                <div class="spec-item">
                    <span class="spec-label">${t('spec.area')}</span>
                    <span class="spec-value">${project.area} ${lang === 'ar' ? 'م²' : 'm²'}</span>
                </div>
                ` : ''}
                
                ${project.price ? `
                <div class="spec-item">
                    <span class="spec-label">${t('spec.price')}</span>
                    <span class="spec-value">${project.price} ${lang === 'ar' ? 'ريال' : 'SAR'}</span>
                </div>
                ` : ''}
                
                ${project.units ? `
                <div class="spec-item">
                    <span class="spec-label">${t('spec.units')}</span>
                    <span class="spec-value">${project.units}</span>
                </div>
                ` : ''}
                
                ${project.deliveryDate ? `
                <div class="spec-item">
                    <span class="spec-label">${t('spec.deliveryDate')}</span>
                    <span class="spec-value">${project.deliveryDate}</span>
                </div>
                ` : ''}
                
                <div class="spec-item">
                    <span class="spec-label">${t('spec.location')}</span>
                    <span class="spec-value">${location}</span>
                </div>
            </div>
        </div>

        <!-- Map -->
        ${project.mapUrl ? `
        <div class="project-map" style="margin-bottom: 60px;">
            <h2 style="color: var(--primary-color); margin-bottom: 30px; font-size: 2rem; text-align: center;">
                ${lang === 'ar' ? 'موقع المشروع' : 'Project Location'}
            </h2>
            <div style="width: 100%; height: 450px; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <iframe 
                    src="${project.mapUrl}" 
                    width="100%" 
                    height="100%" 
                    style="border:0;" 
                    allowfullscreen="" 
                    loading="lazy" 
                    referrerpolicy="no-referrer-when-downgrade">
                </iframe>
            </div>
        </div>
        ` : ''}

        <!-- Units -->
        ${project.units && project.units.length > 0 ? `
        <div class="project-units" style="margin-bottom: 60px;">
            <h2 style="color: var(--primary-color); margin-bottom: 30px; font-size: 2rem; text-align: center;">
                ${lang === 'ar' ? 'الوحدات المتاحة' : 'Available Units'}
            </h2>
            <div class="projects-grid" style="grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));">
                ${project.units.map(unit => `
                    <div class="project-card" style="cursor: pointer;" onclick="window.location.href='unit.html?projectId=${project.id}&unitId=${unit.id}'">
                        <div class="project-image-wrapper">
                            <img src="${unit.mainImage || project.mainImage}" alt="${unit[`name_${lang}`] || unit.name_ar}" class="project-card-image">
                            <span class="project-card-status status-${unit.status}">
                                ${lang === 'ar' ? 
                                    (unit.status === 'available' ? 'متاح' : unit.status === 'sold' ? 'مباع' : 'محجوز') :
                                    (unit.status === 'available' ? 'Available' : unit.status === 'sold' ? 'Sold' : 'Reserved')
                                }
                            </span>
                        </div>
                        <div class="project-card-content">
                            <h3 class="project-card-title" style="font-size: 1.3rem;">${unit[`name_${lang}`] || unit.name_ar}</h3>
                            ${unit.price ? `
                            <div style="color: var(--primary-color); font-weight: 700; font-size: 1.2rem; margin: 10px 0;">
                                ${unit.price}
                            </div>
                            ` : ''}
                            <div style="display: flex; gap: 15px; flex-wrap: wrap; margin: 15px 0; color: var(--text-light); font-size: 0.95rem;">
                                ${unit.area ? `
                                <span><i class="fas fa-ruler-combined"></i> ${unit.area} ${lang === 'ar' ? 'م²' : 'm²'}</span>
                                ` : ''}
                                ${unit.bedrooms ? `
                                <span><i class="fas fa-bed"></i> ${unit.bedrooms}</span>
                                ` : ''}
                                ${unit.bathrooms ? `
                                <span><i class="fas fa-bath"></i> ${unit.bathrooms}</span>
                                ` : ''}
                            </div>
                            <div class="btn btn-primary btn-project-view" style="margin-top: auto; width: 100%; text-align: center;">
                                <i class="fas fa-arrow-${lang === 'ar' ? 'left' : 'right'}"></i>
                                ${lang === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        <!-- Gallery -->
        ${project.images && project.images.length > 0 ? `
        <div class="project-gallery">
            <h2>${t('project.gallery')}</h2>
            <div class="gallery-images">
                ${project.images.map((img, index) => `
                    <div class="gallery-item" onclick="window.projectLightbox(${index})">
                        <img src="${img}" alt="${title}">
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
            <h2>${t('project.contact')}</h2>
            <p>${t('project.contactText')}</p>
            <a href="index.html#contact" class="btn btn-primary">
                <i class="fas fa-phone"></i>
                ${t('project.contactBtn')}
            </a>
        </div>
    `;

    // Setup lightbox for gallery
    if (project.images && project.images.length > 0) {
        window.projectLightbox = (index) => {
            const captions = project.images.map(() => title);
            lightbox.open(project.images, index, captions);
        };
    }
}

function showError(messageKey) {
    const t = (key) => translations[currentLang][key] || key;
    const content = document.getElementById('project-content');
    content.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <h2>${t(messageKey)}</h2>
            <a href="index.html#our-projects" class="btn btn-primary" style="margin-top: 20px;">
                ${t('project.back')}
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
    
    updatePageTranslations();
    loadProject();
});

// Mobile menu toggle
document.getElementById('nav-toggle')?.addEventListener('click', () => {
    document.getElementById('nav-menu')?.classList.toggle('active');
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set initial language
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.getElementById('lang-toggle').textContent = currentLang === 'ar' ? 'EN' : 'ع';
    
    updatePageTranslations();
    loadProject();
});
