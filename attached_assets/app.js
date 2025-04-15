// Configuração do Firebase (substitua com suas credenciais)
const firebaseConfig = {
    apiKey: "AIzaSyBI3PqPC6GER1QwVHD3XQ1XwExStmIyoTk",
    authDomain: "despesas-financeiras.firebaseapp.com",
    projectId: "despesas-financeiras",
    storageBucket: "despesas-financeiras.appspot.com",
    messagingSenderId: "572841772738",
    appId: "1:572841772738:web:f952e3c295c0b712d5dd5b"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Classes para representar os dados
class Transaction {
    constructor(id, description, amount, date, category, notes, type, paymentMethod = null, creditCardId = null) {
        this.id = id;
        this.description = description;
        this.amount = parseFloat(amount);
        this.date = new Date(date).toISOString();
        this.category = category;
        this.notes = notes;
        this.type = type; // 'income' ou 'expense'
        this.paymentMethod = paymentMethod;
        this.creditCardId = creditCardId;
        this.createdAt = new Date().toISOString();
    }
}

class CreditCard {
    constructor(id, name, bank, limit, dueDay, closingDay) {
        this.id = id;
        this.name = name;
        this.bank = bank;
        this.limit = parseFloat(limit);
        this.dueDay = parseInt(dueDay);
        this.closingDay = parseInt(closingDay);
        this.createdAt = new Date().toISOString();
    }
}

class FixedExpense {
    constructor(id, description, amount, category, paymentMethod, dayOfMonth, notes, creditCardId = null) {
        this.id = id;
        this.description = description;
        this.amount = parseFloat(amount);
        this.category = category;
        this.paymentMethod = paymentMethod;
        this.dayOfMonth = parseInt(dayOfMonth);
        this.notes = notes;
        this.creditCardId = creditCardId;
        this.createdAt = new Date().toISOString();
    }
}

// Gerenciador de dados
class FinanceManager {
    constructor(userId) {
        this.userId = userId;
        this.transactions = [];
        this.creditCards = [];
        this.fixedExpenses = [];
    }

    async fetchData() {
        try {
            const [transactions, creditCards, fixedExpenses] = await Promise.all([
                this.fetchTransactions(),
                this.fetchCreditCards(),
                this.fetchFixedExpenses()
            ]);
            
            this.transactions = transactions;
            this.creditCards = creditCards;
            this.fixedExpenses = fixedExpenses;
            
            return true;
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            return false;
        }
    }

    async fetchTransactions() {
        const snapshot = await db.collection(`users/${this.userId}/transactions`).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async fetchCreditCards() {
        const snapshot = await db.collection(`users/${this.userId}/creditCards`).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async fetchFixedExpenses() {
        const snapshot = await db.collection(`users/${this.userId}/fixedExpenses`).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async addTransaction(transaction) {
        const docRef = await db.collection(`users/${this.userId}/transactions`).add(transaction);
        const newTransaction = { id: docRef.id, ...transaction };
        this.transactions.push(newTransaction);
        return newTransaction;
    }

    async deleteTransaction(id) {
        await db.collection(`users/${this.userId}/transactions`).doc(id).delete();
        this.transactions = this.transactions.filter(t => t.id !== id);
        return true;
    }

    async addCreditCard(card) {
        const docRef = await db.collection(`users/${this.userId}/creditCards`).add(card);
        const newCard = { id: docRef.id, ...card };
        this.creditCards.push(newCard);
        return newCard;
    }

    async deleteCreditCard(id) {
        await db.collection(`users/${this.userId}/creditCards`).doc(id).delete();
        this.creditCards = this.creditCards.filter(c => c.id !== id);
        return true;
    }

    async addFixedExpense(expense) {
        const docRef = await db.collection(`users/${this.userId}/fixedExpenses`).add(expense);
        const newExpense = { id: docRef.id, ...expense };
        this.fixedExpenses.push(newExpense);
        return newExpense;
    }

    async deleteFixedExpense(id) {
        await db.collection(`users/${this.userId}/fixedExpenses`).doc(id).delete();
        this.fixedExpenses = this.fixedExpenses.filter(e => e.id !== id);
        return true;
    }

    getMonthlyTransactions(month, year) {
        return this.transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate.getMonth() === month && transactionDate.getFullYear() === year;
        });
    }

    getMonthlyIncomes(month, year) {
        const monthlyTransactions = this.getMonthlyTransactions(month, year);
        return monthlyTransactions.filter(transaction => transaction.type === 'income');
    }

    getMonthlyExpenses(month, year) {
        const monthlyTransactions = this.getMonthlyTransactions(month, year);
        return monthlyTransactions.filter(transaction => transaction.type === 'expense');
    }

    getMonthlyBalance(month, year) {
        const incomes = this.getMonthlyIncomes(month, year);
        const expenses = this.getMonthlyExpenses(month, year);
        
        const totalIncome = incomes.reduce((sum, transaction) => sum + transaction.amount, 0);
        const totalExpense = expenses.reduce((sum, transaction) => sum + transaction.amount, 0);
        
        return totalIncome - totalExpense;
    }

    getCreditCardExpenses(cardId, month, year) {
        const monthlyTransactions = this.getMonthlyTransactions(month, year);
        return monthlyTransactions.filter(
            transaction => transaction.type === 'expense' && 
            transaction.paymentMethod === 'credit' && 
            transaction.creditCardId === cardId
        );
    }
}

// Variáveis globais
let financeManager;
let currentDisplayedMonth = new Date().getMonth();
let currentDisplayedYear = new Date().getFullYear();

// Funções de utilidade
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('pt-BR');
}

function getMonthName(monthIndex) {
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
                       "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    return monthNames[monthIndex];
}

function getCategoryName(categoryId) {
    const categories = {
        'alimentacao': 'Alimentação',
        'transporte': 'Transporte',
        'moradia': 'Moradia',
        'lazer': 'Lazer',
        'saude': 'Saúde',
        'educacao': 'Educação',
        'salario': 'Salário',
        'outros': 'Outros'
    };
    
    return categories[categoryId] || categoryId;
}

function getPaymentMethodName(method) {
    const methods = {
        'money': 'Dinheiro',
        'debit': 'Débito',
        'credit': 'Cartão de Crédito',
        'pix': 'PIX',
        'transfer': 'Transferência'
    };
    
    return methods[method] || method;
}

// Funções de autenticação
function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    if (!email || !password) {
        document.getElementById("auth-error").textContent = "Por favor, informe email e senha.";
        return;
    }
    
    auth.signInWithEmailAndPassword(email, password)
        .catch(error => {
            console.error("Erro no login:", error);
            document.getElementById("auth-error").textContent = error.message;
        });
}

