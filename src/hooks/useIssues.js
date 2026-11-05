import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook for fetching and managing issues from Firestore
 */
export function useIssues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // TODO: Replace with local backend or mock data
    setLoading(false);
    setIssues([]); // Empty or mock data
    // setError(null); // Uncomment if you want to simulate error
  }, []);

  const refetch = useCallback(() => {
    setLoading(true);
    // TODO: Replace with local backend or mock data
    setIssues([]); // Empty or mock data
    setLoading(false);
  }, []);

  return { issues, loading, error, refetch };
}

/**
 * Custom hook for managing issue filters
 */
export function useIssueFilters(initialFilters = {}) {
  const [filters, setFilters] = useState({
    status: "all",
    type: "all",
    search: "",
    ...initialFilters,
  });

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      status: "all",
      type: "all",
      search: "",
    });
  }, []);

  const applyFilters = useCallback(
    (issues) => {
      return issues.filter((issue) => {
        if (filters.status !== "all" && issue.status !== filters.status) {
          return false;
        }
        if (filters.type !== "all" && issue.type !== filters.type) {
          return false;
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          return (
            issue.description.toLowerCase().includes(searchLower) ||
            issue.location.address.toLowerCase().includes(searchLower)
          );
        }
        return true;
      });
    },
    [filters],
  );

  return { filters, updateFilter, resetFilters, applyFilters };
}

export default { useIssues, useIssueFilters };
