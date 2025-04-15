import { useState } from "react";
import { 
  CreditCard, 
  PlusCircle, 
  Home, 
  DollarSign, 
  BarChart3, 
  Wallet,
  Calendar,
  BellRing,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  PieChart
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFinanceContext } from "../contexts/FinanceContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import TransactionForm from "./TransactionForm";
import CreditCardForm from "./CreditCardForm";
import FixedExpenseForm from "./FixedExpenseForm";
import FinancialSummary from "./FinancialSummary";

interface HomeScreenProps {
  onNavigate?: (tab: string) => void;
}

const HomeScreen = ({ onNavigate }: HomeScreenProps) => {
  const { 
    currentMonth, 
    currentYear, 
    addTransaction, 
    addCreditCard, 
    addFixedExpense 
  } = useFinanceContext();
  
  // Função para lidar com a navegação entre as abas
  const handleNavigate = (tab: string) => {
    if (onNavigate) {
      onNavigate(tab);
    }
  };
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isFixedExpenseModalOpen, setIsFixedExpenseModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');

  const handleAddTransaction = async (data: any) => {
    await addTransaction({
      ...data,
      type: transactionType
    });
    setIsTransactionModalOpen(false);
  };

  const handleAddCreditCard = async (data: any) => {
    await addCreditCard(data);
    setIsCardModalOpen(false);
  };

  const handleAddFixedExpense = async (data: any) => {
    await addFixedExpense(data);
    setIsFixedExpenseModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Resumo financeiro */}
      <FinancialSummary 
        currentMonth={currentMonth} 
        currentYear={currentYear}
      />
      
      {/* Ações Rápidas */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-800">Ações Rápidas</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {/* Adicionar Despesa */}
          <Dialog open={isTransactionModalOpen && transactionType === 'expense'} 
                 onOpenChange={(open) => {
                   setIsTransactionModalOpen(open);
                   if (open) setTransactionType('expense');
                 }}>
            <DialogTrigger asChild>
              <Card className="cursor-pointer transition-all hover:bg-gray-50 hover:shadow-md">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="mb-3 rounded-full bg-red-100 p-3">
                    <ArrowDownRight className="h-6 w-6 text-red-500" />
                  </div>
                  <span className="text-sm font-medium">Adicionar Despesa</span>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Adicionar Nova Despesa</DialogTitle>
                <DialogDescription>
                  Preencha os detalhes da despesa abaixo
                </DialogDescription>
              </DialogHeader>
              <TransactionForm 
                transaction={null} 
                onSubmit={handleAddTransaction} 
                onCancel={() => setIsTransactionModalOpen(false)}
              />
            </DialogContent>
          </Dialog>

          {/* Adicionar Receita */}
          <Dialog open={isTransactionModalOpen && transactionType === 'income'} 
                 onOpenChange={(open) => {
                   setIsTransactionModalOpen(open);
                   if (open) setTransactionType('income');
                 }}>
            <DialogTrigger asChild>
              <Card className="cursor-pointer transition-all hover:bg-gray-50 hover:shadow-md">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="mb-3 rounded-full bg-green-100 p-3">
                    <ArrowUpRight className="h-6 w-6 text-green-500" />
                  </div>
                  <span className="text-sm font-medium">Adicionar Receita</span>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Adicionar Nova Receita</DialogTitle>
                <DialogDescription>
                  Preencha os detalhes da receita abaixo
                </DialogDescription>
              </DialogHeader>
              <TransactionForm 
                transaction={null} 
                onSubmit={handleAddTransaction} 
                onCancel={() => setIsTransactionModalOpen(false)}
              />
            </DialogContent>
          </Dialog>

          {/* Adicionar Cartão */}
          <Dialog open={isCardModalOpen} onOpenChange={setIsCardModalOpen}>
            <DialogTrigger asChild>
              <Card className="cursor-pointer transition-all hover:bg-gray-50 hover:shadow-md">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="mb-3 rounded-full bg-blue-100 p-3">
                    <CreditCard className="h-6 w-6 text-blue-500" />
                  </div>
                  <span className="text-sm font-medium">Adicionar Cartão</span>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Cartão</DialogTitle>
                <DialogDescription>
                  Preencha os detalhes do cartão de crédito
                </DialogDescription>
              </DialogHeader>
              <CreditCardForm 
                creditCard={null} 
                onSubmit={handleAddCreditCard} 
                onCancel={() => setIsCardModalOpen(false)}
              />
            </DialogContent>
          </Dialog>

          {/* Adicionar Despesa Fixa */}
          <Dialog open={isFixedExpenseModalOpen} onOpenChange={setIsFixedExpenseModalOpen}>
            <DialogTrigger asChild>
              <Card className="cursor-pointer transition-all hover:bg-gray-50 hover:shadow-md">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="mb-3 rounded-full bg-purple-100 p-3">
                    <Calendar className="h-6 w-6 text-purple-500" />
                  </div>
                  <span className="text-sm font-medium">Despesa Fixa</span>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Adicionar Despesa Fixa</DialogTitle>
                <DialogDescription>
                  Cadastre despesas que se repetem mensalmente
                </DialogDescription>
              </DialogHeader>
              <FixedExpenseForm 
                fixedExpense={null} 
                onSubmit={handleAddFixedExpense} 
                onCancel={() => setIsFixedExpenseModalOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Módulos do Sistema */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-800">Módulos</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card 
            className="cursor-pointer transition-all hover:bg-gray-50 hover:shadow-md"
            onClick={() => handleNavigate('transactions')}
          >
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="mb-3 rounded-full bg-gray-100 p-3">
                <Receipt className="h-6 w-6 text-gray-500" />
              </div>
              <span className="text-sm font-medium">Transações</span>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all hover:bg-gray-50 hover:shadow-md"
            onClick={() => handleNavigate('creditCards')}
          >
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="mb-3 rounded-full bg-gray-100 p-3">
                <CreditCard className="h-6 w-6 text-gray-500" />
              </div>
              <span className="text-sm font-medium">Cartões</span>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all hover:bg-gray-50 hover:shadow-md"
            onClick={() => handleNavigate('fixedExpenses')}
          >
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="mb-3 rounded-full bg-gray-100 p-3">
                <Home className="h-6 w-6 text-gray-500" />
              </div>
              <span className="text-sm font-medium">Despesas Fixas</span>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all hover:bg-gray-50 hover:shadow-md"
            onClick={() => handleNavigate('reports')}
          >
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="mb-3 rounded-full bg-gray-100 p-3">
                <PieChart className="h-6 w-6 text-gray-500" />
              </div>
              <span className="text-sm font-medium">Relatórios</span>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Seção de Resumo Rápido */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-800">Resumo Rápido</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-4">
              <h3 className="mb-2 font-medium text-gray-600">Próximas Contas</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Home className="mr-2 h-4 w-4 text-gray-500" />
                    <span className="text-sm">Aluguel</span>
                  </div>
                  <div className="text-sm font-semibold text-red-500">R$ 1.200,00</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BellRing className="mr-2 h-4 w-4 text-gray-500" />
                    <span className="text-sm">Internet</span>
                  </div>
                  <div className="text-sm font-semibold text-red-500">R$ 120,00</div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2 w-full"
                onClick={() => handleNavigate('fixedExpenses')}
              >
                Ver todos
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="mb-2 font-medium text-gray-600">Saldo de Cartões</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CreditCard className="mr-2 h-4 w-4 text-gray-500" />
                    <span className="text-sm">Nubank</span>
                  </div>
                  <div className="text-sm font-semibold text-green-500">Limite: R$ 3.500,00</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CreditCard className="mr-2 h-4 w-4 text-gray-500" />
                    <span className="text-sm">Itaú</span>
                  </div>
                  <div className="text-sm font-semibold text-green-500">Limite: R$ 2.800,00</div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2 w-full"
                onClick={() => handleNavigate('creditCards')}
              >
                Ver todos
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;