function signup() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    if (!email || !password) {
        document.getElementById("auth-error").textContent = "Por favor, informe email e senha.";
        return;
    }
    
    auth.createUserWithEmailAndPassword(email, password)
        .then(() => {
            return db.collection("users").doc(auth.currentUser.uid).set({
                email: email,
                plan: "free"
            });
        })
        .catch(error => {
            console.error("Erro no cadastro:", error);
            document.getElementById("auth-error").textContent = error.message;
        });
}

function logout() {
    auth.signOut();
}

function showApp(user) {
    document.getElementById("auth-container").style.display = "none";
    document.getElementById("app-container").style.display = "block";
    document.getElementById("user-name").textContent = user.email;
}

function showAuth() {
    document.getElementById("auth-container").style.display = "block";
    document.getElementById("app-container").style.display = "none";
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";
    document.getElementById("auth-error").textContent = "";
}

// Funções de UI
async function updateUI() {
    try {
        // Mostra um loading enquanto carrega os dados
        document.getElementById("transactions-list").innerHTML = '<p class="empty-list">Carregando transações...</p>';
        document.getElementById("credit-cards-list").innerHTML = '<p class="empty-list">Carregando cartões...</p>';
        document.getElementById("fixed-expenses-list").innerHTML = '<p class="empty-list">Carregando despesas fixas...</p>';
        
        // Busca os dados atualizados
        await financeManager.fetchData();
        
        // Atualiza a exibição do mês atual
        document.getElementById("current-month").textContent = `${getMonthName(currentDisplayedMonth)} ${currentDisplayedYear}`;
        
        // Atualiza o resumo financeiro
        updateFinancialSummary();
        
        // Atualiza as listas
        updateTransactionsList();
        updateCreditCardsList();
        updateFixedExpensesList();
        
        // Preenche os selects de cartões de crédito nos formulários
        populateCreditCardSelects();
        
    } catch (error) {
        console.error("Erro ao atualizar a UI:", error);
    }
}

