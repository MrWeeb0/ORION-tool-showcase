/**
 * Orion Tool Showcase - Main JavaScript
 * Handles form submission, Google Sheets integration, and scroll animations
 */

// Configuration
const CONFIG = {
    // Replace with your Google Apps Script Web App URL
    GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzFexuKaDSY2KAlgJT_RKF8DZuGqZzXjRlIajEfGAK3h_bs8xkkDn2mBdtzIGn3cfA/exec',
    FORM_SELECTOR: '#leadForm',
    EMAIL_SELECTOR: '#email',
    SUBMIT_BUTTON_SELECTOR: '#submitButton',
    MESSAGE_SELECTOR: '#formMessage',
    // UTM Tracking Configuration
    UTM_CONFIG: {
        source: 'orion_showcase',
        medium: 'website',
        campaign: 'orion_launch'
    }
};

// DOM Elements
const form = document.querySelector(CONFIG.FORM_SELECTOR);
const emailInput = document.querySelector(CONFIG.EMAIL_SELECTOR);
const submitButton = document.querySelector(CONFIG.SUBMIT_BUTTON_SELECTOR);
const messageElement = document.querySelector(CONFIG.MESSAGE_SELECTOR);

/**
 * Build UTM tracking URL from base URL and parameters
 * @param {string} baseUrl - The base URL to add UTM parameters to
 * @param {object} utm - UTM parameters object
 * @returns {string} URL with UTM parameters
 */
function buildUTMUrl(baseUrl, utm = {}) {
    const url = new URL(baseUrl);
    const utmParams = {
        utm_source: utm.source || CONFIG.UTM_CONFIG.source,
        utm_medium: utm.medium || CONFIG.UTM_CONFIG.medium,
        utm_campaign: utm.campaign || CONFIG.UTM_CONFIG.campaign,
        ...utm // Merge any additional UTM parameters (e.g., utm_content)
    };
    
    // Add UTM parameters to URL
    Object.entries(utmParams).forEach(([key, value]) => {
        if (value) {
            url.searchParams.set(key, value);
        }
    });
    
    return url.toString();
}

/**
 * Initialize UTM tracking on all external links
 */
function initializeUTMTracking() {
    // Get all links on the page
    const links = document.querySelectorAll('a[href^="http"]');
    
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        
        // Determine the context/content for the link
        let content = 'general_link';
        
        if (href.includes('github.com')) {
            content = 'github_link';
        } else if (href.includes('reddit.com')) {
            content = 'reddit_link';
        } else if (link.closest('#features')) {
            content = 'features_section';
        } else if (link.closest('#how-it-works')) {
            content = 'how_it_works_section';
        } else if (link.closest('#benefits')) {
            content = 'benefits_section';
        } else if (link.closest('.open-source')) {
            content = 'open_source_section';
        } else if (link.closest('.cta')) {
            content = 'cta_section';
        } else if (link.closest('footer')) {
            content = 'footer_link';
        } else if (link.closest('.navbar')) {
            content = 'navigation_link';
        }
        
        // Build UTM URL
        const utmUrl = buildUTMUrl(href, { utm_content: content });
        link.setAttribute('href', utmUrl);
        
        // Add data attribute for tracking
        link.setAttribute('data-utm-tracked', 'true');
        link.setAttribute('data-utm-content', content);
    });
}

/**
 * Track form submission with GTM event (if Google Analytics is available)
 */
function trackFormSubmission(email) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'email_subscription', {
            'email': email,
            'source': 'orion_showcase',
            'form_type': 'newsletter'
        });
    }
}

/**
 * Initialize Open Source carousel
 */
