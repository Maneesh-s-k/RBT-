class TreeVisualizer {
    constructor(svgElement) {
        this.svg = svgElement;
        this.width = 1200;
        this.height = 600;
        this.nodeRadius = 25;
        this.currentNodes = [];
        this.highlightedNodes = new Set();
        
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
            console.log('TreeVisualizer received:', treeData);
            
            if (!treeData || !treeData.tree || treeData.tree.empty === true || 
                !treeData.tree.nodes || treeData.tree.nodes.length === 0) {
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
        // Clear previous content
        SVGHelpers.clearSVG(this.edgeGroup);
        SVGHelpers.clearSVG(this.nodeGroup);

        if (nodes.length === 0) {
            this.drawEmptyState();
            return;
        }

        // Calculate proper layout
        const layoutNodes = this.calculateProperLayout(nodes);
        
        // Draw edges using parent-child relationships
        await this.drawProperEdges(layoutNodes);
        
        // Draw nodes
        await this.drawNodes(layoutNodes);
        
        // Update viewBox to fit content
        this.updateViewBox(layoutNodes);
    }

    calculateProperLayout(nodes) {
        // Create a proper tree layout
        const nodeMap = new Map(nodes.map(node => [node.data, node]));
        
        // Find root node
        const root = nodes.find(node => node.parent === null);
        if (!root) {
            console.error('No root node found');
            return nodes;
        }

        // Calculate positions using proper tree layout
        const positions = this.calculateTreePositions(root, nodeMap);
        
        // Apply positions to nodes
        return nodes.map(node => ({
            ...node,
            x: positions[node.data]?.x || node.x,
            y: positions[node.data]?.y || node.y
        }));
    }

    calculateTreePositions(root, nodeMap, level = 0, position = { x: 0 }) {
        const positions = {};
        const levelHeight = 100;
        const nodeSpacing = 80;
        
        // In-order traversal to assign x positions
        const inorderTraversal = (node, level, pos) => {
            if (!node) return pos;
            
            // Process left subtree
            if (node.left !== null) {
                const leftChild = nodeMap.get(node.left);
                if (leftChild) {
                    pos = inorderTraversal(leftChild, level + 1, pos);
                }
            }
            
            // Process current node
            positions[node.data] = {
                x: this.width / 2 + (pos.x - nodeMap.size / 2) * nodeSpacing,
                y: 80 + level * levelHeight
            };
            pos.x++;
            
            // Process right subtree
            if (node.right !== null) {
                const rightChild = nodeMap.get(node.right);
                if (rightChild) {
                    pos = inorderTraversal(rightChild, level + 1, pos);
                }
            }
            
            return pos;
        };
        
        inorderTraversal(root, 0, position);
        return positions;
    }

    async drawProperEdges(nodes) {
        const nodeMap = new Map(nodes.map(node => [node.data, node]));
        
        for (const node of nodes) {
            // Draw edge to left child
            if (node.left !== null) {
                const leftChild = nodeMap.get(node.left);
                if (leftChild) {
                    await this.drawEdge(node, leftChild);
                }
            }
            
            // Draw edge to right child
            if (node.right !== null) {
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
                'stroke-opacity': '0.7'
            }
        );
        
        this.edgeGroup.appendChild(line);
        return line;
    }

    async drawNodes(nodes) {
        for (const node of nodes) {
            await this.drawNode(node);
        }
    }

    async drawNode(node) {
        // Create node group
        const nodeGroup = SVGHelpers.createGroup({
            class: 'node-group',
            'data-value': node.data
        });

        // Create circle
        const circle = SVGHelpers.createCircle(
            node.x, node.y, this.nodeRadius,
            {
                class: `node-circle ${node.color}`,
                'data-value': node.data
            }
        );

        // Create text
        const text = SVGHelpers.createText(
            node.x, node.y, node.data.toString(),
            {
                class: 'node-text',
                'data-value': node.data
            }
        );

        nodeGroup.appendChild(circle);
        nodeGroup.appendChild(text);
        
        // Add click handler
        this.addNodeClickHandler(nodeGroup, node);
        
        // Add to DOM
        this.nodeGroup.appendChild(nodeGroup);

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
            circle.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))';
        } else {
            circle.style.transform = 'scale(1)';
            circle.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))';
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
                'dominant-baseline': 'central'
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
                'fill': '#ef4444'
            }
        );
        
        this.treeGroup.appendChild(errorMessage);
    }

    updateViewBox(nodes = null) {
        if (!nodes || nodes.length === 0) {
            this.svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
            return;
        }

        const viewBox = SVGHelpers.calculateViewBox(nodes, 50);
        this.svg.setAttribute('viewBox', 
            `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`
        );
    }

    centerView() {
        if (this.currentNodes.length > 0) {
            this.updateViewBox(this.currentNodes);
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
