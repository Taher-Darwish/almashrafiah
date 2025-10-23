// Dashboard JavaScript
import { 
    auth, 
    db, 
    storage,
    onAuthStateChanged,
    signOut,
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    serverTimestamp,
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from './firebase-config.js';

let currentProjectId = null;
let mainImageFile = null;
let galleryFiles = [];
let pdfFile = null;
let existingMainImage = null;
let existingGalleryImages = [];
let existingPdfFile = null;

// Check authentication
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'admin.html';
    } else {
        document.getElementById('userEmail').textContent = user.email;
        loadProjects();
    }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await signOut(auth);
        window.location.href = 'admin.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
});

// Load all projects
async function loadProjects() {
    const container = document.getElementById('projectsContainer');
    
    try {
        const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <h3>لا توجد مشاريع بعد</h3>
                    <p>ابدأ بإضافة أول مشروع من خلال الزر أعلاه</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '<div class="projects-grid"></div>';
        const grid = container.querySelector('.projects-grid');
        
        querySnapshot.forEach((doc) => {
            const project = { id: doc.id, ...doc.data() };
            grid.appendChild(createProjectCard(project));
        });
        
    } catch (error) {
        console.error('Error loading projects:', error);
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>حدث خطأ في تحميل المشاريع</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// Create project card
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    
    const statusText = {
        available: 'متاح',
        sold: 'مباع',
        upcoming: 'قريباً'
    };
    
    card.innerHTML = `
        <img src="${project.mainImage}" alt="${project.title_ar}" class="project-image">
        <div class="project-content">
            <h3 class="project-title">${project.title_ar}</h3>
            <div class="project-location">
                <i class="fas fa-map-marker-alt"></i>
                ${project.location_ar}
            </div>
            <span class="project-status status-${project.status}">${statusText[project.status]}</span>
            ${project.units && project.units.length > 0 ? `
            <div style="margin: 10px 0; padding: 8px; background: var(--bg-light); border-radius: 8px; text-align: center; font-size: 0.9rem;">
                <i class="fas fa-home"></i> ${project.units.length} وحدة
            </div>
            ` : ''}
            <div class="project-actions">
                <button class="btn btn-success btn-small units-btn" data-id="${project.id}" style="flex: 1;">
                    <i class="fas fa-home"></i>
                    الوحدات
                </button>
                <button class="btn btn-primary btn-small edit-btn" data-id="${project.id}">
                    <i class="fas fa-edit"></i>
                    تعديل
                </button>
                <button class="btn btn-danger btn-small delete-btn" data-id="${project.id}">
                    <i class="fas fa-trash"></i>
                    حذف
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners
    card.querySelector('.units-btn').addEventListener('click', () => manageUnits(project.id, project.title_ar));
    card.querySelector('.edit-btn').addEventListener('click', () => editProject(project.id));
    card.querySelector('.delete-btn').addEventListener('click', () => deleteProject(project.id));
    
    return card;
}

// Manage units for a project
function manageUnits(projectId, projectTitle) {
    // Store in sessionStorage for the units manager page
    sessionStorage.setItem('currentProjectId', projectId);
    sessionStorage.setItem('currentProjectTitle', projectTitle);
    // Redirect to units manager
    window.location.href = `units-manager.html?projectId=${projectId}`;
}

// Modal controls
const modal = document.getElementById('projectModal');
const addBtn = document.getElementById('addProjectBtn');
const closeBtn = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');

addBtn.addEventListener('click', () => openModal());
closeBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);

modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

function openModal(projectData = null) {
    currentProjectId = projectData ? projectData.id : null;
    document.getElementById('modalTitle').textContent = 
        currentProjectId ? 'تعديل المشروع' : 'إضافة مشروع جديد';
    
    if (projectData) {
        // Fill form with existing data
        document.getElementById('title_ar').value = projectData.title_ar || '';
        document.getElementById('title_en').value = projectData.title_en || '';
        document.getElementById('location_ar').value = projectData.location_ar || '';
        document.getElementById('location_en').value = projectData.location_en || '';
        document.getElementById('mapUrl').value = projectData.mapUrl || '';
        document.getElementById('description_ar').value = projectData.description_ar || '';
        document.getElementById('description_en').value = projectData.description_en || '';
        document.getElementById('area').value = projectData.area || '';
        document.getElementById('price').value = projectData.price || '';
        document.getElementById('units').value = projectData.units || '';
        document.getElementById('deliveryDate').value = projectData.deliveryDate || '';
        document.getElementById('status').value = projectData.status || 'available';
        
        existingMainImage = projectData.mainImage;
        existingGalleryImages = projectData.images || [];
        existingPdfFile = projectData.pdfFile || null;
        
        // Show existing images
        if (existingMainImage) {
            document.getElementById('mainImagePreview').innerHTML = `
                <div class="preview-item">
                    <img src="${existingMainImage}" alt="Main">
                </div>
            `;
        }
        
        if (existingGalleryImages.length > 0) {
            document.getElementById('galleryPreview').innerHTML = existingGalleryImages.map((img, index) => `
                <div class="preview-item">
                    <img src="${img}" alt="Gallery ${index}">
                </div>
            `).join('');
        }

        if (existingPdfFile) {
            const fileName = existingPdfFile.split('/').pop().split('?')[0];
            document.getElementById('pdfPreview').innerHTML = `
                <div class="preview-item pdf-preview">
                    <i class="fas fa-file-pdf" style="font-size: 3rem; color: #e74c3c;"></i>
                    <p style="margin-top: 10px; font-weight: 600;">PDF موجود</p>
                    <a href="${existingPdfFile}" target="_blank" style="color: var(--primary-color);">عرض الملف</a>
                </div>
            `;
        }
    } else {
        document.getElementById('projectForm').reset();
        document.getElementById('mainImagePreview').innerHTML = '';
        document.getElementById('galleryPreview').innerHTML = '';
        document.getElementById('pdfPreview').innerHTML = '';
        existingMainImage = null;
        existingGalleryImages = [];
        existingPdfFile = null;
    }
    
    mainImageFile = null;
    galleryFiles = [];
    pdfFile = null;
    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
    currentProjectId = null;
    mainImageFile = null;
    galleryFiles = [];
    pdfFile = null;
    existingMainImage = null;
    existingGalleryImages = [];
    existingPdfFile = null;
}

// Image upload handlers
document.getElementById('mainImageUpload').addEventListener('click', () => {
    document.getElementById('mainImage').click();
});

document.getElementById('mainImage').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        mainImageFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('mainImagePreview').innerHTML = `
                <div class="preview-item">
                    <img src="${e.target.result}" alt="Preview">
                </div>
            `;
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('galleryUpload').addEventListener('click', () => {
    document.getElementById('galleryImages').click();
});

document.getElementById('galleryImages').addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    galleryFiles = files;
    
    const preview = document.getElementById('galleryPreview');
    preview.innerHTML = '';
    
    files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const div = document.createElement('div');
            div.className = 'preview-item';
            div.innerHTML = `
                <img src="${e.target.result}" alt="Gallery ${index}">
                <button type="button" class="remove-image" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            preview.appendChild(div);
            
            div.querySelector('.remove-image').addEventListener('click', () => {
                galleryFiles.splice(index, 1);
                div.remove();
            });
        };
        reader.readAsDataURL(file);
    });
});

