import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, query, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User } from 'firebase/auth';
import { Transaction, CreditCard, FixedExpense, CategoryTotal, MonthData, BalanceData } from '../types';
import { useToast } from '@/hooks/use-toast';

// Define the shape of our context
interface FinanceContextProps {
  transactions: Transaction[];
  creditCards: CreditCard[];
  fixedExpenses: FixedExpense[];
  currentMonth: number;
  currentYear: number;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  expensesByCategory: CategoryTotal[];
  monthlyData: MonthData[];
  balanceHistory: BalanceData[];
  isLoading: boolean;
  error: string | null;
  
  setCurrentMonth: (month: number) => void;
  setCurrentYear: (year: number) => void;
  
  addTransaction: (transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  
  addCreditCard: (creditCard: Partial<CreditCard>) => Promise<void>;
  deleteCreditCard: (id: string) => Promise<void>;
  
  addFixedExpense: (fixedExpense: Partial<FixedExpense>) => Promise<void>;
  deleteFixedExpense: (id: string) => Promise<void>;
  
  getCreditCardExpenses: (cardId: string, month: number, year: number) => number;
  
  refreshData: () => Promise<void>;
}

// Create the context
const FinanceContext = createContext<FinanceContextProps | undefined>(undefined);

// Create a provider component
export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  
  const { toast } = useToast();

