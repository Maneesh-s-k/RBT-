# Red-Black Tree Implementation

A template-based C++ implementation of a Red-Black Tree data structure.

## Prerequisites

### System Requirements
```bash
# Install required packages
sudo apt-get update
sudo apt-get install -y g++ build-essential
```

### Project Structure
```
.
├── include/
│   └── rbtree/
│       ├── node.h       # RBT node definition
│       ├── tree.h       # RBT class declaration
│       └── tree.tpp     # RBT template implementation
├── code.cc             # Test implementation
├── Makefile           # Build configuration
└── README.md
```

## Building and Testing

```bash
# Build and run tests
make test

# Clean build artifacts
make clean
```

## Usage

```cpp
#include "rbtree/tree.h"

// Create a tree of integers
RedBlackTree<int> tree;

// Insert values
tree.insert(7);
tree.insert(3);
tree.insert(18);

// Search for a value
bool found = tree.search(3);  // returns true

// Delete a value
tree.remove(3);

// Check if tree is empty
bool isEmpty = tree.empty();  // returns false

// Clear all nodes
tree.clear();
```

## Implementation Details

### Red-Black Tree Properties
1. Every node is either red or black
2. The root is black
3. All leaves (NIL) are black
4. If a node is red, then both its children are black
5. Every path from root to leaves contains the same number of black nodes

### Time Complexities
- Insert: O(log n)
- Delete: O(log n)
- Search: O(log n)
- Clear: O(n)

### Special Cases
- **Empty Tree**: All operations handle empty trees gracefully
- **Single Node**: Both insertion and deletion work correctly with a single node
- **Duplicate Values**: Duplicate values are allowed and stored in the right subtree
- **Memory Management**: All memory is properly freed during clear and node deletion

### Available Operations
- `insert(value)`: Inserts a value into the tree
- `remove(value)`: Removes a value from the tree (returns false if not found)
- `search(value)`: Checks if a value exists in the tree
- `empty()`: Checks if the tree is empty
- `clear()`: Removes all nodes from the tree
- `inorder(callback)`: Traverses the tree in-order, calling the callback for each value
