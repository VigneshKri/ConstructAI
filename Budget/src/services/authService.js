// Mock authentication service - In production, replace with real API calls
const DEMO_USERS = [
  {
    id: 'user-1',
    email: 'admin@construction.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    phone: '+1-555-0101',
    department: 'Management'
  },
  {
    id: 'user-2',
    email: 'contractor@construction.com',
    password: 'contractor123',
    name: 'John Contractor',
    role: 'contractor',
    phone: '+1-555-0102',
    department: 'Field Operations'
  },
  {
    id: 'user-3',
    email: 'field@construction.com',
    password: 'field123',
    name: 'Jane Field',
    role: 'field_employee',
    phone: '+1-555-0103',
    department: 'Field Operations'
  }
];

export const authService = {
  login: async (credentials) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = DEMO_USERS.find(
      u => u.email === credentials.email && u.password === credentials.password
    );

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Don't send password back
    const { password, ...userData } = user;
    return {
      ...userData,
      token: `mock-token-${user.id}`,
      loginAt: new Date().toISOString()
    };
  },

  register: async (userData) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if email already exists
    const existingUser = DEMO_USERS.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const newUser = {
      id: `user-${Date.now()}`,
      ...userData,
      role: userData.role || 'field_employee',
      createdAt: new Date().toISOString()
    };

    // In a real app, this would save to database
    DEMO_USERS.push(newUser);

    const { password, ...userDataWithoutPassword } = newUser;
    return {
      ...userDataWithoutPassword,
      token: `mock-token-${newUser.id}`
    };
  },

  getAllUsers: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return DEMO_USERS.map(({ password, ...user }) => user);
  },

  updateUser: async (id, userData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const userIndex = DEMO_USERS.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    DEMO_USERS[userIndex] = { ...DEMO_USERS[userIndex], ...userData };
    const { password, ...updatedUser } = DEMO_USERS[userIndex];
    return updatedUser;
  },

  deleteUser: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const userIndex = DEMO_USERS.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    DEMO_USERS.splice(userIndex, 1);
    return { success: true };
  }
};
