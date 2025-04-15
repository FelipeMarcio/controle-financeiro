import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Transaction } from "../types";
import { useFinanceData } from "../hooks/useFinanceData";

interface TransactionFormProps {
  transaction: Transaction | null;
  onSubmit: (data: Partial<Transaction>) => void;
  onCancel: () => void;
}

const TransactionForm = ({ transaction, onSubmit, onCancel }: TransactionFormProps) => {
  const { creditCards } = useFinanceData();
  const [paymentMethod, setPaymentMethod] = useState(transaction?.paymentMethod || 'money');
  
  const defaultValues = {
    description: transaction?.description || '',
    amount: transaction?.amount || '',
    date: transaction?.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    category: transaction?.category || 'outros',
    type: transaction?.type || 'expense',
    paymentMethod: transaction?.paymentMethod || 'money',
    creditCardId: transaction?.creditCardId || '',
    notes: transaction?.notes || ''
  };
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({ defaultValues });
  
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>(transaction?.type || 'expense');
  
  // Set initial values
  useEffect(() => {
    if (transaction) {
      setValue('description', transaction.description);
      setValue('amount', transaction.amount);
      setValue('date', new Date(transaction.date).toISOString().split('T')[0]);
      setValue('category', transaction.category);
      setValue('type', transaction.type);
      setValue('paymentMethod', transaction.paymentMethod);
      setValue('creditCardId', transaction.creditCardId || '');
      setValue('notes', transaction.notes || '');
      
      setPaymentMethod(transaction.paymentMethod);
      setTransactionType(transaction.type);
    }
  }, [transaction, setValue]);
  
  // Watch for payment method and transaction type changes
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'paymentMethod') {
        setPaymentMethod(value.paymentMethod as string);
      }
      if (name === 'type') {
        if (value.type === 'income' || value.type === 'expense') {
          setTransactionType(value.type);
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [watch]);
  
  const onFormSubmit = (data: any) => {
    // Format data
    const formattedData: Partial<Transaction> = {
      ...data,
      amount: parseFloat(data.amount),
      id: transaction?.id // Preserve id for edits
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
          <Label htmlFor="date">Data</Label>
          <Input
            id="date"
            type="date"
            {...register('date', { required: "Data é obrigatória" })}
          />
          {errors.date && (
            <p className="text-sm text-red-500">{errors.date.message}</p>
          )}
        </div>
        
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
              {transactionType === 'expense' ? (
                <>
                  <SelectItem value="alimentacao">Alimentação</SelectItem>
                  <SelectItem value="transporte">Transporte</SelectItem>
                  <SelectItem value="moradia">Moradia</SelectItem>
                  <SelectItem value="aluguel">Aluguel</SelectItem>
                  <SelectItem value="condominio">Condomínio</SelectItem>
                  <SelectItem value="agua">Água</SelectItem>
                  <SelectItem value="luz">Luz</SelectItem>
                  <SelectItem value="internet">Internet</SelectItem>
                  <SelectItem value="financiamento">Financiamento</SelectItem>
                  <SelectItem value="lazer">Lazer</SelectItem>
                  <SelectItem value="saude">Saúde</SelectItem>
                  <SelectItem value="educacao">Educação</SelectItem>
                  <SelectItem value="vestuario">Vestuário</SelectItem>
                  <SelectItem value="outros_gastos">Outros gastos</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="salario">Salário</SelectItem>
                  <SelectItem value="adiantamento">Adiantamento</SelectItem>
                  <SelectItem value="bonus">Bônus/Comissão</SelectItem>
                  <SelectItem value="investimentos">Investimentos</SelectItem>
                  <SelectItem value="vendas">Vendas</SelectItem>
                  <SelectItem value="aluguel_recebido">Aluguel recebido</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                  <SelectItem value="outras_receitas">Outras receitas</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="type">Tipo</Label>
          <Select 
            defaultValue={defaultValues.type}
            onValueChange={(value: 'income' | 'expense') => setValue('type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expense">Despesa</SelectItem>
              <SelectItem value="income">Receita</SelectItem>
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

export default TransactionForm;
