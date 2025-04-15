import { useState } from "react";
import { User } from "firebase/auth";
import { auth } from "../lib/firebase";
import MonthNavigation from "./MonthNavigation";
import FinancialSummary from "./FinancialSummary";
import TransactionTab from "./TransactionTab";
import CreditCardTab from "./CreditCardTab";
import FixedExpenseTab from "./FixedExpenseTab";
import SpreadsheetTab from "./SpreadsheetTab";
import ReportsTab from "./ReportsTab";
import HomeScreen from "./HomeScreen";
import { useFinanceData } from "../hooks/useFinanceData";
import { 
  LogOut, 
  Home, 
  CreditCard, 
  Receipt, 
  BarChart3, 
  CalendarClock,
  FileSpreadsheet
} from "lucide-react";

interface DashboardProps {
  user: User;
}

const Dashboard = ({ user }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState("home");
  const { currentMonth, currentYear, setCurrentMonth, setCurrentYear } = useFinanceData();

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Menu Lateral */}
      <div className="w-[80px] bg-gray-800 p-4 flex flex-col items-center space-y-8">
        <div className="flex flex-col items-center justify-center mb-8 pt-2">
          <div className="bg-primary h-10 w-10 rounded-full flex items-center justify-center text-white font-bold">
            {user.email?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>

        <button 
          onClick={() => setActiveTab("home")}
          className={`w-full flex flex-col items-center justify-center py-3 rounded-lg transition-colors ${activeTab === "home" ? "bg-primary/20 text-primary" : "text-gray-300 hover:text-white hover:bg-gray-700"}`}
        >
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Início</span>
        </button>

        <button 
          onClick={() => setActiveTab("transactions")}
          className={`w-full flex flex-col items-center justify-center py-3 rounded-lg transition-colors ${activeTab === "transactions" ? "bg-primary/20 text-primary" : "text-gray-300 hover:text-white hover:bg-gray-700"}`}
        >
          <Receipt className="h-6 w-6" />
          <span className="text-xs mt-1">Transações</span>
        </button>

        <button 
          onClick={() => setActiveTab("creditCards")}
          className={`w-full flex flex-col items-center justify-center py-3 rounded-lg transition-colors ${activeTab === "creditCards" ? "bg-primary/20 text-primary" : "text-gray-300 hover:text-white hover:bg-gray-700"}`}
        >
          <CreditCard className="h-6 w-6" />
          <span className="text-xs mt-1">Cartões</span>
        </button>

        <button 
          onClick={() => setActiveTab("fixedExpenses")}
          className={`w-full flex flex-col items-center justify-center py-3 rounded-lg transition-colors ${activeTab === "fixedExpenses" ? "bg-primary/20 text-primary" : "text-gray-300 hover:text-white hover:bg-gray-700"}`}
        >
          <CalendarClock className="h-6 w-6" />
          <span className="text-xs mt-1">Fixas</span>
        </button>

        <button 
          onClick={() => setActiveTab("spreadsheet")}
          className={`w-full flex flex-col items-center justify-center py-3 rounded-lg transition-colors ${activeTab === "spreadsheet" ? "bg-primary/20 text-primary" : "text-gray-300 hover:text-white hover:bg-gray-700"}`}
        >
          <FileSpreadsheet className="h-6 w-6" />
          <span className="text-xs mt-1">Planilha</span>
        </button>

        <button 
          onClick={() => setActiveTab("reports")}
          className={`w-full flex flex-col items-center justify-center py-3 rounded-lg transition-colors ${activeTab === "reports" ? "bg-primary/20 text-primary" : "text-gray-300 hover:text-white hover:bg-gray-700"}`}
        >
          <BarChart3 className="h-6 w-6" />
          <span className="text-xs mt-1">Relatórios</span>
        </button>

        <div className="mt-auto pt-8">
          <button 
            onClick={handleLogout}
            className="text-red-400 hover:text-red-300 flex flex-col items-center justify-center py-3 w-full rounded-lg hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="h-6 w-6" />
            <span className="text-xs mt-1">Sair</span>
          </button>
        </div>
      </div>
      
      {/* Conteúdo principal */}
      <div className="flex-1 px-6 py-6 overflow-auto">
        <header className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Olá, <span className="text-primary">{user.email}</span>!
          </h1>
        </header>

        <MonthNavigation
          currentMonth={currentMonth}
          currentYear={currentYear}
          setCurrentMonth={setCurrentMonth}
          setCurrentYear={setCurrentYear}
        />

        <FinancialSummary
          currentMonth={currentMonth}
          currentYear={currentYear}
        />

        <div className="mt-8">
          {/* Conteúdo das abas - sem mais o componente Tabs visual, já que temos o menu lateral */}
          {activeTab === "home" && (
            <HomeScreen onNavigate={setActiveTab} />
          )}
          
          {activeTab === "transactions" && (
            <TransactionTab 
              currentMonth={currentMonth} 
              currentYear={currentYear} 
            />
          )}
          
          {activeTab === "creditCards" && (
            <CreditCardTab 
              currentMonth={currentMonth} 
              currentYear={currentYear}
            />
          )}
          
          {activeTab === "fixedExpenses" && (
            <FixedExpenseTab 
              currentMonth={currentMonth} 
              currentYear={currentYear}
            />
          )}
          
          {activeTab === "spreadsheet" && (
            <SpreadsheetTab 
              currentMonth={currentMonth} 
              currentYear={currentYear}
            />
          )}
          
          {activeTab === "reports" && (
            <ReportsTab 
              currentMonth={currentMonth} 
              currentYear={currentYear}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;