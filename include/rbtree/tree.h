#pragma once
#include <memory>
#include <iostream>
#include "node.h"

namespace rbtree {

template <typename Key>
class RedBlackTree {
    using NodeType = Node<Key>;

    NodeType* root;

public:
    RedBlackTree() : root(nullptr) {}

    // Insert a key-value pair
    void insert(Key key, std::unique_ptr<ValueBase> value);

    // Find value by key
    ValueBase* find(const Key& key) const;

    // Delete a node by key
    void remove(const Key& key);

    // Update a value by key; returns true if key was found and updated
    bool update(const Key& key, std::unique_ptr<ValueBase> newValue);

    // Inorder traversal for debugging or testing
    void inorder() const;

private:
    // Binary Search Tree insertion logic
    NodeType* bstInsert(NodeType* root, NodeType* node);

    // Fix Red-Black Tree after insertion
    void fixInsert(NodeType* node);

    // Delete helpers
    NodeType* bstDelete(NodeType* node, const Key& key);
    void fixDelete(NodeType* node);

    // Utility to replace one subtree with another
    void transplant(NodeType* u, NodeType* v);

    // Find minimum value node in a subtree
    NodeType* minimum(NodeType* node) const;

    // Search helper
    NodeType* findHelper(NodeType* node, const Key& key) const;

    // Rotations
    void leftRotate(NodeType* x);
    void rightRotate(NodeType* y);

    // Traversal helper
    void inorderHelper(NodeType* node) const;

    // Get root pointer
    NodeType* getRoot() const { return root; }
};

} // namespace rbtree