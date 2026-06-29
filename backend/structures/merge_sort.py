"""
=============================================================
 PHASE 2 — DSA Structure 6: MergeSort
 Rubric requirement: Sorting (at least one O(n log n) sort)
=============================================================

WHY MERGE SORT HERE?
  The `/stocks/<sym>/history` endpoint returns a stock's 90-day
  price history sorted by date. Merge Sort is:
    • Stable  — preserves chronological order for equal dates
    • O(n log n) worst-case  — no adversarial input degrades it
    • O(n) space  — acceptable for n ≤ 100,000 price ticks

  Python's built-in TimSort (used by sorted() and list.sort()) is
  also O(n log n) and faster in practice, but implementing Merge
  Sort explicitly satisfies the rubric requirement and demonstrates
  understanding of the divide-and-conquer paradigm.

DESIGN CONSIDERATIONS & EDGE CASES:
  1. Chronological Stability Maintenance:
     In time-series financial analysis, breaking the relative order of trades 
     executed at identical price points corrupts the historical timeline. Using 
     a protective lower-or-equal comparison operator (<=) inside the merge phase 
     guarantees strict stability retention.
     
  2. Recursive Stack Footprint & Memory Trades:
     Top-down partitioning allocates array slices on each recursive split. While 
     this introduces an temporary auxiliary space footprint of O(n), it remains highly 
     performant and memory-safe for your production data horizon of n <= 100,000.

  3. Polymorphic Evaluation Support:
     The historical record stream balances complex data layouts. Injecting a 
     functional 'key' companion function allows this module to sort symmetrically 
     by raw price scales, isolated timestamps, or custom object records without 
     mutating the underlying data structures.

COMPLEXITY:
  merge_sort(arr)   $O(n \log n)$ Worst, Best, and Average Time | $O(n)$ Auxiliary Space
  _merge(left, right)  $O(n)$ Linear Time | $O(n)$ Temporary Output Space
"""


def merge_sort(arr: list, key=None) -> list:
    """
    Classic top-down merge sort.

    Parameters
    ----------
    arr : list
        The list to sort. May contain any comparable elements.
    key : callable, optional
        A function of one argument used to extract a comparison key
        from each element (like sorted(..., key=...)).

    Returns
    -------
    list
        A new list sorted in ascending order.
    """
    if key is None:
        key = lambda x: x

    if len(arr) <= 1:
        return list(arr)

    mid = len(arr) // 2
    left_half = merge_sort(arr[:mid], key=key)
    right_half = merge_sort(arr[mid:], key=key)

    return _merge(left_half, right_half, key)


def _merge(left: list, right: list, key) -> list:
    """
    Merge two sorted lists into a single sorted list.
    O(n) time, O(n) space.
    """
    result = []
    i = j = 0

    while i < len(left) and j < len(right):
        if key(left[i]) <= key(right[j]):
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1

    # Append any remaining elements
    if i < len(left):
        result.extend(left[i:])
    if j < len(right):
        result.extend(right[j:])

    return result