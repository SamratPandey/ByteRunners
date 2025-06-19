const problemCodes = {
    "Linked List": {
      "C++": `#include <iostream>
  using namespace std;
  
  struct Node {
      int data;
      Node* next;
      Node(int val) : data(val), next(nullptr) {}
  };
  
  int main() {
      // Create a sample linked list
      Node* head = new Node(1);
      head->next = new Node(2);
      head->next->next = new Node(3);
      
      // Print the list
      Node* current = head;
      while(current != nullptr) {
          cout << current->data << " ";
          current = current->next;
      }
      return 0;
  }`,
      "Java": `class Main {
      static class Node {
          int data;
          Node next;
          Node(int data) {
              this.data = data;
              next = null;
          }
      }
      
      public static void main(String[] args) {
          // Create a sample linked list
          Node head = new Node(1);
          head.next = new Node(2);
          head.next.next = new Node(3);
          
          // Print the list
          Node current = head;
          while(current != null) {
              System.out.print(current.data + " ");
              current = current.next;
          }
      }
  }`,
      "Python": `class Node:
      def __init__(self, data):
          self.data = data
          self.next = None
  
  # Create a sample linked list
  head = Node(1)
  head.next = Node(2)
  head.next.next = Node(3)
  
  # Print the list
  current = head
  while current:
      print(current.data, end=" ")
      current = current.next`,
      "JavaScript": `class Node {
      constructor(data) {
          this.data = data;
          this.next = null;
      }
  }
  
  // Create a sample linked list
  const head = new Node(1);
  head.next = new Node(2);  head.next.next = new Node(3);
  
  // Print the list
  let current = head;
  while(current) {
      current = current.next;
  }`
    }
    // Add more problems here as needed
  };

  export default problemCodes;