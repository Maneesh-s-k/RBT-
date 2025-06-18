#pragma once
#include "node.h"
#include <memory>
#include <functional>

namespace rbtree {

template<typename T>
class RedBlackTree {
private:
    RBNode<T>* root;
    RBNode<T>* NIL;  // Sentinel node

    // Private helper methods
    void leftRotate(RBNode<T>* x);
    void rightRotate(RBNode<T>* x);
    void fixInsert(RBNode<T>* k);
    void fixDelete(RBNode<T>* x);
    void transplant(RBNode<T>* u, RBNode<T>* v);
    RBNode<T>* minimum(RBNode<T>* node) const;
    void clearHelper(RBNode<T>* node);
    void inorderHelper(RBNode<T>* node, std::function<void(const T&)> visit) const;

public:
    RedBlackTree();
    ~RedBlackTree();

    // Prevent copying
    RedBlackTree(const RedBlackTree&) = delete;
    RedBlackTree& operator=(const RedBlackTree&) = delete;

    // Core operations
    void insert(const T& value);
    bool remove(const T& value);
    bool search(const T& value) const;
    void clear();
    
    // Traversal
    void inorder(std::function<void(const T&)> visit) const;
    
    // Utility
    bool empty() const { return root == NIL; }
};

} // namespace rbtree

// Include implementation
#include "tree.tpp" 