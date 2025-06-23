# File structure
RBT-Visualizer/
├── backend/                    # C++ REST API Server
│   ├── src/
│   │   ├── rbtree/            # Red-Black Tree implementation
│   │   │   ├── node.h
│   │   │   ├── tree.h
│   │   │   └── tree.tpp
│   │   ├── api/               # REST API
│   │   │   ├── tree_api.h
│   │   │   └── tree_api.cpp
│   │   ├── utils/
│   │   │   ├── json_converter.h
│   │   │   └── json_converter.cpp
│   │   └── main.cpp
│   ├── tests/
│   │   └── test_rbtree.cpp
│   └── Makefile
├── frontend/                  # Web Application
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── css/
│       │   ├── style.css
│       │   └── components.css
│       └── js/
│           ├── api/
│           ├── components/
│           ├── utils/
│           └── app.js
└── README.md


## Setup

# Backend
cd backend
make clean
make deps
make
./rbtree_server


# Frontend
cd frontend
python3 -m http.server 3000 

in localhost directory listing choose public directory

# ApiTest
curl http://localhost:8080/api/health

## ports 
frontend 3000
backend 8080

