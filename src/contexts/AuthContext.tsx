import {
  createContext,
  useContext,
  useEffect,
  useState,
  type JSX,
  type ReactNode,
} from "react";
import { authService } from "../services/authService";
import type {
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthData,
} from "../types/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps): JSX.Element => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Global auth state for debugging
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).authState = {
      user,
      token,
      isAuthenticated: !!user && !!token,
    };
  }, [user, token]);

  useEffect(() => {
    // Check if user is already logged in on app start
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem("authToken");
        const storedUser = localStorage.getItem("userData");

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);

          // Validate token with backend
          await authService.getProfile();
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Auth initialization error:", error);
        // Clear invalid stored data
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      const authData: AuthData = await authService.login(credentials);

      // Store in localStorage first
      localStorage.setItem("authToken", authData.token);
      localStorage.setItem("userData", JSON.stringify(authData.user));

      // Then update state
      setToken(authData.token);
      setUser(authData.user);
      // eslint-disable-next-line no-useless-catch
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      const authData: AuthData = await authService.register(credentials);

      // Store in localStorage first
      localStorage.setItem("authToken", authData.token);
      localStorage.setItem("userData", JSON.stringify(authData.user));

      // Then update state
      setToken(authData.token);
      setUser(authData.user);
      // eslint-disable-next-line no-useless-catch
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    setToken(null);
    setUser(null);

    // Clear localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
  };

  const updateUser = async (userData: Partial<User>): Promise<void> => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await authService.updateProfile(userData);
      const updatedUser = response.user;

      setUser(updatedUser);
      localStorage.setItem("userData", JSON.stringify(updatedUser));
    } catch (error) {
      throw error;
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await authService.getProfile();
      const refreshedUser = response.user;

      setUser(refreshedUser);
      localStorage.setItem("userData", JSON.stringify(refreshedUser));
    } catch (error) {
      // If refresh fails, logout
      logout();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
