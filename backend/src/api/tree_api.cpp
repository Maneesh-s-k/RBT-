#include "tree_api.h"
#include <iostream>
#include <random>
#include <chrono>

TreeAPI::TreeAPI() {
    std::cout << "=== TreeAPI Constructor ===" << std::endl;
    tree = std::make_unique<rbtree::RedBlackTree<int>>();
    std::cout << "Initial tree size: " << tree->size() << std::endl;
    
    // If tree already has nodes, something is wrong
    if (!tree->empty()) {
        std::cout << "ERROR: Tree not empty after construction!" << std::endl;
        auto nodes = tree->getAllNodes();
        for (auto node : nodes) {
            std::cout << "Unexpected node: " << node->data << std::endl;
        }
    }
}

void TreeAPI::setupRoutes(httplib::Server& server) {



    server.Post("/api/tree/random", [this](const httplib::Request& req, httplib::Response& res) {
        std::cout << "\n=== RANDOM API ENDPOINT HIT ===" << std::endl;
        std::cout << "Time: " << time(nullptr) << std::endl;
        std::cout << "User-Agent: " << req.get_header_value("User-Agent") << std::endl;
        std::cout << "Referer: " << req.get_header_value("Referer") << std::endl;
        std::cout << "Origin: " << req.get_header_value("Origin") << std::endl;
        std::cout << "Method: " << req.method << std::endl;
        std::cout.flush();
        
        auto result = insertRandom();
        res.set_content(result.dump(), "application/json");
        
        std::cout << "=== RANDOM API ENDPOINT COMPLETE ===" << std::endl;
        std::cout.flush();
    });
    
   
    // Set CORS headers for all requests
server.set_pre_routing_handler([](const httplib::Request& req, httplib::Response& res) {
    res.set_header("Access-Control-Allow-Origin", "*");
    res.set_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    res.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    res.set_header("Access-Control-Max-Age", "86400"); // Cache preflight for 24 hours
    return httplib::Server::HandlerResponse::Unhandled;
});

// Handle OPTIONS preflight requests explicitly
server.Options(".*", [](const httplib::Request&, httplib::Response& res) {
    res.set_header("Access-Control-Allow-Origin", "*");
    res.set_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    res.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    res.set_header("Access-Control-Max-Age", "86400");
    res.status = 200;
    res.set_content("", "text/plain");
});


    // Health check
    server.Get("/api/health", [this](const httplib::Request&, httplib::Response& res) {
        auto response = successResponse("Server is healthy");
        res.set_content(response.dump(), "application/json");
    });

    // Get tree data
    server.Get("/api/tree", [this](const httplib::Request&, httplib::Response& res) {
        auto response = getTreeData();
        res.set_content(response.dump(), "application/json");
    });

    // Insert node
    server.Post("/api/tree/insert", [this](const httplib::Request& req, httplib::Response& res) {
        try {
            auto body = json::parse(req.body);
            int value = body["value"];
            auto response = insertNode(value);
            res.set_content(response.dump(), "application/json");
        } catch (const std::exception& e) {
            auto error = errorResponse("Invalid request: " + std::string(e.what()));
            res.status = 400;
            res.set_content(error.dump(), "application/json");
        }
    });

    // Delete node
    server.Delete("/api/tree/delete", [this](const httplib::Request& req, httplib::Response& res) {
        try {
            auto body = json::parse(req.body);
            int value = body["value"];
            auto response = deleteNode(value);
            res.set_content(response.dump(), "application/json");
        } catch (const std::exception& e) {
            auto error = errorResponse("Invalid request: " + std::string(e.what()));
            res.status = 400;
            res.set_content(error.dump(), "application/json");
        }
    });

    // Search node
    server.Get("/api/tree/search/(\\d+)", [this](const httplib::Request& req, httplib::Response& res) {
        try {
            int value = std::stoi(req.matches[1]);
            auto response = searchNode(value);
            res.set_content(response.dump(), "application/json");
        } catch (const std::exception& e) {
            auto error = errorResponse("Invalid request: " + std::string(e.what()));
            res.status = 400;
            res.set_content(error.dump(), "application/json");
        }
    });

    // Clear tree
    server.Post("/api/tree/clear", [this](const httplib::Request&, httplib::Response& res) {
        auto response = clearTree();
        res.set_content(response.dump(), "application/json");
    });

    // Get statistics
    server.Get("/api/tree/stats", [this](const httplib::Request&, httplib::Response& res) {
        auto response = getTreeStats();
        res.set_content(response.dump(), "application/json");
    });

    // Validate tree
    server.Get("/api/tree/validate", [this](const httplib::Request&, httplib::Response& res) {
        auto response = validateTree();
        res.set_content(response.dump(), "application/json");
    });

    // Insert random node
    server.Post("/api/tree/random", [this](const httplib::Request&, httplib::Response& res) {
        auto response = insertRandom();
        res.set_content(response.dump(), "application/json");
    });
}