function updateFinancialSummary() {
    const incomes = financeManager.getMonthlyIncomes(currentDisplayedMonth, currentDisplayedYear);
    const expenses = financeManager.getMonthlyExpenses(currentDisplayedMonth, currentDisplayedYear);
    
    const totalIncome = incomes.reduce((sum, transaction) => sum + transaction.amount, 0);
    const totalExpense = expenses.reduce((sum, transaction) => sum + transaction.amount, 0);
    const balance = totalIncome - totalExpense;
    
    document.getElementById("total-income").textContent = formatCurrency(totalIncome);
    document.getElementById("total-expenses").textContent = formatCurrency(totalExpense);
    document.getElementById("balance").textContent = formatCurrency(balance);
    
    // Aplica classe conforme o saldo
    const balanceElement = document.getElementById("balance");
    balanceElement.className = balance >= 0 ? "balance" : "expense";
}

function updateTransactionsList() {
    const transactionsContainer = document.getElementById("transactions-list");
    const transactions = financeManager.getMonthlyTransactions(currentDisplayedMonth, currentDisplayedYear);
    
    if (transactions.length === 0) {
        transactionsContainer.innerHTML = '<p class="empty-list">Nenhuma transação encontrada neste mês.</p>';
        return;
    }
    
    // Ordena por data (mais recente primeiro)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let html = '';
    
    transactions.forEach(transaction => {
        const isExpense = transaction.type === 'expense';
        const creditCardName = transaction.creditCardId ? 
            financeManager.creditCards.find(c => c.id === transaction.creditCardId)?.name || 'Cartão' : '';
        
        html += `
            <div class="list-item">
                <div class="list-item-details">
                    <h4>${transaction.description}</h4>
                    <p>
                        <span class="category-badge category-${transaction.category}">${getCategoryName(transaction.category)}</span>
                        ${formatDate(transaction.date)} 
                        ${transaction.paymentMethod ? `| ${getPaymentMethodName(transaction.paymentMethod)}` : ''}
                        ${creditCardName ? `| ${creditCardName}` : ''}
                    </p>
                    ${transaction.notes ? `<p class="notes">${transaction.notes}</p>` : ''}
                </div>
                <div class="list-item-amount ${isExpense ? 'expense' : 'income'}">
                    ${isExpense ? '-' : '+'} ${formatCurrency(transaction.amount)}
                </div>
                <div class="list-item-actions">
                    <button class="btn-action btn-delete" data-id="${transaction.id}">Excluir</button>
                </div>
            </div>
        `;
    });
    
    transactionsContainer.innerHTML = html;
    
    // Adiciona os listeners para os botões de exclusão
    document.querySelectorAll('#transactions-list .btn-delete').forEach(button => {
        button.addEventListener('click', async function() {
            const id = this.getAttribute('data-id');
            if (confirm('Tem certeza que deseja excluir esta transação?')) {
                await financeManager.deleteTransaction(id);
                updateUI();
            }
        });
    });
}

