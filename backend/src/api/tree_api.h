#pragma once
#include "../rbtree/tree.h"
#include "json.hpp"
#include "httplib.h"
#include <memory>
#include <string>

using json = nlohmann::json;

class TreeAPI {
private:
    std::unique_ptr<rbtree::RedBlackTree<int>> tree;
    
public:
    TreeAPI();
    
    // Setup routes
    void setupRoutes(httplib::Server& server);
    
    // API endpoints
    json insertNode(int value);
    json deleteNode(int value);
    json searchNode(int value);
    json getTreeData();
    json clearTree();
    json getTreeStats();
    json validateTree();
    json insertRandom();
    
    // Utility methods
    json nodeToJson(rbtree::RBNode<int>* node);
    json errorResponse(const std::string& message);
    json successResponse(const std::string& message, const json& data = json::object());
    
    // CORS handler
    void enableCORS(httplib::Response& res);
};
