import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { authService } from '../services/auth';
import { supabase } from '../services/supabase';

interface AuthContextType {
    user: UserProfile | null;
    loading: boolean;
    signIn: typeof authService.signIn;
    signUp: typeof authService.signUp;
    signOut: () => Promise<void>;
    updateLocalUser: (updates: Partial<UserProfile>) => void;
    refreshProfile: () => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(() => {
        // Optimistic Initialization
        try {
            const cached = localStorage.getItem('user_profile');
            return cached ? JSON.parse(cached) : null;
        } catch {
            return null;
        }
    });
    // If we have a user from cache, we aren't "loading" in the blocking sense
    const [loading, setLoading] = useState(() => !localStorage.getItem('user_profile'));

    // Fetch user on mount & listen for updates
    useEffect(() => {
        let mounted = true;

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            // FIX DEADLOCK: Push to macrotask queue to release Supabase's internal token lock
            // during TOKEN_REFRESHED events emitted by mfa.verify().
            setTimeout(async () => {
                if (!mounted) return;

                // 1. No Session -> Logged Out
                if (!session?.user) {
                    setUser(null);
                    setLoading(false);
                    localStorage.removeItem('user_profile');
                    return;
                }

                // 2. Check Assurance Level for MFA (2FA)
                const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
                if (aal && aal.currentLevel === 'aal1' && aal.nextLevel === 'aal2') {
                    // User has enabled 2FA but hasn't verified TOTP yet!
                    setUser(null);
                    setLoading(false);
                    localStorage.removeItem('user_profile');
                    return;
                }

                // 3. Short-circuit only on token refreshes — NEVER on SIGNED_IN.
                // A fresh login must always re-fetch from DB to catch suspended accounts.
                if (event !== 'SIGNED_IN' && user && user.id === session.user.id) {
                    setLoading(false);
                    return;
                }

                // 4. Fetch Profile (Background Check)
                try {
                    const profile = await authService.getCurrentProfile();
                    if (mounted && profile) {
                        // Check if account is suspended at login time
                        if (profile.status === 'suspended') {
                            await supabase.auth.signOut();
                            setUser(null);
                            setLoading(false);
                            localStorage.removeItem('user_profile');
                            return;
                        }
                        setUser(profile);
                        localStorage.setItem('user_profile', JSON.stringify(profile));
                    }
                } catch (error) {
                    console.error("Auth: Failed to fetch profile", error);
                } finally {
                    if (mounted) setLoading(false);
                }
            }, 10);
        });

        // Real-time subscription: auto-logout if admin suspends this user while logged in
        let realtimeSub: ReturnType<typeof supabase.channel> | null = null;
        const setupRealtimeWatch = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user?.id || !mounted) return;

            const userId = session.user.id;
            realtimeSub = supabase
                .channel(`profile-status-${userId}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'profiles',
                        filter: `id=eq.${userId}`,
                    },
                    async (payload) => {
                        const newStatus = (payload.new as { status?: string }).status;
                        if (newStatus === 'suspended' && mounted) {
                            console.warn('Auth: Account suspended by admin — signing out.');
                            await supabase.auth.signOut();
                            setUser(null);
                            localStorage.removeItem('user_profile');
                        }
                    }
                )
                .subscribe();
        };
        setupRealtimeWatch();

        return () => {
            mounted = false;
            subscription.unsubscribe();
            if (realtimeSub) supabase.removeChannel(realtimeSub);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array is correct for auth listener

    const handleSignOut = async () => {
        await authService.signOut();
        setUser(null);
        localStorage.removeItem('user_profile');
    };

    const updateLocalUser = (updates: Partial<UserProfile>) => {
        setUser(prev => {
            if (!prev) return prev;
            const updated = { ...prev, ...updates };
            localStorage.setItem('user_profile', JSON.stringify(updated));
            return updated;
        });
    };

    const refreshProfile = async () => {
        try {
            const profile = await authService.getCurrentProfile();
            if (profile) {
                setUser(profile);
                localStorage.setItem('user_profile', JSON.stringify(profile));
                return profile;
            }
        } catch (error) {
            console.error('Auth: Failed to force refresh profile', error);
        }
        return null;
    };

    const value = {
        user,
        loading,
        signIn: authService.signIn,
        signUp: authService.signUp,
        signOut: handleSignOut,
        updateLocalUser,
        refreshProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