// PDF upload handler
document.getElementById('pdfUpload').addEventListener('click', () => {
    document.getElementById('pdfFile').click();
});

document.getElementById('pdfFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        pdfFile = file;
        const preview = document.getElementById('pdfPreview');
        preview.innerHTML = `
            <div class="preview-item pdf-preview">
                <i class="fas fa-file-pdf" style="font-size: 3rem; color: #e74c3c;"></i>
                <p style="margin-top: 10px; font-weight: 600;">${file.name}</p>
                <p style="font-size: 0.9rem; color: var(--text-light);">${(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
        `;
    }
});

// Form submission
document.getElementById('projectForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const saveBtn = document.getElementById('saveBtn');
    const originalText = saveBtn.innerHTML;
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
    
    try {
        // Get form data
        const formData = {
            title_ar: document.getElementById('title_ar').value.trim(),
            title_en: document.getElementById('title_en').value.trim(),
            location_ar: document.getElementById('location_ar').value.trim(),
            location_en: document.getElementById('location_en').value.trim(),
            mapUrl: document.getElementById('mapUrl').value.trim(),
            description_ar: document.getElementById('description_ar').value.trim(),
            description_en: document.getElementById('description_en').value.trim(),
            area: document.getElementById('area').value.trim(),
            price: document.getElementById('price').value.trim(),
            units: document.getElementById('units').value.trim(),
            deliveryDate: document.getElementById('deliveryDate').value.trim(),
            status: document.getElementById('status').value
        };
        
        // Upload main image if new one selected
        if (mainImageFile) {
            const mainImageRef = ref(storage, `projects/${Date.now()}_main_${mainImageFile.name}`);
            await uploadBytes(mainImageRef, mainImageFile);
            formData.mainImage = await getDownloadURL(mainImageRef);
        } else if (existingMainImage) {
            formData.mainImage = existingMainImage;
        } else {
            throw new Error('يجب رفع صورة رئيسية للمشروع');
        }
        
        // Upload gallery images if new ones selected
        if (galleryFiles.length > 0) {
            const galleryUrls = [];
            for (const file of galleryFiles) {
                const imageRef = ref(storage, `projects/${Date.now()}_gallery_${file.name}`);
                await uploadBytes(imageRef, file);
                const url = await getDownloadURL(imageRef);
                galleryUrls.push(url);
            }
            formData.images = galleryUrls;
        } else if (existingGalleryImages.length > 0) {
            formData.images = existingGalleryImages;
        } else {
            formData.images = [];
        }

        // Upload PDF if new one selected
        if (pdfFile) {
            const pdfRef = ref(storage, `projects/${Date.now()}_${pdfFile.name}`);
            await uploadBytes(pdfRef, pdfFile);
            formData.pdfFile = await getDownloadURL(pdfRef);
        } else if (existingPdfFile) {
            formData.pdfFile = existingPdfFile;
        }
        
        // Save to Firestore
        if (currentProjectId) {
            // Update existing project
            await updateDoc(doc(db, 'projects', currentProjectId), {
                ...formData,
                updatedAt: serverTimestamp()
            });
            showAlert('تم تحديث المشروع بنجاح', 'success');
        } else {
            // Create new project
            await addDoc(collection(db, 'projects'), {
                ...formData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            showAlert('تم إضافة المشروع بنجاح', 'success');
        }
        
        closeModal();
        loadProjects();
        
    } catch (error) {
        console.error('Error saving project:', error);
        showAlert('حدث خطأ: ' + error.message, 'error');
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;
    }
});

// Edit project
async function editProject(projectId) {
    try {
        const projectDoc = await getDoc(doc(db, 'projects', projectId));
        if (projectDoc.exists()) {
            const projectData = { id: projectDoc.id, ...projectDoc.data() };
            openModal(projectData);
        }
    } catch (error) {
        console.error('Error loading project:', error);
        showAlert('حدث خطأ في تحميل المشروع', 'error');
    }
}

// Delete project
async function deleteProject(projectId) {
    if (!confirm('هل أنت متأكد من حذف هذا المشروع؟ لا يمكن التراجع عن هذا الإجراء.')) {
        return;
    }
    
    try {
        await deleteDoc(doc(db, 'projects', projectId));
        showAlert('تم حذف المشروع بنجاح', 'success');
        loadProjects();
    } catch (error) {
        console.error('Error deleting project:', error);
        showAlert('حدث خطأ في حذف المشروع', 'error');
    }
}

// Alert functions
function showAlert(message, type) {
    const alert = document.getElementById('alert');
    alert.textContent = message;
    alert.className = `alert alert-${type} show`;
    
    setTimeout(() => {
        alert.classList.remove('show');
    }, 5000);
}
