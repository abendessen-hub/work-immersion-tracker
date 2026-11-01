import { useMemo, useState } from "react";

const pageSize = 20;

export function useRecordPagination<T>(
  records: T[],
  searchFields: readonly (keyof T)[],
) {
  const [query, setQuery] = useState("");
  const [requestedPage, setRequestedPage] = useState(1);
  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return records;
    return records.filter((record) =>
      searchFields.some((field) =>
        String(record[field] ?? "")
          .toLocaleLowerCase()
          .includes(normalizedQuery),
      ),
    );
  }, [query, records, searchFields]);
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const pageRecords = useMemo(
    () =>
      filteredRecords.slice((page - 1) * pageSize, page * pageSize),
    [filteredRecords, page],
  );

  const updateQuery = (value: string) => {
    setQuery(value);
    setRequestedPage(1);
  };

  return {
    query,
    setQuery: updateQuery,
    page,
    setPage: setRequestedPage,
    totalPages,
    resultCount: filteredRecords.length,
    filteredRecords,
    pageRecords,
  };
}
