import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { FcGoogle } from "react-icons/fc";
import { Separator } from "@/components/ui/separator";

const AuthForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Erro",
        description: "Por favor, informe email e senha.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Erro",
        description: "Por favor, informe email e senha.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: email,
        plan: "free",
        createdAt: new Date()
      });
      
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Manipular resultado do redirecionamento do Google
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        setLoading(true);
        const result = await getRedirectResult(auth);
        
        if (result) {
          const user = result.user;
          
          // Check if user already exists in firestore
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          
          // If user doesn't exist, create a new document
          if (!userDoc.exists()) {
            await setDoc(userDocRef, {
              email: user.email,
              name: user.displayName,
              photoURL: user.photoURL,
              plan: "free",
              createdAt: new Date()
            });
          }
          
          toast({
            title: "Login bem-sucedido",
            description: "Bem-vindo ao Controle Financeiro!"
          });
        }
      } catch (error: any) {
        console.error("Google sign in error:", error);
        if (error.code !== 'auth/credential-already-in-use') {
          toast({
            title: "Erro no login",
            description: "Falha na autenticação com Google. Tente outro método.",
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }
    };
    
    handleRedirectResult();
  }, [toast]);
  
  // Iniciar login com Google usando redirecionamento
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
      // O resultado será manipulado no useEffect acima após o redirecionamento
    } catch (error: any) {
      console.error("Google sign in error:", error);
      toast({
        title: "Erro ao iniciar login",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <h1 className="mb-6 text-center text-2xl font-semibold text-gray-800">Controle Financeiro</h1>
          
          {/* Login com Google */}
          <Button 
            className="w-full mb-4" 
            variant="outline" 
            onClick={handleGoogleSignIn} 
            disabled={loading}
          >
            <FcGoogle className="mr-2 h-5 w-5" />
            {loading ? 'Carregando...' : 'Entrar com Google'}
          </Button>
          
          <div className="relative my-4">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-500">
              ou
            </span>
          </div>
          
          <form className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                id="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Input
                type="password"
                id="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <Button 
              className="w-full" 
              onClick={handleLogin} 
              disabled={loading}
            >
              {loading ? 'Carregando...' : 'Entrar com Email'}
            </Button>
            
            <Button 
              onClick={handleSignup} 
              className="w-full" 
              variant="secondary"
              disabled={loading}
            >
              {loading ? 'Carregando...' : 'Criar Nova Conta'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthForm;
