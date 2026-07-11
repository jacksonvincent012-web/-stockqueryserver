import logging
import threading
import time
from typing import Optional
from .storage_manager import StorageManager

logger = logging.getLogger("ArchiveManager")


class ArchiveManager:
    """
    Background scheduler and utility for enforcing retention policies,
    archiving historical ticks (>30 days old), and keeping SQLite storage optimized.
    """

    def __init__(self, storage: Optional[StorageManager] = None, retention_days: int = 30):
        self.storage = storage or StorageManager()
        self.retention_days = retention_days
        self._stop_event = threading.Event()
        self._thread: Optional[threading.Thread] = None

    def run_archive_cycle(self) -> int:
        """Trigger an immediate archival cleanup cycle."""
        try:
            archived_count = self.storage.archive_old_ticks(retention_days=self.retention_days)
            if archived_count > 0:
                logger.info(f"ArchiveManager successfully archived/purged {archived_count} historical ticks.")
            return archived_count
        except Exception as e:
            logger.error(f"Error during archival cycle: {e}")
            return 0

    def start_background_task(self, interval_hours: float = 24.0) -> None:
        """Start a background daemon thread that runs archival cleanup periodically."""
        if self._thread and self._thread.is_alive():
            return

        self._stop_event.clear()

        def _worker():
            while not self._stop_event.is_set():
                self.run_archive_cycle()
                # Wait for the next interval or until stop event is set
                self._stop_event.wait(timeout=interval_hours * 3600)

        self._thread = threading.Thread(target=_worker, name="ArchiveManagerDaemon", daemon=True)
        self._thread.start()
        logger.info(f"ArchiveManager daemon started with interval={interval_hours}h.")

    def stop_background_task(self) -> None:
        """Stop the background archival thread."""
        if self._thread and self._thread.is_alive():
            self._stop_event.set()
            self._thread.join(timeout=5.0)
            logger.info("ArchiveManager daemon stopped.")
