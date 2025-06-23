#pragma once
#include "json.hpp"
#include "../rbtree/tree.h"

using json = nlohmann::json;

class JsonConverter {
public:
    static json treeToJson(const rbtree::RedBlackTree<int>& tree);
    static json nodeToJson(rbtree::RBNode<int>* node);
    static json statsToJson(const rbtree::RedBlackTree<int>& tree);
};