function updateCreditCardsList() {
    const cardsContainer = document.getElementById("credit-cards-list");
    const cards = financeManager.creditCards;
    
    if (cards.length === 0) {
        cardsContainer.innerHTML = '<p class="empty-list">Nenhum cartão de crédito cadastrado.</p>';
        return;
    }
    
    let html = '';
    
    cards.forEach(card => {
        // Calcula o uso do limite para o mês atual
        const cardExpenses = financeManager.getCreditCardExpenses(card.id, currentDisplayedMonth, currentDisplayedYear);
        const totalUsed = cardExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const percentUsed = (totalUsed / card.limit) * 100;
        
        html += `
            <div class="list-item">
                <div class="list-item-details">
                    <h4>${card.name}</h4>
                    <p>${card.bank} | Fechamento: Dia ${card.closingDay} | Vencimento: Dia ${card.dueDay}</p>
                    <div class="card-limit-bar">
                        <div class="limit-used" style="width: ${percentUsed}%"></div>
                    </div>
                    <p>Limite: ${formatCurrency(card.limit)} | Usado: ${formatCurrency(totalUsed)} (${percentUsed.toFixed(1)}%)</p>
                </div>
                <div class="list-item-actions">
                    <button class="btn-action btn-delete" data-id="${card.id}">Excluir</button>
                </div>
            </div>
        `;
    });
    
    cardsContainer.innerHTML = html;
    
    // Adiciona os listeners para os botões de exclusão
    document.querySelectorAll('#credit-cards-list .btn-delete').forEach(button => {
        button.addEventListener('click', async function() {
            const id = this.getAttribute('data-id');
            if (confirm('Tem certeza que deseja excluir este cartão? Transações associadas a ele serão mantidas.')) {
                await financeManager.deleteCreditCard(id);
                updateUI();
            }
        });
    });
}

function updateFixedExpensesList() {
    const expensesContainer = document.getElementById("fixed-expenses-list");
    const expenses = financeManager.fixedExpenses;
    
    if (expenses.length === 0) {
        expensesContainer.innerHTML = '<p class="empty-list">Nenhuma despesa fixa cadastrada.</p>';
        return;
    }
    
    // Ordena por dia do mês
    expenses.sort((a, b) => a.dayOfMonth - b.dayOfMonth);
    
    let html = '';
    
    expenses.forEach(expense => {
        const creditCardName = expense.creditCardId ? 
            financeManager.creditCards.find(c => c.id === expense.creditCardId)?.name || 'Cartão' : '';
        
        html += `
            <div class="list-item">
                <div class="list-item-details">
                    <h4>${expense.description}</h4>
                    <p>
                        <span class="category-badge category-${expense.category}">${getCategoryName(expense.category)}</span>
                        Todo dia ${expense.dayOfMonth} 
                        ${expense.paymentMethod ? `| ${getPaymentMethodName(expense.paymentMethod)}` : ''}
                        ${creditCardName ? `| ${creditCardName}` : ''}
                    </p>
                    ${expense.notes ? `<p class="notes">${expense.notes}</p>` : ''}
                </div>
                <div class="list-item-amount expense">
                    ${formatCurrency(expense.amount)}
                </div>
                <div class="list-item-actions">
                    <button class="btn-action btn-delete" data-id="${expense.id}">Excluir</button>
                </div>
            </div>
        `;
    });
    
    expensesContainer.innerHTML = html;
    
    // Adiciona os listeners para os botões de exclusão
    document.querySelectorAll('#fixed-expenses-list .btn-delete').forEach(button => {
        button.addEventListener('click', async function() {
            const id = this.getAttribute('data-id');
            if (confirm('Tem certeza que deseja excluir esta despesa fixa?')) {
                await financeManager.deleteFixedExpense(id);
                updateUI();
            }
        });
    });
}

