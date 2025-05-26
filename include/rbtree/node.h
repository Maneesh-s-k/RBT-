#pragma once
#include <memory>
#include <string>
#include <iostream>

namespace rbtree {

using std::unique_ptr;
using std::string;
using std::cout;

// Color constants inside a struct
struct Color {
    static constexpr bool RED = false;
    static constexpr bool BLACK = true;
};

// Base class for polymorphic value storage
struct ValueBase {
    virtual ~ValueBase() = default;
    virtual void print() const = 0;
};

// Node struct template
template <typename Key>
struct Node {
    Key key;
    unique_ptr<ValueBase> value;
    bool color;
    Node* left;
    Node* right;
    Node* parent;

    Node(Key k, unique_ptr<ValueBase> v)
        : key(k), value(std::move(v)), color(Color::RED),
          left(nullptr), right(nullptr), parent(nullptr) {}
};

} 