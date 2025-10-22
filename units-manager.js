// Units Manager JavaScript
import { 
    auth, 
    db, 
    storage,
    onAuthStateChanged,
    getDoc,
    doc,
    updateDoc,
    ref,
    uploadBytes,
    getDownloadURL
} from './firebase-config.js';

const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get('projectId');

let currentProject = null;
let currentUnitIndex = null;
let unitMainImageFile = null;
let unitGalleryFiles = [];
let unitFloorPlanFile = null;

// Check authentication
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'admin.html';
    } else {
        if (!projectId) {
            alert('لم يتم تحديد المشروع');
            window.location.href = 'dashboard.html';
            return;
        }
        loadProject();
    }
});

// Load project and its units
async function loadProject() {
    try {
        const projectDoc = await getDoc(doc(db, 'projects', projectId));
        
        if (!projectDoc.exists()) {
            alert('المشروع غير موجود');
            window.location.href = 'dashboard.html';
            return;
        }

        currentProject = { id: projectDoc.id, ...projectDoc.data() };
        document.getElementById('projectName').textContent = currentProject.title_ar;
        
        displayUnits();
    } catch (error) {
        console.error('Error loading project:', error);
        showAlert('حدث خطأ في تحميل المشروع', 'error');
    }
}

// Display units
function displayUnits() {
    const container = document.getElementById('unitsContainer');
    // Ensure units is always an array
    let units = currentProject.units || [];
    
    // Convert to array if it's not already (in case it's an object)
    if (!Array.isArray(units)) {
        units = [];
        currentProject.units = [];
    }
    
    if (units.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-home"></i>
                <h3>لا توجد وحدات بعد</h3>
                <p>ابدأ بإضافة أول وحدة للمشروع</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '<div class="units-grid"></div>';
    const grid = container.querySelector('.units-grid');
    
    units.forEach((unit, index) => {
        grid.appendChild(createUnitCard(unit, index));
    });
}

// Create unit card
function createUnitCard(unit, index) {
    const card = document.createElement('div');
    card.className = 'unit-card';
    
    const statusText = {
        available: 'متاح',
        sold: 'مباع',
        reserved: 'محجوز'
    };
    
    card.innerHTML = `
        <img src="${unit.mainImage || currentProject.mainImage}" alt="${unit.name_ar}" class="unit-image">
        <div class="unit-content">
            <h3 class="unit-name">${unit.name_ar}</h3>
            ${unit.price ? `<div class="unit-price">${unit.price}</div>` : ''}
            <span class="unit-status status-${unit.status}">${statusText[unit.status]}</span>
            <div class="unit-specs">
                ${unit.area ? `<span><i class="fas fa-ruler-combined"></i> ${unit.area} م²</span>` : ''}
                ${unit.bedrooms ? `<span><i class="fas fa-bed"></i> ${unit.bedrooms} غرف</span>` : ''}
                ${unit.bathrooms ? `<span><i class="fas fa-bath"></i> ${unit.bathrooms} حمام</span>` : ''}
            </div>
            <div class="unit-actions">
                <button class="btn btn-primary btn-small edit-unit-btn" data-index="${index}">
                    <i class="fas fa-edit"></i>
                    تعديل
                </button>
                <button class="btn btn-danger btn-small delete-unit-btn" data-index="${index}">
                    <i class="fas fa-trash"></i>
                    حذف
                </button>
            </div>
        </div>
    `;
    
    card.querySelector('.edit-unit-btn').addEventListener('click', () => editUnit(index));
    card.querySelector('.delete-unit-btn').addEventListener('click', () => deleteUnit(index));
    
    return card;
}

// Add new unit button
document.getElementById('addUnitBtn')?.addEventListener('click', () => {
    openUnitModal();
});

// Open unit modal
function openUnitModal(unitIndex = null) {
    currentUnitIndex = unitIndex;
    
    // Create modal dynamically
    const modalHTML = `
        <div id="unitModal" class="modal active">
            <div class="modal-content" style="max-width: 900px;">
                <div class="modal-header">
                    <h3>${unitIndex !== null ? 'تعديل الوحدة' : 'إضافة وحدة جديدة'}</h3>
                    <button class="close-modal" id="closeUnitModal">&times;</button>
                </div>

                <form id="unitForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label>اسم الوحدة (عربي) *</label>
                            <input type="text" id="unit_name_ar" required placeholder="مثال: فيلا A1">
                        </div>
                        <div class="form-group">
                            <label>اسم الوحدة (إنجليزي) *</label>
                            <input type="text" id="unit_name_en" required placeholder="Example: Villa A1">
                        </div>
                    </div>

                    <div class="form-group">
                        <label>وصف الوحدة (عربي) *</label>
                        <textarea id="unit_description_ar" required rows="3"></textarea>
                    </div>

                    <div class="form-group">
                        <label>وصف الوحدة (إنجليزي) *</label>
                        <textarea id="unit_description_en" required rows="3"></textarea>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>المساحة (م²)</label>
                            <input type="text" id="unit_area" placeholder="500">
                        </div>
                        <div class="form-group">
                            <label>السعر</label>
                            <input type="text" id="unit_price" placeholder="1,500,000 ريال">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>عدد غرف النوم</label>
                            <input type="number" id="unit_bedrooms" min="0" placeholder="4">
                        </div>
                        <div class="form-group">
                            <label>عدد الحمامات</label>
                            <input type="number" id="unit_bathrooms" min="0" placeholder="3">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>عدد المجالس</label>
                            <input type="number" id="unit_living_rooms" min="0" placeholder="2">
                        </div>
                        <div class="form-group">
                            <label>المطبخ</label>
                            <input type="text" id="unit_kitchen" placeholder="مطبخ واحد">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>عدد المواقف</label>
                            <input type="number" id="unit_parking" min="0" placeholder="2">
                        </div>
                        <div class="form-group">
                            <label>الدور</label>
                            <input type="text" id="unit_floor" placeholder="الدور الأرضي">
                        </div>
                    </div>

                    <div class="form-group">
                        <label>حالة الوحدة *</label>
                        <select id="unit_status" required>
                            <option value="available">متاح</option>
                            <option value="reserved">محجوز</option>
                            <option value="sold">مباع</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>المميزات (أدخل كل ميزة في سطر)</label>
                        <textarea id="unit_features" rows="4" placeholder="مسبح خاص\nحديقة\nغرفة خادمة\nمصعد"></textarea>
                    </div>

                    <div class="form-group">
                        <label>الصورة الرئيسية</label>
                        <div class="image-upload-area" id="unitMainImageUpload">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <p>اضغط لرفع الصورة الرئيسية</p>
                            <input type="file" id="unitMainImage" accept="image/*" style="display: none;">
                        </div>
                        <div id="unitMainImagePreview" class="image-preview"></div>
                    </div>

                    <div class="form-group">
                        <label>مخطط الطابق</label>
                        <div class="image-upload-area" id="unitFloorPlanUpload">
                            <i class="fas fa-file-image"></i>
                            <p>اضغط لرفع مخطط الطابق</p>
                            <input type="file" id="unitFloorPlan" accept="image/*" style="display: none;">
                        </div>
                        <div id="unitFloorPlanPreview" class="image-preview"></div>
                    </div>

                    <div class="form-group">
                        <label>صور إضافية</label>
                        <div class="image-upload-area" id="unitGalleryUpload">
                            <i class="fas fa-images"></i>
                            <p>اضغط لرفع صور الوحدة (متعددة)</p>
                            <input type="file" id="unitGalleryImages" accept="image/*" multiple style="display: none;">
                        </div>
                        <div id="unitGalleryPreview" class="image-preview"></div>
                    </div>

                    <div style="display: flex; gap: 15px; margin-top: 30px;">
                        <button type="submit" class="btn btn-success" id="saveUnitBtn" style="flex: 1;">
                            <i class="fas fa-save"></i>
                            حفظ الوحدة
                        </button>
                        <button type="button" class="btn btn-secondary" id="cancelUnitBtn" style="flex: 1;">
                            <i class="fas fa-times"></i>
                            إلغاء
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Add modal styles if not exists
    if (!document.getElementById('modalStyles')) {
        const styles = document.createElement('style');
        styles.id = 'modalStyles';
        styles.textContent = `
            .modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.7);
                z-index: 1000;
                align-items: center;
                justify-content: center;
                padding: 20px;
                overflow-y: auto;
            }
            .modal.active {
                display: flex;
            }
            .modal-content {
                background: white;
                border-radius: 20px;
                max-width: 900px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                padding: 40px;
                animation: modalSlideIn 0.3s ease;
            }
            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(-30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
                padding-bottom: 15px;
                border-bottom: 2px solid var(--border-color);
            }
            .modal-header h3 {
                color: var(--primary-color);
                font-size: 1.8rem;
            }
            .close-modal {
                background: none;
                border: none;
                font-size: 2rem;
                color: var(--text-light);
                cursor: pointer;
                transition: color 0.3s ease;
            }
            .close-modal:hover {
                color: var(--error-color);
            }
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 20px;
            }
            @media (max-width: 768px) {
                .form-row {
                    grid-template-columns: 1fr;
                }
            }
            .form-group {
                margin-bottom: 20px;
            }
            .form-group label {
                display: block;
                margin-bottom: 8px;
                font-weight: 600;
                color: var(--text-color);
            }
            .form-group input,
            .form-group textarea,
            .form-group select {
                width: 100%;
                padding: 12px 15px;
                border: 2px solid var(--border-color);
                border-radius: 10px;
                font-family: 'Cairo', sans-serif;
                font-size: 1rem;
                transition: border-color 0.3s ease;
            }
            .form-group input:focus,
            .form-group textarea:focus,
            .form-group select:focus {
                outline: none;
                border-color: var(--primary-color);
            }
            .form-group textarea {
                min-height: 80px;
                resize: vertical;
            }
            .image-upload-area {
                border: 2px dashed var(--border-color);
                border-radius: 10px;
                padding: 30px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .image-upload-area:hover {
                border-color: var(--primary-color);
                background: #f8f9fa;
            }
            .image-upload-area i {
                font-size: 3rem;
                color: var(--text-light);
                margin-bottom: 15px;
            }
            .image-preview {
                display: flex;
                flex-wrap: wrap;
                gap: 15px;
                margin-top: 20px;
            }
            .preview-item {
                position: relative;
                width: 150px;
                height: 150px;
                border-radius: 10px;
                overflow: hidden;
            }
            .preview-item img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
        `;
        document.head.appendChild(styles);
    }
    
    // Remove existing modal if any
    document.getElementById('unitModal')?.remove();
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Setup modal events
    setupUnitModal(unitIndex);
}

// Setup unit modal
function setupUnitModal(unitIndex) {
    const modal = document.getElementById('unitModal');
    const closeBtn = document.getElementById('closeUnitModal');
    const cancelBtn = document.getElementById('cancelUnitBtn');
    const form = document.getElementById('unitForm');
    
    closeBtn.addEventListener('click', closeUnitModal);
    cancelBtn.addEventListener('click', closeUnitModal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeUnitModal();
    });
    
    // Image uploads
    document.getElementById('unitMainImageUpload').addEventListener('click', () => {
        document.getElementById('unitMainImage').click();
    });
    
    document.getElementById('unitMainImage').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            unitMainImageFile = file;
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('unitMainImagePreview').innerHTML = `
                    <div class="preview-item">
                        <img src="${e.target.result}" alt="Preview">
                    </div>
                `;
            };
            reader.readAsDataURL(file);
        }
    });
    
    document.getElementById('unitFloorPlanUpload').addEventListener('click', () => {
        document.getElementById('unitFloorPlan').click();
    });
    
    document.getElementById('unitFloorPlan').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            unitFloorPlanFile = file;
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('unitFloorPlanPreview').innerHTML = `
                    <div class="preview-item">
                        <img src="${e.target.result}" alt="Floor Plan">
                    </div>
                `;
            };
            reader.readAsDataURL(file);
        }
    });
    
    document.getElementById('unitGalleryUpload').addEventListener('click', () => {
        document.getElementById('unitGalleryImages').click();
    });
    
    document.getElementById('unitGalleryImages').addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        unitGalleryFiles = files;
        
        const preview = document.getElementById('unitGalleryPreview');
        preview.innerHTML = '';
        
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.innerHTML += `
                    <div class="preview-item">
                        <img src="${e.target.result}" alt="Gallery">
                    </div>
                `;
            };
            reader.readAsDataURL(file);
        });
    });
    
    // Fill form if editing
    if (unitIndex !== null) {
        const unit = currentProject.units[unitIndex];
        document.getElementById('unit_name_ar').value = unit.name_ar || '';
        document.getElementById('unit_name_en').value = unit.name_en || '';
        document.getElementById('unit_description_ar').value = unit.description_ar || '';
        document.getElementById('unit_description_en').value = unit.description_en || '';
        document.getElementById('unit_area').value = unit.area || '';
        document.getElementById('unit_price').value = unit.price || '';
        document.getElementById('unit_bedrooms').value = unit.bedrooms || '';
        document.getElementById('unit_bathrooms').value = unit.bathrooms || '';
        document.getElementById('unit_living_rooms').value = unit.living_rooms || '';
        document.getElementById('unit_kitchen').value = unit.kitchen || '';
        document.getElementById('unit_parking').value = unit.parking || '';
        document.getElementById('unit_floor').value = unit.floor || '';
        document.getElementById('unit_status').value = unit.status || 'available';
        
        if (unit.features && unit.features.length > 0) {
            document.getElementById('unit_features').value = unit.features.join('\n');
        }
        
        // Show existing images
        if (unit.mainImage) {
            document.getElementById('unitMainImagePreview').innerHTML = `
                <div class="preview-item">
                    <img src="${unit.mainImage}" alt="Main">
                </div>
            `;
        }
        
        if (unit.floorPlan) {
            document.getElementById('unitFloorPlanPreview').innerHTML = `
                <div class="preview-item">
                    <img src="${unit.floorPlan}" alt="Floor Plan">
                </div>
            `;
        }
        
        if (unit.images && unit.images.length > 0) {
            document.getElementById('unitGalleryPreview').innerHTML = unit.images.map(img => `
                <div class="preview-item">
                    <img src="${img}" alt="Gallery">
                </div>
            `).join('');
        }
    }
    
    // Form submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveUnit();
    });
}

// Close unit modal
function closeUnitModal() {
    document.getElementById('unitModal')?.remove();
    currentUnitIndex = null;
    unitMainImageFile = null;
    unitGalleryFiles = [];
    unitFloorPlanFile = null;
}

// Save unit
async function saveUnit() {
    const saveBtn = document.getElementById('saveUnitBtn');
    const originalText = saveBtn.innerHTML;
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
    
    try {
        const unitData = {
            id: currentUnitIndex !== null ? currentProject.units[currentUnitIndex].id : `unit-${Date.now()}`,
            name_ar: document.getElementById('unit_name_ar').value.trim(),
            name_en: document.getElementById('unit_name_en').value.trim(),
            description_ar: document.getElementById('unit_description_ar').value.trim(),
            description_en: document.getElementById('unit_description_en').value.trim(),
            area: document.getElementById('unit_area').value.trim(),
            price: document.getElementById('unit_price').value.trim(),
            bedrooms: parseInt(document.getElementById('unit_bedrooms').value) || null,
            bathrooms: parseInt(document.getElementById('unit_bathrooms').value) || null,
            living_rooms: parseInt(document.getElementById('unit_living_rooms').value) || null,
            kitchen: document.getElementById('unit_kitchen').value.trim(),
            parking: parseInt(document.getElementById('unit_parking').value) || null,
            floor: document.getElementById('unit_floor').value.trim(),
            status: document.getElementById('unit_status').value
        };
        
        // Features
        const featuresText = document.getElementById('unit_features').value.trim();
        unitData.features = featuresText ? featuresText.split('\n').filter(f => f.trim()) : [];
        
        // Upload images
        if (unitMainImageFile) {
            const mainImageRef = ref(storage, `projects/${projectId}/units/${Date.now()}_main_${unitMainImageFile.name}`);
            await uploadBytes(mainImageRef, unitMainImageFile);
            unitData.mainImage = await getDownloadURL(mainImageRef);
        } else if (currentUnitIndex !== null && currentProject.units[currentUnitIndex].mainImage) {
            unitData.mainImage = currentProject.units[currentUnitIndex].mainImage;
        }
        
        if (unitFloorPlanFile) {
            const floorPlanRef = ref(storage, `projects/${projectId}/units/${Date.now()}_floorplan_${unitFloorPlanFile.name}`);
            await uploadBytes(floorPlanRef, unitFloorPlanFile);
            unitData.floorPlan = await getDownloadURL(floorPlanRef);
        } else if (currentUnitIndex !== null && currentProject.units[currentUnitIndex].floorPlan) {
            unitData.floorPlan = currentProject.units[currentUnitIndex].floorPlan;
        }
        
        if (unitGalleryFiles.length > 0) {
            const galleryUrls = [];
            for (const file of unitGalleryFiles) {
                const imageRef = ref(storage, `projects/${projectId}/units/${Date.now()}_gallery_${file.name}`);
                await uploadBytes(imageRef, file);
                const url = await getDownloadURL(imageRef);
                galleryUrls.push(url);
            }
            unitData.images = galleryUrls;
        } else if (currentUnitIndex !== null && currentProject.units[currentUnitIndex].images) {
            unitData.images = currentProject.units[currentUnitIndex].images;
        } else {
            unitData.images = [];
        }
        
        // Update project's units array
        // Ensure units is always an array
        let units = currentProject.units || [];
        
        // Convert to array if it's not already
        if (!Array.isArray(units)) {
            units = [];
        }
        
        if (currentUnitIndex !== null) {
            units[currentUnitIndex] = unitData;
        } else {
            units.push(unitData);
        }
        
        // Save to Firestore
        await updateDoc(doc(db, 'projects', projectId), {
            units: units
        });
        
        showAlert(currentUnitIndex !== null ? 'تم تحديث الوحدة بنجاح' : 'تم إضافة الوحدة بنجاح', 'success');
        
        closeUnitModal();
        loadProject();
        
    } catch (error) {
        console.error('Error saving unit:', error);
        showAlert('حدث خطأ: ' + error.message, 'error');
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;
    }
}

// Edit unit
function editUnit(index) {
    openUnitModal(index);
}

// Delete unit
async function deleteUnit(index) {
    if (!confirm('هل أنت متأكد من حذف هذه الوحدة؟')) {
        return;
    }
    
    try {
        // Ensure units is always an array
        let units = currentProject.units || [];
        
        // Convert to array if it's not already
        if (!Array.isArray(units)) {
            units = [];
        }
        
        units.splice(index, 1);
        
        await updateDoc(doc(db, 'projects', projectId), {
            units: units
        });
        
        showAlert('تم حذف الوحدة بنجاح', 'success');
        loadProject();
    } catch (error) {
        console.error('Error deleting unit:', error);
        showAlert('حدث خطأ في حذف الوحدة', 'error');
    }
}

// Show alert
function showAlert(message, type) {
    const alert = document.getElementById('alert');
    alert.textContent = message;
    alert.className = `alert alert-${type} show`;
    
    setTimeout(() => {
        alert.classList.remove('show');
    }, 5000);
}