  // Effect to listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        refreshData();
      } else {
        // Clear data when user logs out
        setTransactions([]);
        setCreditCards([]);
        setFixedExpenses([]);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch all user data from Firebase
  const refreshData = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch transactions
      const transactionsQuery = query(collection(db, `users/${user.uid}/transactions`));
      const transactionsSnapshot = await getDocs(transactionsQuery);
      const transactionsData = transactionsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Transaction));
      setTransactions(transactionsData);

      // Fetch credit cards
      const creditCardsQuery = query(collection(db, `users/${user.uid}/creditCards`));
      const creditCardsSnapshot = await getDocs(creditCardsQuery);
      const creditCardsData = creditCardsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as CreditCard));
      setCreditCards(creditCardsData);

      // Fetch fixed expenses
      const fixedExpensesQuery = query(collection(db, `users/${user.uid}/fixedExpenses`));
      const fixedExpensesSnapshot = await getDocs(fixedExpensesQuery);
      const fixedExpensesData = fixedExpensesSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as FixedExpense));
      setFixedExpenses(fixedExpensesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Falha ao carregar dados. Por favor, tente novamente.');
      toast({
        title: "Erro ao carregar dados",
        description: "Ocorreu um erro ao buscar seus dados financeiros.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add or update a transaction
  const addTransaction = async (transaction: Partial<Transaction>) => {
    if (!user) return;

    try {
      if (transaction.id) {
        // Update existing transaction
        const transactionRef = doc(db, `users/${user.uid}/transactions`, transaction.id);
        await updateDoc(transactionRef, {
          ...transaction,
          updatedAt: serverTimestamp()
        });

        // Update local state
        setTransactions(prev => 
          prev.map(t => t.id === transaction.id ? { ...t, ...transaction } as Transaction : t)
        );

        toast({
          title: "Transação atualizada",
          description: "A transação foi atualizada com sucesso.",
        });
      } else {
        // Add new transaction
        const newTransaction = {
          ...transaction,
          createdAt: new Date().toISOString(),
        };

        const docRef = await addDoc(
          collection(db, `users/${user.uid}/transactions`), 
          newTransaction
        );

        // Update local state
        const savedTransaction = { 
          ...newTransaction, 
          id: docRef.id 
        } as Transaction;
        
        setTransactions(prev => [...prev, savedTransaction]);

        toast({
          title: "Transação adicionada",
          description: "A nova transação foi registrada com sucesso.",
        });
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar a transação.",
        variant: "destructive",
      });
    }
  };

  // Delete a transaction
  const deleteTransaction = async (id: string) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, `users/${user.uid}/transactions`, id));
      setTransactions(prev => prev.filter(t => t.id !== id));

      toast({
        title: "Transação excluída",
        description: "A transação foi excluída com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir a transação.",
        variant: "destructive",
      });
    }
  };

  // Add or update a credit card
  const addCreditCard = async (creditCard: Partial<CreditCard>) => {
    if (!user) return;

    try {
      if (creditCard.id) {
        // Update existing credit card
        const cardRef = doc(db, `users/${user.uid}/creditCards`, creditCard.id);
        await updateDoc(cardRef, {
          ...creditCard,
          updatedAt: serverTimestamp()
        });

        // Update local state
        setCreditCards(prev => 
          prev.map(c => c.id === creditCard.id ? { ...c, ...creditCard } as CreditCard : c)
        );

        toast({
          title: "Cartão atualizado",
          description: "O cartão de crédito foi atualizado com sucesso.",
        });
      } else {
        // Add new credit card
        const newCard = {
          ...creditCard,
          createdAt: serverTimestamp(),
        };

        const docRef = await addDoc(
          collection(db, `users/${user.uid}/creditCards`), 
          newCard
        );

        // Update local state with proper date string for the UI
        const savedCard = { 
          ...creditCard, 
          id: docRef.id,
          createdAt: new Date().toISOString()
        } as CreditCard;
        
        setCreditCards(prev => [...prev, savedCard]);

        toast({
          title: "Cartão adicionado",
          description: "O novo cartão de crédito foi registrado com sucesso.",
        });
      }
    } catch (error) {
      console.error('Error saving credit card:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o cartão de crédito.",
        variant: "destructive",
      });
    }
  };

  // Delete a credit card
  const deleteCreditCard = async (id: string) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, `users/${user.uid}/creditCards`, id));
      setCreditCards(prev => prev.filter(c => c.id !== id));

      toast({
        title: "Cartão excluído",
        description: "O cartão de crédito foi excluído com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting credit card:', error);
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir o cartão de crédito.",
        variant: "destructive",
      });
    }
  };

  // Add or update a fixed expense
  const addFixedExpense = async (fixedExpense: Partial<FixedExpense>) => {
    if (!user) return;

    try {
      if (fixedExpense.id) {
        // Update existing fixed expense
        const expenseRef = doc(db, `users/${user.uid}/fixedExpenses`, fixedExpense.id);
        await updateDoc(expenseRef, {
          ...fixedExpense,
          updatedAt: serverTimestamp()
        });

        // Update local state
        setFixedExpenses(prev => 
          prev.map(e => e.id === fixedExpense.id ? { ...e, ...fixedExpense } as FixedExpense : e)
        );

        toast({
          title: "Despesa atualizada",
          description: "A despesa fixa foi atualizada com sucesso.",
        });
      } else {
        // Add new fixed expense
        const newExpense = {
          ...fixedExpense,
          createdAt: serverTimestamp(),
        };

        const docRef = await addDoc(
          collection(db, `users/${user.uid}/fixedExpenses`), 
          newExpense
        );

        // Update local state with proper date string for the UI
        const savedExpense = { 
          ...fixedExpense, 
          id: docRef.id,
          createdAt: new Date().toISOString()
        } as FixedExpense;
        
        setFixedExpenses(prev => [...prev, savedExpense]);

        toast({
          title: "Despesa adicionada",
          description: "A nova despesa fixa foi registrada com sucesso.",
        });
      }
    } catch (error) {
      console.error('Error saving fixed expense:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar a despesa fixa.",
        variant: "destructive",
      });
    }
  };

  // Delete a fixed expense
  const deleteFixedExpense = async (id: string) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, `users/${user.uid}/fixedExpenses`, id));
      setFixedExpenses(prev => prev.filter(e => e.id !== id));

      toast({
        title: "Despesa excluída",
        description: "A despesa fixa foi excluída com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting fixed expense:', error);
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir a despesa fixa.",
        variant: "destructive",
      });
    }
  };

  // Filter transactions for the current month/year
  const getCurrentMonthTransactions = () => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return (
        transactionDate.getMonth() === currentMonth && 
        transactionDate.getFullYear() === currentYear
      );
    });
  };

  // Calculate total income for the current month
  const getTotalIncome = () => {
    const monthTransactions = getCurrentMonthTransactions();
    return monthTransactions
      .filter(t => t.type === 'income')
      .reduce((total, t) => total + t.amount, 0);
  };

  // Calculate total expenses for the current month
  const getTotalExpenses = () => {
    const monthTransactions = getCurrentMonthTransactions();
    return monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((total, t) => total + t.amount, 0);
  };

  // Get expenses by category for the current month
  const getExpensesByCategory = () => {
    const monthTransactions = getCurrentMonthTransactions();
    const expenseTransactions = monthTransactions.filter(t => t.type === 'expense');
    
    // Group expenses by category
    const categories: Record<string, number> = {};
    expenseTransactions.forEach(t => {
      if (!categories[t.category]) {
        categories[t.category] = 0;
      }
      categories[t.category] += t.amount;
    });
    
    // Transform to array and map category IDs to readable names
    return Object.entries(categories).map(([category, amount]) => {
      // Convert category ID to display name
      const displayName = getCategoryDisplayName(category);
      return { category: displayName, amount };
    });
  };

  // Helper to convert category ID to display name
  const getCategoryDisplayName = (categoryId: string) => {
    const categories: Record<string, string> = {
      alimentacao: 'Alimentação',
      transporte: 'Transporte',
      moradia: 'Moradia',
      lazer: 'Lazer',
      saude: 'Saúde',
      educacao: 'Educação',
      salario: 'Salário',
      outros: 'Outros'
    };
    
    return categories[categoryId] || categoryId;
  };

  // Generate monthly data for charts (last 6 months)
  const getMonthlyData = () => {
    const data: MonthData[] = [];
    const monthNames = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];
    
    // Get data for the last 6 months including current month
    for (let i = 5; i >= 0; i--) {
      let month = currentMonth - i;
      let year = currentYear;
      
      // Adjust for previous year
      if (month < 0) {
        month += 12;
        year -= 1;
      }
      
      const monthTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === month && date.getFullYear() === year;
      });
      
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
        
      data.push({
        month: `${monthNames[month]}`,
        income,
        expenses,
        balance: income - expenses
      });
    }
    
    return data;
  };

  // Generate balance history data (daily running balance)
  const getBalanceHistory = () => {
    // Get all transactions for the current month
    const monthTransactions = getCurrentMonthTransactions();
    
    // Sort by date
    monthTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const history: BalanceData[] = [];
    let runningBalance = 0;
    
    // Group by date
    const dateGroups: Record<string, Transaction[]> = {};
    
    monthTransactions.forEach(transaction => {
      const dateStr = new Date(transaction.date).toISOString().split('T')[0];
      if (!dateGroups[dateStr]) {
        dateGroups[dateStr] = [];
      }
      dateGroups[dateStr].push(transaction);
    });
    
    // Calculate daily balances
    Object.entries(dateGroups)
      .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
      .forEach(([date, transactions]) => {
        const dailyBalance = transactions.reduce((sum, t) => {
          return sum + (t.type === 'income' ? t.amount : -t.amount);
        }, 0);
        
        runningBalance += dailyBalance;
        
        // Format date to be more readable
        const formattedDate = new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        
        history.push({
          date: formattedDate,
          balance: runningBalance
        });
      });
    
    return history;
  };

  // Calculate expenses for a specific credit card in the current month
  const getCreditCardExpenses = (cardId: string, month: number, year: number) => {
    const cardTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return (
        t.type === 'expense' && 
        t.paymentMethod === 'credit' && 
        t.creditCardId === cardId &&
        transactionDate.getMonth() === month && 
        transactionDate.getFullYear() === year
      );
    });
    
    return cardTransactions.reduce((total, t) => total + t.amount, 0);
  };

  // Calculate derived values
  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const balance = totalIncome - totalExpenses;
  const expensesByCategory = getExpensesByCategory();
  const monthlyData = getMonthlyData();
  const balanceHistory = getBalanceHistory();

  // Context value
  const value: FinanceContextProps = {
    transactions,
    creditCards,
    fixedExpenses,
    currentMonth,
    currentYear,
    totalIncome,
    totalExpenses,
    balance,
    expensesByCategory,
    monthlyData,
    balanceHistory,
    isLoading,
    error,
    
    setCurrentMonth,
    setCurrentYear,
    
    addTransaction,
    deleteTransaction,
    
    addCreditCard,
    deleteCreditCard,
    
    addFixedExpense,
    deleteFixedExpense,
    
    getCreditCardExpenses,
    
    refreshData
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};

// Custom hook to use the finance context
export const useFinanceContext = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinanceContext must be used within a FinanceProvider');
  }
  return context;
};
