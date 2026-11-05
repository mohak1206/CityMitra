import { motion } from "framer-motion";
import { Trophy, Medal, Star, Shield, Award } from "lucide-react";
import DefaultBadgeIcon from "./DefaultBadgeIcon";
import { Card } from "../ui";
import { useState, useEffect } from "react";
import { localDB } from "../../services/localStorage";

const BadgeIcon = ({ type }) => {
  switch (type) {
    case "guardian":
      return (
        <Shield className="w-4 h-4 text-blueprint" title="City Guardian" />
      );
    case "super_citizen":
      return <Star className="w-4 h-4 text-accent" title="Super Citizen" />;
    case "pothole_patrol":
      return <Award className="w-4 h-4 text-warning" title="Pothole Patrol" />;
    case "green_thumb":
      return <Award className="w-4 h-4 text-success" title="Green Thumb" />;
    default:
      return null;
  }
};

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Force update leaderboard first
        localDB.updateLeaderboard();
        
        // Get leaderboard from local storage
        const data = localDB.getLeaderboard();
        console.log("Leaderboard data:", data);

        if (data.length === 0) {
          // Check if there are any users in the system
          const users = JSON.parse(localStorage.getItem('smartcity_users') || '{}');
          const userCount = Object.keys(users).length;
          
          if (userCount > 0) {
            // Users exist but no points, show them with 0 points
            // Deduplicate by email first
            const uniqueUsers = {};
            Object.values(users).forEach(user => {
              if (user.email) {
                const existingUser = uniqueUsers[user.email];
                if (!existingUser || (user.points || 0) > (existingUser.points || 0)) {
                  uniqueUsers[user.email] = user;
                }
              }
            });
            
            const usersWithPoints = Object.values(uniqueUsers)
              .sort((a, b) => (b.points || 0) - (a.points || 0))
              .slice(0, 10)
              .map((user, index) => ({
                id: user.id,
                ...user,
                points: user.points || 0,
                badges: user.badges || [],
                avatar: user.photoURL || `https://i.pravatar.cc/150?u=${user.id}`,
                name: user.displayName || user.email?.split('@')[0] || "Anonymous",
                rank: index + 1,
              }));
            setLeaderboard(usersWithPoints);
          } else {
            // No users at all
            setLeaderboard([]);
          }
        } else {
          // Format users for display
          const users = data.map((user, index) => ({
            id: user.id,
            ...user,
            points: user.points || 0,
            badges: user.badges || [],
            avatar: user.photoURL || `https://i.pravatar.cc/150?u=${user.id}`,
            name: user.displayName || user.email?.split('@')[0] || "Anonymous",
            rank: index + 1,
          }));
          setLeaderboard(users);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
    
    // Listen for storage changes to update leaderboard
    const handleStorageChange = () => {
      fetchLeaderboard();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userPointsUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userPointsUpdated', handleStorageChange);
    };
  }, []);

  return (
    <Card hover={false} className="overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-warning flex items-center justify-center">
          <Trophy className="w-5 h-5 text-cream" />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold text-slate">
            Top Contributors
          </h3>
          <p className="text-sm text-slate-muted font-body">
            Citizens making a difference
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-slate-muted font-body">Loading leaderboard...</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="w-12 h-12 text-cream-muted mx-auto mb-4" />
          <p className="text-slate font-display font-semibold mb-2">
            Be the First!
          </p>
          <p className="text-slate-muted font-body text-sm">
            Submit your first report to start earning Impact Points and badges.
            You could be #1 on the leaderboard!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.slice(0, 5).map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 p-3 bg-cream-dark/30 border border-cream-muted hover:border-accent/30 transition-colors"
            >
              {/* Rank */}
              <div
                className={`
                                w-8 h-8 flex items-center justify-center font-display font-bold
                                ${index === 0 ? "text-warning bg-warning/10" : ""}
                                ${index === 1 ? "text-slate-muted bg-slate/10" : ""}
                                ${index === 2 ? "text-accent bg-accent/10" : ""}
                                ${index > 2 ? "text-slate-muted" : ""}
                            `}
              >
                {index + 1}
              </div>

              {/* Avatar */}
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 border-2 border-cream-muted rounded-full object-cover"
                />
              ) : (
                <DefaultBadgeIcon className="w-10 h-10" />
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-display font-medium text-slate truncate">
                    {user.name}
                  </h4>
                  {user.badges.map((badge) => (
                    <BadgeIcon key={badge} type={badge} />
                  ))}
                </div>
                <div className="text-xs text-slate-muted font-body">
                  {user.points} Impact Points
                </div>
              </div>

              {/* Medal for top 3 */}
              {index < 3 && (
                <Medal
                  className={`
                                    w-5 h-5
                                    ${index === 0 ? "text-warning" : ""}
                                    ${index === 1 ? "text-slate-muted" : ""}
                                    ${index === 2 ? "text-accent" : ""}
                                `}
                />
              )}
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-cream-muted text-center">
        <button className="font-display text-sm font-semibold text-accent hover:text-accent/80 transition-colors uppercase tracking-wider">
          View Global Rankings →
        </button>
      </div>
    </Card>
  );
}
