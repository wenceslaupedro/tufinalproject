document.addEventListener('DOMContentLoaded', () => {
    // Set today's date as default
    document.getElementById('date').valueAsDate = new Date();
    
    // Load expenses when page loads
    loadExpenses();
    
    // Handle form submission
    document.getElementById('expenseForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Form submitted');
        
        const amount = document.getElementById('amount').value;
        const category = document.getElementById('category').value;
        const date = document.getElementById('date').value;
        const description = document.getElementById('description').value;
        
        console.log('Sending data:', { amount, category, date, description });
        
        try {
            const response = await fetch('/api/expenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount,
                    category,
                    date,
                    description
                })
            });
            
            console.log('Response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Success response:', data);
                
                // Clear form
                document.getElementById('expenseForm').reset();
                document.getElementById('date').valueAsDate = new Date();
                
                // Reload expenses
                await loadExpenses();
            } else {
                const error = await response.json();
                console.error('Server error:', error);
                alert('Error adding expense: ' + error.error);
            }
        } catch (error) {
            console.error('Network error:', error);
            alert('Error adding expense: ' + error.message);
        }
    });
});

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function calculateTotal(expenses) {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
}

async function loadExpenses() {
    try {
        console.log('Loading expenses...');
        const response = await fetch('/api/expenses');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const expenses = await response.json();
        console.log('Loaded expenses:', expenses);
        
        const expensesList = document.getElementById('expensesList');
        expensesList.innerHTML = '';
        
        if (expenses.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="5" class="text-center">No expenses found</td>';
            expensesList.appendChild(row);
            // Add empty total row
            addTotalRow(0);
            return;
        }
        
        expenses.forEach(expense => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatDate(expense.date)}</td>
                <td>${expense.category}</td>
                <td>${expense.description || '-'}</td>
                <td>€${parseFloat(expense.amount).toFixed(2)}</td>
                <td>
                    <span class="delete-btn" onclick="deleteExpense(${expense.id})">
                        <i class="fas fa-trash"></i> Delete
                    </span>
                </td>
            `;
            expensesList.appendChild(row);
        });

        // Add total row
        const total = calculateTotal(expenses);
        addTotalRow(total);

    } catch (error) {
        console.error('Error loading expenses:', error);
        const expensesList = document.getElementById('expensesList');
        expensesList.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error loading expenses</td></tr>';
    }
}

function addTotalRow(total) {
    const expensesList = document.getElementById('expensesList');
    const totalRow = document.createElement('tr');
    totalRow.className = 'table-info font-weight-bold';
    totalRow.innerHTML = `
        <td colspan="3" class="text-end"><strong>Total:</strong></td>
        <td><strong>€${parseFloat(total).toFixed(2)}</strong></td>
        <td></td>
    `;
    expensesList.appendChild(totalRow);
}

async function deleteExpense(id) {
    if (confirm('Are you sure you want to delete this expense?')) {
        try {
            console.log('Deleting expense:', id);
            const response = await fetch(`/api/expenses/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                console.log('Expense deleted successfully');
                await loadExpenses();
            } else {
                const error = await response.json();
                console.error('Error deleting expense:', error);
                alert('Error deleting expense');
            }
        } catch (error) {
            console.error('Network error:', error);
            alert('Error deleting expense: ' + error.message);
        }
    }
} 