function populateCreditCardSelects() {
    const transactionCreditCardSelect = document.getElementById("transaction-credit-card");
    const fixedExpenseCreditCardSelect = document.getElementById("fixed-expense-credit-card");
    const cards = financeManager.creditCards;
    
    // Limpa os selects
    transactionCreditCardSelect.innerHTML = '';
    fixedExpenseCreditCardSelect.innerHTML = '';
    
    if (cards.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Nenhum cartão cadastrado';
        transactionCreditCardSelect.appendChild(option);
        
        const optionFixed = document.createElement('option');
        optionFixed.value = '';
        optionFixed.textContent = 'Nenhum cartão cadastrado';
        fixedExpenseCreditCardSelect.appendChild(optionFixed);
        return;
    }
    
    // Adiciona as opções de cartões
    cards.forEach(card => {
        const option = document.createElement('option');
        option.value = card.id;
        option.textContent = `${card.name} (${card.bank})`;
        transactionCreditCardSelect.appendChild(option);
        
        const optionFixed = document.createElement('option');
        optionFixed.value = card.id;
        optionFixed.textContent = `${card.name} (${card.bank})`;
        fixedExpenseCreditCardSelect.appendChild(optionFixed);
    });
}

function generateCategoryReport() {
    const reportContainer = document.getElementById("report-container");
    const expenses = financeManager.getMonthlyExpenses(currentDisplayedMonth, currentDisplayedYear);
    
    if (expenses.length === 0) {
        reportContainer.innerHTML = '<p class="empty-list">Não há despesas para gerar o relatório.</p>';
        return;
    }
    
    // Agrupa as despesas por categoria
    const categoriesMap = {};
    let totalExpense = 0;
    
    expenses.forEach(expense => {
        if (!categoriesMap[expense.category]) {
            categoriesMap[expense.category] = 0;
        }
        categoriesMap[expense.category] += expense.amount;
        totalExpense += expense.amount;
    });
    
    // Converte para array e ordena do maior para o menor
    const categories = [];
    for (const category in categoriesMap) {
        categories.push({
            name: getCategoryName(category),
            id: category,
            amount: categoriesMap[category],
            percentage: (categoriesMap[category] / totalExpense) * 100
        });
    }
    
    categories.sort((a, b) => b.amount - a.amount);
    
    let html = `
        <h3>Relatório de Gastos por Categoria - ${getMonthName(currentDisplayedMonth)} ${currentDisplayedYear}</h3>
        <p class="report-total">Total de despesas: ${formatCurrency(totalExpense)}</p>
        <div class="category-chart">
    `;
    
    // Gera o gráfico de barras
    categories.forEach(category => {
        html += `
            <div class="chart-item">
                <div class="chart-label">
                    <span class="category-badge category-${category.id}">${category.name}</span>
                    <span>${formatCurrency(category.amount)} (${category.percentage.toFixed(1)}%)</span>
                </div>
                <div class="chart-bar-container">
                    <div class="chart-bar category-${category.id}" style="width: ${category.percentage}%"></div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    reportContainer.innerHTML = html;
}

function generateMonthlyReport() {
    const reportContainer = document.getElementById("report-container");
    
    // Busca dados dos últimos 6 meses
    const monthsData = [];
    let currentMonth = currentDisplayedMonth;
    let currentYear = currentDisplayedYear;
    
    for (let i = 0; i < 6; i++) {
        // Retrocede um mês
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        
        const incomes = financeManager.getMonthlyIncomes(currentMonth, currentYear);
        const expenses = financeManager.getMonthlyExpenses(currentMonth, currentYear);
        
        const totalIncome = incomes.reduce((sum, transaction) => sum + transaction.amount, 0);
        const totalExpense = expenses.reduce((sum, transaction) => sum + transaction.amount, 0);
        
        monthsData.unshift({
            month: getMonthName(currentMonth),
            year: currentYear,
            income: totalIncome,
            expense: totalExpense,
            balance: totalIncome - totalExpense
        });
    }
    
    // Adiciona o mês atual
    const currentIncomes = financeManager.getMonthlyIncomes(currentDisplayedMonth, currentDisplayedYear);
    const currentExpenses = financeManager.getMonthlyExpenses(currentDisplayedMonth, currentDisplayedYear);
    
    const currentTotalIncome = currentIncomes.reduce((sum, transaction) => sum + transaction.amount, 0);
    const currentTotalExpense = currentExpenses.reduce((sum, transaction) => sum + transaction.amount, 0);
    
    monthsData.push({
        month: getMonthName(currentDisplayedMonth),
        year: currentDisplayedYear,
        income: currentTotalIncome,
        expense: currentTotalExpense,
        balance: currentTotalIncome - currentTotalExpense
    });
    
    // Gera o HTML do relatório
    let html = `
        <h3>Evolução Mensal - Últimos 6 Meses</h3>
        <div class="monthly-chart-container">
            <div class="monthly-chart">
    `;
    
    // Encontra o valor máximo para escalar o gráfico
    const allValues = monthsData.flatMap(data => [data.income, data.expense, Math.abs(data.balance)]);
    const maxValue = Math.max(...allValues, 1);
    
    // Gera o gráfico
    monthsData.forEach(data => {
        const incomeHeight = (data.income / maxValue) * 100;
        const expenseHeight = (data.expense / maxValue) * 100;
        const balanceHeight = (Math.abs(data.balance) / maxValue) * 100;
        const isBalancePositive = data.balance >= 0;
        
        html += `
            <div class="month-column">
                <div class="chart-bars">
                    <div class="chart-bar income-bar" style="height: ${incomeHeight}%" title="Receitas: ${formatCurrency(data.income)}"></div>
                    <div class="chart-bar expense-bar" style="height: ${expenseHeight}%" title="Despesas: ${formatCurrency(data.expense)}"></div>
                    <div class="chart-bar ${isBalancePositive ? 'balance-positive-bar' : 'balance-negative-bar'}" 
                         style="height: ${balanceHeight}%" 
                         title="Saldo: ${formatCurrency(data.balance)}"></div>
                </div>
                <div class="month-label">${data.month.substring(0, 3)}<br>${data.year}</div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
        <div class="chart-legend">
            <div class="legend-item">
                <div class="legend-color income-bar"></div>
                <div>Receitas</div>
            </div>
            <div class="legend-item">
                <div class="legend-color expense-bar"></div>
                <div>Despesas</div>
            </div>
            <div class="legend-item">
                <div class="legend-color balance-positive-bar"></div>
                <div>Saldo Positivo</div>
            </div>
            <div class="legend-item">
                <div class="legend-color balance-negative-bar"></div>
                <div>Saldo Negativo</div>
            </div>
        </div>
        <div class="report-data">
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Mês</th>
                        <th>Receitas</th>
                        <th>Despesas</th>
                        <th>Saldo</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    // Adiciona os dados da tabela
    monthsData.forEach(data => {
        html += `
            <tr>
                <td>${data.month}/${data.year}</td>
                <td class="income">${formatCurrency(data.income)}</td>
                <td class="expense">${formatCurrency(data.expense)}</td>
                <td class="${data.balance >= 0 ? 'balance' : 'expense'}">${formatCurrency(data.balance)}</td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    reportContainer.innerHTML = html;
}

// Função para navegar entre meses
function navigateMonth(direction) {
    currentDisplayedMonth += direction;
    
    if (currentDisplayedMonth > 11) {
        currentDisplayedMonth = 0;
        currentDisplayedYear++;
    } else if (currentDisplayedMonth < 0) {
        currentDisplayedMonth = 11;
        currentDisplayedYear--;
    }
    
    updateUI();
}

// Função para adicionar uma nova transação
async function addTransaction() {
    const description = document.getElementById("transaction-description").value;
    const amount = document.getElementById("transaction-amount").value;
    const date = document.getElementById("transaction-date").value;
    const category = document.getElementById("transaction-category").value;
    const type = document.getElementById("transaction-type").value;
    const notes = document.getElementById("transaction-notes").value;
    const paymentMethod = document.getElementById("transaction-payment").value;
    
    // Validações básicas
    if (!description || !amount || !date || !category || !type) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
    }
    
    // Dados adicionais para cartão de crédito
    let creditCardId = null;
    if (paymentMethod === "credit") {
        creditCardId = document.getElementById("transaction-credit-card").value;
        if (!creditCardId) {
            alert("Por favor, selecione um cartão de crédito.");
            return;
        }
    }
    
    // Criar objeto de transação
    const transaction = new Transaction(
        null, // ID será gerado pelo Firebase
        description,
        amount,
        date,
        category,
        notes,
        type,
        paymentMethod,
        creditCardId
    );
    
    try {
        await financeManager.addTransaction(transaction);
        
        // Limpa o formulário
        document.getElementById("add-transaction-form").reset();
        
        // Atualiza a UI
        updateUI();
        
        // Fecha o modal
        closeModal("add-transaction-modal");
        
    } catch (error) {
        console.error("Erro ao adicionar transação:", error);
        alert("Erro ao adicionar transação. Por favor, tente novamente.");
    }
}

// Função para adicionar um novo cartão de crédito
async function addCreditCard() {
    const name = document.getElementById("credit-card-name").value;
    const bank = document.getElementById("credit-card-bank").value;
    const limit = document.getElementById("credit-card-limit").value;
    const dueDay = document.getElementById("credit-card-due-day").value;
    const closingDay = document.getElementById("credit-card-closing-day").value;
    
    // Validações básicas
    if (!name || !bank || !limit || !dueDay || !closingDay) {
        alert("Por favor, preencha todos os campos.");
        return;
    }
    
    // Validações específicas
    if (parseInt(dueDay) < 1 || parseInt(dueDay) > 31) {
        alert("O dia de vencimento deve estar entre 1 e 31.");
        return;
    }
    
    if (parseInt(closingDay) < 1 || parseInt(closingDay) > 31) {
        alert("O dia de fechamento deve estar entre 1 e 31.");
        return;
    }
    
    // Criar objeto de cartão
    const creditCard = new CreditCard(
        null, // ID será gerado pelo Firebase
        name,
        bank,
        limit,
        dueDay,
        closingDay
    );
    
    try {
        await financeManager.addCreditCard(creditCard);
        
        // Limpa o formulário
        document.getElementById("add-credit-card-form").reset();
        
        // Atualiza a UI
        updateUI();
        
        // Fecha o modal
        closeModal("add-credit-card-modal");
        
    } catch (error) {
        console.error("Erro ao adicionar cartão de crédito:", error);
        alert("Erro ao adicionar cartão de crédito. Por favor, tente novamente.");
    }
}

// Função para adicionar uma nova despesa fixa
async function addFixedExpense() {
    const description = document.getElementById("fixed-expense-description").value;
    const amount = document.getElementById("fixed-expense-amount").value;
    const category = document.getElementById("fixed-expense-category").value;
    const dayOfMonth = document.getElementById("fixed-expense-day").value;
    const notes = document.getElementById("fixed-expense-notes").value;
    const paymentMethod = document.getElementById("fixed-expense-payment").value;
    
    // Validações básicas
    if (!description || !amount || !category || !dayOfMonth) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
    }
    
    // Validações específicas
    if (parseInt(dayOfMonth) < 1 || parseInt(dayOfMonth) > 31) {
        alert("O dia do mês deve estar entre 1 e 31.");
        return;
    }
    
    // Dados adicionais para cartão de crédito
    let creditCardId = null;
    if (paymentMethod === "credit") {
        creditCardId = document.getElementById("fixed-expense-credit-card").value;
        if (!creditCardId) {
            alert("Por favor, selecione um cartão de crédito.");
            return;
        }
    }
    
    // Criar objeto de despesa fixa
    const fixedExpense = new FixedExpense(
        null, // ID será gerado pelo Firebase
        description,
        amount,
        category,
        paymentMethod,
        dayOfMonth,
        notes,
        creditCardId
    );
    
    try {
        await financeManager.addFixedExpense(fixedExpense);
        
        // Limpa o formulário
        document.getElementById("add-fixed-expense-form").reset();
        
        // Atualiza a UI
        updateUI();
        
        // Fecha o modal
        closeModal("add-fixed-expense-modal");
        
    } catch (error) {
        console.error("Erro ao adicionar despesa fixa:", error);
        alert("Erro ao adicionar despesa fixa. Por favor, tente novamente.");
    }
}

// Funções para gerenciar modais
function openModal(modalId) {
    document.getElementById(modalId).style.display = "block";
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
}

// Função para mostrar/esconder o seletor de cartão de crédito
function toggleCreditCardSelect(selector, paymentMethodSelectId) {
    const paymentMethod = document.getElementById(paymentMethodSelectId).value;
    const creditCardSelect = document.querySelector(selector);
    
    if (paymentMethod === "credit") {
        creditCardSelect.style.display = "block";
    } else {
        creditCardSelect.style.display = "none";
    }
}

// Inicialização da aplicação
document.addEventListener("DOMContentLoaded", function() {
    // Configura os listeners de autenticação
    document.getElementById("btn-login").addEventListener("click", login);
    document.getElementById("btn-signup").addEventListener("click", signup);
    document.getElementById("btn-logout").addEventListener("click", logout);
    
    // Monitora estado de autenticação
    auth.onAuthStateChanged(user => {
        if (user) {
            showApp(user);
            financeManager = new FinanceManager(user.uid);
            updateUI();
        } else {
            showAuth();
        }
    });
    
    // Botões de navegação do mês
    document.getElementById("prev-month").addEventListener("click", () => navigateMonth(-1));
    document.getElementById("next-month").addEventListener("click", () => navigateMonth(1));
    
    // Botões de abertura de modais
    document.getElementById("add-transaction-button").addEventListener("click", () => openModal("add-transaction-modal"));
    document.getElementById("add-credit-card-button").addEventListener("click", () => openModal("add-credit-card-modal"));
    document.getElementById("add-fixed-expense-button").addEventListener("click", () => openModal("add-fixed-expense-modal"));
    
    // Botões de fechamento de modais
    document.querySelectorAll(".close-modal").forEach(button => {
        button.addEventListener("click", function() {
            const modalId = this.closest(".modal").id;
            closeModal(modalId);
        });
    });
    
    // Botões de envio de formulários
    document.getElementById("add-transaction-submit").addEventListener("click", addTransaction);
    document.getElementById("add-credit-card-submit").addEventListener("click", addCreditCard);
    document.getElementById("add-fixed-expense-submit").addEventListener("click", addFixedExpense);
    
    // Ouvintes para o método de pagamento
    document.getElementById("transaction-payment").addEventListener("change", function() {
        toggleCreditCardSelect("#transaction-credit-card-container", "transaction-payment");
    });
    
    document.getElementById("fixed-expense-payment").addEventListener("change", function() {
        toggleCreditCardSelect("#fixed-expense-credit-card-container", "fixed-expense-payment");
    });
    
    // Botões de relatório
    document.getElementById("category-report-button").addEventListener("click", generateCategoryReport);
    document.getElementById("monthly-report-button").addEventListener("click", generateMonthlyReport);
    
    // Inicializa a data atual no formulário de transação
    const today = new Date().toISOString().split('T')[0];
    document.getElementById("transaction-date").value = today;
    
    // Configura tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove a classe active de todas as tabs
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            // Adiciona a classe active apenas à tab clicada
            this.classList.add('active');
            
            // Esconde todos os conteúdos de tab
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Mostra apenas o conteúdo da tab clicada
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
});

// Fechar modais ao clicar fora deles
window.addEventListener("click", function(event) {
    document.querySelectorAll(".modal").forEach(modal => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
});