import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FixedExpense } from "../types";
import { useFinanceData } from "../hooks/useFinanceData";

interface FixedExpenseFormProps {
  fixedExpense: FixedExpense | null;
  onSubmit: (data: Partial<FixedExpense>) => void;
  onCancel: () => void;
}

const FixedExpenseForm = ({ fixedExpense, onSubmit, onCancel }: FixedExpenseFormProps) => {
  const { creditCards } = useFinanceData();
  const [paymentMethod, setPaymentMethod] = useState(fixedExpense?.paymentMethod || 'money');
  
  const defaultValues = {
    description: fixedExpense?.description || '',
    amount: fixedExpense?.amount || '',
    category: fixedExpense?.category || 'outros',
    paymentMethod: fixedExpense?.paymentMethod || 'money',
    dayOfMonth: fixedExpense?.dayOfMonth || '',
    creditCardId: fixedExpense?.creditCardId || '',
    notes: fixedExpense?.notes || ''
  };
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({ defaultValues });
  
  // Set initial values
  useEffect(() => {
    if (fixedExpense) {
      setValue('description', fixedExpense.description);
      setValue('amount', fixedExpense.amount);
      setValue('category', fixedExpense.category);
      setValue('paymentMethod', fixedExpense.paymentMethod);
      setValue('dayOfMonth', fixedExpense.dayOfMonth);
      setValue('creditCardId', fixedExpense.creditCardId || '');
      setValue('notes', fixedExpense.notes || '');
      
      setPaymentMethod(fixedExpense.paymentMethod);
    }
  }, [fixedExpense, setValue]);
  
  // Watch for payment method changes
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'paymentMethod') {
        setPaymentMethod(value.paymentMethod as string);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [watch]);
  
  const onFormSubmit = (data: any) => {
    // Format data
    const formattedData: Partial<FixedExpense> = {
      ...data,
      amount: parseFloat(data.amount),
      dayOfMonth: parseInt(data.dayOfMonth),
      id: fixedExpense?.id // Preserve id for edits
    };
    
    // If not credit card, clear creditCardId
    if (data.paymentMethod !== 'credit') {
      formattedData.creditCardId = null;
    }
    
    onSubmit(formattedData);
  };
  
  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Input
            id="description"
            {...register('description', { required: "Descrição é obrigatória" })}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="amount">Valor (R$)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            {...register('amount', { 
              required: "Valor é obrigatório",
              min: { value: 0.01, message: "Valor deve ser maior que zero" }
            })}
          />
          {errors.amount && (
            <p className="text-sm text-red-500">{errors.amount.message}</p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select 
            defaultValue={defaultValues.category}
            onValueChange={(value) => setValue('category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aluguel">Aluguel</SelectItem>
              <SelectItem value="condominio">Condomínio</SelectItem>
              <SelectItem value="financiamento">Financiamento</SelectItem>
              <SelectItem value="agua">Água</SelectItem>
              <SelectItem value="luz">Luz</SelectItem>
              <SelectItem value="internet">Internet</SelectItem>
              <SelectItem value="telefone">Telefone</SelectItem>
              <SelectItem value="tv">TV por Assinatura</SelectItem>
              <SelectItem value="academia">Academia</SelectItem>
              <SelectItem value="plano_saude">Plano de Saúde</SelectItem>
              <SelectItem value="seguro">Seguro</SelectItem>
              <SelectItem value="educacao">Mensalidade Escolar</SelectItem>
              <SelectItem value="assinaturas">Assinaturas</SelectItem>
              <SelectItem value="transporte">Transporte</SelectItem>
              <SelectItem value="outros">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="paymentMethod">Método de Pagamento</Label>
          <Select 
            defaultValue={defaultValues.paymentMethod}
            onValueChange={(value) => setValue('paymentMethod', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o método" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="money">Dinheiro</SelectItem>
              <SelectItem value="debit">Débito</SelectItem>
              <SelectItem value="credit">Cartão de Crédito</SelectItem>
              <SelectItem value="pix">PIX</SelectItem>
              <SelectItem value="transfer">Transferência</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {paymentMethod === 'credit' && (
        <div className="space-y-2">
          <Label htmlFor="creditCardId">Cartão de Crédito</Label>
          <Select 
            defaultValue={defaultValues.creditCardId}
            onValueChange={(value) => setValue('creditCardId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o cartão" />
            </SelectTrigger>
            <SelectContent>
              {creditCards.length > 0 ? (
                creditCards.map(card => (
                  <SelectItem key={card.id} value={card.id}>
                    {card.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="" disabled>
                  Nenhum cartão cadastrado
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="dayOfMonth">Dia do Mês</Label>
        <Input
          id="dayOfMonth"
          type="number"
          min="1"
          max="31"
          {...register('dayOfMonth', { 
            required: "Dia do mês é obrigatório",
            min: { value: 1, message: "Dia deve ser entre 1 e 31" },
            max: { value: 31, message: "Dia deve ser entre 1 e 31" }
          })}
        />
        {errors.dayOfMonth && (
          <p className="text-sm text-red-500">{errors.dayOfMonth.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Observações adicionais"
          rows={3}
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Salvar
        </Button>
      </div>
    </form>
  );
};

export default FixedExpenseForm;
