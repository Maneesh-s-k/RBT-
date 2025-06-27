class TreeVisualizer {
    constructor(svgElement) {
    this.svg = svgElement;
    this.width = 1300; // Increased from 800
    this.height = 800; // Increased from 400
    this.nodeRadius = 35; // Increased from 25
    this.currentNodes = [];
    this.highlightedNodes = new Set();
    this.minNodeSpacing = 150; // Increased from 120
    this.levelHeight = 120; // Increased from 100
    
    this.setupSVG();
    this.bindEvents();
}


    setupSVG() {
        this.svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
        this.svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        
        // Create main group for tree content
        this.treeGroup = SVGHelpers.createGroup({ class: 'tree-group' });
        this.svg.appendChild(this.treeGroup);
        
        // Create groups for different layers
        this.edgeGroup = SVGHelpers.createGroup({ class: 'edge-group' });
        this.nodeGroup = SVGHelpers.createGroup({ class: 'node-group' });
        
        this.treeGroup.appendChild(this.edgeGroup);
        this.treeGroup.appendChild(this.nodeGroup);
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.updateViewBox();
        });
    }

    async draw(treeData) {
        try {
            console.log('TreeVisualizer received data:', treeData);
            
            // Clear everything first
            SVGHelpers.clearSVG(this.treeGroup);
            
            // Recreate the groups after clearing
            this.edgeGroup = SVGHelpers.createGroup({ class: 'edge-group' });
            this.nodeGroup = SVGHelpers.createGroup({ class: 'node-group' });
            this.treeGroup.appendChild(this.edgeGroup);
            this.treeGroup.appendChild(this.nodeGroup);
            
            // Check for empty
            if (!treeData || !treeData.tree || treeData.tree.empty === true || 
                !treeData.tree.nodes || treeData.tree.nodes.length === 0) {
                console.log('Drawing empty state');
                this.drawEmptyState();
                return;
            }

            const nodes = treeData.tree.nodes || [];
            console.log('Drawing nodes:', nodes);
            
            await this.drawTree(nodes);
            this.currentNodes = nodes;
            
        } catch (error) {
            console.error('Error drawing tree:', error);
            this.drawErrorState(error.message);
        }
    }

    async drawTree(nodes) {
        console.log('Drawing tree with nodes:', nodes);

        // FIXED: Use Reingold-Tilford inspired symmetric layout
        const layoutNodes = this.calculateSymmetricLayout(nodes);
        
        // FIXED: Dynamic sizing based on tree bounds
        this.adjustViewBoxForTree(layoutNodes);
        
        console.log('Layout nodes:', layoutNodes);

        // Draw edges first
        await this.drawProperEdges(layoutNodes);
        
        // Then draw nodes
        await this.drawNodes(layoutNodes);
        
        console.log('Tree drawing completed, nodes in DOM:', this.nodeGroup.children.length);
    }

    // FIXED: Symmetric tree layout algorithm (Reingold-Tilford inspired)
    calculateSymmetricLayout(nodes) {
        if (nodes.length === 0) return [];
        
        // Find root node
        const root = nodes.find(node => node.parent === null);
        if (!root) return nodes;
        
        // Build tree structure
        const nodeMap = new Map(nodes.map(node => [node.data, node]));
        const children = new Map();
        
        // Initialize children map
        nodes.forEach(node => {
            children.set(node.data, []);
        });
        
        // Populate children
        nodes.forEach(node => {
            if (node.left !== null) {
                const leftChild = nodeMap.get(node.left);
                if (leftChild) children.get(node.data).push(leftChild);
            }
            if (node.right !== null) {
                const rightChild = nodeMap.get(node.right);
                if (rightChild) children.get(node.data).push(rightChild);
            }
        });
        
        // Calculate positions using symmetric algorithm
        const positions = new Map();
        
        // First pass: calculate subtree widths (bottom-up)
        const calculateSubtreeWidth = (node) => {
            const nodeChildren = children.get(node.data) || [];
            if (nodeChildren.length === 0) {
                return this.minNodeSpacing;
            }
            
            let totalWidth = 0;
            nodeChildren.forEach(child => {
                totalWidth += calculateSubtreeWidth(child);
            });
            
            return Math.max(totalWidth, this.minNodeSpacing);
        };
        
        // Second pass: position nodes (top-down)
        const positionNode = (node, x, y, availableWidth) => {
            positions.set(node.data, { x, y });
            
            const nodeChildren = children.get(node.data) || [];
            if (nodeChildren.length === 0) return;
            
            // Calculate positions for children
            let currentX = x - availableWidth / 2;
            
            nodeChildren.forEach(child => {
                const childWidth = calculateSubtreeWidth(child);
                const childX = currentX + childWidth / 2;
                const childY = y + this.levelHeight;
                
                positionNode(child, childX, childY, childWidth);
                currentX += childWidth;
            });
        };
        
        // Start positioning from root
        const rootWidth = calculateSubtreeWidth(root);
        const rootX = this.width / 2;
        const rootY = 100;
        
        positionNode(root, rootX, rootY, rootWidth);
        
        // Apply positions to nodes
        return nodes.map(node => ({
            ...node,
            x: positions.get(node.data)?.x || this.width / 2,
            y: positions.get(node.data)?.y || 100
        }));
    }

    // FIXED: Dynamic viewBox adjustment for tree expansion
    adjustViewBoxForTree(nodes) {
        if (nodes.length === 0) return;
        
        const padding = 100;
        const minX = Math.min(...nodes.map(n => n.x)) - padding;
        const maxX = Math.max(...nodes.map(n => n.x)) + padding;
        const minY = Math.min(...nodes.map(n => n.y)) - padding;
        const maxY = Math.max(...nodes.map(n => n.y)) + padding;
        
        const treeWidth = maxX - minX;
        const treeHeight = maxY - minY;
        
        // Expand dimensions if tree is larger
        this.width = Math.max(this.width, treeWidth);
        this.height = Math.max(this.height, treeHeight);
        
        // Update SVG viewBox
        this.svg.setAttribute('viewBox', `${minX} ${minY} ${treeWidth} ${treeHeight}`);
        
        // Update container height dynamically
        const container = this.svg.closest('.tree-container');
        if (container) {
            const newHeight = Math.max(600, treeHeight * 0.8);
            container.style.minHeight = `${newHeight}px`;
        }
    }

    async drawProperEdges(nodes) {
        const nodeMap = new Map(nodes.map(node => [node.data, node]));
        
        for (const node of nodes) {
            // Draw edge to left child
            if (node.left !== null && node.left !== undefined) {
                const leftChild = nodeMap.get(node.left);
                if (leftChild) {
                    await this.drawEdge(node, leftChild);
                }
            }
            
            // Draw edge to right child
            if (node.right !== null && node.right !== undefined) {
                const rightChild = nodeMap.get(node.right);
                if (rightChild) {
                    await this.drawEdge(node, rightChild);
                }
            }
        }
    }

    async drawEdge(parent, child) {
        const line = SVGHelpers.createLine(
            parent.x, parent.y,
            child.x, child.y,
            { 
                class: 'edge',
                'stroke': '#6b7280',
                'stroke-width': '4', // Thicker edges
                'stroke-opacity': '0.8'
            }
        );
        
        this.edgeGroup.appendChild(line);
        return line;
    }

    async drawNodes(nodes) {
        console.log('drawNodes called with:', nodes);
        
        for (const node of nodes) {
            console.log(`Drawing node ${node.data} at (${node.x}, ${node.y})`);
            const nodeElement = await this.drawNode(node);
            console.log('Node element created:', nodeElement);
        }
        
        console.log('All nodes drawn, total in nodeGroup:', this.nodeGroup.children.length);
    }

    async drawNode(node) {
    console.log(`drawNode called for node ${node.data} at (${node.x}, ${node.y})`);
    
    // Create node group
    const nodeGroup = SVGHelpers.createGroup({
        class: 'node-group',
        'data-value': node.data
    });

    // Create circle with explicit styling
    const circle = SVGHelpers.createCircle(
        node.x, node.y, this.nodeRadius,
        {
            class: `node-circle ${node.color}`,
            'data-value': node.data,
            'fill': node.color === 'red' ? '#dc2626' : '#1f2937',
            'stroke': '#374151',
            'stroke-width': '4'
        }
    );

    // Create text with LARGER font size
    const text = SVGHelpers.createText(
        node.x, node.y, node.data.toString(),
        {
            class: 'node-text',
            'data-value': node.data,
            'fill': 'white',
            'text-anchor': 'middle',
            'dominant-baseline': 'central',
            'font-size': '20px', // INCREASED from 18px
            'font-weight': 'bold',
            'font-family': 'Arial, sans-serif' // Added for better readability
        }
    );

    nodeGroup.appendChild(circle);
    nodeGroup.appendChild(text);
    
    // Add click handler
    this.addNodeClickHandler(nodeGroup, node);
    
    // Add to DOM
    this.nodeGroup.appendChild(nodeGroup);
    
    console.log('Node added to DOM:', nodeGroup);
    return nodeGroup;
}

    addNodeClickHandler(nodeElement, node) {
        nodeElement.addEventListener('click', (event) => {
            event.stopPropagation();
            this.onNodeClick(node, nodeElement);
        });

        nodeElement.addEventListener('mouseenter', () => {
            this.onNodeHover(node, nodeElement, true);
        });

        nodeElement.addEventListener('mouseleave', () => {
            this.onNodeHover(node, nodeElement, false);
        });
    }

    onNodeClick(node, element) {
        if (this.highlightedNodes.has(node.data)) {
            this.unhighlightNode(node.data);
        } else {
            this.highlightNode(node.data);
        }
        
        this.svg.dispatchEvent(new CustomEvent('nodeClick', {
            detail: { node, element }
        }));
    }

    onNodeHover(node, element, isEntering) {
        const circle = element.querySelector('.node-circle');
        
        if (isEntering) {
            circle.style.transform = 'scale(1.1)';
            circle.style.filter = 'drop-shadow(0 6px 12px rgba(0,0,0,0.4))';
        } else {
            circle.style.transform = 'scale(1)';
            circle.style.filter = 'drop-shadow(0 3px 6px rgba(0,0,0,0.2))';
        }
    }

    highlightNode(value, className = 'highlighted') {
        const nodeElement = this.nodeGroup.querySelector(`[data-value="${value}"]`);
        if (nodeElement) {
            const circle = nodeElement.querySelector('.node-circle');
            circle.classList.add(className);
            this.highlightedNodes.add(value);
        }
    }

    unhighlightNode(value) {
        const nodeElement = this.nodeGroup.querySelector(`[data-value="${value}"]`);
        if (nodeElement) {
            const circle = nodeElement.querySelector('.node-circle');
            circle.classList.remove('highlighted', 'search-highlight', 'validation-success', 'validation-error');
            this.highlightedNodes.delete(value);
        }
    }

    clearHighlights() {
        this.highlightedNodes.forEach(value => {
            this.unhighlightNode(value);
        });
        this.highlightedNodes.clear();
    }

    async animateSearch(value) {
        this.clearHighlights();
        const nodeElement = this.nodeGroup.querySelector(`[data-value="${value}"]`);
        
        if (nodeElement) {
            const circle = nodeElement.querySelector('.node-circle');
            circle.classList.add('search-highlight');
            
            setTimeout(() => {
                circle.classList.remove('search-highlight');
            }, 6000);
            
            return true;
        }
        
        return false;
    }

    async animateValidation(isValid) {
        const circles = this.nodeGroup.querySelectorAll('.node-circle');
        const className = isValid ? 'validation-success' : 'validation-error';
        
        circles.forEach((circle, index) => {
            setTimeout(() => {
                circle.classList.add(className);
                setTimeout(() => {
                    circle.classList.remove(className);
                }, 1000);
            }, index * 50);
        });
    }

    drawEmptyState() {
        SVGHelpers.clearSVG(this.treeGroup);
        
        const emptyMessage = SVGHelpers.createText(
            this.width / 2,
            this.height / 2,
            'Tree is empty. Insert some nodes to get started!',
            {
                class: 'empty-tree-message',
                'text-anchor': 'middle',
                'dominant-baseline': 'central',
                'fill': '#9ca3af',
                'font-size': '22px', // Larger font
                'font-style': 'italic'
            }
        );
        
        this.treeGroup.appendChild(emptyMessage);
    }

    drawErrorState(message) {
        SVGHelpers.clearSVG(this.treeGroup);
        
        const errorMessage = SVGHelpers.createText(
            this.width / 2,
            this.height / 2,
            `Error: ${message}`,
            {
                class: 'error-message',
                'text-anchor': 'middle',
                'dominant-baseline': 'central',
                'fill': '#ef4444',
                'font-size': '20px'
            }
        );
        
        this.treeGroup.appendChild(errorMessage);
    }

    updateViewBox(nodes = null) {
        // Dynamic viewBox is handled in adjustViewBoxForTree
        if (nodes) {
            this.adjustViewBoxForTree(nodes);
        }
    }

    exportSVG() {
        const svgData = new XMLSerializer().serializeToString(this.svg);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'red-black-tree.svg';
        link.click();
        
        URL.revokeObjectURL(url);
    }
}

// Make available globally
window.TreeVisualizer = TreeVisualizer;
