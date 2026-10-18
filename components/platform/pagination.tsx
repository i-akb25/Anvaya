"use client";
export function Pager({
  page,
  pages,
  total,
  onPage,
}: {
  page: number;
  pages: number;
  total: number;
  onPage: (p: number) => void;
}) {
  function move(next: number) {
    onPage(next);
    requestAnimationFrame(() => {
      const target = document.getElementById("lesson-page-start");
      target?.focus({ preventScroll: true });
      target?.scrollIntoView({ block: "start" });
    });
  }
  return (
    <div className="question-actions" aria-label="Lesson pages">
      <button
        className="button"
        disabled={page === 0}
        onClick={() => move(page - 1)}
      >
        Previous lessons
      </button>
      <span aria-live="polite">
        Page {page + 1}/{pages} · {total} items
      </span>
      <button
        className="button"
        disabled={page + 1 >= pages}
        onClick={() => move(page + 1)}
      >
        Next lessons
      </button>
    </div>
  );
}
