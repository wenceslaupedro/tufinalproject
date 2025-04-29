# Simple Expense Tracker

A web-based expense tracking application built with Flask and MySQL.

## Features

- Add expenses with amount, category, date, and description
- View all expenses in a table format
- Delete expenses
- Responsive design that works on both desktop and mobile devices

## Tech Stack

- Backend: Python (Flask)
- Database: MySQL
- Frontend: HTML, CSS, JavaScript
- UI Framework: Bootstrap 5

## Setup Instructions

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a MySQL database named `expense_tracker`

4. Create a `.env` file in the project root with your database configuration:
```
DATABASE_URL=mysql://username:password@localhost/expense_tracker
```

5. Run the application:
```bash
python app.py
```

6. Open your browser and navigate to `http://localhost:5000`

## Project Structure

- `app.py` - Main Flask application
- `templates/index.html` - Main HTML template
- `static/style.css` - Custom CSS styles
- `static/script.js` - Frontend JavaScript
- `requirements.txt` - Python dependencies
- `.env` - Environment variables (database configuration)

## Contributing

Feel free to submit issues and enhancement requests! 