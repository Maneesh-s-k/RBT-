#include "json_converter.h"

json JsonConverter::treeToJson(const rbtree::RedBlackTree<int>& tree) {
    json result;
    result["empty"] = tree.empty();
    result["size"] = tree.size();
    result["height"] = tree.height();
    result["valid"] = tree.isValidRBTree();
    
    auto nodes = tree.getAllNodes();
    json nodeArray = json::array();
    
    for (auto node : nodes) {
        if (node) {
            nodeArray.push_back(nodeToJson(node));
        }
    }
    
    result["nodes"] = nodeArray;
    return result;
}

json JsonConverter::nodeToJson(rbtree::RBNode<int>* node) {
    if (!node) return nullptr;
    
    return json{
        {"data", node->data},
        {"color", node->isRed ? "red" : "black"},
        {"x", node->x},
        {"y", node->y},
        {"level", node->level}
    };
}

json JsonConverter::statsToJson(const rbtree::RedBlackTree<int>& tree) {
    return json{
        {"nodeCount", tree.size()},
        {"height", tree.height()},
        {"empty", tree.empty()},
        {"valid", tree.isValidRBTree()}
    };
}
