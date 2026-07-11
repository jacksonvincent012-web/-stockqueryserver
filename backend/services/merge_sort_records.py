from typing import Any, Dict, List, Callable


class MergeSortRecords:
    """
    Merge Sort DSA Structure: Sort historical records.
    A stable, divide-and-conquer sorting algorithm with guaranteed O(N log N) time complexity.
    Used to sort out-of-sequence historical market data feeds, tick batches, or OHLC archives
    by timestamp, trading volume, or price levels.
    """

    @classmethod
    def sort(cls, records: List[Dict[str, Any]], sort_key: str = "timestamp", ascending: bool = True) -> List[Dict[str, Any]]:
        """
        Sort a list of historical records using the Merge Sort algorithm.
        Time complexity: O(N log N) worst, average, and best case.
        Space complexity: O(N) auxiliary space for merging.
        """
        if not records or len(records) <= 1:
            return records[:]

        mid = len(records) // 2
        left_half = cls.sort(records[:mid], sort_key=sort_key, ascending=ascending)
        right_half = cls.sort(records[mid:], sort_key=sort_key, ascending=ascending)

        return cls._merge(left_half, right_half, sort_key=sort_key, ascending=ascending)

    @classmethod
    def _merge(
        cls,
        left: List[Dict[str, Any]],
        right: List[Dict[str, Any]],
        sort_key: str,
        ascending: bool
    ) -> List[Dict[str, Any]]:
        merged: List[Dict[str, Any]] = []
        i = 0
        j = 0

        while i < len(left) and j < len(right):
            val_left = left[i].get(sort_key)
            val_right = right[j].get(sort_key)

            # Handle type coercion for comparison
            if isinstance(val_left, (int, float)) and isinstance(val_right, (int, float)):
                cmp_le = (val_left <= val_right) if ascending else (val_left >= val_right)
            else:
                str_l = str(val_left if val_left is not None else "")
                str_r = str(val_right if val_right is not None else "")
                cmp_le = (str_l <= str_r) if ascending else (str_l >= str_r)

            if cmp_le:
                merged.append(left[i])
                i += 1
            else:
                merged.append(right[j])
                j += 1

        # Append remaining elements
        while i < len(left):
            merged.append(left[i])
            i += 1
        while j < len(right):
            merged.append(right[j])
            j += 1

        return merged

    @classmethod
    def sort_custom(
        cls,
        records: List[Dict[str, Any]],
        comparator: Callable[[Dict[str, Any], Dict[str, Any]], bool]
    ) -> List[Dict[str, Any]]:
        """
        Sort historical records using a custom comparator function.
        comparator(a, b) should return True if element `a` should come before or equal to element `b`.
        """
        if not records or len(records) <= 1:
            return records[:]

        mid = len(records) // 2
        left_half = cls.sort_custom(records[:mid], comparator)
        right_half = cls.sort_custom(records[mid:], comparator)

        merged: List[Dict[str, Any]] = []
        i, j = 0, 0
        while i < len(left_half) and j < len(right_half):
            if comparator(left_half[i], right_half[j]):
                merged.append(left_half[i])
                i += 1
            else:
                merged.append(right_half[j])
                j += 1

        merged.extend(left_half[i:])
        merged.extend(right_half[j:])
        return merged
