import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useAuth } from "../context/AuthContext";

type ActionCardProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  title: string;
  description: string;
  tag?: ReactNode;
  active?: boolean;
  accessLevel?: number;
};

function ActionCard({
  title,
  description,
  tag,
  accessLevel = 1,
  active = false,
  className = "",
  ...buttonProps
}: ActionCardProps) {
  const classes = ["action-card", active ? "active" : "", className]
    .filter(Boolean)
    .join(" ");
  const { user } = useAuth();
  if ((user ? user.accessId : 1) < accessLevel) {
    return <></>;
  }
  return (
    <button className={classes} type="button" {...buttonProps}>
      <h3 className="action-title">{title}</h3>
      <p className="action-desc">{description}</p>
      {tag ? <span className="action-tag">{tag}</span> : null}
    </button>
  );
}

export default ActionCard;
