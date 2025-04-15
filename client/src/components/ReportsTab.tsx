import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
  LineChart, Line, AreaChart, Area
} from "recharts";
import { useFinanceData } from "../hooks/useFinanceData";
import { formatCurrency } from "../utils/formatters";
import { exportToCSV } from "../utils/exportData";

interface ReportsTabProps {
  currentMonth: number;
  currentYear: number;
}

const ReportsTab = ({ currentMonth, currentYear }: ReportsTabProps) => {
  const [showMonthlyReport, setShowMonthlyReport] = useState(true);
  
  const { 
    expensesByCategory, 
    monthlyData,
    balanceHistory,
    isLoading,
    transactions
  } = useFinanceData();

  const COLORS = ['#3b82f6', '#2dd4bf', '#f59e0b', '#ef4444', '#8b5cf6', '#22c55e', '#64748b', '#f43f5e'];

  const exportReport = () => {
    // Create a more detailed report for export
    const reportData = showMonthlyReport 
      ? monthlyData.map(item => ({
          month: item.month,
          income: item.income,
          expenses: item.expenses,
          balance: item.balance
        }))
      : expensesByCategory.map(item => ({
          category: item.category,
          amount: item.amount,
          percentage: ((item.amount / expensesByCategory.reduce((sum, cat) => sum + cat.amount, 0)) * 100).toFixed(2) + '%'
        }));
    
    exportToCSV(reportData, showMonthlyReport ? 'relatorio-mensal' : 'relatorio-categorias');
  };

  return (
    <Card className="mt-6">
      <CardContent className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Relatórios</h3>
          <div className="flex gap-2">
            <Button 
              variant={showMonthlyReport ? "default" : "outline"} 
              onClick={() => setShowMonthlyReport(true)}
            >
              Relatório Mensal
            </Button>
            <Button 
              variant={!showMonthlyReport ? "default" : "outline"} 
              onClick={() => setShowMonthlyReport(false)}
            >
              Relatório por Categoria
            </Button>
            <Button variant="outline" onClick={exportReport} className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              Exportar Relatório
            </Button>
          </div>
        </div>
        
        {showMonthlyReport ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card>
                <CardContent className="p-4">
                  <h4 className="mb-4 text-sm font-medium text-gray-500">Receitas x Despesas</h4>
                  <div className="h-[250px]">
                    {isLoading ? (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-sm text-gray-400">Carregando dados...</p>
                      </div>
                    ) : monthlyData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={monthlyData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis tickFormatter={(value) => formatCurrency(value).split(',')[0]} />
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                          <Legend />
                          <Bar dataKey="income" name="Receitas" fill="#22c55e" />
                          <Bar dataKey="expenses" name="Despesas" fill="#ef4444" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-sm text-gray-400">Nenhum dado disponível</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <h4 className="mb-4 text-sm font-medium text-gray-500">Saldo Mensal</h4>
                  <div className="h-[250px]">
                    {isLoading ? (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-sm text-gray-400">Carregando dados...</p>
                      </div>
                    ) : monthlyData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={monthlyData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis tickFormatter={(value) => formatCurrency(value).split(',')[0]} />
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                          <Area 
                            type="monotone" 
                            dataKey="balance" 
                            name="Saldo" 
                            stroke="#3b82f6" 
                            fill="#93c5fd" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-sm text-gray-400">Nenhum dado disponível</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardContent className="p-4">
                <h4 className="mb-4 text-sm font-medium text-gray-500">Histórico de Saldo</h4>
                <div className="h-[250px]">
                  {isLoading ? (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-sm text-gray-400">Carregando dados...</p>
                    </div>
                  ) : balanceHistory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={balanceHistory}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis tickFormatter={(value) => formatCurrency(value).split(',')[0]} />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="balance" 
                          name="Saldo" 
                          stroke="#3b82f6" 
                          activeDot={{ r: 8 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-sm text-gray-400">Nenhum dado disponível</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="p-4">
                <h4 className="mb-4 text-sm font-medium text-gray-500">Despesas por Categoria</h4>
                <div className="h-[300px]">
                  {isLoading ? (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-sm text-gray-400">Carregando dados...</p>
                    </div>
                  ) : expensesByCategory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expensesByCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
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
                      <p className="text-sm text-gray-400">Nenhuma despesa registrada no período</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <h4 className="mb-4 text-sm font-medium text-gray-500">Detalhamento por Categoria</h4>
                <div className="overflow-y-auto max-h-[300px]">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Categoria
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                          Valor
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                          %
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {isLoading ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                            Carregando dados...
                          </td>
                        </tr>
                      ) : expensesByCategory.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                            Nenhuma despesa registrada no período.
                          </td>
                        </tr>
                      ) : (
                        expensesByCategory.map((category, index) => {
                          const totalExpenses = expensesByCategory.reduce((sum, cat) => sum + cat.amount, 0);
                          const percentage = (category.amount / totalExpenses) * 100;
                          
                          return (
                            <tr key={index}>
                              <td className="whitespace-nowrap px-6 py-4">
                                <div className="flex items-center">
                                  <div 
                                    className="h-3 w-3 rounded-full mr-2" 
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                  ></div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {category.category}
                                  </div>
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">
                                {formatCurrency(category.amount)}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">
                                {percentage.toFixed(1)}%
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportsTab;
