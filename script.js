// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    // IMPORTANT: Apply i18n first so any animations (like typewriter) use the correct language content
    initializeI18n();
    initializeNavigation();
    initializeScrollEffects();
    initializeAnimations();
    initializeForm();
    initializeChartAnimations();
    initializeScrollToTop();
    initializeLoadingScreen();
    initializeSubmissionFeedback();
    initializeImageLightbox();
});

// Navigation functionality
function initializeNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            // Position menu right below the current header height (handles larger logo)
            const headerEl = document.querySelector('.header');
            if (navMenu.classList.contains('active') && headerEl) {
                navMenu.style.top = headerEl.offsetHeight + 'px';
            }
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });
    }

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Header scroll effect
    const header = document.querySelector('.header');
    let lastScrollTop = 0;

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.backdropFilter = 'blur(15px)';
            header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
            header.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        }

        // Hide/show header on scroll
        if (scrollTop > lastScrollTop && scrollTop > 200) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        lastScrollTop = scrollTop;
    });
}

// Scroll effects and animations
function initializeScrollEffects() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.about-card, .value-item, .feature-card, .path-card, .contact-item, .gallery-item');
    animateElements.forEach(el => {
        observer.observe(el);
    });

    // Parallax effect for hero section
    const hero = document.querySelector('.hero');
    const heroImage = document.querySelector('.hero-img');
    
    if (hero && heroImage) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const heroHeight = hero.offsetHeight;
            const scrollProgress = scrolled / heroHeight;
            
            if (scrolled < heroHeight) {
                heroImage.style.transform = `translateY(${scrolled * 0.3}px)`;
            }
        });
    }

    // Scroll progress indicator
    createScrollProgressIndicator();
}

// Create scroll progress indicator
function createScrollProgressIndicator() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
        z-index: 9999;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        progressBar.style.width = scrollPercent + '%';
    });
}

// Initialize animations
function initializeAnimations() {
    // Counter animation for statistics
    const counters = document.querySelectorAll('.stat-number, .growth-number, .rate');
    
    const counterObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => {
        counterObserver.observe(counter);
    });

    // Typing animation for hero title
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        // Only run once on initial load; i18n toggle will call with force=true
        typewriterEffect(heroTitle, 1000, false);
    }

    // Stagger animation for cards
    staggerCardAnimations();
}

// Counter animation
function animateCounter(element) {
    const target = parseFloat(element.textContent.replace(/[^\d.]/g, ''));
    const duration = 2000; // 2 seconds
    const increment = target / (duration / 16); // 60 FPS
    let current = 0;

    const timer = setInterval(function() {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        // Format number based on original content
        const originalText = element.textContent;
        if (originalText.includes('%')) {
            element.textContent = Math.floor(current) + '%';
        } else if (originalText.includes('مليون')) {
            element.textContent = Math.floor(current);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Typewriter effect
function typewriterEffect(element, startDelay = 1000, force = false) {
    if (!element) return;
    // Prevent double-run on initial load unless forced (e.g., on language toggle)
    if (!force && element.dataset.typed === '1') return;
    // If an instance is running, cancel it before restarting
    if (element._typeTimer) {
        clearTimeout(element._typeTimer);
        element._typeTimer = null;
    }

    // Convert current HTML into plain text with \n for <br> and decode entities like &amp;
    const html = element.innerHTML;
    const htmlWithNewlines = html.replace(/<br\s*\/?>(\r?\n)?/gi, '\n');
    const tmp = document.createElement('div');
    tmp.innerHTML = htmlWithNewlines;
    const text = (tmp.textContent || '').toString();

    element.innerHTML = '';
    let i = 0;

    function typeChar() {
        if (i <= text.length) {
            const partial = text.slice(0, i);
            // Render newlines as <br>
            element.innerHTML = partial.replace(/\n/g, '<br>');
            i++;
            element._typeTimer = setTimeout(typeChar, 100);
        } else {
            element.dataset.typed = '1';
            element._typeTimer = null;
        }
    }

    setTimeout(typeChar, startDelay); // Start after provided delay (default 1s)
}

// Stagger card animations
function staggerCardAnimations() {
    const cardSections = [
        '.values-grid .value-item',
        '.features-grid .feature-card',
        '.investment-paths .path-card'
    ];

    cardSections.forEach(selector => {
        const cards = document.querySelectorAll(selector);
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
        });
    });
}

// Form functionality
function initializeForm() {
    const form = document.getElementById('contactForm');
    const inputs = form.querySelectorAll('input, select, textarea');

    // Add floating label effect
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', function() {
            if (this.value === '' && this.type !== 'select-one') {
                this.parentElement.classList.remove('focused');
            }
        });

        // Check if input has value on page load
        if (input.value !== '' || input.type === 'select-one') {
            input.parentElement.classList.add('focused');
        }
    });

    // Form validation
    form.addEventListener('submit', function(e) {
        
        let isValid = true;
        const formData = new FormData(form);
        
        // Validate required fields
        inputs.forEach(input => {
            if (input.hasAttribute('required') && !input.value.trim()) {
                showFieldError(input, window.__i18n ? window.__i18n.t('form.errors.required') : 'هذا الحقل مطلوب');
                isValid = false;
            } else {
                clearFieldError(input);
            }
        });

        // Email validation
        const email = form.querySelector('#email');
        if (email.value && !isValidEmail(email.value)) {
            showFieldError(email, window.__i18n ? window.__i18n.t('form.errors.email') : 'يرجى إدخال بريد إلكتروني صحيح');
            isValid = false;
        }

        // Phone validation
        const phone = form.querySelector('#phone');
        if (phone.value && !isValidPhone(phone.value)) {
            showFieldError(phone, window.__i18n ? window.__i18n.t('form.errors.phone') : 'يرجى إدخال رقم هاتف صحيح');
            isValid = false;
        }

        if (!isValid) {
            e.preventDefault();
            return;
        }

        // If configured to use external service, set reply-to and redirect then allow native submit
        if (form.dataset.external === 'formsubmit') {
            const emailInput = form.querySelector('#email');
            const replyTo = document.getElementById('fsReplyTo');
            if (emailInput && replyTo) replyTo.value = emailInput.value;

            const next = document.getElementById('fsNext');
            if (next) {
                // Redirect back to same page with success flag
                next.value = window.location.origin + window.location.pathname + '?sent=1#contact';
            }
            // Let the form submit normally to FormSubmit
            return;
        }

        // Default behavior (no external): prevent and simulate
        e.preventDefault();
        submitForm(formData);
    });
}

