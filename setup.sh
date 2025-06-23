#!/bin/bash

# Create the new directory structure
mkdir -p backend/src/rbtree backend/src/api backend/src/utils backend/tests backend/include
mkdir -p frontend/public frontend/src/css frontend/src/js/api frontend/src/js/components frontend/src/js/utils frontend/src/assets
mkdir -p docs/screenshots scripts

# Move existing files to appropriate locations
echo "Moving existing files..."

# Move RB Tree implementation to backend
mv include/rbtree/* backend/src/rbtree/
mv code.cc backend/tests/test_rbtree.cpp
mv Makefile backend/
mv README.md backend/

# Remove unnecessary files and directories
echo "Cleaning up unnecessary files..."
rm -rf test_rbt test_rbt_debug
rm -rf *.dSYM
rm -rf include/  # Now empty after moving files

# Create essential files
touch .gitignore
touch frontend/public/index.html
touch backend/CMakeLists.txt
touch docs/API.md
touch README.md

# Create a simple build script
cat > scripts/build.sh << 'EOF'
#!/bin/bash
cd backend
make clean
make
EOF

chmod +x scripts/build.sh

echo "Directory structure created successfully!"
echo "Current structure:"
tree -I '*.dSYM'
