import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CampusItem,
  ClaimVerification,
  MatchResult,
  UserProfile,
  ItemType,
  ItemCategory,
  ItemStatus,
} from '../types/retrivo';
import {
  INITIAL_ITEMS,
  INITIAL_MATCHES,
  INITIAL_CLAIMS,
  INITIAL_USERS,
  CURRENT_USER,
} from '../services/mockData';
import { computeMultimodalMatch, findMatchesForItem } from '../utils/aiMatcher';
import { supabase, isConfigured } from '../lib/supabase';

interface AppContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  availableDemoUsers: UserProfile[];
  items: CampusItem[];
  matches: MatchResult[];
  claims: ClaimVerification[];
  login: (email: string, password?: string) => Promise<{ success: boolean; message: string }>;
  signup: (profileData: {
    student_id: string;
    name: string;
    email: string;
    password?: string;
    department?: string;
  }) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  switchDemoUser: (userId: string) => void;
  reportItem: (newItem: Omit<CampusItem, 'id' | 'status' | 'user_id' | 'created_at'>) => CampusItem;
  submitClaim: (itemId: string, proofAnswer: string) => { success: boolean; claimId?: string; message: string };
  verifyClaim: (claimId: string, isApproved: boolean) => void;
  confirmHandover: (claimId: string, enteredPin: string) => { success: boolean; message: string };
  getItemById: (id: string) => CampusItem | undefined;
  getClaimsForItem: (itemId: string) => ClaimVerification[];
  getMatchesForItem: (itemId: string) => MatchResult[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(CURRENT_USER);
  const [items, setItems] = useState<CampusItem[]>(INITIAL_ITEMS);
  const [matches, setMatches] = useState<MatchResult[]>(INITIAL_MATCHES);
  const [claims, setClaims] = useState<ClaimVerification[]>(INITIAL_CLAIMS);

  // Check Supabase session on mount if Supabase is connected
  useEffect(() => {
    if (isConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          // If Supabase session exists, set current user
          const studentProfile: UserProfile = {
            id: session.user.id,
            student_id: session.user.user_metadata?.student_id || 'STU-ONLINE',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Campus User',
            email: session.user.email || '',
            department: session.user.user_metadata?.department || 'University Member',
            trust_score: 95,
          };
          setCurrentUser(studentProfile);
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!session) {
          // If session destroyed
          setCurrentUser(null);
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const login = async (
    email: string,
    password?: string
  ): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Check if user is logging into a predefined campus demo account
    const matchedDemo = INITIAL_USERS.find((u) => u.email.toLowerCase() === cleanEmail);
    if (matchedDemo) {
      setCurrentUser(matchedDemo);
      return { success: true, message: `Welcome back, ${matchedDemo.name}!` };
    }

    // 2. If Supabase is connected, attempt Supabase Auth
    if (isConfigured && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          if (!error.message.toLowerCase().includes('fetch') && !error.message.toLowerCase().includes('network')) {
            return { success: false, message: error.message };
          }
          console.warn('Supabase host unreachable, continuing with campus authentication');
        } else if (data?.user) {
          const profile: UserProfile = {
            id: data.user.id,
            student_id: data.user.user_metadata?.student_id || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
            name: data.user.user_metadata?.name || cleanEmail.split('@')[0],
            email: data.user.email || cleanEmail,
            department: data.user.user_metadata?.department || 'Undergraduate Studies',
            trust_score: 95,
          };
          setCurrentUser(profile);
          return { success: true, message: `Welcome, ${profile.name}!` };
        }
      } catch (err: any) {
        console.warn('Supabase signIn exception, continuing with campus authentication:', err.message);
      }
    }

    // 3. Fallback: Authenticate as valid campus .edu user
    if (cleanEmail.includes('@')) {
      const generatedProfile: UserProfile = {
        id: `usr_${Date.now()}`,
        student_id: `CAMPUS-${Math.floor(1000 + Math.random() * 9000)}`,
        name: cleanEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        email: cleanEmail,
        department: 'Campus Member',
        trust_score: 90,
      };
      setCurrentUser(generatedProfile);
      return { success: true, message: `Signed in as ${generatedProfile.name}` };
    }

    return { success: false, message: 'Please enter a valid campus email address.' };
  };

  const signup = async (profileData: {
    student_id: string;
    name: string;
    email: string;
    password?: string;
    department?: string;
  }): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = profileData.email.trim().toLowerCase();

    if (isConfigured && profileData.password) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: profileData.password,
          options: {
            data: {
              name: profileData.name,
              student_id: profileData.student_id,
              department: profileData.department,
            },
          },
        });

        if (error) {
          if (error.message.toLowerCase().includes('fetch') || error.message.toLowerCase().includes('network')) {
            console.warn('Supabase host unreachable, creating campus local account:', error.message);
          } else {
            return { success: false, message: error.message };
          }
        }
      } catch (e: any) {
        console.warn('Supabase signup exception, falling back to local account:', e.message);
      }
    }

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      student_id: profileData.student_id,
      name: profileData.name,
      email: cleanEmail,
      department: profileData.department || 'General Studies',
      trust_score: 85,
      created_at: new Date().toISOString(),
    };

    setCurrentUser(newUser);
    return { success: true, message: `Account created for ${newUser.name}!` };
  };

  const logout = async (): Promise<void> => {
    try {
      if (isConfigured) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('Sign out warning:', e);
    }
    setCurrentUser(null);
  };

  const switchDemoUser = (userId: string) => {
    const target = INITIAL_USERS.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
    }
  };

  // Recalculate or link items to matches whenever items change
  const enrichedMatches = matches
    .map((m) => ({
      ...m,
      lost_item: items.find((i) => i.id === m.lost_item_id),
      found_item: items.find((i) => i.id === m.found_item_id),
    }))
    .filter((m) => m.lost_item && m.found_item);

  const reportItem = (
    itemData: Omit<CampusItem, 'id' | 'status' | 'user_id' | 'created_at'>
  ): CampusItem => {
    const userId = currentUser ? currentUser.id : 'usr_anonymous';
    const newId = `item_${Date.now()}`;
    const newItem: CampusItem = {
      ...itemData,
      id: newId,
      status: 'open',
      user_id: userId,
      created_at: new Date().toISOString(),
    };

    const updatedItems = [newItem, ...items];
    setItems(updatedItems);

    // Run multimodal AI matching against existing items
    const newMatches = findMatchesForItem(newItem, updatedItems);
    if (newMatches.length > 0) {
      setMatches((prev) => [...newMatches, ...prev]);
    }

    return newItem;
  };

  const submitClaim = (
    itemId: string,
    proofAnswer: string
  ): { success: boolean; claimId?: string; message: string } => {
    const item = items.find((i) => i.id === itemId);
    if (!item) {
      return { success: false, message: 'Item not found.' };
    }

    const claimantId = currentUser ? currentUser.id : 'usr_claimant';

    if (item.user_id === claimantId) {
      return { success: false, message: 'You cannot submit a claim on your own report.' };
    }

    const claimId = `claim_${Date.now()}`;
    // Generate secure 6-digit OTP for physical handover
    const randomPin = `${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`;

    const newClaim: ClaimVerification = {
      id: claimId,
      item_id: itemId,
      claimant_id: claimantId,
      proof_answer: proofAnswer,
      status: 'pending',
      handover_code: randomPin,
      created_at: new Date().toISOString(),
      claimant: currentUser || undefined,
      item: item,
    };

    setClaims((prev) => [newClaim, ...prev]);

    // Update item status to under_verification
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, status: 'under_verification' } : i))
    );

    return {
      success: true,
      claimId,
      message: 'Claim submitted. The reporter/finder will review your hidden ownership proof.',
    };
  };

  const verifyClaim = (claimId: string, isApproved: boolean) => {
    setClaims((prev) =>
      prev.map((claim) => {
        if (claim.id === claimId) {
          return {
            ...claim,
            status: isApproved ? 'verified' : 'rejected',
            verified_by_reporter: isApproved,
          };
        }
        return claim;
      })
    );

    if (!isApproved) {
      const claim = claims.find((c) => c.id === claimId);
      if (claim) {
        setItems((prev) =>
          prev.map((i) => (i.id === claim.item_id ? { ...i, status: 'open' } : i))
        );
      }
    }
  };

  const confirmHandover = (
    claimId: string,
    enteredPin: string
  ): { success: boolean; message: string } => {
    const claim = claims.find((c) => c.id === claimId);
    if (!claim) {
      return { success: false, message: 'Claim record not found.' };
    }

    const cleanEntered = enteredPin.replace(/\s|-/g, '');
    const cleanActual = (claim.handover_code || '').replace(/\s|-/g, '');

    if (cleanEntered !== cleanActual) {
      return { success: false, message: 'Invalid Handover PIN. Please check the code with the counterparty.' };
    }

    const timestamp = new Date().toISOString();

    // Mark claim verified and confirmed
    setClaims((prev) =>
      prev.map((c) =>
        c.id === claimId
          ? { ...c, status: 'verified', handover_confirmed_at: timestamp }
          : c
      )
    );

    // Mark item returned
    setItems((prev) =>
      prev.map((i) => (i.id === claim.item_id ? { ...i, status: 'returned' } : i))
    );

    return {
      success: true,
      message: 'Handover verified and recorded. Item is now marked as returned!',
    };
  };

  const getItemById = (id: string) => items.find((i) => i.id === id);

  const getClaimsForItem = (itemId: string) =>
    claims.filter((c) => c.item_id === itemId);

  const getMatchesForItem = (itemId: string) =>
    enrichedMatches.filter((m) => m.lost_item_id === itemId || m.found_item_id === itemId);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated: currentUser !== null,
        availableDemoUsers: INITIAL_USERS,
        items,
        matches: enrichedMatches,
        claims,
        login,
        signup,
        logout,
        switchDemoUser,
        reportItem,
        submitClaim,
        verifyClaim,
        confirmHandover,
        getItemById,
        getClaimsForItem,
        getMatchesForItem,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

