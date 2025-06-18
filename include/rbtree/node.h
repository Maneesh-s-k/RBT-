#pragma once

namespace rbtree {

template<typename T>
class RBNode {
public:
    T data;
    RBNode<T>* left;
    RBNode<T>* right;
    RBNode<T>* parent;
    bool isRed;

    explicit RBNode(const T& value, bool red = true) 
        : data(value), left(nullptr), right(nullptr), parent(nullptr), isRed(red) {}
    
    ~RBNode() = default;

    // Prevent copying
    RBNode(const RBNode&) = delete;
    RBNode& operator=(const RBNode&) = delete;
};

} // namespace rbtree 