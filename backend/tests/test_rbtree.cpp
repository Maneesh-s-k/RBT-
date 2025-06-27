#include "rbtree/tree.h"
#include <iostream>
#include <vector>
#include <cassert>
#include <random>
#include <algorithm>

void test_insert_and_search() {
    rbtree::RedBlackTree<int> tree;
    std::vector<int> values = {7, 3, 18, 10, 22, 8, 11, 26, 2, 6, 13};
    
    // Test insert
    for (int val : values) {
        tree.insert(val);
    }
    
    // Test search
    for (int val : values) {
        assert(tree.search(val) && "Value should be found");
    }
    
    // Test non-existent values
    assert(!tree.search(1) && "Value should not be found");
    assert(!tree.search(4) && "Value should not be found");
    assert(!tree.search(9) && "Value should not be found");
}

void test_inorder_traversal() {
    rbtree::RedBlackTree<int> tree;
    std::vector<int> values = {7, 3, 18, 10, 22, 8, 11, 26, 2, 6, 13};
    std::vector<int> expected = {2, 3, 6, 7, 8, 10, 11, 13, 18, 22, 26};
    std::vector<int> result;
    
    for (int val : values) {
        tree.insert(val);
    }
    
    tree.inorder([&result](const int& val) {
        result.push_back(val);
    });
    
    assert(result == expected && "Inorder traversal should match expected order");
}

void test_delete() {
    rbtree::RedBlackTree<int> tree;
    std::vector<int> values = {7, 3, 18, 10, 22, 8, 11, 26, 2, 6, 13};
    
    // Insert values
    for (int val : values) {
        tree.insert(val);
    }
    
    // Test deleting leaf node
    assert(tree.remove(2) && "Should delete leaf node");
    assert(!tree.search(2) && "Deleted value should not be found");
    
    // Test deleting node with one child
    assert(tree.remove(26) && "Should delete node with one child");
    assert(!tree.search(26) && "Deleted value should not be found");
    
    // Test deleting node with two children
    assert(tree.remove(18) && "Should delete node with two children");
    assert(!tree.search(18) && "Deleted value should not be found");
    
    // Test deleting non-existent value
    assert(!tree.remove(99) && "Should return false for non-existent value");
    
    // Verify remaining values
    std::vector<int> remaining = {3, 6, 7, 8, 10, 11, 13, 22};
    for (int val : remaining) {
        assert(tree.search(val) && "Remaining value should be found");
    }
}

void test_delete_and_traversal() {
    rbtree::RedBlackTree<int> tree;
    std::vector<int> values = {7, 3, 18, 10, 22, 8, 11, 26, 2, 6, 13};
    std::vector<int> expected = {3, 6, 7, 8, 10, 11, 13, 22};
    std::vector<int> result;
    
    // Insert and delete
    for (int val : values) {
        tree.insert(val);
    }
    tree.remove(2);
    tree.remove(18);
    tree.remove(26);
    
    // Verify inorder traversal
    tree.inorder([&result](const int& val) {
        result.push_back(val);
    });
    
    assert(result == expected && "Inorder traversal should match expected order after deletions");
}

void test_empty_and_clear() {
    rbtree::RedBlackTree<int> tree;
    
    // Test empty tree
    assert(tree.empty() && "New tree should be empty");
    assert(!tree.search(1) && "Empty tree search should return false");
    assert(!tree.remove(1) && "Empty tree remove should return false");
    
    // Test after insertion
    tree.insert(1);
    assert(!tree.empty() && "Tree should not be empty after insertion");
    
    // Test clear
    tree.clear();
    assert(tree.empty() && "Tree should be empty after clear");
    assert(!tree.search(1) && "Cleared tree search should return false");
    
    // Test multiple operations after clear
    std::vector<int> values = {5, 3, 7, 1, 9};
    for (int val : values) {
        tree.insert(val);
    }
    assert(!tree.empty() && "Tree should not be empty after insertions");
    
    tree.clear();
    assert(tree.empty() && "Tree should be empty after second clear");
    
    // Test operations after clear
    tree.insert(10);
    assert(!tree.empty() && "Tree should not be empty after post-clear insertion");
    assert(tree.search(10) && "Should find value inserted after clear");
}

void test_edge_cases() {
    rbtree::RedBlackTree<int> tree;
    
    // Single node operations
    tree.insert(1);
    assert(tree.search(1) && "Should find single node");
    assert(tree.remove(1) && "Should remove single node");
    assert(tree.empty() && "Should be empty after removing single node");
    
    // Duplicate values
    tree.insert(1);
    tree.insert(1);  // Duplicate insert - should be ignored
    assert(tree.search(1) && "Should find value after duplicate insert");
    assert(tree.size() == 1 && "Size should be 1 after duplicate insert");
    assert(tree.remove(1) && "Should remove the single occurrence");
    assert(tree.empty() && "Should be empty after removing the value");
    
    // Sequential vs Random insertions
    // Sequential
    for (int i = 1; i <= 10; i++) {
        tree.insert(i);
        assert(tree.search(i) && "Should find sequential insert");
    }
    tree.clear();
    
    // Random
    std::random_device rd;
    std::mt19937 gen(rd());
    std::vector<int> values(10);
    for (int i = 0; i < 10; i++) values[i] = i + 1;
    std::shuffle(values.begin(), values.end(), gen);
    
    for (int val : values) {
        tree.insert(val);
        assert(tree.search(val) && "Should find random insert");
    }
    
    // Large number of nodes
    tree.clear();
    const int LARGE_SIZE = 1000;
    for (int i = 0; i < LARGE_SIZE; i++) {
        tree.insert(i);
    }
    
    // Verify all values in large tree
    for (int i = 0; i < LARGE_SIZE; i++) {
        assert(tree.search(i) && "Should find value in large tree");
    }
    
    // Remove all values from large tree
    for (int i = 0; i < LARGE_SIZE; i++) {
        assert(tree.remove(i) && "Should remove value from large tree");
    }
    assert(tree.empty() && "Should be empty after removing all values");
}

int main() {
    try {
        test_insert_and_search();
        test_inorder_traversal();
        test_delete();
        test_delete_and_traversal();
        test_empty_and_clear();
        test_edge_cases();
        std::cout << "All tests passed!" << std::endl;
    } catch (const std::exception& e) {
        std::cerr << "Test failed: " << e.what() << std::endl;
        return 1;
    }
    return 0;
} 