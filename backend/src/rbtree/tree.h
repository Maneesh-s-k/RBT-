#pragma once
#include "node.h"
#include <functional>
#include <vector>
#include <string>
#include <sstream>

namespace rbtree {

template<typename T>
class RedBlackTree {
private:
    RBNode<T>* root;
    RBNode<T>* NIL;
    size_t nodeCount;
    
    // Helper methods
    void leftRotate(RBNode<T>* x);
    void rightRotate(RBNode<T>* x);
    void fixInsert(RBNode<T>* k);
    void fixDelete(RBNode<T>* x);
    void clearHelper(RBNode<T>* node);
    void inorderHelper(RBNode<T>* node, std::function<void(const T&)> visit) const;
    RBNode<T>* minimum(RBNode<T>* node) const;
    void transplant(RBNode<T>* u, RBNode<T>* v);
    void collectNodes(RBNode<T>* node, std::vector<RBNode<T>*>& nodes) const;
    int heightHelper(RBNode<T>* node) const;
    void calculatePositions(RBNode<T>* node, int level, int& position);
    std::string nodeToJSON(RBNode<T>* node) const;
    bool validateNode(RBNode<T>* node, int blackCount, int& blackHeight) const;

public:
    RedBlackTree();
    ~RedBlackTree();
    
    void insert(const T& value);
    bool remove(const T& value);
    bool search(const T& value) const;
    void clear();
    void inorder(std::function<void(const T&)> visit) const;
    
    //methods
    bool empty() const;
    size_t size() const;
    int height() const;
    std::vector<RBNode<T>*> getAllNodes() const;
    void updateLayout();
    std::string toJSON() const;
    bool isValidRBTree() const;
    // yeh wala for helping in drawing cause without child and parent a wrong tree was being made  
    RBNode<T>* getRoot() const { return root; }
    RBNode<T>* getNIL() const { return NIL; }
};

} // namespace rbtree

#include "tree.tpp"
