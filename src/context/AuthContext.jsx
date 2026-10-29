// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    id: 'demo-student-id',
    full_name: 'Alex Morgan',
    email: 'alex.morgan@university.edu',
    role: 'student', // 'student' or 'staff'
    student_id: 'STU-2024-8842',
    major: 'B.S. Computer Science',
    department: 'School of Engineering',
    semester: 'Semester 5 (Fall 2026)',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  });
  const isLive = isSupabaseConfigured();
  const [loading, setLoading] = useState(isLive);

  // Load user profile from Supabase profiles table
  const fetchProfile = async (userId) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Could not fetch profile from Supabase:', error.message);
      } else if (data) {
        setProfile(data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  useEffect(() => {
    if (!isLive || !supabase) {
      return;
    }

    // 1. Check existing session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // 2. Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isLive]);

  // Sign In with email & password
  const signIn = async (email, password) => {
    if (!isLive || !supabase) {
      // Demo authentication simulation
      const isStaffRole = email.includes('staff') || email.includes('prof') || email.includes('faculty');
      const mockProfile = {
        id: `demo-${isStaffRole ? 'staff' : 'student'}-id`,
        full_name: isStaffRole ? 'Prof. Evelyn Reed' : 'Alex Morgan',
        email: email,
        role: isStaffRole ? 'staff' : 'student',
        student_id: isStaffRole ? null : 'STU-2024-8842',
        major: isStaffRole ? 'Faculty Advisor' : 'B.S. Computer Science',
        department: 'School of Engineering',
        avatar_url: isStaffRole
          ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      };
      setUser({ id: mockProfile.id, email: email });
      setProfile(mockProfile);
      return { data: { user: { email } }, error: null };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (data?.user) {
      await fetchProfile(data.user.id);
    }
    return { data, error };
  };

  // Sign Up with email, password and metadata
  const signUp = async (email, password, metadata) => {
    if (!isLive || !supabase) {
      // Demo simulation
      const mockProfile = {
        id: `demo-${metadata.role || 'student'}-${Date.now()}`,
        full_name: metadata.full_name || 'New User',
        email: email,
        role: metadata.role || 'student',
        student_id: metadata.student_id || 'STU-NEW',
        major: metadata.major || 'B.S. Computer Science',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      };
      setUser({ id: mockProfile.id, email });
      setProfile(mockProfile);
      return { data: { user: { email } }, error: null };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: metadata.full_name,
          role: metadata.role || 'student',
          student_id: metadata.student_id,
          major: metadata.major,
        },
      },
    });
    return { data, error };
  };

  // Sign Out
  const signOut = async () => {
    if (isLive && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile({
      id: 'demo-student-id',
      full_name: 'Alex Morgan',
      email: 'alex.morgan@university.edu',
      role: 'student',
      student_id: 'STU-2024-8842',
      major: 'B.S. Computer Science',
      department: 'School of Engineering',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    });
  };

  // Switch Role helper for testing permissions
  const switchRole = (newRole) => {
    setProfile((prev) => ({
      ...prev,
      role: newRole,
      full_name: newRole === 'staff' ? 'Prof. Evelyn Reed (Staff)' : 'Alex Morgan (Student)',
    }));
  };

  const isStaff = profile?.role === 'staff' || profile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: profile?.role || 'student',
        isStaff,
        loading,
        isLive,
        signIn,
        signUp,
        signOut,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
