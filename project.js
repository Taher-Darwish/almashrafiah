// Project Detail Page JavaScript
import { db, getDocs, getDoc, doc, collection } from './firebase-config.js';

// Get project ID from URL
const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get('id');

// i18n translations
const translations = {
    ar: {
        'project.back': 'العودة إلى المشاريع',
        'project.loading': 'جاري تحميل تفاصيل المشروع...',
        'project.notFound': 'المشروع غير موجود',
        'project.description': 'وصف المشروع',
        'project.specs': 'المواصفات',
        'project.gallery': 'معرض الصور',
        'project.contact': 'هل أنت مهتم بهذا المشروع؟',
        'project.contactText': 'تواصل معنا الآن للحصول على المزيد من التفاصيل',
        'project.contactBtn': 'تواصل معنا',
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
        'project.back': 'Back to Projects',
        'project.loading': 'Loading project details...',
        'project.notFound': 'Project not found',
        'project.description': 'Project Description',
        'project.specs': 'Specifications',
        'project.gallery': 'Gallery',
        'project.contact': 'Interested in this project?',
        'project.contactText': 'Contact us now for more details',
        'project.contactBtn': 'Contact Us',
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
        </div>

        <!-- Project Content -->
        <div class="project-content">
            <!-- Description -->
            <div class="project-description">
                <h2>${t('project.description')}</h2>
                <p>${description}</p>
            </div>

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

        <!-- Gallery -->
        ${project.images && project.images.length > 0 ? `
        <div class="project-gallery">
            <h2>${t('project.gallery')}</h2>
            <div class="gallery-images">
                ${project.images.map(img => `
                    <div class="gallery-item">
                        <img src="${img}" alt="${title}">
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
    
    loadProject();
});
