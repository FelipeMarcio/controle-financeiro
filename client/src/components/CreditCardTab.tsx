import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { CreditCard } from "../types";
import { useFinanceData } from "../hooks/useFinanceData";
import { formatCurrency } from "../utils/formatters";
import CreditCardForm from "./CreditCardForm";

interface CreditCardTabProps {
  currentMonth: number;
  currentYear: number;
}

const CreditCardTab = ({ currentMonth, currentYear }: CreditCardTabProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  
  const { 
    creditCards, 
    isLoading, 
    addCreditCard,
    deleteCreditCard,
    getCreditCardExpenses
  } = useFinanceData();

  const handleAddNew = () => {
    setEditingCard(null);
    setIsModalOpen(true);
  };

  const handleEdit = (card: CreditCard) => {
    setEditingCard(card);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este cartão?")) {
      await deleteCreditCard(id);
    }
  };

  const getCardBackgroundClass = (index: number) => {
    const backgrounds = [
      "bg-gradient-to-r from-primary-700 to-primary-900", 
      "bg-gradient-to-r from-purple-700 to-purple-900",
      "bg-gradient-to-r from-emerald-700 to-emerald-900",
      "bg-gradient-to-r from-rose-700 to-rose-900"
    ];
    
    return backgrounds[index % backgrounds.length];
  };

  return (
    <Card className="mt-6">
      <CardContent className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Cartões de Crédito</h3>
          <Button onClick={handleAddNew} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Novo Cartão
          </Button>
        </div>
        
        {isLoading ? (
          <p className="text-center text-gray-500">Carregando cartões...</p>
        ) : creditCards.length === 0 ? (
          <p className="text-center text-gray-500">Nenhum cartão de crédito cadastrado.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {creditCards.map((card, index) => {
              const totalExpenses = getCreditCardExpenses(card.id, currentMonth, currentYear);
              const usedPercentage = card.limit > 0 ? (totalExpenses / card.limit) * 100 : 0;
              
              return (
                <div 
                  key={card.id} 
                  className={`${getCardBackgroundClass(index)} rounded-xl p-6 text-white shadow-md`}
                >
                  <div className="mb-8 flex items-start justify-between">
                    <h3 className="text-lg font-semibold">{card.name}</h3>
                    <div className="text-right">
                      <div className="text-xs opacity-75">Limite</div>
                      <div className="font-semibold">{formatCurrency(card.limit)}</div>
                    </div>
                  </div>
                  
                  <div className="mb-2 text-lg font-bold">•••• •••• •••• {card.id.substr(-4)}</div>
                  
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-xs opacity-75">Vencimento</div>
                      <div>Dia {card.dueDay}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs opacity-75">Fechamento</div>
                      <div>Dia {card.closingDay}</div>
                    </div>
                  </div>
                  
                  <div className="mt-6 border-t border-white border-opacity-20 pt-4">
                    <div className="mb-1 flex items-center justify-between">
                      <div className="text-sm">Gasto atual</div>
                      <div className="font-semibold">{formatCurrency(totalExpenses)}</div>
                    </div>
                    
                    <Progress value={usedPercentage} className="h-2 bg-white bg-opacity-20" indicatorColor="bg-white" />
                    
                    <div className="mt-4 flex space-x-2">
                      <Button 
                        variant="ghost" 
                        className="flex-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white"
                        onClick={() => handleEdit(card)}
                      >
                        Ver detalhes
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white"
                        onClick={() => handleDelete(card.id)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCard ? 'Editar Cartão de Crédito' : 'Novo Cartão de Crédito'}
            </DialogTitle>
          </DialogHeader>
          <CreditCardForm 
            creditCard={editingCard} 
            onSubmit={(data) => {
              addCreditCard(data);
              setIsModalOpen(false);
            }}
            onCancel={() => setIsModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CreditCardTab;
