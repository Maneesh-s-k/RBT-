# RBT-Visualizer

[![C++](https://img.shields.io/badge/C++-17-blue.svg)](https://isocpp.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black.svg)](https://vercel.com/)
[![Render](https://img.shields.io/badge/Deploy-Render-green.svg)](https://render.com/)

An interactive Red-Black Tree visualization tool with a C++ REST API backend and JavaScript frontend. Visualize tree operations in real-time with comprehensive performance tracking and testing.

## 🚀 Features

- **Interactive Tree Visualization**: Real-time rendering of Red-Black Tree operations
- **RESTful API**: C++ backend with comprehensive tree operations (insert, delete, search)
- **Performance Tracking**: Monitor operation performance and tree statistics
- **Comprehensive Testing**: 200+ lines of unit tests covering edge cases
- **Docker Support**: Containerized deployment for consistent environments
- **Modern UI**: Responsive web interface with keyboard shortcuts
- **Data Export**: Save and load tree states

## 🛠️ Technology Stack

### Frontend (Client-Side)
- **Language**: Vanilla JavaScript (ES6+)
- **Markup**: HTML5
- **Styling**: CSS3 with custom properties and animations
- **Visualization**: SVG for tree rendering
- **Architecture**: Component-based (TreeVisualizer, ControlPanel, StatsPanel)
- **Deployment**: Vercel

### Backend (Server-Side)
- **Language**: C++ (C++17 standard)
- **Compiler**: Clang++
- **HTTP Library**: cpp-httplib (header-only)
- **JSON Processing**: nlohmann/json (header-only)
- **Build System**: Make
- **Architecture**: RESTful API with TreeAPI class
- **Deployment**: Render (Docker containerized)

### Infrastructure & DevOps
- **Containerization**: Docker (Ubuntu 22.04 base)
- **Version Control**: Git + GitHub
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render
- **Environment Management**: Environment variables for API URL

## 🏗️ Architecture
    
```
RBT-Visualizer/
├── backend/                    # C++ REST API Server
│   ├── src/
│   │   ├── rbtree/            # Red-Black Tree implementation
│   │   │   ├── node.h         # Tree node structure
│   │   │   ├── tree.h         # Main tree interface
│   │   │   └── tree.tpp       # Template implementations
│   │   ├── api/               # REST API endpoints
│   │   │   ├── tree_api.h     # API interface
│   │   │   └── tree_api.cpp   # API implementation
│   │   ├── utils/             # Utility functions
│   │   │   ├── json_converter.h
│   │   │   └── json_converter.cpp
│   │   └── main.cpp           # Server entry point
│   ├── tests/                 # Unit tests
│   │   └── test_rbtree.cpp    # Comprehensive test suite
│   ├── CMakeLists.txt         # CMake configuration
│   ├── Dockerfile             # Docker containerization
│   └── Makefile               # Build automation
├── frontend/                  # Web Application
│   ├── public/
│   │   └── index.html         # Main HTML file
│   └── src/
│       ├── css/               # Styling
│       │   ├── style.css      # Main styles
│       │   └── components.css # Component styles
│       └── js/                # JavaScript modules
│           ├── api/           # API client
│           ├── components/    # UI components
│           ├── utils/         # Utility functions
│           └── app.js         # Main application
└── README.md
```

## 📋 Prerequisites

- **C++17** compatible compiler (Clang++ recommended)
- **CMake** 3.16 or higher
- **Make** (for build automation)
- **Python 3** (for local frontend server)
- **Docker** (for containerized deployment)

## 🛠️ Installation

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd RBT-Visualizer
   ```

2. **Build the backend**
   ```bash
   cd backend
   make clean
   make deps    # Install dependencies (httplib, nlohmann/json)
   make         # Build the project
   ```

3. **Run the server**
   ```bash
   ./rbtree_server
   ```

The backend will start on `http://localhost:8080`

### Frontend Setup

1. **Start the frontend server**
   ```bash
   cd frontend
   python3 -m http.server 3000
   ```

2. **Access the application**
   - Open your browser to `http://localhost:3000`
   - Navigate to the `public` directory in the file listing
   - Or directly access `http://localhost:3000/public/`

### Docker Deployment

```bash
# Build and run with Docker
cd backend
docker build -t rbt-visualizer .
docker run -p 8080:8080 rbt-visualizer
```

## 🚀 Usage

### API Endpoints

| Method   | Endpoint                  | Description                                 |
|----------|---------------------------|---------------------------------------------|
| `GET`    | `/api/health`             | Health check                                |
| `GET`    | `/api/tree`               | Get tree data                               |
| `POST`   | `/api/tree/insert`        | Insert a node (JSON body: `{"value": 10}`)  |
| `DELETE` | `/api/tree/delete`        | Delete a node (JSON body: `{"value": 10}`)  |
| `GET`    | `/api/tree/search/{value}`| Search for a node                           |
| `POST`   | `/api/tree/clear`         | Clear the tree                              |
| `GET`    | `/api/tree/stats`         | Get tree statistics                         |
| `GET`    | `/api/tree/validate`      | Validate tree properties                    |
| `POST`   | `/api/tree/random`        | Insert random node                          |

### Example API Usage

```bash
# Test connection
curl http://localhost:8080/api/health

# Insert a node
curl -X POST http://localhost:8080/api/tree/insert -H "Content-Type: application/json" -d '{"value": 10}'

# Search for a node
curl http://localhost:8080/api/tree/search/10

# Get tree statistics
curl http://localhost:8080/api/tree/stats
```

### Web Interface Features

- **Interactive Controls**: Insert, delete, and search nodes
- **Real-time Visualization**: Watch tree rebalancing in real-time
- **Performance Tracking**: Monitor operation performance
- **Keyboard Shortcuts**: Quick access to common operations
- **Data Export**: Save and load tree states
- **Statistics Panel**: View tree properties and metrics

## 🧪 Testing

Run the comprehensive test suite:

```bash
cd backend
make test
```

The test suite covers:
- Insert and search operations
- Delete operations with various node types
- Tree traversal and validation
- Edge cases and large datasets
- Memory management and cleanup

## 🔧 Configuration

### Port Configuration

- **Frontend**: Port 3000 (configurable)
- **Backend**: Port 8080 (configurable via environment variable)

## 📊 Performance

- **Insert/Delete/Search**: O(log n) time complexity
- **Tree Validation**: O(n) time complexity
- **Memory Usage**: Efficient node management with proper cleanup
- **API Response Time**: < 10ms for standard operations

**Built with ❤️ using C++17, JavaScript ES6+, and modern web technologies**

