#include "httplib.h"
#include "api/tree_api.h"
#include <iostream>
#include <signal.h>

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
    httplib::Server server;
    server_ptr = &server;
    
    // Setup signal handlers
    signal(SIGINT, signalHandler);
    signal(SIGTERM, signalHandler);
    
    TreeAPI treeAPI;
    
    // Setup API routes
    treeAPI.setupRoutes(server);
    
    // Serve static files (frontend)
    server.set_mount_point("/", "../frontend/public");
    
    const int PORT = 8080;
    std::cout << "🌳 Red-Black Tree API Server" << std::endl;
    std::cout << "================================" << std::endl;
    std::cout << "Server starting on http://localhost:" << PORT << std::endl;
    std::cout << "API Base URL: http://localhost:" << PORT << "/api" << std::endl;
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
    
    if (!server.listen("0.0.0.0", PORT)) {
        std::cerr << "Failed to start server on port " << PORT << std::endl;
        return 1;
    }
    
    return 0;
}
