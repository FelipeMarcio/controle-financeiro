import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import AuthForm from "./components/AuthForm";
import Dashboard from "./components/Dashboard";
import { User } from "firebase/auth";
import { FinanceProvider } from "./contexts/FinanceContext";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <FinanceProvider>
        <div className="min-h-screen bg-gray-100">
          {user ? <Dashboard user={user} /> : <AuthForm />}
        </div>
        <Toaster />
      </FinanceProvider>
    </QueryClientProvider>
  );
}

export default App;
