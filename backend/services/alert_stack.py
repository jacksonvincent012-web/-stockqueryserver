import threading
from typing import Any, Dict, List, Optional


class AlertStack:
    """
    Stack DSA Structure: Alert history and undo.
    A thread-safe LIFO (Last-In-First-Out) stack designed to record triggered price alerts,
    user notifications, and system thresholds, enabling instant undo/revert actions in O(1) time.
    """

    def __init__(self, max_history: int = 1000):
        self.max_history = max_history
        self._stack: List[Dict[str, Any]] = []
        self._redo_stack: List[Dict[str, Any]] = []
        self._lock = threading.Lock()

    def push(self, alert_event: Dict[str, Any]) -> None:
        """
        Push a new alert event onto the top of the stack in O(1) time.
        Clears the redo stack when a new action occurs.
        """
        if not alert_event:
            return
        with self._lock:
            self._stack.append(alert_event)
            # Enforce history limit
            if len(self._stack) > self.max_history:
                self._stack.pop(0)
            # Clear redo history upon new action
            self._redo_stack.clear()

    def pop(self) -> Optional[Dict[str, Any]]:
        """
        Pop the most recent alert from the top of the stack in O(1) time.
        Can be used to undo or dismiss the latest notification.
        """
        with self._lock:
            if not self._stack:
                return None
            item = self._stack.pop()
            self._redo_stack.append(item)
            return item

    def undo(self) -> Optional[Dict[str, Any]]:
        """Alias for pop(), reverting the last recorded alert action."""
        return self.pop()

    def redo(self) -> Optional[Dict[str, Any]]:
        """Re-apply the last undone alert action from the redo stack."""
        with self._lock:
            if not self._redo_stack:
                return None
            item = self._redo_stack.pop()
            self._stack.append(item)
            return item

    def peek(self) -> Optional[Dict[str, Any]]:
        """Inspect the most recent alert without removing it from the stack."""
        with self._lock:
            return self._stack[-1] if self._stack else None

    def get_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Return the most recent alerts in LIFO order (newest first)."""
        with self._lock:
            return list(reversed(self._stack[-limit:]))

    def is_empty(self) -> bool:
        """Check if the alert history stack is empty."""
        with self._lock:
            return len(self._stack) == 0

    def size(self) -> int:
        """Return the current number of items in the stack."""
        with self._lock:
            return len(self._stack)

    def clear(self) -> None:
        """Clear both alert history and redo stacks."""
        with self._lock:
            self._stack.clear()
            self._redo_stack.clear()