// Form validation helpers
function showFieldError(field, message) {
    clearFieldError(field);
    field.style.borderColor = 'var(--accent-color)';
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: var(--accent-color);
        font-size: var(--font-size-sm);
        margin-top: var(--spacing-xs);
    `;
    
    field.parentElement.appendChild(errorDiv);
}

function clearFieldError(field) {
    field.style.borderColor = 'transparent';
    const errorDiv = field.parentElement.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
}

// Form submission
function submitForm(formData) {
    const submitBtn = document.querySelector('#contactForm button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${window.__i18n ? window.__i18n.t('form.sending') : 'جاري الإرسال...'}`;
    submitBtn.disabled = true;

    // Simulate form submission (replace with actual API call)
    setTimeout(function() {
    showNotification(window.__i18n ? window.__i18n.t('ui.success') : 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.', 'success');
        document.getElementById('contactForm').reset();
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Clear focused states
        document.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('focused');
        });
    }, 2000);
}

// Chart animations
function initializeChartAnimations() {
    const chartBars = document.querySelectorAll('.bar');
    
    const chartObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateChart();
                chartObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    if (chartBars.length > 0) {
        chartObserver.observe(chartBars[0].parentElement);
    }
}

function animateChart() {
    const items = document.querySelectorAll('.bar-item');
    if (items.length === 0) return;

    // Determine max value if we need to compute relative heights
    let maxValue = 0;
    items.forEach(item => {
        const v = parseFloat(item.getAttribute('data-value')) || 0;
        if (v > maxValue) maxValue = v;
    });

    items.forEach((item, index) => {
        const bar = item.querySelector('.bar');
        if (!bar) return;

        // Target height from inline style or computed from data-value
        let targetHeight = bar.style.height;
        if (!targetHeight) {
            const val = parseFloat(item.getAttribute('data-value')) || 0;
            targetHeight = maxValue > 0 ? `${Math.round((val / maxValue) * 100)}%` : '0%';
        }

        // Animate from 0% to targetHeight using CSS transition
        bar.style.transition = 'height 1.5s ease-out';
        bar.style.height = '0%';
        setTimeout(() => {
            bar.style.height = targetHeight;
        }, index * 200 + 50);
    });
}

