import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useAuth } from "../context/useAuth";

type ActionCardProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  title: string;
  description: string;
  tag?: ReactNode;
  icon?: ReactNode;
  active?: boolean;
  accessLevels?: number[];
};

function ActionCard({
  title,
  description,
  tag,
  icon,
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
      <div className="action-card-head">
        {icon ? (
          <span className="action-icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        {tag ? <span className="action-tag">{tag}</span> : null}
      </div>

      <div className="action-card-body">
        <h3 className="action-title">{title}</h3>
        <p className="action-desc">{description}</p>
      </div>

      <div className="action-card-foot" aria-hidden="true">
        <span className="action-cta">Open module</span>
        <span className="action-arrow">→</span>
      </div>
    </button>
  );
}

export default ActionCard;
