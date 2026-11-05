// Simple local storage backend for testing
// No server required - works entirely in browser

class LocalBackend {
  constructor() {
    this.storageKey = 'smartcity_data'
    this.initData()
  }

  initData() {
    if (!localStorage.getItem(this.storageKey)) {
      const initialData = {
        issues: [],
        users: {},
        leaderboard: []
      }
      localStorage.setItem(this.storageKey, JSON.stringify(initialData))
    }
  }

  getData() {
    return JSON.parse(localStorage.getItem(this.storageKey) || '{}')
  }

  saveData(data) {
    localStorage.setItem(this.storageKey, JSON.stringify(data))
  }

  // Auth simulation
  async signInWithGoogle() {
    // Simulate Google sign-in with a mock user
    const mockUser = {
      uid: 'demo_user_' + Date.now(),
      email: 'demo@example.com',
      displayName: 'Demo User',
      photoURL: 'https://i.pravatar.cc/150?u=demo'
    }
    
    localStorage.setItem('currentUser', JSON.stringify(mockUser))
    return { data: { user: mockUser }, error: null }
  }

  async signOut() {
    localStorage.removeItem('currentUser')
    return { error: null }
  }

  onAuthStateChanged(callback) {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null')
    callback(user)
    return () => {} // Unsubscribe function
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null')
  }

  // Database operations
  async addDoc(collection, data) {
    const dbData = this.getData()
    const id = 'doc_' + Date.now()
    const doc = { id, ...data, createdAt: new Date().toISOString() }
    
    if (!dbData[collection]) {
      dbData[collection] = []
    }
    dbData[collection].push(doc)
    this.saveData(dbData)
    
    return { id, ...doc }
  }

  async getDocs(collection) {
    const dbData = this.getData()
    const docs = dbData[collection] || []
    
    return {
      docs: docs.map(doc => ({
        id: doc.id,
        data: () => doc
      })),
      empty: docs.length === 0
    }
  }

  // Leaderboard
  async updateUserPoints(userId, points) {
    const dbData = this.getData()
    
    if (!dbData.users[userId]) {
      dbData.users[userId] = {
        points: 0,
        badges: [],
        displayName: 'Demo User',
        email: 'demo@example.com'
      }
    }
    
    dbData.users[userId].points += points
    
    // Update leaderboard
    dbData.leaderboard = Object.entries(dbData.users)
      .map(([id, user]) => ({ id, ...user }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 5)
    
    this.saveData(dbData)
    return dbData.users[userId]
  }

  async getLeaderboard() {
    const dbData = this.getData()
    return dbData.leaderboard || []
  }
}

export const localBackend = new LocalBackend()

// Firebase-compatible interface
export const auth = {
  signInWithGoogle: () => localBackend.signInWithGoogle(),
  signOut: () => localBackend.signOut(),
  onAuthStateChanged: (callback) => localBackend.onAuthStateChanged(callback),
  currentUser: localBackend.getCurrentUser()
}

export const db = {
  collection: (name) => ({
    addDoc: (data) => localBackend.addDoc(name, data),
    getDocs: () => localBackend.getDocs(name)
  })
}

export const storage = {
  // Mock storage - returns placeholder URLs
  ref: (path) => ({
    put: async (file) => ({ ref: { fullPath: path } }),
    getDownloadURL: async () => 'https://picsum.photos/400/300?random=' + Date.now()
  })
}

export default localBackend
