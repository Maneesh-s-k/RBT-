class SVGHelpers {
    static createSVGElement(tag, attributes = {}) {
        const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        
        return element;
    }

    static createCircle(x, y, radius, attributes = {}) {
        return this.createSVGElement('circle', {
            cx: x,
            cy: y,
            r: radius,
            ...attributes
        });
    }

    static createLine(x1, y1, x2, y2, attributes = {}) {
        return this.createSVGElement('line', {
            x1,
            y1,
            x2,
            y2,
            ...attributes
        });
    }

    static createText(x, y, text, attributes = {}) {
        const textElement = this.createSVGElement('text', {
            x,
            y,
            ...attributes
        });
        textElement.textContent = text;
        return textElement;
    }

    static createGroup(attributes = {}) {
        return this.createSVGElement('g', attributes);
    }

    static createPath(d, attributes = {}) {
        return this.createSVGElement('path', {
            d,
            ...attributes
        });
    }

    // Calculate curved path between two points
    static createCurvedPath(x1, y1, x2, y2, curvature = 0.3) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Control point for curve
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        
        // Perpendicular offset for curve
        const offsetX = -dy * curvature;
        const offsetY = dx * curvature;
        
        const controlX = midX + offsetX;
        const controlY = midY + offsetY;
        
        return `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`;
    }

    // Animation helpers
    static animateAttribute(element, attribute, from, to, duration = 500, easing = 'ease') {
        return new Promise(resolve => {
            const startTime = performance.now();
            
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Apply easing
                let easedProgress;
                switch (easing) {
                    case 'ease-in':
                        easedProgress = progress * progress;
                        break;
                    case 'ease-out':
                        easedProgress = 1 - Math.pow(1 - progress, 2);
                        break;
                    case 'ease-in-out':
                        easedProgress = progress < 0.5 
                            ? 2 * progress * progress 
                            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
                        break;
                    default:
                        easedProgress = progress;
                }
                
                const currentValue = from + (to - from) * easedProgress;
                element.setAttribute(attribute, currentValue);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            requestAnimationFrame(animate);
        });
    }

    static animateTransform(element, fromTransform, toTransform, duration = 500) {
        return new Promise(resolve => {
            element.style.transition = `transform ${duration}ms ease`;
            element.style.transform = toTransform;
            
            setTimeout(() => {
                element.style.transition = '';
                resolve();
            }, duration);
        });
    }

    // Layout helpers
    static calculateTreeLayout(nodes, containerWidth, containerHeight, nodeRadius = 25) {
        if (!nodes || nodes.length === 0) return [];

        const levels = {};
        const layoutNodes = [];

        // Group nodes by level
        nodes.forEach(node => {
            if (!levels[node.level]) {
                levels[node.level] = [];
            }
            levels[node.level].push(node);
        });

        const maxLevel = Math.max(...Object.keys(levels).map(Number));
        const levelHeight = Math.max(80, (containerHeight - 100) / (maxLevel + 1));

        // Position nodes
        Object.entries(levels).forEach(([level, levelNodes]) => {
            const levelNum = parseInt(level);
            const y = 50 + levelNum * levelHeight;
            
            const totalWidth = containerWidth - 100;
            const nodeSpacing = levelNodes.length > 1 
                ? totalWidth / (levelNodes.length - 1) 
                : 0;

            levelNodes.forEach((node, index) => {
                const x = levelNodes.length === 1 
                    ? containerWidth / 2 
                    : 50 + index * nodeSpacing;

                layoutNodes.push({
                    ...node,
                    x: Math.max(nodeRadius + 10, Math.min(containerWidth - nodeRadius - 10, x)),
                    y
                });
            });
        });

        return layoutNodes;
    }

    // Collision detection for better layout
    static resolveCollisions(nodes, minDistance = 60) {
        const resolvedNodes = [...nodes];
        let iterations = 0;
        const maxIterations = 50;

        while (iterations < maxIterations) {
            let hasCollision = false;
            
            for (let i = 0; i < resolvedNodes.length; i++) {
                for (let j = i + 1; j < resolvedNodes.length; j++) {
                    const node1 = resolvedNodes[i];
                    const node2 = resolvedNodes[j];
                    
                    // Skip if on different levels
                    if (node1.level !== node2.level) continue;
                    
                    const dx = node2.x - node1.x;
                    const distance = Math.abs(dx);
                    
                    if (distance < minDistance) {
                        hasCollision = true;
                        const overlap = minDistance - distance;
                        const adjustment = overlap / 2;
                        
                        if (dx > 0) {
                            node1.x -= adjustment;
                            node2.x += adjustment;
                        } else {
                            node1.x += adjustment;
                            node2.x -= adjustment;
                        }
                    }
                }
            }
            
            if (!hasCollision) break;
            iterations++;
        }

        return resolvedNodes;
    }

    // Find optimal viewBox for tree
    static calculateViewBox(nodes, padding = 50) {
        if (!nodes || nodes.length === 0) {
            return { x: 0, y: 0, width: 800, height: 600 };
        }

        const xs = nodes.map(n => n.x);
        const ys = nodes.map(n => n.y);
        
        const minX = Math.min(...xs) - padding;
        const maxX = Math.max(...xs) + padding;
        const minY = Math.min(...ys) - padding;
        const maxY = Math.max(...ys) + padding;
        
        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }

    // Color utilities
    static interpolateColor(color1, color2, factor) {
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);
        
        const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * factor);
        const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * factor);
        const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * factor);
        
        return this.rgbToHex(r, g, b);
    }

    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    static rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    // Event helpers
    static addSVGEventListener(element, event, handler) {
        element.addEventListener(event, handler);
        return () => element.removeEventListener(event, handler);
    }

    // Cleanup helper
    static clearSVG(svgElement) {
        while (svgElement.firstChild) {
            svgElement.removeChild(svgElement.firstChild);
        }
    }
}

// Make available globally
window.SVGHelpers = SVGHelpers;
