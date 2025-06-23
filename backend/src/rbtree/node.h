#pragma once

namespace rbtree {

template<typename T>
struct RBNode {
    T data;
    RBNode* left;
    RBNode* right;
    RBNode* parent;
    bool isRed;
    
    // For visualization support
    int x, y;
    int level;
    
    RBNode(const T& value, bool red = true) 
        : data(value), left(nullptr), right(nullptr), 
          parent(nullptr), isRed(red), x(0), y(0), level(0) {}
};

} // namespace rbtree
