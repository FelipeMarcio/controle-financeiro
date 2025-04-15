import { useEffect } from 'react';
import { useFinanceContext } from '../contexts/FinanceContext';

/**
 * Custom hook to access and manage financial data
 * Acts as a convenient wrapper around the FinanceContext
 */
export const useFinanceData = () => {
  const context = useFinanceContext();
  
  // Refresh data when the component using this hook mounts
  useEffect(() => {
    context.refreshData();
  }, []);
  
  // Get transactions for current month
  const getCurrentMonthTransactions = () => {
    return context.transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return (
        transactionDate.getMonth() === context.currentMonth && 
        transactionDate.getFullYear() === context.currentYear
      );
    });
  };
  
  // Expose all context data and methods, plus some convenience methods
  return {
    ...context,
    transactions: getCurrentMonthTransactions(),
  };
};
