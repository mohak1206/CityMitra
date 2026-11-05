// This file exports the default badge icon for leaderboard avatars
// Exported as a React component for easy use

import medal from "../../assets/medal.png";

export default function DefaultBadgeIcon({ className = "w-10 h-10" }) {
  return (
    <img
      src={medal}
      alt="Default Badge"
      className={className}
      style={{ borderRadius: "50%", background: "#fff" }}
    />
  );
}
