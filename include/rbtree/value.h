#pragma once
#include <string>
#include <iostream>
#include "node.h" 

namespace rbtree {

using std::string;
using std::cout;

// Derived value classes for demonstration

struct IntValue : ValueBase {
    int data;
    explicit IntValue(int d) : data(d) {}
    void print() const override {
        cout << data;
    }
};

struct StringValue : ValueBase {
    string data;
    explicit StringValue(const string& d) : data(d) {}
    void print() const override {
        cout << data;
    }
};

} 