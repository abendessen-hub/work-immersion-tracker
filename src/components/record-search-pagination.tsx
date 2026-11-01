import SimpleButton from "./simple-button";

type RecordSearchPaginationProps = {
  id: string;
  query: string;
  onQueryChange: (value: string) => void;
  page: number;
  totalPages: number;
  resultCount: number;
  onPageChange: (page: number) => void;
};

function RecordSearchPagination({
  id,
  query,
  onQueryChange,
  page,
  totalPages,
  resultCount,
  onPageChange,
}: RecordSearchPaginationProps) {
  return (
    <div className="record-list-controls">
      <label className="form-field" htmlFor={`${id}-search`}>
        Search records
        <input
          id={`${id}-search`}
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search..."
        />
      </label>
      <span className="record-list-count">
        {resultCount} matching record{resultCount === 1 ? "" : "s"}
      </span>
      <div className="dashboard-inline-actions">
        <SimpleButton
          type="button"
          variant="secondary"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </SimpleButton>
        <span aria-live="polite">
          Page {page} of {totalPages}
        </span>
        <SimpleButton
          type="button"
          variant="secondary"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </SimpleButton>
      </div>
    </div>
  );
}

export default RecordSearchPagination;
