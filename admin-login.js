// Admin Login JavaScript
import { auth, signInWithEmailAndPassword, onAuthStateChanged } from './firebase-config.js';

// Check if already logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = 'dashboard.html';
    }
});

// Toggle password visibility
document.getElementById('togglePassword').addEventListener('click', function() {
    const passwordInput = document.getElementById('password');
    const icon = this;
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
});

// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('loginBtn');
    const alert = document.getElementById('alert');
    
    // Disable button and show loading
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري تسجيل الدخول...';
    hideAlert();
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
        
        // Show success message
        showAlert('تم تسجيل الدخول بنجاح! جاري التحويل...', 'success');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
        
    } catch (error) {
        console.error('Login error:', error);
        
        let errorMessage = 'حدث خطأ أثناء تسجيل الدخول';
        
        switch (error.code) {
            case 'auth/invalid-email':
                errorMessage = 'البريد الإلكتروني غير صحيح';
                break;
            case 'auth/user-disabled':
                errorMessage = 'هذا الحساب معطل';
                break;
            case 'auth/user-not-found':
                errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
                break;
            case 'auth/wrong-password':
                errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
                break;
            case 'auth/invalid-credential':
                errorMessage = 'البيانات المدخلة غير صحيحة';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'تم تجاوز عدد المحاولات. يرجى المحاولة لاحقاً';
                break;
            default:
                errorMessage = 'حدث خطأ: ' + error.message;
        }
        
        showAlert(errorMessage, 'error');
        
        // Re-enable button
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> تسجيل الدخول';
    }
});

function showAlert(message, type) {
    const alert = document.getElementById('alert');
    alert.textContent = message;
    alert.className = `alert alert-${type}`;
    alert.style.display = 'block';
}

function hideAlert() {
    const alert = document.getElementById('alert');
    alert.style.display = 'none';
}