// Internationalization (i18n)
function initializeI18n() {
    const TRANSLATIONS = {
        ar: {
            meta: {
                title: 'شركة المشرفية للتطوير والاستثمار العقاري | Al-Mashrafiah Real Estate',
                description: 'شركة سعودية رائدة في مجال التطوير العقاري والاستثمار - Saudi leading real estate development and investment company',
                ogTitle: 'شركة المشرفية للتطوير والاستثمار العقاري',
                ogDescription: 'شركة سعودية رائدة في مجال التطوير العقاري والاستثمار',
                twTitle: 'شركة المشرفية للتطوير والاستثمار العقاري',
                twDescription: 'شركة سعودية رائدة في مجال التطوير العقاري والاستثمار'
            },
            brand: { name: 'المشرفية' },
            nav: { home: 'الرئيسية', about: 'من نحن', ourProjects: 'مشاريعنا', investment: 'سجل اهتمامك', projects: 'التشييد والتشطيب', contact: 'اتصل بنا' },
            hero: {
                title: 'المشرفية\nللتطوير والاستثمار العقاري',
                subtitle: 'نحن شركة سعودية تأسست برؤية طموحة لصناعة نماذج استثمارية مبتكرة\nمن خلال تطوير وحدات سكنية ذات جودة عالية في مواقع استراتيجية',
                ctaPrimary: 'تواصل معنا',
                ctaSecondary: 'اعرف المزيد',
                quality: 'مشاريع عالية الجودة',
                stats: {
                    stat1: 'مليون ريال\\nالقيمة المتوقعة 2030',
                    stat2: 'عائد الاستثمار\\nللمستثمر الفردي',
                    stat3: 'شهر فقط\\nمدة التسليم'
                }
            },
            about: {
                title: 'من نحن',
                subtitle: 'شركة رائدة في مجال التطوير العقاري بالمملكة العربية السعودية',
                vision: { title: 'رؤيتنا', text: 'أن نكون الوجهة الأولى والأكثر ثقة في مجال التطوير العقاري السكني، وأن نضع بصمتنا في كل حي ومشروع، بوصفنا شركاء النجاح للمستثمرين والمستهلكين على حد سواء.' },
                mission: { title: 'مهمتنا', text: 'تقديم منتج عقاري عالي الجودة يُلبي تطلعات السوق، ويحقق رضا المستثمر من خلال تنفيذ احترافي، وتقييمات دقيقة، وخطط تشغيل ذكية وتحقيق اعلى معدلات رضا للعملاء والمستثمرين.' },
                values: {
                    title: 'قيمنا',
                    integrity: { title: 'النزاهة', text: 'نلتزم بالشفافية والوضوح في كل تعامل وكل مشروع' },
                    professionalism: { title: 'الاحترافية', text: 'نُدير مشاريعنا بفكر هندسي وتسويقي عالي المستوى' },
                    integration: { title: 'التكامل', text: 'نعمل كفريق واحد بخبرات متخصصة تغطي كل مراحل المشروع' },
                    innovation: { title: 'الابتكار', text: 'نعيد تعريف العقار كمنتج استثماري ذكي وقابل للنمو المستدام' }
                }
            },
            features: {
                title: 'ما يميزنا',
                subtitle: 'في المشرفية، لا نُقدم مشروعًا فقط… بل نُقدم تجربة استثمارية متكاملة',
                safeOwnership: { title: 'تملّك آمن', text: 'صكوك رسمية بإسم المستثمر' },
                quickReturns: { title: 'عوائد سريعة', text: 'عوائد تشغيلية تبدأ من أول سنة' },
                integratedManagement: { title: 'إدارة متكاملة', text: 'التصميم، التنفيذ، الإشراف، التسويق، البيع والتأجير' },
                selectedLocations: { title: 'مواقع مختارة', text: 'داخل مناطق ذات نمو واعد' },
                independentDeeds: { title: 'صكوك مستقلة', text: 'صكوك ملكية مستقلة لكل وحدة' },
                fastDelivery: { title: 'تسليم سريع', text: 'تسليم خلال 10-12 شهر فقط' }
            },
            partners: { title: 'شركاؤنا', subtitle: 'نفخر بشراكتنا مع أفضل الشركات والمؤسسات في المملكة' },
            ourProjects: {
                title: 'مشاريعنا',
                subtitle: 'تعرف على مشاريعنا المتميزة في مختلف مناطق المملكة',
                loading: 'جاري تحميل المشاريع...',
                noProjects: 'لا توجد مشاريع حالياً',
                viewDetails: 'عرض التفاصيل'
            },
            investment: {
                title: 'سجل اهتمامك للشراء',
                subtitle: 'اترك بياناتك وسنتواصل معك حول الوحدات المتاحة وخيارات الشراء',
                interest: {
                    title: 'سجل اهتمامك الآن',
                    points: {
                        p1: 'تواصل سريع حول الوحدات المتاحة',
                        p2: 'خيارات شراء مرنة وتمويلية',
                        p3: 'أسعار ومخططات تفصيلية',
                        p4: 'دعم واستشارة مجانية'
                    },
                    cta: 'سجل اهتمامك الآن'
                }
            },
            projections: { title: 'توقعات النمو', subtitle: 'القيمة السوقية المتوقعة للمشاريع خلال الخمس سنوات القادمة', growth1: 'نمو متوقع\nخلال 5 سنوات', growth2: 'مليون ريال\nنمو سنوي متوسط' },
            construction: {
                title: 'التشييد والتشطيب', subtitle: 'الجودة ليست خيار، بل هي الأساس الذي يُبنى عليه',
                textTitle: 'معايير الجودة العالية',
                text: 'في كل مشروع نولي أدق التفاصيل عناية استثنائية، من البنية التحتية إلى آخر مراحل التشطيب. كل وحدة عقارية تمثل نموذجاً للجودة والتميز، وتزداد قيمتها مع مرور الوقت.',
                q1: 'تصميمات عصرية تواكب ذوق العميل', q2: 'مواد بناء وتشطيبات مختارة بعناية', q3: 'تنفيذ هندسي وفق أعلى المواصفات', q4: 'جاهزية تامة للتأجير أو السكن فوراً', q5: 'قابلية عالية لزيادة القيمة مع الوقت', q6: 'ضمانات تصل الى 20 عام'
            },
            contact: {
                title: 'تواصل معنا', subtitle: 'ابدأ رحلتك الاستثمارية اليوم',
                address: { title: 'العنوان', map: 'فتح الموقع على خرائط جوجل', value: 'المملكة العربية السعودية\\nالرياض' },
                phone: { title: 'تواصل', whatsapp: 'واتساب مباشرة' },
                email: { title: 'البريد الإلكتروني' },
                cr: { title: 'السجل التجاري' }
            },
            form: {
                name: { label: 'الاسم الكامل', placeholder: '' },
                email: { label: 'البريد الإلكتروني', placeholder: '' },
                phone: { label: 'رقم الهاتف', placeholder: '' },
                message: { label: 'رسالتك', placeholder: '' },
                submit: 'إرسال الرسالة',
                errors: { required: 'هذا الحقل مطلوب', email: 'يرجى إدخال بريد إلكتروني صحيح', phone: 'يرجى إدخال رقم هاتف صحيح' },
                sending: 'جاري الإرسال...'
            },
            footer: {
                description: 'شركة رائدة في مجال التطوير العقاري والاستثمار في المملكة العربية السعودية',
                quickLinks: { title: 'روابط سريعة' },
                services: { title: 'الخدمات' },
                contact: { title: 'معلومات التواصل', address: 'المملكة العربية السعودية، الرياض، الحمراء', cr: 'السجل التجاري: 7032981883' },
                copyright: '© 2024 شركة المشرفية للتطوير والاستثمار العقاري. جميع الحقوق محفوظة.'
            },
            services: {
                item1: 'الاستثمار الفردي',
                item2: 'الشراكة الاستثمارية',
                item3: 'التطوير العقاري',
                item4: 'الاستشارات العقارية',
                item5: 'البيع على الخارطة',
                item6: 'تأجير الوحدات الجاهزة',
                item7: 'بيع الوحدات الجاهزة'
            },
            ui: { loading: 'جاري التحميل...', backToTop: 'العودة للأعلى', success: 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.' }
        },
        en: {
            meta: {
                title: 'Al-Mashrafiah Real Estate Development & Investment',
                description: 'Saudi leading real estate development and investment company',
                ogTitle: 'Al-Mashrafiah Real Estate Development',
                ogDescription: 'Saudi leading real estate development and investment company',
                twTitle: 'Al-Mashrafiah Real Estate Development',
                twDescription: 'Saudi leading real estate development and investment company'
            },
            brand: { name: 'Al-Mashrafiah' },
            nav: { home: 'Home', about: 'About', ourProjects: 'Our Projects', investment: 'Register Interest', projects: 'Construction & Finishing', contact: 'Contact' },
            hero: {
                title: 'Al-Mashrafiah\nReal Estate Development & Investment',
                subtitle: 'We are a Saudi company with an ambitious vision to craft innovative investment models\nby developing high-quality residential units in strategic locations',
                ctaPrimary: 'Contact Us',
                ctaSecondary: 'Learn More',
                quality: 'High-quality projects',
                stats: {
                    stat1: 'Million SAR\\nProjected by 2030',
                    stat2: 'Investment Return\\nfor Individual Investor',
                    stat3: 'Months Only\\nDelivery Time'
                }
            },
            about: {
                title: 'About Us',
                subtitle: 'A leading real estate development company in Saudi Arabia',
                vision: { title: 'Our Vision', text: 'To be the first and most trusted destination in residential real estate development, leaving our mark in every neighborhood and project, as partners of success for both investors and consumers.' },
                mission: { title: 'Our Mission', text: 'Delivering high-quality real estate products that meet market aspirations, ensuring investor satisfaction through professional execution, precise evaluations, and smart operations — achieving the highest satisfaction for clients and investors.' },
                values: {
                    title: 'Our Values',
                    integrity: { title: 'Integrity', text: 'We commit to transparency and clarity in every interaction and project' },
                    professionalism: { title: 'Professionalism', text: 'We manage our projects with top-tier engineering and marketing expertise' },
                    integration: { title: 'Integration', text: 'We work as one team with specialized expertise covering all project phases' },
                    innovation: { title: 'Innovation', text: 'We redefine real estate as a smart, scalable investment product' }
                }
            },
            features: {
                title: 'What Sets Us Apart',
                subtitle: 'At Al-Mashrafiah, we don’t just deliver a project… we deliver a complete investment experience',
                safeOwnership: { title: 'Secure Ownership', text: 'Official deeds in the investor’s name' },
                quickReturns: { title: 'Fast Returns', text: 'Operational returns from year one' },
                integratedManagement: { title: 'End-to-End Management', text: 'Design, execution, supervision, marketing, sales and leasing' },
                selectedLocations: { title: 'Prime Locations', text: 'Within areas with promising growth' },
                independentDeeds: { title: 'Independent Titles', text: 'Independent ownership deed for each unit' },
                fastDelivery: { title: 'Quick Delivery', text: 'Delivery within 10–12 months' }
            },
            partners: { title: 'Our Partners', subtitle: 'We are proud to partner with leading companies and institutions in the Kingdom' },
            ourProjects: {
                title: 'Our Projects',
                subtitle: 'Discover our distinguished projects across the Kingdom',
                loading: 'Loading projects...',
                noProjects: 'No projects available',
                viewDetails: 'View Details'
            },
            investment: {
                title: 'Register Your Interest',
                subtitle: 'Leave your details and we’ll contact you about available units and purchase options',
                interest: {
                    title: 'Register Now',
                    points: {
                        p1: 'Fast follow-up on available units',
                        p2: 'Flexible purchase and financing options',
                        p3: 'Detailed prices and floor plans',
                        p4: 'Free support and consultation'
                    },
                    cta: 'Register Your Interest'
                }
            },
            projections: { title: 'Growth Projections', subtitle: 'Expected market value of projects over the next five years', growth1: 'Projected Growth\nOver 5 Years', growth2: 'Million SAR\nAverage Annual Growth' },
            construction: {
                title: 'Construction & Finishing', subtitle: 'Quality is not optional—it’s the foundation we build on',
                textTitle: 'High Quality Standards',
                text: 'In every project, we pay exceptional attention to detail—from infrastructure to final finishing. Each unit is a model of quality and excellence whose value grows over time.',
                q1: 'Modern designs that match client taste', q2: 'Carefully selected building materials and finishes', q3: 'Engineering execution to the highest standards', q4: 'Ready for immediate leasing or living', q5: 'High potential for value appreciation', q6: 'Warranties up to 20 years'
            },
            contact: {
                title: 'Contact Us', subtitle: 'Start your investment journey today',
                address: { title: 'Address', map: 'Open on Google Maps', value: 'Saudi Arabia\\nRiyadh' },
                phone: { title: 'Contact', whatsapp: 'Chat on WhatsApp' },
                email: { title: 'Email' },
                cr: { title: 'Commercial Registration' }
            },
            form: {
                name: { label: 'Full Name', placeholder: '' },
                email: { label: 'Email', placeholder: '' },
                phone: { label: 'Phone Number', placeholder: '' },
                message: { label: 'Your Message', placeholder: '' },
                submit: 'Send Message',
                errors: { required: 'This field is required', email: 'Please enter a valid email', phone: 'Please enter a valid phone number' },
                sending: 'Sending...'
            },
            footer: {
                description: 'A leading real estate development and investment company in Saudi Arabia',
                quickLinks: { title: 'Quick Links' },
                services: { title: 'Services' },
                contact: { title: 'Contact Info', address: 'Saudi Arabia, Riyadh, Al-Hamra', cr: 'CR: 7032981883' },
                copyright: '© 2024 Al-Mashrafiah Real Estate Development. All rights reserved.'
            },
            services: {
                item1: 'Individual Investment',
                item2: 'Investment Partnership',
                item3: 'Real Estate Development',
                item4: 'Real Estate Consulting',
                item5: 'Off-plan Sales',
                item6: 'Leasing Ready Units',
                item7: 'Selling Ready Units'
            },
            ui: { loading: 'Loading...', backToTop: 'Back to top', success: 'Your message has been sent! We will contact you soon.' }
        }
    };

    const langToggle = document.getElementById('lang-toggle');
    let currentLang = localStorage.getItem('lang') || 'ar';

    function getByPath(obj, path) {
        return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
    }

    function applyTranslations(lang, isToggle = false) {
        const dict = TRANSLATIONS[lang] || TRANSLATIONS.ar;

        // Elements with data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const value = getByPath(dict, key);
            if (value !== undefined && value !== null) {
                    // Replace newline characters and literal "\\n" sequences with <br>
                    const asHtml = String(value)
                        .replace(/\\n/g, '<br>')
                        .replace(/\n/g, '<br>');
                if (el.tagName.toLowerCase() === 'title') {
                    document.title = String(value);
                } else if (el.matches('meta') && el.hasAttribute('data-i18n-attr')) {
                    const attrName = el.getAttribute('data-i18n-attr');
                    el.setAttribute(attrName, String(value));
                } else if (el.hasAttribute('data-i18n-attr')) {
                    const attrName = el.getAttribute('data-i18n-attr');
                    el.setAttribute(attrName, String(value));
                } else {
                    // Preserve leading icon(s) if present (e.g., <i> or <svg> at start)
                    let prefixHTML = '';
                    let node = el.firstElementChild;
                    while (node && (node.tagName === 'I' || node.tagName === 'SVG')) {
                        prefixHTML += node.outerHTML;
                        node = node.nextElementSibling;
                    }
                    if (prefixHTML) {
                        el.innerHTML = `${prefixHTML} ${asHtml}`;
                    } else {
                        el.innerHTML = asHtml;
                    }
                }
            }
        });

        // Dir + lang
        document.documentElement.setAttribute('lang', lang);
        document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

        // Toggle button label
        if (langToggle) langToggle.textContent = lang === 'ar' ? 'EN' : 'AR';

        // Update dynamic UI strings
        const scrollBtn = document.querySelector('.scroll-to-top');
        if (scrollBtn) scrollBtn.setAttribute('aria-label', (TRANSLATIONS[lang].ui.backToTop));

        const loadingText = document.querySelector('.loading-text');
        if (loadingText) loadingText.textContent = TRANSLATIONS[lang].ui.loading;

        const submitBtn = document.querySelector('#contactForm button[type="submit"]');
        if (submitBtn) {
            const icon = submitBtn.querySelector('i');
            submitBtn.innerHTML = `${icon ? icon.outerHTML + ' ' : ''}${TRANSLATIONS[lang].form.submit}`;
        }

        // Localize hero stat labels with newline handling already via data-i18n
        // Localize bar values units if needed
        const barItems = document.querySelectorAll('.bar-item');
        let maxVal = 0;
        barItems.forEach(item => {
            const value = parseFloat(item.getAttribute('data-value')) || 0;
            if (value > maxVal) maxVal = value;
        });
        barItems.forEach(item => {
            const value = parseFloat(item.getAttribute('data-value')) || 0;
            const valueSpan = item.querySelector('.bar-value');
            if (valueSpan) {
                valueSpan.textContent = lang === 'ar' ? `${value} مليون ريال` : `${value} Million SAR`;
            }
            // Keep bar heights proportional even after language switch
            const bar = item.querySelector('.bar');
            if (bar && maxVal > 0) {
                const height = `${Math.round((value / maxVal) * 100)}%`;
                bar.style.height = height;
            }
        });

        // Update skip-link and lang toggle ARIA
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) skipLink.textContent = lang === 'ar' ? 'تخطي إلى المحتوى الرئيسي' : 'Skip to main content';
        const langToggleBtn = document.getElementById('lang-toggle');
        if (langToggleBtn) langToggleBtn.setAttribute('aria-label', lang === 'ar' ? 'التبديل إلى الإنجليزية' : 'Switch to Arabic');

        // Retrigger hero title typewriter only when toggling languages
        if (isToggle) {
            const heroTitle = document.querySelector('.hero-title');
            if (heroTitle) {
                heroTitle.style.visibility = 'hidden';
                // allow rerun
                delete heroTitle.dataset.typed;
                setTimeout(() => {
                    heroTitle.style.visibility = '';
                    typewriterEffect(heroTitle, 300, true); // force restart on toggle
                }, 0);
            }
        }
    }

    // Initial apply BEFORE other animations run (DOMContentLoaded order already calls i18n first)
    applyTranslations(currentLang, false);

    // Click toggle
    if (langToggle) {
        langToggle.addEventListener('click', function() {
            currentLang = currentLang === 'ar' ? 'en' : 'ar';
            localStorage.setItem('lang', currentLang);
            applyTranslations(currentLang, true);
            document.body.style.transition = 'all 0.2s ease';
            setTimeout(() => (document.body.style.transition = ''), 200);
        });
    }

    // Expose helper
    window.__i18n = {
        t: (key) => getByPath(TRANSLATIONS[currentLang], key) ?? key,
        lang: () => currentLang
    };
}

