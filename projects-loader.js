// Projects Loader for Homepage
import { db, getDocs, collection, query, orderBy } from './firebase-config.js';

const translations = {
    ar: {
        'ourProjects.title': 'مشاريعنا',
        'ourProjects.subtitle': 'تعرف على مشاريعنا المتميزة في مختلف مناطق المملكة',
        'ourProjects.loading': 'جاري تحميل المشاريع...',
        'ourProjects.viewDetails': 'عرض التفاصيل',
        'ourProjects.noProjects': 'لا توجد مشاريع حالياً',
        'status.available': 'متاح',
        'status.sold': 'مباع',
        'status.upcoming': 'قريباً'
    },
    en: {
        'ourProjects.title': 'Our Projects',
        'ourProjects.subtitle': 'Discover our distinguished projects across the Kingdom',
        'ourProjects.loading': 'Loading projects...',
        'ourProjects.viewDetails': 'View Details',
        'ourProjects.noProjects': 'No projects available',
        'status.available': 'Available',
        'status.sold': 'Sold',
        'status.upcoming': 'Upcoming'
    }
};

export async function loadProjects() {
    const container = document.getElementById('projects-grid');
    if (!container) return;
    
    const currentLang = localStorage.getItem('preferredLanguage') || 'ar';
    const t = (key) => translations[currentLang][key] || key;
    
    try {
        const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                    <i class="fas fa-folder-open" style="font-size: 4rem; color: var(--text-light); margin-bottom: 20px;"></i>
                    <p style="color: var(--text-light); font-size: 1.2rem;">${t('ourProjects.noProjects')}</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        querySnapshot.forEach((doc) => {
            const project = { id: doc.id, ...doc.data() };
            container.appendChild(createProjectCard(project, currentLang, t));
        });
        
    } catch (error) {
        console.error('Error loading projects:', error);
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--error-color);">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 15px;"></i>
                <p>حدث خطأ في تحميل المشاريع</p>
            </div>
        `;
    }
}

function createProjectCard(project, lang, t) {
    const card = document.createElement('div');
    card.className = 'project-card';
    
    const title = project[`title_${lang}`] || project.title_ar;
    const location = project[`location_${lang}`] || project.location_ar;
    const description = project[`description_${lang}`] || project.description_ar;
    
    card.innerHTML = `
        <div class="project-image-wrapper">
            <img src="${project.mainImage}" alt="${title}" class="project-card-image">
            <span class="project-card-status status-${project.status}">${t('status.' + project.status)}</span>
        </div>
        <div class="project-card-content">
            <h3 class="project-card-title">${title}</h3>
            <div class="project-card-location">
                <i class="fas fa-map-marker-alt"></i>
                <span>${location}</span>
            </div>
            <p class="project-card-description">${description.substring(0, 120)}...</p>
            <a href="project.html?id=${project.id}" class="btn btn-primary">
                <i class="fas fa-arrow-left"></i>
                ${t('ourProjects.viewDetails')}
            </a>
        </div>
    `;
    
    return card;
}

// Call this when language changes
export function reloadProjects() {
    loadProjects();
}
