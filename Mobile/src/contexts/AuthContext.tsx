// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  PropsWithChildren,
} from 'react';

// Context가 가지게 될 값들의 타입을 정의합니다.
interface AuthContextType {
  user: object | null; // user가 있으면 로그인, null이면 로그아웃 상태
  login: () => void;
  logout: () => void;
}

// Context 생성. 초기값은 undefined.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 앱 전체를 감싸서 user, login, logout 값을 제공할 Provider 컴포넌트
export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<object | null>(null);

  // 지금은 간단하게 가짜 유저 객체를 설정하여 로그인 시뮬레이션
  const login = () => {
    setUser({ name: 'planMateUser' });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 다른 컴포넌트에서 쉽게 Context 값을 사용하기 위한 Custom Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
