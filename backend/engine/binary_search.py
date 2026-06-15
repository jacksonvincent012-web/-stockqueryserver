"""BinarySearch — Hand-written O(log n) search on sorted arrays."""


def binary_search(sorted_arr, target):
    """
    Search for target in sorted array.
    O(log n) time, O(1) space.
    Returns index if found, -1 otherwise.
    """
    left, right = 0, len(sorted_arr) - 1

    while left <= right:
        mid = (left + right) // 2
        mid_val = sorted_arr[mid]

        if mid_val == target:
            return mid
        elif mid_val < target:
            left = mid + 1
        else:
            right = mid - 1

    return -1


def binary_search_leftmost(sorted_arr, target):
    """Find leftmost occurrence of target. O(log n). Returns -1 if not found."""
    left, right = 0, len(sorted_arr) - 1
    result = -1

    while left <= right:
        mid = (left + right) // 2
        if sorted_arr[mid] == target:
            result = mid
            right = mid - 1
        elif sorted_arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    return result


def binary_search_rightmost(sorted_arr, target):
    """Find rightmost occurrence of target. O(log n). Returns -1 if not found."""
    left, right = 0, len(sorted_arr) - 1
    result = -1

    while left <= right:
        mid = (left + right) // 2
        if sorted_arr[mid] == target:
            result = mid
            left = mid + 1
        elif sorted_arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    return result


def binary_search_range(sorted_arr, target):
    """Find [leftmost, rightmost] indices of target. Returns [-1, -1] if not found."""
    left_idx = binary_search_leftmost(sorted_arr, target)
    if left_idx == -1:
        return [-1, -1]
    right_idx = binary_search_rightmost(sorted_arr, target)
    return [left_idx, right_idx]