// Scroll to top button
function initializeScrollToTop() {
    // Create scroll to top button
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.className = 'scroll-to-top';
    scrollToTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    scrollToTopBtn.setAttribute('aria-label', 'العودة للأعلى');
    document.body.appendChild(scrollToTopBtn);

    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    });

    // Smooth scroll to top
    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Loading screen
function initializeLoadingScreen() {
    // Create loading screen
    const loadingScreen = document.createElement('div');
    loadingScreen.className = 'loading';
    loadingScreen.innerHTML = `
        <div class="loading-content">
            <div class="spinner"></div>
            <p class="loading-text" style="margin-top: 20px; color: var(--primary-color); font-weight: 600;">جاري التحميل...</p>
        </div>
    `;
    document.body.appendChild(loadingScreen);

    // Hide loading screen when page is fully loaded
    window.addEventListener('load', function() {
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.remove();
            }, 500);
        }, 1000);
    });
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'var(--success-color)' : 'var(--primary-color)'};
        color: white;
        padding: var(--spacing-md) var(--spacing-lg);
        border-radius: var(--border-radius-md);
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform var(--transition-normal);
        max-width: 300px;
        font-weight: 500;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Hide notification after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// Image lazy loading
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => {
        imageObserver.observe(img);
    });
}

// Touch gestures for mobile
function initializeTouchGestures() {
    let startX = 0;
    let startY = 0;

    document.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });

    document.addEventListener('touchend', function(e) {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const diffX = startX - endX;
        const diffY = startY - endY;

        // Swipe detection (minimum 50px)
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            if (diffX > 0) {
                // Swipe left
                console.log('Swiped left');
            } else {
                // Swipe right
                console.log('Swiped right');
            }
        }
    });
}

