class AnimationUtils {
    static async animateElement(element, animationClass, duration = 500) {
        return new Promise((resolve) => {
            element.classList.add(animationClass);
            
            const handleAnimationEnd = () => {
                element.classList.remove(animationClass);
                element.removeEventListener('animationend', handleAnimationEnd);
                resolve();
            };
            
            element.addEventListener('animationend', handleAnimationEnd);
            
            // Fallback timeout
            setTimeout(() => {
                if (element.classList.contains(animationClass)) {
                    element.classList.remove(animationClass);
                    resolve();
                }
            }, duration);
        });
    }

    static async fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.transition = `opacity ${duration}ms ease`;
        
        // Force reflow
        element.offsetHeight;
        
        element.style.opacity = '1';
        
        return new Promise(resolve => {
            setTimeout(resolve, duration);
        });
    }

    static async fadeOut(element, duration = 300) {
        element.style.transition = `opacity ${duration}ms ease`;
        element.style.opacity = '0';
        
        return new Promise(resolve => {
            setTimeout(resolve, duration);
        });
    }

    static async slideIn(element, direction = 'down', duration = 300) {
        const transforms = {
            down: 'translateY(-20px)',
            up: 'translateY(20px)',
            left: 'translateX(20px)',
            right: 'translateX(-20px)'
        };

        element.style.transform = transforms[direction];
        element.style.opacity = '0';
        element.style.transition = `all ${duration}ms ease`;
        
        // Force reflow
        element.offsetHeight;
        
        element.style.transform = 'translate(0)';
        element.style.opacity = '1';
        
        return new Promise(resolve => {
            setTimeout(resolve, duration);
        });
    }

    static async pulse(element, scale = 1.05, duration = 200) {
        const originalTransform = element.style.transform;
        
        element.style.transition = `transform ${duration}ms ease`;
        element.style.transform = `${originalTransform} scale(${scale})`;
        
        return new Promise(resolve => {
            setTimeout(() => {
                element.style.transform = originalTransform;
                setTimeout(resolve, duration);
            }, duration);
        });
    }

    static async shake(element, intensity = 5, duration = 500) {
        const originalTransform = element.style.transform;
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
        
        const animation = element.animate(keyframes, {
            duration,
            easing: 'ease-out'
        });
        
        return animation.finished;
    }

    static createLoadingDots(container, count = 3) {
        container.innerHTML = '';
        
        for (let i = 0; i < count; i++) {
            const dot = document.createElement('span');
            dot.style.cssText = `
                display: inline-block;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: currentColor;
                margin: 0 2px;
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

    static async typeWriter(element, text, speed = 50) {
        element.textContent = '';
        
        for (let i = 0; i < text.length; i++) {
            element.textContent += text[i];
            await new Promise(resolve => setTimeout(resolve, speed));
        }
    }

    static async countUp(element, start, end, duration = 1000) {
        const startTime = performance.now();
        const difference = end - start;
        
        return new Promise(resolve => {
            const updateCount = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function (ease-out)
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
}

// Make available globally
window.AnimationUtils = AnimationUtils;
