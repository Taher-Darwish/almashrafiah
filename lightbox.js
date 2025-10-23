// Image Lightbox Component
export class Lightbox {
    constructor() {
        this.currentIndex = 0;
        this.images = [];
        this.isOpen = false;
        this.createLightboxHTML();
        this.attachEventListeners();
    }

    createLightboxHTML() {
        const lightboxHTML = `
            <div id="lightbox" class="lightbox">
                <button class="lightbox-close" id="lightbox-close">
                    <i class="fas fa-times"></i>
                </button>
                <button class="lightbox-prev" id="lightbox-prev">
                    <i class="fas fa-chevron-right"></i>
                </button>
                <button class="lightbox-next" id="lightbox-next">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <div class="lightbox-content">
                    <img id="lightbox-image" src="" alt="">
                    <div class="lightbox-caption" id="lightbox-caption"></div>
                    <div class="lightbox-counter" id="lightbox-counter"></div>
                </div>
            </div>
        `;

        // Add styles
        const styleHTML = `
            <style id="lightbox-styles">
                .lightbox {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.95);
                    z-index: 10000;
                    align-items: center;
                    justify-content: center;
                    animation: lightboxFadeIn 0.3s ease;
                }

                .lightbox.active {
                    display: flex;
                }

                @keyframes lightboxFadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                .lightbox-content {
                    position: relative;
                    max-width: 90%;
                    max-height: 90vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .lightbox-content img {
                    max-width: 100%;
                    max-height: 80vh;
                    object-fit: contain;
                    border-radius: 10px;
                    box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
                    animation: imageZoomIn 0.3s ease;
                }

                @keyframes imageZoomIn {
                    from {
                        opacity: 0;
                        transform: scale(0.8);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                .lightbox-caption {
                    color: white;
                    font-size: 1.1rem;
                    margin-top: 20px;
                    text-align: center;
                    padding: 10px 20px;
                    background: rgba(0, 0, 0, 0.5);
                    border-radius: 8px;
                }

                .lightbox-counter {
                    color: white;
                    font-size: 0.9rem;
                    margin-top: 10px;
                    opacity: 0.8;
                }

                .lightbox-close,
                .lightbox-prev,
                .lightbox-next {
                    position: fixed;
                    background: rgba(255, 255, 255, 0.1);
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    color: white;
                    font-size: 1.5rem;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    backdrop-filter: blur(10px);
                    z-index: 10001;
                }

                .lightbox-close:hover,
                .lightbox-prev:hover,
                .lightbox-next:hover {
                    background: rgba(255, 255, 255, 0.2);
                    border-color: rgba(255, 255, 255, 0.5);
                    transform: scale(1.1);
                }

                .lightbox-close {
                    top: 30px;
                    right: 30px;
                }

                .lightbox-prev {
                    top: 50%;
                    right: 30px;
                    transform: translateY(-50%);
                }

                .lightbox-next {
                    top: 50%;
                    left: 30px;
                    transform: translateY(-50%);
                }

                .lightbox-prev:hover {
                    transform: translateY(-50%) scale(1.1);
                }

                .lightbox-next:hover {
                    transform: translateY(-50%) scale(1.1);
                }

                @media (max-width: 768px) {
                    .lightbox-close,
                    .lightbox-prev,
                    .lightbox-next {
                        width: 40px;
                        height: 40px;
                        font-size: 1.2rem;
                    }

                    .lightbox-close {
                        top: 15px;
                        right: 15px;
                    }

                    .lightbox-prev {
                        right: 15px;
                    }

                    .lightbox-next {
                        left: 15px;
                    }

                    .lightbox-caption {
                        font-size: 0.9rem;
                        margin-top: 10px;
                    }
                }
            </style>
        `;

        // Add to document if not exists
        if (!document.getElementById('lightbox')) {
            document.body.insertAdjacentHTML('beforeend', styleHTML + lightboxHTML);
        }
    }

    attachEventListeners() {
        document.getElementById('lightbox-close')?.addEventListener('click', () => this.close());
        document.getElementById('lightbox-prev')?.addEventListener('click', () => this.prev());
        document.getElementById('lightbox-next')?.addEventListener('click', () => this.next());

        // Click outside to close
        document.getElementById('lightbox')?.addEventListener('click', (e) => {
            if (e.target.id === 'lightbox') {
                this.close();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.isOpen) return;

            if (e.key === 'Escape') this.close();
            if (e.key === 'ArrowLeft') this.next(); // For RTL
            if (e.key === 'ArrowRight') this.prev(); // For RTL
        });

        // Touch swipe support
        let touchStartX = 0;
        let touchEndX = 0;

        document.getElementById('lightbox-image')?.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        document.getElementById('lightbox-image')?.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        });

        const handleSwipe = () => {
            if (touchEndX < touchStartX - 50) this.next(); // Swipe left
            if (touchEndX > touchStartX + 50) this.prev(); // Swipe right
        };

        this.handleSwipe = handleSwipe;
    }

    open(images, startIndex = 0, captions = []) {
        this.images = images;
        this.captions = captions;
        this.currentIndex = startIndex;
        this.isOpen = true;

        document.getElementById('lightbox').classList.add('active');
        document.body.style.overflow = 'hidden';

        this.updateImage();
    }

    close() {
        this.isOpen = false;
        document.getElementById('lightbox').classList.remove('active');
        document.body.style.overflow = '';
    }

    next() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.updateImage();
    }

    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.updateImage();
    }

    updateImage() {
        const img = document.getElementById('lightbox-image');
        const caption = document.getElementById('lightbox-caption');
        const counter = document.getElementById('lightbox-counter');

        img.src = this.images[this.currentIndex];
        
        if (this.captions && this.captions[this.currentIndex]) {
            caption.textContent = this.captions[this.currentIndex];
            caption.style.display = 'block';
        } else {
            caption.style.display = 'none';
        }

        counter.textContent = `${this.currentIndex + 1} / ${this.images.length}`;

        // Show/hide navigation buttons
        const prevBtn = document.getElementById('lightbox-prev');
        const nextBtn = document.getElementById('lightbox-next');

        if (this.images.length <= 1) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'flex';
            nextBtn.style.display = 'flex';
        }
    }
}

// Export singleton instance
export const lightbox = new Lightbox();
