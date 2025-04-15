import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { useFinanceData } from "../hooks/useFinanceData";
import { formatCurrency } from "../utils/formatters";

interface FinancialSummaryProps {
  currentMonth: number;
  currentYear: number;
}

const FinancialSummary = ({ currentMonth, currentYear }: FinancialSummaryProps) => {
  const { 
    totalIncome, 
    totalExpenses, 
    balance, 
    expensesByCategory,
    isLoading 
  } = useFinanceData();

  const COLORS = ['#3b82f6', '#2dd4bf', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-2 text-sm font-medium text-gray-500">Receitas</h3>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-2 text-sm font-medium text-gray-500">Despesas</h3>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-2 text-sm font-medium text-gray-500">Saldo</h3>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-primary' : 'text-red-600'}`}>
                {formatCurrency(balance)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">Resumo Financeiro</h3>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="mb-2 text-sm font-medium text-gray-500">Despesas por Categoria</h4>
              <div className="h-[250px]">
                {isLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <Skeleton className="h-full w-full rounded-md" />
                  </div>
                ) : expensesByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expensesByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="amount"
                        nameKey="category"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {expensesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-sm text-gray-400">Nenhuma despesa registrada neste mês</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="mb-2 text-sm font-medium text-gray-500">Receitas x Despesas</h4>
              <div className="h-[250px]">
                {isLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <Skeleton className="h-full w-full rounded-md" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Receitas', value: totalIncome, color: '#22c55e' },
                        { name: 'Despesas', value: totalExpenses, color: '#ef4444' }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => formatCurrency(value).split(',')[0]} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Bar dataKey="value" name="Valor" fill={(entry) => entry.color} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialSummary;
