type LoginResult = {
  token: string;
  role: 'admin' | 'user';
};

export const login = async (username: string, password: string): Promise<LoginResult> => {
  // MOCK DATA
  if (username === 'admin' && password === '123') {
    const result = {
      token: 'admin-token',
      role: 'admin' as const,
    };
    localStorage.setItem('auth', JSON.stringify(result));
    return result;
  }

  if (username === 'user' && password === '123') {
    const result = {
      token: 'user-token',
      role: 'user' as const,
    };
    localStorage.setItem('auth', JSON.stringify(result));
    return result;
  }

  throw new Error('Login failed');
};
