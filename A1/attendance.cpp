#include <iostream>
#include <queue>
#include <stack>
#include <unordered_set>
#include <string>
#include <ctime>
#include <limits>
#include <utility>
using namespace std;
using namespace std;

streamsize BAD_INPUT_DISCARDING = numeric_limits<streamsize>::max();

// UTILS
tm *getLocalTime()
{
  time_t now = time(0);
  return localtime(&now);
}

string getDate(tm *ltm)
{
  char buffer[11];
  strftime(buffer, 11, "%Y-%m-%d", ltm);
  return buffer;
}

string getDay(tm *ltm)
{
  char dayBuf[10];
  strftime(dayBuf, 10, "%A", ltm);
  return dayBuf;
}

template <typename T>
inline void removeFromQueue(queue<T> &originalQueue, const T &elementToRemove)
{
  queue<T> temp;
  while (!originalQueue.empty())
  {
    T current = move(originalQueue.front());
    originalQueue.pop();
    if (current != elementToRemove)
      temp.push(move(current));
  }
  originalQueue = move(temp);
}

template <typename T>
bool safeInput(T &var)
{
  if (!(cin >> var))
  {
    cin.clear();
    cin.ignore(BAD_INPUT_DISCARDING, '\n');
    cout << "! Invalid input. Please try again.\n";
    return false;
  }
  return true;
}

// CORE SYSTEM
class AttendanceSystem
{
private:
  queue<int> entryOrder;
  unordered_set<int> present;
  stack<int> undoStack;
  string classname, grade, date, day;

public:
  AttendanceSystem(string c, string g) : classname(c), grade(g)
  {
    if (classname.empty()) classname = "Unknown Class";
    if (grade.empty()) grade = "Unknown Grade";

    tm *localeCurrentTime = getLocalTime();
    date = getDate(localeCurrentTime);
    day = getDay(localeCurrentTime);

    cout << "\n === Initialized Attendance System ===\n";
    cout << "Class: " << classname << "| Grade: " << grade << "\n";
    cout << "Date: " << date << " | Day: " << day << "\n";
  }

  // O(1): just insert operations
  void markAsAttend(int studentId)
  {
    if (present.count(studentId))
    {
      cout << "! Student " << studentId << " already marked present.\n";
      return;
    }
    entryOrder.push(studentId);
    present.insert(studentId);
    undoStack.push(studentId);
    cout << "Attendance marked for student " << studentId << ".\n";
  }

  // O(n): remove from queue is expensive
  void undoLast()
  {
    if (undoStack.empty())
    {
      cout << "! No attendance records to undo.\n";
      return;
    }

    int last = undoStack.top();
    undoStack.pop();
    present.erase(last);

    if (entryOrder.empty())
    {
      cout << "! Queue is empty, cannot undo.\n";
      cout << "DEV ERROR: DATA DESYNCHRONISED\n";
      return;
    }
    // lets remove from queue
    removeFromQueue<int>(entryOrder, last);
    cout << "Undo successful. Removed student " << last << ".\n";
  }

  // O(1): hashmap access
  bool isPresent(int studentId) const
  {
    return present.count(studentId);
  }

  void displayAttendance() const
  {
    if (entryOrder.empty())
    {
      cout << "No students present.\n";
      return;
    }

    cout << "\nStudent present (in order of arrival):\n";
    queue<int> temp = entryOrder;
    while (!temp.empty())
    {
      cout << temp.front();
      temp.pop();
      if (!temp.empty())
        cout << " -> ";
    }

    cout << "\nTotal: " << present.size() << " students.\n";
  }

  void showMetadata() const
  {
    cout << "\n--- Class Metadata ---\n";
    cout << "Class Name: " << classname << "\n";
    cout << "Grade: " << grade << "\n";
    cout << "Date: " << date << "\n";
    cout << "Day: " << day << "\n";
    cout << "Total present: " << entryOrder.size() << "\n";
    cout << "-----------------------\n";
  }

  bool getStudentIdInput(int &sid)
  {
    cout << "Enter studentId: ";
    if (!safeInput<int>(sid))
      return false;
    if (sid <= 0)
    {
      cout << "! Invalid StudentId. Must be a positive integer.\n";
      return false;
    }
    return true;
  }
};

// MAIN
int main()
{
  string classname, grade;
  cout << "Enter Class Name: ";
  getline(cin, classname);
  cout << "Enter Grade: ";
  getline(cin, grade);

  AttendanceSystem system(classname, grade);

  int choice;
  bool continueFlag = true;
  while (continueFlag)
  {
    cout << "\n========== 🎓 Student Attendance Management ==========\n";
    cout << "1. Mark Attendance\n";
    cout << "2. Undo Last Attendance\n";
    cout << "3. Check if Student is Present\n";
    cout << "4. Display All Attendance\n";
    cout << "5. Show Metadata\n";
    cout << "6. Exit\n";
    cout << "=====================================================\n";
    cout << "Enter your choice (1-6): ";
    if (!safeInput<int>(choice))
      break;

    switch (choice)
    {
    case 1:
    {
      int sid;
      if(!system.getStudentIdInput(sid)) break;
      system.markAsAttend(sid);
      break;
    }
    case 2:
    {
      system.undoLast();
      break;
    }
    case 3:
    {
      int sid;
      if(!system.getStudentIdInput(sid)) break;
      cout << (system.isPresent(sid) ? "Present\n" : "Absent\n");
      break;
    }
    case 4:
    {
      system.displayAttendance();
      break;
    }
    case 5:
    {
      system.showMetadata();
      break;
    }
    case 6:
    {
      cout << "Exiting Attendance System.\n";
      continueFlag = false;
      break;
    }
    default:
    {
      cout << "! Invalid choice. Please select between 1 and 6.\n";
    }
    }
  }
  return 0;
}