import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile, UserRole, AppRole } from '@/types/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  userRoles: AppRole[];
  loading: boolean;
  signOut: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
  hasMinimumRole: (role: AppRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRoles, setUserRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      setProfile(profileData);

      // Fetch user roles
      const { data: rolesData, error: rolesError } = await (supabase as any)
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
        return;
      }

      setUserRoles(rolesData?.map((r: any) => r.role as AppRole) || []);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const hasRole = (role: AppRole): boolean => {
    return userRoles.includes(role);
  };

  const getRoleLevel = (role: AppRole): number => {
    const levels: Record<AppRole, number> = {
      'resident': 1,
      'admin': 2,
      'super_admin': 3
    };
    return levels[role] || 0;
  };

  const hasMinimumRole = (minRole: AppRole): boolean => {
    const minLevel = getRoleLevel(minRole);
    return userRoles.some(role => getRoleLevel(role) >= minLevel);
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
    setUserRoles([]);
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (!session?.user) {
          setProfile(null);
          setUserRoles([]);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      profile, 
      userRoles,
      loading, 
      signOut, 
      fetchProfile,
      hasRole,
      hasMinimumRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};