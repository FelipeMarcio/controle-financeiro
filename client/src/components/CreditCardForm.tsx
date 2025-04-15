import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard } from "../types";

interface CreditCardFormProps {
  creditCard: CreditCard | null;
  onSubmit: (data: Partial<CreditCard>) => void;
  onCancel: () => void;
}

const CreditCardForm = ({ creditCard, onSubmit, onCancel }: CreditCardFormProps) => {
  const defaultValues = {
    name: creditCard?.name || '',
    bank: creditCard?.bank || '',
    limit: creditCard?.limit || '',
    dueDay: creditCard?.dueDay || '',
    closingDay: creditCard?.closingDay || ''
  };
  
  const { register, handleSubmit, formState: { errors }, setValue } = useForm({ defaultValues });
  
  // Set initial values
  useEffect(() => {
    if (creditCard) {
      setValue('name', creditCard.name);
      setValue('bank', creditCard.bank);
      setValue('limit', creditCard.limit);
      setValue('dueDay', creditCard.dueDay);
      setValue('closingDay', creditCard.closingDay);
    }
  }, [creditCard, setValue]);
  
  const onFormSubmit = (data: any) => {
    // Format data
    const formattedData: Partial<CreditCard> = {
      ...data,
      limit: parseFloat(data.limit),
      dueDay: parseInt(data.dueDay),
      closingDay: parseInt(data.closingDay),
      id: creditCard?.id // Preserve id for edits
    };
    
    onSubmit(formattedData);
  };
  
  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Cartão</Label>
        <Input
          id="name"
          {...register('name', { required: "Nome do cartão é obrigatório" })}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="bank">Banco</Label>
        <Input
          id="bank"
          {...register('bank', { required: "Banco é obrigatório" })}
        />
        {errors.bank && (
          <p className="text-sm text-red-500">{errors.bank.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="limit">Limite (R$)</Label>
        <Input
          id="limit"
          type="number"
          step="0.01"
          {...register('limit', { 
            required: "Limite é obrigatório",
            min: { value: 0.01, message: "Limite deve ser maior que zero" }
          })}
        />
        {errors.limit && (
          <p className="text-sm text-red-500">{errors.limit.message}</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dueDay">Dia de Vencimento</Label>
          <Input
            id="dueDay"
            type="number"
            min="1"
            max="31"
            {...register('dueDay', { 
              required: "Dia de vencimento é obrigatório",
              min: { value: 1, message: "Dia deve ser entre 1 e 31" },
              max: { value: 31, message: "Dia deve ser entre 1 e 31" }
            })}
          />
          {errors.dueDay && (
            <p className="text-sm text-red-500">{errors.dueDay.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="closingDay">Dia de Fechamento</Label>
          <Input
            id="closingDay"
            type="number"
            min="1"
            max="31"
            {...register('closingDay', { 
              required: "Dia de fechamento é obrigatório",
              min: { value: 1, message: "Dia deve ser entre 1 e 31" },
              max: { value: 31, message: "Dia deve ser entre 1 e 31" }
            })}
          />
          {errors.closingDay && (
            <p className="text-sm text-red-500">{errors.closingDay.message}</p>
          )}
        </div>
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

export default CreditCardForm;
