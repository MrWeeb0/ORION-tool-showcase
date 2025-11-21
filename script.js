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
    MESSAGE_SELECTOR: '#formMessage'
};

// DOM Elements
const form = document.querySelector(CONFIG.FORM_SELECTOR);
const emailInput = document.querySelector(CONFIG.EMAIL_SELECTOR);
const submitButton = document.querySelector(CONFIG.SUBMIT_BUTTON_SELECTOR);
const messageElement = document.querySelector(CONFIG.MESSAGE_SELECTOR);

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
    initializeEventListeners();
    initializeSmoothScroll();
    initializeScrollAnimations();
    initializeParallaxEffect();
    initializeScrollProgress();
    
    // Log initialization
    console.log('Orion Tool Showcase initialized successfully');
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateEmail,
        submitToGoogleSheets,
        showMessage
    };
}