// Performance monitoring
function initializePerformanceMonitoring() {
    // Log performance metrics
    window.addEventListener('load', function() {
        const perfData = performance.timing;
        const loadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`Page load time: ${loadTime}ms`);
    });
}

// Accessibility enhancements
function initializeAccessibility() {
    // Skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main';
    skipLink.textContent = 'تخطي إلى المحتوى الرئيسي';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--primary-color);
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 10000;
        transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', function() {
        this.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', function() {
        this.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);

    // Set initial ARIA label for language toggle
    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) langToggle.setAttribute('aria-label', 'التبديل إلى الإنجليزية');

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Close mobile menu
            const navToggle = document.getElementById('nav-toggle');
            const navMenu = document.getElementById('nav-menu');
            if (navMenu.classList.contains('active')) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });
}

// Initialize all features when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeLazyLoading();
    initializeTouchGestures();
    initializePerformanceMonitoring();
    initializeAccessibility();
});

// Error handling
window.addEventListener('error', function(e) {
    console.error('Script error:', e.error);
    // Optionally show user-friendly error message
});

// Service worker registration (for PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed');
            });
    });
}

// Show success message if redirected back after external submit
function initializeSubmissionFeedback() {
    try {
        const params = new URLSearchParams(window.location.search);
        if (params.get('sent') === '1') {
            showNotification(window.__i18n ? window.__i18n.t('ui.success') : 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.', 'success');
            // Clean URL param without reloading
            params.delete('sent');
            const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '') + window.location.hash;
            window.history.replaceState({}, '', newUrl);
        }
    } catch (e) {
        // ignore
    }
}