function initializeOSCarousel() {
    const titleItems = document.querySelectorAll('.os-title-item');
    const contentCard = document.querySelector('.os-content-inner');
    const contentData = document.getElementById('os-content-data');
    
    if (!titleItems.length || !contentCard) return;
    
    function updateContent(index) {
        const item = contentData.querySelector(`.os-item[data-index="${index}"]`);
        if (!item) return;
        
        const icon = item.querySelector('.os-item-icon').textContent;
        const title = item.querySelector('.os-item-title').textContent;
        const description = item.querySelector('.os-item-description').textContent;
        const link = item.querySelector('.os-item-link')?.textContent || null;
        const features = item.querySelector('.os-item-features')?.innerHTML || null;
        const badge = item.querySelector('.os-item-badge')?.textContent || null;
        const url = item.querySelector('.os-item-url').textContent;
        
        // Update content with fade effect
        contentCard.style.opacity = '0';
        
        setTimeout(() => {
            let contentHTML = `
                <div class="os-content-header">
                    <span class="os-content-icon">${icon}</span>
                    <h3>${title}</h3>
                </div>
                <p class="os-content-description">${description}</p>
            `;
            
            if (features) {
                contentHTML += `<div class="os-content-features">${features}</div>`;
            }
            
            if (badge) {
                contentHTML += `<span class="os-content-badge">${badge}</span>`;
            }
            
            if (link) {
                contentHTML += `<a href="${url}" target="_blank" rel="noopener noreferrer" class="os-content-link">${link}</a>`;
            }
            
            contentHTML += '<div class="os-content-accent"></div>';
            
            contentCard.innerHTML = contentHTML;
            contentCard.style.opacity = '1';
        }, 200);
        
        // Update active state
        titleItems.forEach((item, idx) => {
            item.classList.toggle('active', idx === index);
        });
    }
    
    // Add click listeners
    titleItems.forEach((item, index) => {
        item.addEventListener('click', () => updateContent(index));
    });
    
    // Initialize with first item
    updateContent(0);
}

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
    if (!form) return;
    
    form.addEventListener('submit', handleFormSubmit);
    
    // Add click handlers for step cards on mobile/touch devices
    initializeStepCardInteractions();
}

/**
 * Initialize carousel functionality
 */
function initializeFeatureCarousel() {
    const carousel = document.querySelector('.features-carousel');
    const carouselContainer = document.querySelector('.carousel-container');
    const cards = document.querySelectorAll('.features-carousel .feature-card');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    
    if (!carousel || !cards.length) return;
    
    let currentIndex = 0;
    const totalCards = cards.length;
    const cardsPerView = 3;
    const gap = 24; // var(--space-lg) = 2rem = 24px
    let autoPlayInterval;
    
    // Function to calculate card width from container
    function getCardWidth() {
        const containerWidth = carouselContainer.offsetWidth;
        return (containerWidth - (gap * (cardsPerView - 1))) / cardsPerView;
    }
    
    // Function to update carousel position
    function updateCarouselPosition() {
        const cardWidth = getCardWidth();
        const offset = currentIndex * (cardWidth + gap);
        carousel.style.transform = `translateX(-${offset}px)`;
    }
    
    // Function to move to next slide
    function nextSlide() {
        currentIndex = Math.min(currentIndex + 1, totalCards - cardsPerView);
        updateCarouselPosition();
        resetAutoPlay();
    }
    
    // Function to move to previous slide
    function prevSlide() {
        currentIndex = Math.max(currentIndex - 1, 0);
        updateCarouselPosition();
        resetAutoPlay();
    }
    
    // Auto-play functionality
    function startAutoPlay() {
        autoPlayInterval = setInterval(() => {
            if (currentIndex < totalCards - cardsPerView) {
                nextSlide();
            } else {
                currentIndex = 0;
                updateCarouselPosition();
                resetAutoPlay();
            }
        }, 5000);
    }
    
    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
    }
    
    function resetAutoPlay() {
        stopAutoPlay();
        startAutoPlay();
    }
    
    // Event listeners for navigation buttons
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') nextSlide();
        if (e.key === 'ArrowLeft') prevSlide();
    });
    
    // Pause auto-play on hover
    carousel.addEventListener('mouseenter', stopAutoPlay);
    carousel.addEventListener('mouseleave', startAutoPlay);
    
    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoPlay();
    });
    
    carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        resetAutoPlay();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swiped left, show next
                nextSlide();
            } else {
                // Swiped right, show previous
                prevSlide();
            }
        }
    }
    
    // Recalculate on window resize
    window.addEventListener('resize', updateCarouselPosition);
    
    // Initialize
    updateCarouselPosition();
    startAutoPlay();
}

/**
 * Initialize step card interactions for click/touch
 */
function initializeStepCardInteractions() {
    const steps = document.querySelectorAll('.step');
    
    steps.forEach(step => {
        // Add click event to toggle details on mobile
        step.addEventListener('click', function(e) {
            e.preventDefault();
            // On touch devices, the hover state is handled by CSS
            // but we can add additional interaction logic here if needed
        });
        
        // Make step cards focusable for keyboard navigation
        step.setAttribute('tabindex', '0');
        
        // Add keyboard support (Enter/Space to toggle)
        step.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.focus();
            }
        });
    });
}

