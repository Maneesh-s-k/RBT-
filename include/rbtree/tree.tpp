#pragma once
#include "tree.h"

namespace rbtree {

template<typename T>
RedBlackTree<T>::RedBlackTree() {
    NIL = new RBNode<T>(T(), false);  // Black sentinel node
    root = NIL;
}

template<typename T>
RedBlackTree<T>::~RedBlackTree() {
    clear();
    delete NIL;
}

template<typename T>
void RedBlackTree<T>::leftRotate(RBNode<T>* x) {
    RBNode<T>* y = x->right;
    x->right = y->left;
    
    if (y->left != NIL) {
        y->left->parent = x;
    }
    
    y->parent = x->parent;
    
    if (x->parent == nullptr) {
        root = y;
    } else if (x == x->parent->left) {
        x->parent->left = y;
    } else {
        x->parent->right = y;
    }
    
    y->left = x;
    x->parent = y;
}

template<typename T>
void RedBlackTree<T>::rightRotate(RBNode<T>* x) {
    RBNode<T>* y = x->left;
    x->left = y->right;
    
    if (y->right != NIL) {
        y->right->parent = x;
    }
    
    y->parent = x->parent;
    
    if (x->parent == nullptr) {
        root = y;
    } else if (x == x->parent->right) {
        x->parent->right = y;
    } else {
        x->parent->left = y;
    }
    
    y->right = x;
    x->parent = y;
}

template<typename T>
void RedBlackTree<T>::insert(const T& value) {
    RBNode<T>* node = new RBNode<T>(value);
    RBNode<T>* y = nullptr;
    RBNode<T>* x = root;

    while (x != NIL) {
        y = x;
        if (node->data < x->data) {
            x = x->left;
        } else {
            x = x->right;
        }
    }

    node->parent = y;
    if (y == nullptr) {
        root = node;
    } else if (node->data < y->data) {
        y->left = node;
    } else {
        y->right = node;
    }

    node->left = NIL;
    node->right = NIL;
    node->isRed = true;

    fixInsert(node);
}

template<typename T>
void RedBlackTree<T>::fixInsert(RBNode<T>* k) {
    RBNode<T>* u;
    while (k->parent != nullptr && k->parent->isRed) {
        if (k->parent == k->parent->parent->right) {
            u = k->parent->parent->left;
            if (u->isRed) {
                u->isRed = false;
                k->parent->isRed = false;
                k->parent->parent->isRed = true;
                k = k->parent->parent;
            } else {
                if (k == k->parent->left) {
                    k = k->parent;
                    rightRotate(k);
                }
                k->parent->isRed = false;
                k->parent->parent->isRed = true;
                leftRotate(k->parent->parent);
            }
        } else {
            u = k->parent->parent->right;
            if (u->isRed) {
                u->isRed = false;
                k->parent->isRed = false;
                k->parent->parent->isRed = true;
                k = k->parent->parent;
            } else {
                if (k == k->parent->right) {
                    k = k->parent;
                    leftRotate(k);
                }
                k->parent->isRed = false;
                k->parent->parent->isRed = true;
                rightRotate(k->parent->parent);
            }
        }
        if (k == root) {
            break;
        }
    }
    root->isRed = false;
}

template<typename T>
bool RedBlackTree<T>::search(const T& value) const {
    RBNode<T>* current = root;
    while (current != NIL) {
        if (value == current->data) {
            return true;
        }
        if (value < current->data) {
            current = current->left;
        } else {
            current = current->right;
        }
    }
    return false;
}

template<typename T>
void RedBlackTree<T>::clearHelper(RBNode<T>* node) {
    if (node != NIL) {
        clearHelper(node->left);
        clearHelper(node->right);
        delete node;
    }
}

template<typename T>
void RedBlackTree<T>::clear() {
    clearHelper(root);
    root = NIL;
}

template<typename T>
void RedBlackTree<T>::inorderHelper(RBNode<T>* node, std::function<void(const T&)> visit) const {
    if (node != NIL) {
        inorderHelper(node->left, visit);
        visit(node->data);
        inorderHelper(node->right, visit);
    }
}

template<typename T>
void RedBlackTree<T>::inorder(std::function<void(const T&)> visit) const {
    inorderHelper(root, visit);
}

template<typename T>
RBNode<T>* RedBlackTree<T>::minimum(RBNode<T>* node) const {
    while (node->left != NIL) {
        node = node->left;
    }
    return node;
}

template<typename T>
void RedBlackTree<T>::transplant(RBNode<T>* u, RBNode<T>* v) {
    if (u->parent == nullptr) {
        root = v;
    } else if (u == u->parent->left) {
        u->parent->left = v;
    } else {
        u->parent->right = v;
    }
    v->parent = u->parent;
}

template<typename T>
bool RedBlackTree<T>::remove(const T& value) {
    RBNode<T>* z = root;
    while (z != NIL) {
        if (value == z->data) {
            break;
        }
        if (value < z->data) {
            z = z->left;
        } else {
            z = z->right;
        }
    }
    
    if (z == NIL) {
        return false;
    }

    RBNode<T>* y = z;
    RBNode<T>* x;
    bool yOriginalColor = y->isRed;

    if (z->left == NIL) {
        x = z->right;
        transplant(z, z->right);
    } else if (z->right == NIL) {
        x = z->left;
        transplant(z, z->left);
    } else {
        y = minimum(z->right);
        yOriginalColor = y->isRed;
        x = y->right;

        if (y->parent == z) {
            x->parent = y;
        } else {
            transplant(y, y->right);
            y->right = z->right;
            y->right->parent = y;
        }

        transplant(z, y);
        y->left = z->left;
        y->left->parent = y;
        y->isRed = z->isRed;
    }

    delete z;

    if (!yOriginalColor) {
        fixDelete(x);
    }

    return true;
}

template<typename T>
void RedBlackTree<T>::fixDelete(RBNode<T>* x) {
    RBNode<T>* w;
    while (x != root && !x->isRed) {
        if (x == x->parent->left) {
            w = x->parent->right;
            if (w->isRed) {
                w->isRed = false;
                x->parent->isRed = true;
                leftRotate(x->parent);
                w = x->parent->right;
            }
            if (!w->left->isRed && !w->right->isRed) {
                w->isRed = true;
                x = x->parent;
            } else {
                if (!w->right->isRed) {
                    w->left->isRed = false;
                    w->isRed = true;
                    rightRotate(w);
                    w = x->parent->right;
                }
                w->isRed = x->parent->isRed;
                x->parent->isRed = false;
                w->right->isRed = false;
                leftRotate(x->parent);
                x = root;
            }
        } else {
            w = x->parent->left;
            if (w->isRed) {
                w->isRed = false;
                x->parent->isRed = true;
                rightRotate(x->parent);
                w = x->parent->left;
            }
            if (!w->right->isRed && !w->left->isRed) {
                w->isRed = true;
                x = x->parent;
            } else {
                if (!w->left->isRed) {
                    w->right->isRed = false;
                    w->isRed = true;
                    leftRotate(w);
                    w = x->parent->left;
                }
                w->isRed = x->parent->isRed;
                x->parent->isRed = false;
                w->left->isRed = false;
                rightRotate(x->parent);
                x = root;
            }
        }
    }
    x->isRed = false;
}

} // namespace rbtree 