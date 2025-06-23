cmake_minimum_required(VERSION 3.16)
project(RBTreeAPI)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Include directories
include_directories(src)

# Source files
set(SOURCES
    src/main.cpp
    src/api/tree_api.cpp
    src/utils/json_converter.cpp
)

# Create executable
add_executable(rbtree_server ${SOURCES})

# Download and include httplib
include(FetchContent)
FetchContent_Declare(
  httplib
  GIT_REPOSITORY https://github.com/yhirose/cpp-httplib.git
  GIT_TAG v0.14.0
)
FetchContent_MakeAvailable(httplib)

# Download and include nlohmann/json
FetchContent_Declare(
  json
  GIT_REPOSITORY https://github.com/nlohmann/json.git
  GIT_TAG v3.11.2
)
FetchContent_MakeAvailable(json)

# Link libraries
target_link_libraries(rbtree_server httplib::httplib nlohmann_json::nlohmann_json)

# Find threads
find_package(Threads REQUIRED)
target_link_libraries(rbtree_server Threads::Threads)
