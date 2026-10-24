import type { ReactNode } from "react";

function renderModalBackdrop({
  hidden,
  children,
}: {
  hidden: boolean;
  children: ReactNode;
}) {
  return (
    <div className="modal-backdrop" hidden={hidden}>
      <div className="modal">{children}</div>
    </div>
  );
}

export default renderModalBackdrop;
