import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

// Pre-seeded demo user profiles for rapid evaluation
const DEMO_USERS = {
  "shipper@naugati.com": {
    uid: "demo-shipper-001",
    email: "shipper@naugati.com",
    firstName: "Rohan",
    lastName: "Sharma",
    company: "Tata Steel Logistics & Minerals",
    phone: "+91 98200 12345",
    country: "🇮🇳 India",
    organizationType: "Enterprise Shipper",
    role: "shipper"
  },
  "carrier@naugati.com": {
    uid: "demo-carrier-002",
    email: "carrier@naugati.com",
    firstName: "Capt. Alexander",
    lastName: "Vance",
    company: "Eastern Maritime Bulk Carriers Ltd",
    phone: "+65 6789 0123",
    country: "🇸🇬 Singapore",
    organizationType: "Ocean Carrier",
    role: "shipowner"
  }
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. If Firebase is configured, listen to onAuthStateChanged
    if (isFirebaseConfigured) {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);
        if (user) {
          try {
            const docRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setUserProfile(docSnap.data());
            } else {
              setUserProfile({
                firstName: user.displayName?.split(' ')[0] || 'User',
                lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
                email: user.email,
                organizationType: 'Enterprise Shipper'
              });
            }
          } catch (error) {
            console.error("Error fetching user profile:", error);
          }
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    }

    // 2. Local fallback session handler (works immediately without env vars)
    const localSession = localStorage.getItem('naugati_session');
    if (localSession) {
      try {
        const parsed = JSON.parse(localSession);
        setCurrentUser({ uid: parsed.uid, email: parsed.email });
        setUserProfile(parsed);
      } catch {
        localStorage.removeItem('naugati_session');
      }
    } else {
      // Initialize with default demo session as Enterprise Shipper
      const defaultProfile = DEMO_USERS["shipper@naugati.com"];
      setCurrentUser({ uid: defaultProfile.uid, email: defaultProfile.email });
      setUserProfile(defaultProfile);
      localStorage.setItem('naugati_session', JSON.stringify(defaultProfile));
    }
    setLoading(false);
  }, []);

  async function signup(email, password, profileData) {
    if (isFirebaseConfigured) {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const fullProfile = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone,
        company: profileData.company,
        country: profileData.country,
        organizationType: profileData.organizationType || "Enterprise Shipper",
        role: profileData.organizationType === "Ocean Carrier" ? "shipowner" : "shipper",
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', user.uid), fullProfile);
      setUserProfile(fullProfile);
      return userCredential;
    }

    // Local authentication signup
    const newProfile = {
      uid: "user_" + Date.now(),
      email,
      firstName: profileData.firstName || "User",
      lastName: profileData.lastName || "",
      company: profileData.company || "Maritime Enterprise",
      phone: profileData.phone || "",
      country: profileData.country || "India",
      organizationType: profileData.organizationType || "Enterprise Shipper",
      role: profileData.organizationType === "Ocean Carrier" ? "shipowner" : "shipper",
      createdAt: new Date().toISOString()
    };
    setCurrentUser({ uid: newProfile.uid, email: newProfile.email });
    setUserProfile(newProfile);
    localStorage.setItem('naugati_session', JSON.stringify(newProfile));
    return { user: { uid: newProfile.uid, email: newProfile.email } };
  }

  async function login(email, password) {
    if (isFirebaseConfigured) {
      return signInWithEmailAndPassword(auth, email, password);
    }

    // Local authentication login
    const foundUser = DEMO_USERS[email.toLowerCase()] || {
      uid: "user_" + Date.now(),
      email,
      firstName: email.split('@')[0],
      lastName: "",
      company: "Maritime Corp",
      country: "India",
      organizationType: email.includes("carrier") ? "Ocean Carrier" : "Enterprise Shipper",
      role: email.includes("carrier") ? "shipowner" : "shipper"
    };

    setCurrentUser({ uid: foundUser.uid, email: foundUser.email });
    setUserProfile(foundUser);
    localStorage.setItem('naugati_session', JSON.stringify(foundUser));
    return { user: { uid: foundUser.uid, email: foundUser.email } };
  }

  async function logout() {
    if (isFirebaseConfigured) {
      await signOut(auth);
    }
    setCurrentUser(null);
    setUserProfile(null);
    localStorage.removeItem('naugati_session');
  }

  function resetPassword(email) {
    if (isFirebaseConfigured) {
      return sendPasswordResetEmail(auth, email);
    }
    return Promise.resolve(true);
  }

  async function loginWithGoogle() {
    if (isFirebaseConfigured) {
      const provider = new GoogleAuthProvider();
      return signInWithPopup(auth, provider);
    }
    // Fallback demo Google sign-in
    const googleProfile = {
      uid: "google_user_demo",
      email: "google.user@maritime-enterprise.com",
      firstName: "Google",
      lastName: "Partner",
      company: "Pacific Commodities Ltd",
      country: "Singapore",
      organizationType: "Enterprise Shipper",
      role: "shipper"
    };
    setCurrentUser({ uid: googleProfile.uid, email: googleProfile.email });
    setUserProfile(googleProfile);
    localStorage.setItem('naugati_session', JSON.stringify(googleProfile));
    return { user: googleProfile };
  }

  // Helper to switch user role directly in the UI for test & review purposes
  function switchRole(newRole) {
    const updated = {
      ...(userProfile || DEMO_USERS["shipper@naugati.com"]),
      organizationType: newRole,
      role: newRole === "Ocean Carrier" ? "shipowner" : "shipper"
    };
    setUserProfile(updated);
    localStorage.setItem('naugati_session', JSON.stringify(updated));
  }

  const value = {
    currentUser,
    userProfile,
    login,
    signup,
    logout,
    resetPassword,
    loginWithGoogle,
    switchRole,
    isFirebaseConfigured
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
