CXX = clang++
CXXFLAGS = -std=c++17 -Wall -Wextra -O2 -I./src
INCLUDES = -I./src

# For development with httplib and nlohmann/json (header-only)
HTTPLIB_URL = https://raw.githubusercontent.com/yhirose/cpp-httplib/v0.14.0/httplib.h
JSON_URL = https://raw.githubusercontent.com/nlohmann/json/v3.11.2/single_include/nlohmann/json.hpp

# Source files
SOURCES = src/main.cpp src/api/tree_api.cpp src/utils/json_converter.cpp
TARGET = rbtree_server
TEST_TARGET = test_rbt

all: deps $(TARGET)

# Download dependencies
deps:
	@mkdir -p include
	@if [ ! -f include/httplib.h ]; then \
		echo "Downloading httplib..."; \
		curl -s $(HTTPLIB_URL) -o include/httplib.h; \
	fi
	@if [ ! -f include/json.hpp ]; then \
		echo "Downloading nlohmann/json..."; \
		curl -s $(JSON_URL) -o include/json.hpp; \
	fi

$(TARGET): $(SOURCES)
	$(CXX) $(CXXFLAGS) -I./include $(SOURCES) -o $(TARGET) -lpthread

# Test target (your existing tests)
$(TEST_TARGET): tests/test_rbtree.cpp
	$(CXX) $(CXXFLAGS) tests/test_rbtree.cpp -o $(TEST_TARGET)

test: $(TEST_TARGET)
	./$(TEST_TARGET)

run: $(TARGET)
	./$(TARGET)

clean:
	rm -f $(TARGET) $(TEST_TARGET)

clean-deps:
	rm -rf include/

.PHONY: all deps test run clean clean-deps
