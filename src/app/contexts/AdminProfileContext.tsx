import { createContext, useContext, useState, type ReactNode } from "react";

export interface AdminProfile {
  name: string;
  initials: string;
  phone: string;
  avatarUrl: string | null;
}

interface AdminProfileContextType {
  profile: AdminProfile;
  updateProfile: (updates: Partial<AdminProfile>) => void;
}

const AdminProfileContext = createContext<AdminProfileContextType>({
  profile: { name: "Admin Officer", initials: "AO", phone: "0821234567", avatarUrl: null },
  updateProfile: () => {},
});

export function useAdminProfile() {
  return useContext(AdminProfileContext);
}

function buildInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AdminProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<AdminProfile>({
    name: "Admin Officer",
    initials: "AO",
    phone: "0821234567",
    avatarUrl: null,
  });

  const updateProfile = (updates: Partial<AdminProfile>) => {
    setProfile(prev => {
      const next = { ...prev, ...updates };
      if (updates.name !== undefined) {
        next.initials = buildInitials(updates.name);
      }
      return next;
    });
  };

  return (
    <AdminProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </AdminProfileContext.Provider>
  );
}
