import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useAuth } from "../context/useAuth";

type ActionCardProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  title: string;
  description: string;
  tag?: ReactNode;
  active?: boolean;
  accessLevels?: number[];
};

function ActionCard({
  title,
  description,
  tag,
  accessLevels = [1],
  active = false,
  className = "",
  ...buttonProps
}: ActionCardProps) {
  const classes = ["action-card", active ? "active" : "", className]
    .filter(Boolean)
    .join(" ");
  const { user } = useAuth();
  if (!accessLevels.includes(user ? user.accessId : 1)) {
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
