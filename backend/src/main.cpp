#include "httplib.h"
#include "api/tree_api.h"
#include <iostream>
#include <signal.h>
#include <cstdlib>
#include <string>

// Global server pointer for signal handling
httplib::Server* server_ptr = nullptr;

void signalHandler(int signal) {
    if (server_ptr) {
        std::cout << "\nShutting down server..." << std::endl;
        server_ptr->stop();
    }
    exit(signal);
}

int main() {
    std::cout << "========================================" << std::endl;
    std::cout << "🚀 BACKEND SERVER IS STARTING NOW!" << std::endl;
    std::cout << "🚀 YOU SHOULD SEE THIS MESSAGE!" << std::endl;
    std::cout << "========================================" << std::endl;
    
    httplib::Server server;
    server_ptr = &server;
    
    // Setup signal handlers
    signal(SIGINT, signalHandler);
    signal(SIGTERM, signalHandler);
    
    // Get environment variables
    const char* port_env = std::getenv("PORT");
    const int PORT = port_env ? std::atoi(port_env) : 8080;
    
    const char* env = std::getenv("NODE_ENV");
    const bool isProduction = env && std::string(env) == "production";
    
    TreeAPI treeAPI;
    
    // Clear tree on startup (temporary for debugging)
    if (!isProduction) {
        std::cout << "Clearing tree on server startup..." << std::endl;
        treeAPI.clearTree();
        std::cout << "Tree cleared." << std::endl;
    }
    
    // Setup API routes (ONLY ONCE)
    treeAPI.setupRoutes(server);
    
    // REMOVED: Static file serving (not needed for backend-only deployment)
    // server.set_mount_point("/", "../frontend/public");
    
    std::cout << "🌳 Red-Black Tree API Server" << std::endl;
    std::cout << "================================" << std::endl;
    std::cout << "Environment: " << (isProduction ? "Production" : "Development") << std::endl;
    std::cout << "Server starting on port " << PORT << std::endl;
    std::cout << "API Base URL: http://0.0.0.0:" << PORT << "/api" << std::endl;
    std::cout << std::endl;
    std::cout << "Available endpoints:" << std::endl;
    std::cout << "  GET    /api/health           - Health check" << std::endl;
    std::cout << "  GET    /api/tree             - Get tree data" << std::endl;
    std::cout << "  POST   /api/tree/insert      - Insert node" << std::endl;
    std::cout << "  DELETE /api/tree/delete      - Delete node" << std::endl;
    std::cout << "  GET    /api/tree/search/:id  - Search node" << std::endl;
    std::cout << "  POST   /api/tree/clear       - Clear tree" << std::endl;
    std::cout << "  GET    /api/tree/stats       - Get statistics" << std::endl;
    std::cout << "  GET    /api/tree/validate    - Validate tree" << std::endl;
    std::cout << "  POST   /api/tree/random      - Insert random" << std::endl;
    std::cout << std::endl;
    std::cout << "Press Ctrl+C to stop the server" << std::endl;
    std::cout << "================================" << std::endl;
    
    // Start server
    if (!server.listen("0.0.0.0", PORT)) {
        std::cerr << "Failed to start server on port " << PORT << std::endl;
        return 1;
    }
    
    return 0;
}