// Image Lightbox functionality
function initializeImageLightbox() {
    // Create lightbox overlay
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox-overlay';
    lightbox.innerHTML = `
        <div class="lightbox-container">
            <button class="lightbox-close" aria-label="إغلاق">
                <i class="fas fa-times"></i>
            </button>
            <button class="lightbox-prev" aria-label="السابق">
                <i class="fas fa-chevron-right"></i>
            </button>
            <button class="lightbox-next" aria-label="التالي">
                <i class="fas fa-chevron-left"></i>
            </button>
            <img class="lightbox-image" alt="" />
            <div class="lightbox-caption"></div>
        </div>
    `;
    
    // Add lightbox styles
    lightbox.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
    `;
    
    document.body.appendChild(lightbox);
    
    // Style lightbox elements
    const lightboxContainer = lightbox.querySelector('.lightbox-container');
    lightboxContainer.style.cssText = `
        position: relative;
        max-width: 90vw;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        align-items: center;
    `;
    
    const lightboxImage = lightbox.querySelector('.lightbox-image');
    lightboxImage.style.cssText = `
        max-width: 100%;
        max-height: 80vh;
        object-fit: contain;
        border-radius: 8px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        animation: lightboxZoom 0.3s ease-out;
    `;
    
    const lightboxClose = lightbox.querySelector('.lightbox-close');
    lightboxClose.style.cssText = `
        position: absolute;
        top: -50px;
        right: 0;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: white;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
    `;
    
    const lightboxPrev = lightbox.querySelector('.lightbox-prev');
    const lightboxNext = lightbox.querySelector('.lightbox-next');
    
    [lightboxPrev, lightboxNext].forEach(btn => {
        btn.style.cssText = `
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(255, 255, 255, 0.1);
            border: none;
            color: white;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        `;
    });
    
    lightboxPrev.style.right = 'calc(100% + 20px)';
    lightboxNext.style.left = 'calc(100% + 20px)';
    
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    lightboxCaption.style.cssText = `
        color: white;
        text-align: center;
        margin-top: 20px;
        font-size: 16px;
        max-width: 80%;
    `;
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes lightboxZoom {
            from {
                transform: scale(0.8);
                opacity: 0;
            }
            to {
                transform: scale(1);
                opacity: 1;
            }
        }
        
        .lightbox-close:hover,
        .lightbox-prev:hover,
        .lightbox-next:hover {
            background: rgba(255, 255, 255, 0.2) !important;
            transform: scale(1.1);
        }
        
        .lightbox-prev:hover {
            transform: translateY(-50%) scale(1.1) !important;
        }
        
        .lightbox-next:hover {
            transform: translateY(-50%) scale(1.1) !important;
        }
        
        .gallery-item img {
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .gallery-item img:hover {
            transform: scale(1.05);
            filter: brightness(1.1);
        }
        
        @media (max-width: 768px) {
            .lightbox-prev,
            .lightbox-next {
                width: 40px !important;
                height: 40px !important;
                font-size: 16px !important;
            }
            
            .lightbox-prev {
                right: calc(100% + 10px) !important;
            }
            
            .lightbox-next {
                left: calc(100% + 10px) !important;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Get all gallery images
    const galleryImages = document.querySelectorAll('.gallery-item img');
    let currentImageIndex = 0;
    let imagesList = [];
    
    // Convert gallery images to array with metadata
    galleryImages.forEach((img, index) => {
        imagesList.push({
            src: img.src,
            alt: img.alt,
            caption: img.alt
        });
        
        // Add click event to open lightbox
        img.addEventListener('click', function() {
            currentImageIndex = index;
            openLightbox();
        });
    });
    
    // Open lightbox
    function openLightbox() {
        if (imagesList.length === 0) return;
        
        showImage(currentImageIndex);
        lightbox.style.opacity = '1';
        lightbox.style.visibility = 'visible';
        document.body.style.overflow = 'hidden';
        
        // Show/hide navigation buttons
        lightboxPrev.style.display = imagesList.length > 1 ? 'flex' : 'none';
        lightboxNext.style.display = imagesList.length > 1 ? 'flex' : 'none';
    }
    
    // Close lightbox
    function closeLightbox() {
        lightbox.style.opacity = '0';
        lightbox.style.visibility = 'hidden';
        document.body.style.overflow = '';
    }
    
    // Show specific image
    function showImage(index) {
        if (index < 0 || index >= imagesList.length) return;
        
        const imageData = imagesList[index];
        lightboxImage.src = imageData.src;
        lightboxImage.alt = imageData.alt;
        lightboxCaption.textContent = imageData.caption;
        
        // Reset animation
        lightboxImage.style.animation = 'none';
        setTimeout(() => {
            lightboxImage.style.animation = 'lightboxZoom 0.3s ease-out';
        }, 10);
    }
    
    // Navigation functions
    function nextImage() {
        currentImageIndex = (currentImageIndex + 1) % imagesList.length;
        showImage(currentImageIndex);
    }
    
    function prevImage() {
        currentImageIndex = (currentImageIndex - 1 + imagesList.length) % imagesList.length;
        showImage(currentImageIndex);
    }
    
    // Event listeners
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxNext.addEventListener('click', nextImage);
    lightboxPrev.addEventListener('click', prevImage);
    
    // Close on backdrop click
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (lightbox.style.visibility === 'visible') {
            switch(e.key) {
                case 'Escape':
                    closeLightbox();
                    break;
                case 'ArrowLeft':
                    nextImage(); // In RTL, left arrow goes to next
                    break;
                case 'ArrowRight':
                    prevImage(); // In RTL, right arrow goes to previous
                    break;
            }
        }
    });
    
    // Touch swipe support for mobile
    let touchStartX = 0;
    let touchStartY = 0;
    
    lightbox.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });
    
    lightbox.addEventListener('touchend', function(e) {
        if (lightbox.style.visibility !== 'visible') return;
        
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const diffX = touchStartX - touchEndX;
        const diffY = Math.abs(touchStartY - touchEndY);
        
        // Only handle horizontal swipes (ignore vertical)
        if (Math.abs(diffX) > 50 && diffY < 100) {
            if (diffX > 0) {
                nextImage(); // Swipe left = next image
            } else {
                prevImage(); // Swipe right = previous image
            }
        }
    });
}

// ============================================
// PROJECTS LOADER FROM FIREBASE
// ============================================

// Load projects dynamically from Firebase
async function loadProjectsFromFirebase() {
    const projectsGrid = document.getElementById('projects-grid');
    if (!projectsGrid) return; // Not on homepage
    
    try {
        // Dynamically import Firebase modules
        const { db, getDocs, collection, query, orderBy } = await import('./firebase-config.js');
        
        const currentLang = localStorage.getItem('preferredLanguage') || 'ar';
        
        const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            projectsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                    <i class="fas fa-folder-open" style="font-size: 4rem; color: var(--text-light); margin-bottom: 20px; display: block;"></i>
                    <p style="color: var(--text-light); font-size: 1.2rem;" data-i18n="ourProjects.noProjects">لا توجد مشاريع حالياً</p>
                </div>
            `;
            applyTranslations(); // Re-apply translations
            return;
        }
        
        projectsGrid.innerHTML = '';
        
        querySnapshot.forEach((doc) => {
            const project = { id: doc.id, ...doc.data() };
            projectsGrid.appendChild(createProjectCard(project, currentLang));
        });
        
    } catch (error) {
        console.error('Error loading projects:', error);
        projectsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--error-color);">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 15px; display: block;"></i>
                <p>حدث خطأ في تحميل المشاريع</p>
            </div>
        `;
    }
}

function createProjectCard(project, lang) {
    const card = document.createElement('div');
    card.className = 'project-card';
    
    const title = project[`title_${lang}`] || project.title_ar;
    const location = project[`location_${lang}`] || project.location_ar;
    const description = project[`description_${lang}`] || project.description_ar;
    
    const statusText = {
        ar: { available: 'متاح', sold: 'مباع', upcoming: 'قريباً' },
        en: { available: 'Available', sold: 'Sold', upcoming: 'Upcoming' }
    };
    
    const viewDetailsText = lang === 'ar' ? 'عرض التفاصيل' : 'View Details';
    
    card.innerHTML = `
        <div class="project-image-wrapper">
            <img src="${project.mainImage}" alt="${title}" class="project-card-image">
            <span class="project-card-status status-${project.status}">${statusText[lang][project.status]}</span>
        </div>
        <div class="project-card-content">
            <h3 class="project-card-title">${title}</h3>
            <div class="project-card-location">
                <i class="fas fa-map-marker-alt"></i>
                <span>${location}</span>
            </div>
            <p class="project-card-description">${description.substring(0, 120)}...</p>
            <a href="project.html?id=${project.id}" class="btn btn-primary btn-project-view">
                <i class="fas fa-arrow-${lang === 'ar' ? 'left' : 'right'}"></i>
                ${viewDetailsText}
            </a>
        </div>
    `;
    
    return card;
}

// Initialize projects loading
if (document.getElementById('projects-grid')) {
    // Load projects after a short delay to prioritize initial page render
    setTimeout(() => {
        loadProjectsFromFirebase();
    }, 500);
}
