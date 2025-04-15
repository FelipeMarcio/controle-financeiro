import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Save, Upload, Download, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFinanceData } from "../hooks/useFinanceData";
import { Transaction } from "../types";
import { formatCurrency } from "../utils/formatters";
import { exportToCSV } from "../utils/exportData";
import { useToast } from "@/hooks/use-toast";

interface SpreadsheetTabProps {
  currentMonth: number;
  currentYear: number;
}

interface SpreadsheetRow {
  id: string;
  date: string;
  description: string;
  category: string;
  paymentMethod: string;
  creditCardId?: string | null;
  amount: number;
  type: 'expense' | 'income';
  isNew?: boolean;
  isModified?: boolean;
}

const SpreadsheetTab = ({ currentMonth, currentYear }: SpreadsheetTabProps) => {
  const [rows, setRows] = useState<SpreadsheetRow[]>([]);
  const { transactions, creditCards, addTransaction, isLoading } = useFinanceData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Initialize spreadsheet with transactions from the current month/year
  useEffect(() => {
    if (!isLoading && transactions.length > 0) {
      const filteredTransactions = transactions.filter(transaction => {
        const date = new Date(transaction.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      });

      const newRows = filteredTransactions.map(transaction => ({
        id: transaction.id,
        date: transaction.date.split('T')[0], // Format as YYYY-MM-DD
        description: transaction.description,
        category: transaction.category,
        paymentMethod: transaction.paymentMethod,
        amount: transaction.amount,
        type: transaction.type
      }));

      setRows(newRows);
    }
  }, [transactions, currentMonth, currentYear, isLoading]);

  const handleAddRow = () => {
    // Create a new empty row with defaults
    const today = new Date();
    today.setMonth(currentMonth);
    today.setFullYear(currentYear);
    
    const newRow: SpreadsheetRow = {
      id: `new-${Date.now()}`,
      date: today.toISOString().split('T')[0],
      description: '',
      category: 'outros',
      paymentMethod: 'money',
      amount: 0,
      type: 'expense',
      isNew: true
    };

    setRows([...rows, newRow]);
  };

  const handleRowChange = (id: string, field: keyof SpreadsheetRow, value: any) => {
    setRows(rows.map(row => {
      if (row.id === id) {
        return { 
          ...row, 
          [field]: value,
          isModified: !row.isNew // Mark as modified only if it's not a new row
        };
      }
      return row;
    }));
  };

  const handleSaveAll = async () => {
    try {
      // Find rows that are new or modified
      const rowsToSave = rows.filter(row => row.isNew || row.isModified);
      
      if (rowsToSave.length === 0) {
        toast({
          title: "Nenhuma alteração para salvar",
          description: "Faça algumas alterações antes de salvar.",
        });
        return;
      }

      // Save each row
      for (const row of rowsToSave) {
        const transaction: Partial<Transaction> = {
          id: row.isNew ? undefined : row.id,
          description: row.description,
          amount: row.amount,
          date: new Date(row.date).toISOString(),
          category: row.category,
          type: row.type,
          paymentMethod: row.paymentMethod,
          creditCardId: row.paymentMethod === 'credit' ? row.creditCardId || null : null,
          notes: '',
        };

        await addTransaction(transaction);
      }

      toast({
        title: "Dados salvos com sucesso!",
        description: `${rowsToSave.length} transações foram salvas.`,
        variant: "default",
      });

      // Reset the isNew and isModified flags
      setRows(rows.map(row => ({
        ...row,
        isNew: false,
        isModified: false
      })));
    } catch (error) {
      console.error("Error saving data:", error);
      toast({
        title: "Erro ao salvar dados",
        description: "Ocorreu um erro ao salvar os dados. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRow = (id: string) => {
    setRows(rows.filter(row => row.id !== id));
  };

  const handleExport = () => {
    exportToCSV(rows, 'planilha-financeira');
  };

  const handleImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const processImportedFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        
        // Map CSV columns to our data structure
        const dateIndex = headers.findIndex(h => h.toLowerCase().includes('data'));
        const descIndex = headers.findIndex(h => h.toLowerCase().includes('descri'));
        const catIndex = headers.findIndex(h => h.toLowerCase().includes('categ'));
        const methodIndex = headers.findIndex(h => h.toLowerCase().includes('method') || h.toLowerCase().includes('pagamento'));
        const amountIndex = headers.findIndex(h => h.toLowerCase().includes('valor'));
        const typeIndex = headers.findIndex(h => h.toLowerCase().includes('tipo'));
        
        const importedRows: SpreadsheetRow[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue; // Skip empty lines
          
          const values = lines[i].split(',');
          
          // Parse the date - try to handle different formats
          let dateStr = values[dateIndex]?.trim() || '';
          let date: Date | null = null;
          
          if (dateStr) {
            // Try to parse various date formats
            if (dateStr.includes('/')) {
              // DD/MM/YYYY or MM/DD/YYYY
              const parts = dateStr.split('/');
              if (parts.length === 3) {
                // Assume DD/MM/YYYY format
                date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
              }
            } else {
              // Try ISO format or other formats
              date = new Date(dateStr);
            }
          }
          
          if (!date || isNaN(date.getTime())) {
            // If date parsing failed, use current date
            date = new Date();
          }
          
          // Get payment method
          let paymentMethod = values[methodIndex]?.trim().toLowerCase() || 'money';
          if (paymentMethod.includes('cartao') || paymentMethod.includes('credito')) {
            paymentMethod = 'credit';
          } else if (paymentMethod.includes('debito')) {
            paymentMethod = 'debit';
          } else if (paymentMethod.includes('pix')) {
            paymentMethod = 'pix';
          } else if (paymentMethod.includes('transfer')) {
            paymentMethod = 'transfer';
          }
          
          // Get type
          let type: 'income' | 'expense' = 'expense';
          if (typeIndex >= 0) {
            const typeValue = values[typeIndex]?.trim().toLowerCase() || '';
            if (typeValue.includes('receita') || typeValue.includes('income')) {
              type = 'income';
            }
          } else {
            // If no type column, try to infer from amount
            const amountStr = values[amountIndex]?.trim() || '0';
            if (amountStr.startsWith('+')) {
              type = 'income';
            } else if (!amountStr.startsWith('-')) {
              // If amount is positive without sign, assume it's income
              type = 'income';
            }
          }
          
          // Get amount - clean up currency symbols, etc
          let amountStr = values[amountIndex]?.trim() || '0';
          amountStr = amountStr.replace(/[^\d.,\-+]/g, ''); // Remove currency symbols, keep only digits, dot, comma, minus
          amountStr = amountStr.replace(',', '.'); // Replace comma with dot for decimal
          let amount = parseFloat(amountStr);
          if (isNaN(amount)) amount = 0;
          
          // Ensure amount is positive (type already captured sign)
          amount = Math.abs(amount);
          
          // Get category
          let category = values[catIndex]?.trim().toLowerCase() || 'outros';
          if (category.includes('aliment')) {
            category = 'alimentacao';
          } else if (category.includes('transport')) {
            category = 'transporte';
          } else if (category.includes('casa') || category.includes('morad')) {
            category = 'moradia';
          } else if (category.includes('lazer')) {
            category = 'lazer';
          } else if (category.includes('saude')) {
            category = 'saude';
          } else if (category.includes('educa')) {
            category = 'educacao';
          } else if (category.includes('salario')) {
            category = 'salario';
          }
          
          importedRows.push({
            id: `imported-${Date.now()}-${i}`,
            date: date.toISOString().split('T')[0],
            description: values[descIndex]?.trim() || '',
            category,
            paymentMethod,
            amount,
            type,
            isNew: true
          });
        }
        
        if (importedRows.length > 0) {
          setRows([...rows, ...importedRows]);
          toast({
            title: "Importação concluída",
            description: `${importedRows.length} registros foram importados.`,
            variant: "default",
          });
        } else {
          toast({
            title: "Nenhum registro importado",
            description: "O arquivo parece estar vazio ou com formato incompatível.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error parsing CSV:", error);
        toast({
          title: "Erro ao importar arquivo",
          description: "O formato do arquivo não é compatível. Verifique se é um CSV válido.",
          variant: "destructive",
        });
      }
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    
    reader.readAsText(file);
  };

  return (
    <Card className="mt-6">
      <CardContent className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Planilha de Lançamentos</h3>
          <div className="flex gap-2">
            <Button onClick={handleAddRow} className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Nova Linha
            </Button>
            <Button onClick={handleSaveAll} variant="default" className="flex items-center gap-1 bg-green-600 text-white hover:bg-green-700">
              <Save className="h-4 w-4" />
              Salvar Tudo
            </Button>
            <Button onClick={handleImport} variant="secondary" className="flex items-center gap-1">
              <Upload className="h-4 w-4" />
              Importar
            </Button>
            <Button onClick={handleExport} variant="outline" className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".csv" 
              onChange={processImportedFile} 
            />
          </div>
        </div>
        
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 w-24">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Descrição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 w-36">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 w-32">
                  Método
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 w-36">
                  Cartão
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 w-36">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 w-24">
                  Tipo
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 w-20">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {rows.map((row) => (
                <tr key={row.id} className={row.isNew || row.isModified ? 'bg-blue-50' : ''}>
                  <td className="px-2 py-2">
                    <Input 
                      type="date" 
                      value={row.date}
                      onChange={(e) => handleRowChange(row.id, 'date', e.target.value)}
                      className="w-full text-sm"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <Input 
                      type="text" 
                      value={row.description}
                      onChange={(e) => handleRowChange(row.id, 'description', e.target.value)}
                      placeholder="Descrição"
                      className="w-full text-sm"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <Select 
                      value={row.category}
                      onValueChange={(value) => handleRowChange(row.id, 'category', value)}
                    >
                      <SelectTrigger className="w-full text-sm">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alimentacao">Alimentação</SelectItem>
                        <SelectItem value="transporte">Transporte</SelectItem>
                        <SelectItem value="moradia">Moradia</SelectItem>
                        <SelectItem value="lazer">Lazer</SelectItem>
                        <SelectItem value="saude">Saúde</SelectItem>
                        <SelectItem value="educacao">Educação</SelectItem>
                        <SelectItem value="salario">Salário</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-2 py-2">
                    <Select 
                      value={row.paymentMethod}
                      onValueChange={(value) => handleRowChange(row.id, 'paymentMethod', value)}
                    >
                      <SelectTrigger className="w-full text-sm">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="money">Dinheiro</SelectItem>
                        <SelectItem value="debit">Débito</SelectItem>
                        <SelectItem value="credit">Cartão de Crédito</SelectItem>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="transfer">Transferência</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-2 py-2">
                    <Select 
                      value={row.creditCardId || ''}
                      onValueChange={(value) => handleRowChange(row.id, 'creditCardId', value)}
                      disabled={row.paymentMethod !== 'credit'}
                    >
                      <SelectTrigger className="w-full text-sm">
                        <SelectValue placeholder="Selecione o cartão" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Nenhum</SelectItem>
                        {creditCards.map(card => (
                          <SelectItem key={card.id} value={card.id}>{card.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-2 py-2">
                    <Input 
                      type="number" 
                      value={row.amount}
                      onChange={(e) => handleRowChange(row.id, 'amount', parseFloat(e.target.value) || 0)}
                      placeholder="0,00"
                      className="w-full text-sm"
                      step="0.01"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <Select 
                      value={row.type}
                      onValueChange={(value: 'expense' | 'income') => handleRowChange(row.id, 'type', value)}
                    >
                      <SelectTrigger className="w-full text-sm">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="expense">Despesa</SelectItem>
                        <SelectItem value="income">Receita</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-2 py-2 text-center">
                    <div className="flex justify-center space-x-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-green-600 hover:text-green-900"
                        onClick={() => {
                          const transaction: Partial<Transaction> = {
                            id: row.isNew ? undefined : row.id,
                            description: row.description,
                            amount: row.amount,
                            date: new Date(row.date).toISOString(),
                            category: row.category,
                            type: row.type,
                            paymentMethod: row.paymentMethod,
                            creditCardId: row.paymentMethod === 'credit' ? row.creditCardId || null : null,
                            notes: '',
                          };
                          
                          addTransaction(transaction);
                          
                          // Update row's isNew and isModified flags
                          handleRowChange(row.id, 'isNew', false);
                          handleRowChange(row.id, 'isModified', false);
                          
                          toast({
                            title: "Registro salvo",
                            description: "O registro foi salvo com sucesso.",
                          });
                        }}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteRow(row.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    Nenhum registro encontrado. Clique em "Nova Linha" para adicionar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpreadsheetTab;
