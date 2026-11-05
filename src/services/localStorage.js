// Local Storage Backend Service - No Firebase
// Handles all data persistence using browser localStorage

const STORAGE_KEYS = {
  ISSUES: 'smartcity_issues',
  USERS: 'smartcity_users',
  CURRENT_USER: 'smartcity_current_user',
  LEADERBOARD: 'smartcity_leaderboard',
  NOTIFICATIONS: 'smartcity_notifications'
};

// Generate unique ID
const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Local Storage Service
export const localDB = {
  // Issues
  getIssues: () => {
    const data = localStorage.getItem(STORAGE_KEYS.ISSUES);
    return data ? JSON.parse(data) : [];
  },

  addIssue: async (issue) => {
    const issues = localDB.getIssues();
    const newIssue = {
      id: generateId(),
      ...issue,
      createdAt: new Date().toISOString(),
      status: issue.status || 'open',
      aiAnalysis: issue.aiAnalysis || {
        detectedLabels: [],
        summary: '',
        verified: false,
        confidenceScore: 0
      }
    };
    issues.push(newIssue);
    localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(issues));
    return newIssue;
  },

  updateIssue: async (id, updates) => {
    const issues = localDB.getIssues();
    const index = issues.findIndex(i => i.id === id);
    if (index !== -1) {
      issues[index] = { ...issues[index], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(issues));
      return issues[index];
    }
    return null;
  },

  deleteIssue: async (id) => {
    const issues = localDB.getIssues();
    const filtered = issues.filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(filtered));
    return true;
  },

  // Users & Gamification
  getUser: (userId) => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '{}');
    return users[userId] || null;
  },

  updateUserPoints: async (userId, userData, points) => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '{}');
    
    // Check if user already exists to avoid duplication
    if (!users[userId]) {
      users[userId] = {
        id: userId,
        points: 0,
        badges: [],
        issueCounts: {},
        reportsSubmitted: 0,
        ...userData
      };
    }

    // Cumulative points - add to existing points
    users[userId].points += points;
    users[userId].reportsSubmitted += 1;
    
    // Update issue counts
    const issueType = userData.issueType || 'other';
    users[userId].issueCounts[issueType] = (users[userId].issueCounts[issueType] || 0) + 1;
    
    // Check for badges
    const currentPoints = users[userId].points;
    if (currentPoints >= 500 && !users[userId].badges.includes('guardian')) {
      users[userId].badges.push('guardian');
    }
    if (currentPoints >= 100 && !users[userId].badges.includes('contributor')) {
      users[userId].badges.push('contributor');
    }
    if (currentPoints >= 50 && !users[userId].badges.includes('reporter')) {
      users[userId].badges.push('reporter');
    }

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    // Update leaderboard
    localDB.updateLeaderboard();
    
    // Trigger event to notify components
    window.dispatchEvent(new CustomEvent('userPointsUpdated', { 
      detail: { userId, points: users[userId].points } 
    }));
    
    return users[userId];
  },

  updateLeaderboard: () => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '{}');
    
    // Deduplicate users by email (keep the one with highest points)
    const uniqueUsers = {};
    Object.values(users).forEach(user => {
      if (user.email) {
        const existingUser = uniqueUsers[user.email];
        if (!existingUser || user.points > existingUser.points) {
          uniqueUsers[user.email] = user;
        }
      }
    });
    
    const leaderboard = Object.values(uniqueUsers)
      .sort((a, b) => b.points - a.points)
      .slice(0, 10)
      .map((user, index) => ({
        rank: index + 1,
        ...user
      }));
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(leaderboard));
    return leaderboard;
  },

  getLeaderboard: () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADERBOARD) || '[]');
  },

  // Auth - Prevent duplicate users
  setCurrentUser: (user) => {
    // Check if user already exists in users collection
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '{}');
    
    if (user && user.uid && !users[user.uid]) {
      // Add new user to collection if not exists
      users[user.uid] = {
        id: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        points: 0,
        badges: [],
        issueCounts: {},
        reportsSubmitted: 0,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
    
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  },

  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || 'null');
  },

  clearCurrentUser: () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  // Notifications
  getNotifications: (userId) => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
    return all.filter(n => n.userId === userId).sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  },

  addNotification: (notification) => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
    all.push({
      id: generateId(),
      ...notification,
      createdAt: new Date().toISOString(),
      read: false
    });
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
  },

  // Export/Import for backup
  exportData: () => {
    return {
      issues: localDB.getIssues(),
      users: JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '{}'),
      leaderboard: localDB.getLeaderboard(),
      exportDate: new Date().toISOString()
    };
  },

  importData: (data) => {
    if (data.issues) localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(data.issues));
    if (data.users) localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data.users));
    if (data.leaderboard) localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(data.leaderboard));
  },

  // Clear all data
  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  }
};

export default localDB;