json TreeAPI::insertNode(int value) {
    std::cout << "🔍 INSERT_NODE called with value: " << value << std::endl;
    std::cout << "🔍 Current tree size before insert: " << tree->size() << std::endl;
    
    try {
        bool existed = tree->search(value);
        
        if (existed) {
            std::cout << "⚠️ Node " << value << " already exists" << std::endl;
            return successResponse("Node already exists", {
                {"value", value},
                {"existed", true}
            });
        }
        
        tree->insert(value);
        std::cout << "✅ Node " << value << " inserted. New tree size: " << tree->size() << std::endl;
        
        return successResponse("Node inserted successfully", {
            {"value", value},
            {"existed", false}
        });
        
    } catch (const std::exception& e) {
        return errorResponse("Failed to insert node: " + std::string(e.what()));
    }
}



json TreeAPI::deleteNode(int value) {
    try {
        bool removed = tree->remove(value);
        if (removed) {
            return successResponse("Node deleted successfully", {
                {"value", value},
                {"tree", getTreeData()["data"]["tree"]},
                {"stats", getTreeStats()["data"]}
            });
        } else {
            return errorResponse("Node not found");
        }
    } catch (const std::exception& e) {
        return errorResponse("Failed to delete node: " + std::string(e.what()));
    }
}

json TreeAPI::searchNode(int value) {
    try {
        bool found = tree->search(value);
        return successResponse("Search completed", {
            {"value", value},
            {"found", found}
        });
    } catch (const std::exception& e) {
        return errorResponse("Search failed: " + std::string(e.what()));
    }
}

json TreeAPI::getTreeData() {
    try {
        auto nodes = tree->getAllNodes();
        json nodeArray = json::array();
        
        for (auto node : nodes) {
            if (node) {
                nodeArray.push_back(nodeToJson(node));
            }
        }
        
        // Fixed: Use getters instead of direct access
        json rootData = nullptr;
        if (tree->getRoot() != tree->getNIL()) {
            rootData = tree->getRoot()->data;
        }
        
        return successResponse("Tree data retrieved", {
            {"tree", {
                {"nodes", nodeArray},
                {"empty", tree->empty()},
                {"root", rootData}
            }}
        });
    } catch (const std::exception& e) {
        return errorResponse("Failed to get tree data: " + std::string(e.what()));
    }
}

json TreeAPI::clearTree() {
    try {
        tree->clear();
        return successResponse("Tree cleared successfully", {
            {"stats", getTreeStats()["data"]}
        });
    } catch (const std::exception& e) {
        return errorResponse("Failed to clear tree: " + std::string(e.what()));
    }
}

json TreeAPI::getTreeStats() {
    try {
        return successResponse("Statistics retrieved", {
            {"nodeCount", tree->size()},
            {"height", tree->height()},
            {"empty", tree->empty()},
            {"valid", tree->isValidRBTree()}
        });
    } catch (const std::exception& e) {
        return errorResponse("Failed to get statistics: " + std::string(e.what()));
    }
}

json TreeAPI::validateTree() {
    try {
        bool valid = tree->isValidRBTree();
        return successResponse("Validation completed", {
            {"valid", valid}
        });
    } catch (const std::exception& e) {
        return errorResponse("Validation failed: " + std::string(e.what()));
    }
}

json TreeAPI::insertRandom() {
    std::cout << "🎲 INSERT_RANDOM called" << std::endl;
    std::cout.flush(); // Force immediate output
    
    try {
        std::random_device rd;
        std::mt19937 gen(rd());
        std::uniform_int_distribution<> dis(1, 100);
        
        int value = dis(gen);
        std::cout << "🎲 Generated random value: " << value << std::endl;
        std::cout.flush();
        
        return insertNode(value);
    } catch (const std::exception& e) {
        return errorResponse("Failed to insert random node: " + std::string(e.what()));
    }
}



json TreeAPI::nodeToJson(rbtree::RBNode<int>* node) {
    // Fixed: Use getters and proper null handling
    if (!node || node == tree->getNIL()) return nullptr;
    
    return json{
        {"data", node->data},
        {"color", node->isRed ? "red" : "black"},
        {"x", node->x},
        {"y", node->y},
        {"level", node->level},
        {"left", node->left != tree->getNIL() ? json(node->left->data) : json(nullptr)},
        {"right", node->right != tree->getNIL() ? json(node->right->data) : json(nullptr)},
        {"parent", node->parent != nullptr ? json(node->parent->data) : json(nullptr)}
    };
}

json TreeAPI::errorResponse(const std::string& message) {
    return json{
        {"success", false},
        {"message", message},
        {"timestamp", std::chrono::duration_cast<std::chrono::seconds>(
            std::chrono::system_clock::now().time_since_epoch()).count()}
    };
}

json TreeAPI::successResponse(const std::string& message, const json& data) {
    return json{
        {"success", true},
        {"message", message},
        {"data", data},
        {"timestamp", std::chrono::duration_cast<std::chrono::seconds>(
            std::chrono::system_clock::now().time_since_epoch()).count()}
    };
}
