CXX = g++
CXXFLAGS = -std=c++17 -Wall -Wextra
INCLUDES = -I.

all: test_rbt

test_rbt: code.cc include/rbtree/tree.h include/rbtree/node.h
	$(CXX) $(CXXFLAGS) $(INCLUDES) code.cc -o test_rbt

test: test_rbt
	./test_rbt

clean:
	rm -f test_rbt

.PHONY: all test clean 