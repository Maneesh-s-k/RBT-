class AnimationUtils {
    // Core element animation with proper error handling
    static async animateElement(element, animationClass, duration = 500) {
        return new Promise((resolve) => {
            if (!element || !element.classList) {
                resolve();
                return;
            }
            
            element.classList.add(animationClass);
            
            const handleAnimationEnd = () => {
                element.classList.remove(animationClass);
                element.removeEventListener('animationend', handleAnimationEnd);
                resolve();
            };
            
            element.addEventListener('animationend', handleAnimationEnd);
            
            // Fallback timeout in case animationend doesn't fire
            setTimeout(() => {
                if (element.classList && element.classList.contains(animationClass)) {
                    element.classList.remove(animationClass);
                    element.removeEventListener('animationend', handleAnimationEnd);
                }
                resolve();
            }, duration);
        });
    }

    // Fade animations for UI elements
    static async fadeIn(element, duration = 300) {
        if (!element || !element.style) return Promise.resolve();
        
        element.style.opacity = '0';
        element.style.transition = `opacity ${duration}ms ease`;
        element.style.display = element.style.display || 'block';
        
        // Force reflow
        element.offsetHeight;
        
        element.style.opacity = '1';
        
        return new Promise(resolve => {
            setTimeout(resolve, duration);
        });
    }

    static async fadeOut(element, duration = 300) {
        if (!element || !element.style) return Promise.resolve();
        
        element.style.transition = `opacity ${duration}ms ease`;
        element.style.opacity = '0';
        
        return new Promise(resolve => {
            setTimeout(() => {
                if (element.style) {
                    element.style.display = 'none';
                }
                resolve();
            }, duration);
        });
    }

    // Slide animations for messages and panels
    static async slideIn(element, direction = 'down', duration = 300) {
        if (!element || !element.style) return Promise.resolve();
        
        const transforms = {
            down: 'translateY(-20px)',
            up: 'translateY(20px)',
            left: 'translateX(20px)',
            right: 'translateX(-20px)'
        };

        const initialTransform = transforms[direction] || transforms.down;
        
        element.style.transform = initialTransform;
        element.style.opacity = '0';
        element.style.transition = `all ${duration}ms ease`;
        
        // Force reflow
        element.offsetHeight;
        
        element.style.transform = 'translateX(0) translateY(0)';
        element.style.opacity = '1';
        
        return new Promise(resolve => {
            setTimeout(resolve, duration);
        });
    }

    // Pulse animation for stats updates (used by StatsPanel)
    static async pulse(element, scale = 1.1, duration = 200) {
        if (!element || !element.style) return Promise.resolve();
        
        const originalTransform = element.style.transform || '';
        
        element.style.transition = `transform ${duration}ms ease`;
        element.style.transform = `${originalTransform} scale(${scale})`;
        
        return new Promise(resolve => {
            setTimeout(() => {
                if (element.style) {
                    element.style.transform = originalTransform;
                }
                setTimeout(resolve, duration);
            }, duration);
        });
    }

    // Shake animation for input validation errors
    static async shake(element, intensity = 5, duration = 500) {
        if (!element) return Promise.resolve();
        
        const originalTransform = element.style.transform || '';
        
        // Check if Web Animations API is supported
        if (element.animate && typeof element.animate === 'function') {
            const keyframes = [];
            const steps = 10;
            
            for (let i = 0; i <= steps; i++) {
                const progress = i / steps;
                const amplitude = intensity * (1 - progress);
                const offset = Math.sin(progress * Math.PI * 4) * amplitude;
                keyframes.push({
                    transform: `${originalTransform} translateX(${offset}px)`,
                    offset: progress
                });
            }
            
            try {
                const animation = element.animate(keyframes, {
                    duration,
                    easing: 'ease-out'
                });
                
                return animation.finished;
            } catch (error) {
                console.warn('Web Animations API failed, using CSS fallback');
                return this.shakeWithCSS(element, intensity, duration, originalTransform);
            }
        } else {
            // Fallback for browsers without Web Animations API
            return this.shakeWithCSS(element, intensity, duration, originalTransform);
        }
    }

    // CSS-based shake fallback
    static async shakeWithCSS(element, intensity = 5, duration = 500, originalTransform = '') {
        if (!element || !element.style) return Promise.resolve();
        
        const steps = 10;
        const stepDuration = duration / steps;
        
        for (let i = 0; i <= steps; i++) {
            const progress = i / steps;
            const amplitude = intensity * (1 - progress);
            const offset = Math.sin(progress * Math.PI * 4) * amplitude;
            
            element.style.transform = `${originalTransform} translateX(${offset}px)`;
            await new Promise(resolve => setTimeout(resolve, stepDuration));
        }
        
        element.style.transform = originalTransform;
        return Promise.resolve();
    }

    // Loading dots animation for loading states
    static createLoadingDots(container, count = 3, color = 'currentColor') {
        if (!container) return;
        
        container.innerHTML = '';
        container.style.display = 'inline-flex';
        container.style.alignItems = 'center';
        container.style.gap = '4px';
        
        for (let i = 0; i < count; i++) {
            const dot = document.createElement('span');
            dot.style.cssText = `
                display: inline-block;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: ${color};
                animation: loadingDot 1.4s ease-in-out infinite both;
                animation-delay: ${i * 0.16}s;
            `;
            container.appendChild(dot);
        }
        
        // Add CSS animation if not already present
        if (!document.getElementById('loading-dots-style')) {
            const style = document.createElement('style');
            style.id = 'loading-dots-style';
            style.textContent = `
                @keyframes loadingDot {
                    0%, 80%, 100% {
                        transform: scale(0);
                        opacity: 0.5;
                    }
                    40% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Typewriter effect for messages
    static async typeWriter(element, text, speed = 50) {
        if (!element || !text) return Promise.resolve();
        
        element.textContent = '';
        
        for (let i = 0; i < text.length; i++) {
            element.textContent += text[i];
            await new Promise(resolve => setTimeout(resolve, speed));
        }
    }

    // Count up animation for statistics
    static async countUp(element, start, end, duration = 1000) {
        if (!element) return Promise.resolve();
        
        const startTime = performance.now();
        const difference = end - start;
        
        return new Promise(resolve => {
            const updateCount = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function (ease-out cubic)
                const easedProgress = 1 - Math.pow(1 - progress, 3);
                const currentValue = Math.round(start + (difference * easedProgress));
                
                element.textContent = currentValue;
                
                if (progress < 1) {
                    requestAnimationFrame(updateCount);
                } else {
                    resolve();
                }
            };
            
            requestAnimationFrame(updateCount);
        });
    }

    // Highlight animation for search results
    static async highlight(element, color = '#f59e0b', duration = 2000) {
        if (!element || !element.style) return Promise.resolve();
        
        const originalBackground = element.style.backgroundColor || '';
        const originalTransition = element.style.transition || '';
        
        element.style.transition = 'background-color 0.3s ease';
        element.style.backgroundColor = color;
        
        return new Promise(resolve => {
            setTimeout(() => {
                if (element.style) {
                    element.style.backgroundColor = originalBackground;
                    setTimeout(() => {
                        if (element.style) {
                            element.style.transition = originalTransition;
                        }
                        resolve();
                    }, 300);
                } else {
                    resolve();
                }
            }, duration);
        });
    }

    // Bounce animation for node interactions
    static async bounce(element, scale = 1.2, duration = 300) {
        if (!element || !element.style) return Promise.resolve();
        
        const originalTransform = element.style.transform || '';
        
        element.style.transition = `transform ${duration / 2}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
        element.style.transform = `${originalTransform} scale(${scale})`;
        
        return new Promise(resolve => {
            setTimeout(() => {
                if (element.style) {
                    element.style.transform = originalTransform;
                }
                setTimeout(resolve, duration / 2);
            }, duration / 2);
        });
    }

    // Utility methods
    static async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static isElementVisible(element) {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && 
               rect.top >= 0 && rect.left >= 0 && 
               rect.bottom <= window.innerHeight && 
               rect.right <= window.innerWidth;
    }

    static async waitForElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }

            const observer = new MutationObserver(() => {
                const element = document.querySelector(selector);
                if (element) {
                    observer.disconnect();
                    resolve(element);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Element ${selector} not found within ${timeout}ms`));
            }, timeout);
        });
    }

    // Chain multiple animations
    static async sequence(...animations) {
        for (const animation of animations) {
            if (typeof animation === 'function') {
                await animation();
            }
        }
    }

    // Run animations in parallel
    static async parallel(...animations) {
        const promises = animations.map(animation => 
            typeof animation === 'function' ? animation() : Promise.resolve()
        );
        return Promise.all(promises);
    }
}

// Make available globally for your application
window.AnimationUtils = AnimationUtils;

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationUtils;
}

// Auto-initialize common animations CSS if needed
document.addEventListener('DOMContentLoaded', () => {
    // Add common animation styles if not present
    if (!document.getElementById('animation-utils-styles')) {
        const style = document.createElement('style');
        style.id = 'animation-utils-styles';
        style.textContent = `
            .slide-in {
                animation: slideIn 0.3s ease-out;
            }
            
            .slide-out {
                animation: slideOut 0.3s ease-in;
            }
            
            .search-highlight {
                animation: searchPulse 2s ease-in-out 3;
            }
            
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(-20px) scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            
            @keyframes slideOut {
                from {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
                to {
                    opacity: 0;
                    transform: translateY(-20px) scale(0.95);
                }
            }
            
            @keyframes searchPulse {
                0%, 100% {
                    transform: scale(1);
                    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
                }
                50% {
                    transform: scale(1.05);
                    box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
                }
            }
        `;
        document.head.appendChild(style);
    }
});
