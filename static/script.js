document.addEventListener('DOMContentLoaded', () => {
    // Set today's date as default
    document.getElementById('date').valueAsDate = new Date();
    
    // Load expenses when page loads
    loadExpenses();
    
    // Handle form submission
    document.getElementById('expenseForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const amount = document.getElementById('amount').value;
        const category = document.getElementById('category').value;
        const date = document.getElementById('date').value;
        const description = document.getElementById('description').value;
        
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
            
            if (response.ok) {
                // Clear form
                document.getElementById('expenseForm').reset();
                document.getElementById('date').valueAsDate = new Date();
                
                // Reload expenses
                loadExpenses();
            } else {
                const error = await response.json();
                alert('Error adding expense: ' + error.error);
            }
        } catch (error) {
            alert('Error adding expense: ' + error.message);
        }
    });
});

async function loadExpenses() {
    try {
        const response = await fetch('/api/expenses');
        const expenses = await response.json();
        
        const expensesList = document.getElementById('expensesList');
        expensesList.innerHTML = '';
        
        expenses.forEach(expense => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${expense.date}</td>
                <td>${expense.category}</td>
                <td>${expense.description || '-'}</td>
                <td>$${parseFloat(expense.amount).toFixed(2)}</td>
                <td>
                    <span class="delete-btn" onclick="deleteExpense(${expense.id})">
                        <i class="fas fa-trash"></i> Delete
                    </span>
                </td>
            `;
            expensesList.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading expenses:', error);
    }
}

async function deleteExpense(id) {
    if (confirm('Are you sure you want to delete this expense?')) {
        try {
            const response = await fetch(`/api/expenses/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                loadExpenses();
            } else {
                alert('Error deleting expense');
            }
        } catch (error) {
            alert('Error deleting expense: ' + error.message);
        }
    }
} 