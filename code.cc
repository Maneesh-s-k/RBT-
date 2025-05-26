#include <memory>
#include <iostream>
#include <bitset>

namespace rbtree {

using std::unique_ptr;
using std::make_unique;
using std::string;
using std::cout;
using std::endl;

struct Color {
    static constexpr bool RED = false;
    static constexpr bool BLACK = true;
};

struct ValueBase {
    virtual ~ValueBase() = default;
    virtual void print() const = 0;
};

struct IntValue : ValueBase {
    int data;
    IntValue(int d) : data(d) {}
    void print() const override {
        cout << data;
    }
};

struct StringValue : ValueBase {
    string data;
    StringValue(const string& d) : data(d) {}
    void print() const override {
        cout << data;
    }
};

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