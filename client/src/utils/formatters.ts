/**
 * Format a number as currency (BRL)
 * @param value The number to format
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(value);
};

/**
 * Format a date string to local format (DD/MM/YYYY)
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

/**
 * Get month name from month index (0-11)
 * @param monthIndex Month index (0-11)
 * @returns Month name in Portuguese
 */
export const getMonthName = (monthIndex: number): string => {
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  return monthNames[monthIndex];
};

/**
 * Get category display name from category ID
 * @param categoryId Category ID
 * @returns Human-readable category name
 */
export const getCategoryName = (categoryId: string): string => {
  const categories: Record<string, string> = {
    alimentacao: 'Alimentação',
    transporte: 'Transporte',
    moradia: 'Moradia',
    lazer: 'Lazer',
    saude: 'Saúde',
    educacao: 'Educação',
    salario: 'Salário',
    outros: 'Outros'
  };
  
  return categories[categoryId] || categoryId;
};

/**
 * Get payment method display name from method ID
 * @param methodId Payment method ID
 * @returns Human-readable payment method name
 */
export const getPaymentMethodName = (methodId: string): string => {
  const methods: Record<string, string> = {
    money: 'Dinheiro',
    debit: 'Débito',
    credit: 'Cartão de Crédito',
    pix: 'PIX',
    transfer: 'Transferência'
  };
  
  return methods[methodId] || methodId;
};
