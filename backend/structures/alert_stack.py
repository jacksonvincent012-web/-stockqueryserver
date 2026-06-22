"""AlertStack — LIFO alert stack with undo capability."""


class Alert:
    def __init__(self, symbol, threshold, triggered=False):
        self.symbol = symbol
        self.threshold = threshold
        self.triggered = triggered


class AlertStack:
    def __init__(self):
        self.stack = []
        self.undo_stack = []  # for undo operation

    def push(self, alert):
        """Add alert to top of stack. O(1)."""
        self.stack.append(alert)
        self.undo_stack.clear()  # clear undo history on new push

    def pop(self):
        """Remove and return top alert. O(1). Raises IndexError if empty."""
        if not self.stack:
            raise IndexError("Cannot pop from empty stack")
        self.undo_stack.append(self.stack.pop())
        return self.undo_stack[-1]

    def peek(self):
        """Return top alert without removing. O(1). Returns None if empty."""
        return self.stack[-1] if self.stack else None

    def undo(self):
        """Restore last popped alert. O(1). Returns True if undo succeeded."""
        if not self.undo_stack:
            return False
        self.stack.append(self.undo_stack.pop())
        return True

    def all_alerts(self):
        """Return all alerts as list. O(n)."""
        return list(self.stack)

    def size(self):
        """Return number of alerts in stack. O(1)."""
        return len(self.stack)

    def is_empty(self):
        """Check if stack is empty. O(1)."""
        return len(self.stack) == 0
