from typing import Any, Dict, List, Optional, Tuple


class HistoricalBinarySearch:
    """
    Binary Search DSA Structure: Search sorted historical data.
    Provides logarithmic O(log N) time complexity algorithms to search sorted arrays
    of historical ticks or OHLC candlesticks by timestamp, price target, or volume threshold.
    """

    @staticmethod
    def find_by_timestamp(records: List[Dict[str, Any]], target_timestamp: str) -> Optional[Dict[str, Any]]:
        """
        Perform exact Binary Search on a timestamp-sorted array of historical records.
        Time complexity: O(log N).
        """
        if not records or not target_timestamp:
            return None

        left = 0
        right = len(records) - 1

        while left <= right:
            mid = (left + right) // 2
            mid_ts = str(records[mid].get("timestamp", ""))

            if mid_ts == target_timestamp:
                return records[mid]
            elif mid_ts < target_timestamp:
                left = mid + 1
            else:
                right = mid - 1

        return None

    @staticmethod
    def find_closest_timestamp(records: List[Dict[str, Any]], target_timestamp: str) -> Optional[Dict[str, Any]]:
        """
        Perform Binary Search to find the historical record with the closest timestamp
        to the target if an exact match does not exist.
        Time complexity: O(log N).
        """
        if not records or not target_timestamp:
            return None

        left = 0
        right = len(records) - 1
        closest_record = records[0]

        while left <= right:
            mid = (left + right) // 2
            current = records[mid]
            mid_ts = str(current.get("timestamp", ""))

            # Update closest record if current is closer
            if abs(len(mid_ts) - len(target_timestamp)) == 0:  # Lexicographical check for ISO strings
                closest_record = current

            if mid_ts == target_timestamp:
                return current
            elif mid_ts < target_timestamp:
                left = mid + 1
            else:
                right = mid - 1

        return closest_record

    @staticmethod
    def find_price_threshold(records: List[Dict[str, Any]], target_price: float, key: str = "close") -> int:
        """
        Use Binary Search on a price-sorted array to find the first index where price >= target_price.
        Returns -1 if all elements are less than target_price.
        Time complexity: O(log N).
        """
        if not records:
            return -1

        left = 0
        right = len(records) - 1
        result = -1

        while left <= right:
            mid = (left + right) // 2
            val = float(records[mid].get(key, records[mid].get("price", 0.0)))

            if val >= target_price:
                result = mid
                right = mid - 1  # Look for earlier occurrence
            else:
                left = mid + 1

        return result

    @staticmethod
    def find_range_by_timestamp(records: List[Dict[str, Any]], start_ts: str, end_ts: str) -> List[Dict[str, Any]]:
        """
        Use Binary Search to locate the slice indices for a specific timestamp window [start_ts, end_ts].
        Time complexity: O(log N + K) where K is number of matching records.
        """
        if not records or not start_ts or not end_ts:
            return []

        # Find lower bound
        left, right = 0, len(records) - 1
        start_idx = len(records)
        while left <= right:
            mid = (left + right) // 2
            if str(records[mid].get("timestamp", "")) >= start_ts:
                start_idx = mid
                right = mid - 1
            else:
                left = mid + 1

        # Find upper bound
        left, right = 0, len(records) - 1
        end_idx = -1
        while left <= right:
            mid = (left + right) // 2
            if str(records[mid].get("timestamp", "")) <= end_ts:
                end_idx = mid
                left = mid + 1
            else:
                right = mid - 1

        if start_idx <= end_idx and 0 <= start_idx < len(records):
            return records[start_idx : end_idx + 1]
        return []
