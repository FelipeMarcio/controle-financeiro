import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FixedExpense } from "../types";
import { useFinanceData } from "../hooks/useFinanceData";
import { formatCurrency } from "../utils/formatters";
import FixedExpenseForm from "./FixedExpenseForm";
import { exportToCSV } from "../utils/exportData";

interface FixedExpenseTabProps {
  currentMonth: number;
  currentYear: number;
}

const FixedExpenseTab = ({ currentMonth, currentYear }: FixedExpenseTabProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<FixedExpense | null>(null);
  
  const { 
    fixedExpenses, 
    isLoading, 
    addFixedExpense,
    deleteFixedExpense 
  } = useFinanceData();

  const handleAddNew = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const handleEdit = (expense: FixedExpense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta despesa fixa?")) {
      await deleteFixedExpense(id);
    }
  };

  const handleExport = () => {
    exportToCSV(fixedExpenses, 'despesas-fixas');
  };

  const getCategoryClassName = (category: string) => {
    const classes = {
      alimentacao: "bg-yellow-100 text-yellow-800",
      transporte: "bg-blue-100 text-blue-800",
      moradia: "bg-purple-100 text-purple-800",
      lazer: "bg-green-100 text-green-800",
      saude: "bg-red-100 text-red-800",
      educacao: "bg-amber-100 text-amber-800",
      outros: "bg-gray-100 text-gray-800"
    };
    
    return classes[category as keyof typeof classes] || "bg-gray-100 text-gray-800";
  };

  const getCategoryName = (categoryId: string) => {
    const categories: Record<string, string> = {
      alimentacao: 'Alimentação',
      transporte: 'Transporte',
      moradia: 'Moradia',
      lazer: 'Lazer',
      saude: 'Saúde',
      educacao: 'Educação',
      outros: 'Outros'
    };
    
    return categories[categoryId] || categoryId;
  };

  const getPaymentMethodName = (methodId: string) => {
    const methods: Record<string, string> = {
      money: 'Dinheiro',
      debit: 'Débito',
      credit: 'Cartão de Crédito',
      pix: 'PIX',
      transfer: 'Transferência'
    };
    
    return methods[methodId] || methodId;
  };

  return (
    <Card className="mt-6">
      <CardContent className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Despesas Fixas</h3>
          <div className="flex gap-2">
            <Button onClick={handleAddNew} className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Nova Despesa Fixa
            </Button>
            <Button variant="outline" onClick={handleExport} className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Dia do Mês
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Descrição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Método
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Valor
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    Carregando despesas fixas...
                  </td>
                </tr>
              ) : fixedExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    Nenhuma despesa fixa cadastrada.
                  </td>
                </tr>
              ) : (
                fixedExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      Dia {expense.dayOfMonth}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{expense.description}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <Badge variant="outline" className={getCategoryClassName(expense.category)}>
                        {getCategoryName(expense.category)}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {getPaymentMethodName(expense.paymentMethod)}
                      {expense.creditCardId && " (Cartão)"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-red-600">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <Button variant="ghost" className="text-indigo-600 hover:text-indigo-900" 
                        onClick={() => handleEdit(expense)}>
                        Editar
                      </Button>
                      <Button variant="ghost" className="text-red-600 hover:text-red-900" 
                        onClick={() => handleDelete(expense.id)}>
                        Excluir
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingExpense ? 'Editar Despesa Fixa' : 'Nova Despesa Fixa'}
            </DialogTitle>
          </DialogHeader>
          <FixedExpenseForm 
            fixedExpense={editingExpense} 
            onSubmit={(data) => {
              addFixedExpense(data);
              setIsModalOpen(false);
            }}
            onCancel={() => setIsModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default FixedExpenseTab;