/**
 * Handle form submission
 */
async function handleFormSubmit(event) {
    event.preventDefault();
    
    if (!validateEmail(emailInput.value)) {
        showMessage('Please enter a valid email address.', 'error');
        return;
    }
    
    // Track form submission
    trackFormSubmission(emailInput.value);
    
    // Disable submit button during request
    submitButton.disabled = true;
    submitButton.textContent = 'Subscribing...';
    
    try {
        // Option 1: Using Fetch API with Google Apps Script
        await submitToGoogleSheets(emailInput.value);
        
        showMessage('✓ Successfully subscribed! Check your email for updates.', 'success');
        form.reset();
    } catch (error) {
        console.error('Form submission error:', error);
        showMessage('An error occurred. Please try again.', 'error');
    } finally {
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = 'Subscribe';
    }
}

/**
 * Submit data to Google Sheets via Google Apps Script
 */
async function submitToGoogleSheets(email) {
    // Prepare data
    const data = {
        email: email,
        timestamp: new Date().toISOString(),
        source: 'Orion Tool Showcase'
    };
    
    // Option 1: Direct FETCH to Google Apps Script (Recommended)
    try {
        const response = await fetch(CONFIG.GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        // Note: With no-cors mode, we won't get response details but the request will be sent
        return true;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

/**
 * Validate email address format
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Display message to user
 */
function showMessage(message, type = 'info') {
    if (!messageElement) return;
    
    messageElement.textContent = message;
    messageElement.className = `form-message ${type}`;
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            messageElement.textContent = '';
            messageElement.className = 'form-message';
        }, 5000);
    }
}

/**
 * Smooth scroll to section
 */
function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Add scroll reveal animations for elements
 * Animates elements as they come into view
 */
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add visible class to trigger animation
                entry.target.classList.add('scroll-revealed');
                // Optional: stop observing after animation
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all feature cards
    document.querySelectorAll('.feature-card').forEach((card, index) => {
        card.classList.add('scroll-reveal-item');
        card.style.setProperty('--reveal-delay', `${index * 100}ms`);
        observer.observe(card);
    });
    
    // Observe all benefit items
    document.querySelectorAll('.benefit-item').forEach((item, index) => {
        item.classList.add('scroll-reveal-item');
        item.style.setProperty('--reveal-delay', `${index * 100}ms`);
        observer.observe(item);
    });
    
    // Observe all step items
    document.querySelectorAll('.step').forEach((step, index) => {
        step.classList.add('scroll-reveal-item');
        step.style.setProperty('--reveal-delay', `${index * 100}ms`);
        observer.observe(step);
    });
    
    // Observe section headings
    document.querySelectorAll('section h2').forEach((heading) => {
        heading.classList.add('scroll-reveal-heading');
        observer.observe(heading);
    });
    
    // Observe feature grids
    document.querySelectorAll('.features-grid, .benefits-list, .steps, .testimonials-grid').forEach((grid) => {
        grid.classList.add('scroll-reveal-grid');
        observer.observe(grid);
    });
}

/**
 * Add parallax effect to hero section (optional)
 */
function initializeParallaxEffect() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = hero.querySelectorAll('.orbiting-circle');
        
        parallaxElements.forEach(element => {
            element.style.transform = `translateY(${scrolled * 0.5}px)`;
        });
    }, { passive: true });
}

/**
 * Add scroll progress indicator (optional enhancement)
 */
function initializeScrollProgress() {
    const scrollProgress = () => {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (scrollTop / docHeight);
        
        // You can use this to create a progress bar if needed
        // Update a progress element here
    };
    
    window.addEventListener('scroll', scrollProgress, { passive: true });
}

/**
 * Initialize all functionality when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    initializeUTMTracking();
    initializeEventListeners();
    initializeSmoothScroll();
    initializeScrollAnimations();
    initializeParallaxEffect();
    initializeScrollProgress();
    initializeFeatureCarousel();
    initializeOSCarousel();
    
    // Log initialization
    console.log('Orion Tool Showcase initialized successfully');
    console.log('UTM tracking enabled for external links');
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateEmail,
        submitToGoogleSheets,
        showMessage
    };
}
