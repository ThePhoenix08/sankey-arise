#include <iostream>
#include <bits/stdc++.h>
using namespace std;

// UTILS
tm* getLocalTime() {
  time_t now = time(0);
  return localtime(&now);
}

string getDate(tm* ltm) {
  char buffer[11];
  strftime(buffer, 11, "%Y-%m-%d", ltm);
  return buffer;
}
 
string getDay(tm* ltm) {
  char dayBuf[10];
  strftime(dayBuf, 10, "%A", ltm);
  return dayBuf;
}

template <typename T>
inline void removeFromQueue(queue<T>& originalQueue, const T& elementToRemove) {
  queue<T> temp;
  while(!originalQueue.empty()) {
    T current = move(originalQueue.front());
    originalQueue.pop();
    if (current != elementToRemove) temp.push(move(current));
  }
  originalQueue = move(temp);
}

// CORE SYSTEM
class AttendanceSystem {
private:
  queue<int> entryOrder;
  unordered_set<int> present;
  stack<int> undoStack;
  string classname, grade, date, day;

public:
  AttendanceSystem(string c, string g): classname(c), grade(g) {
    // Get current date and day
    tm *localeCurrentTime = getLocalTime();
    date = getDate(localeCurrentTime);
    day = getDate(localeCurrentTime);

    cout << "\n === Initialized Attendance System ===\n";
    cout << "Class: " << classname << "| Grade: " << grade << "\n";
    cout << "Date: " << date << " | Day: " << day << "\n";
  }

  void markAsAttend(int studentId) {
    if (present.count(studentId)) {
      cout << "! Student " << studentId << " already marked present.\n";
      return;
    }
    entryOrder.push(studentId);
    present.insert(studentId);
    undoStack.push(studentId);
    cout << "Attendance marked for student " << studentId << ".\n";
  }

  void undoLast() {
    if (undoStack.empty()) {
      cout << "! No attendance records to undo.\n";
      return;
    }

    int last = undoStack.top();
    undoStack.pop();
    present.erase(last);

    // lets remove from queue
    removeFromQueue<int>(entryOrder, last);
    cout << "Undo successful. Removed student " << last << ".\n";
  }

  bool isPresent(int studentId) const {
    return present.count(studentId);
  }

  void displayAttendance() const {
    if (entryOrder.empty()) {
      cout << "No students present.\n";
      return;
    }

    cout << "\nStudent present (in order of arrival):\n";
    queue<int> temp = entryOrder;
    while(!temp.empty()) {
      cout << temp.front();
      temp.pop();
      if (!temp.empty()) cout << " -> ";
    }

    cout << "\nTotal: " << present.size() << " students.\n";
  }

  void showMetadata() const {
    cout << "\n--- Class Metadata ---\n";
    cout << "Class Name: " << classname << "\n";
    cout << "Grade: " << grade << "\n";
    cout << "Date: " << date << "\n";
    cout << "Day: " << day << "\n";
    cout << "Total present: " << entryOrder.size() << "\n";
    cout << "-----------------------\n";
  }
};

// MAIN
int main() {
  string classname, grade;
  cout << "Enter Class Name: ";
  getline(cin, classname);
  cout << "Enter Grade: ";
  getline(cin, grade);

  AttendanceSystem system(classname, grade);

  int choice;
  bool continueFlag = true;
  while (continueFlag) {
    cout << "\n========== 🎓 Student Attendance Management ==========\n";
    cout << "1. Mark Attendance\n";
    cout << "2. Undo Last Attendance\n";
    cout << "3. Check if Student is Present\n";
    cout << "4. Display All Attendance\n";
    cout << "5. Show Metadata\n";
    cout << "6. Exit\n";
    cout << "=====================================================\n";
    cout << "Enter your choice (1-6): ";
    cin >> choice;

    switch (choice) {
      case 1: {
        int sid;
        cout << "Enter studentId: ";
        cin >> sid;
        system.markAsAttend(sid);
        break;
      }
      case 2: {
        system.undoLast();
        break;
      }
      case 3: {
        int sid;
        cout << "Enter studentId to check: ";
        cin >> sid;
        cout << (system.isPresent(sid) ? "Present\n" : "Absent\n");
        break;
      }
      case 4: {
        system.displayAttendance();
        break;
      }
      case 5: {
        system.showMetadata();
        break;
      }
      case 6: {
        cout << "Exiting Attendance System.\n";
        continueFlag = false;
        break;
      }
      default: {
        cout << "! Invalid choice. Please select between 1 and 6.\n";
      }
    }
  }
  return 0;
}