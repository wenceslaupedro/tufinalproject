from flask import Flask, render_template, request, jsonify, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
from dotenv import load_dotenv
import sys
import mysql.connector
from mysql.connector import Error
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Database configuration
db_user = os.getenv('DB_USER', 'root')
db_password = os.getenv('DB_PASSWORD', 'password')
db_host = os.getenv('DB_HOST', 'localhost')
db_name = os.getenv('DB_NAME', 'expense_tracker')

# Create database if it doesn't exist
try:
    conn = mysql.connector.connect(
        host=db_host,
        user=db_user,
        password=db_password
    )
    if conn.is_connected():
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
        logger.info(f"Database '{db_name}' created successfully!")
except Error as e:
    logger.error(f"Error while connecting to MySQL: {e}")
    sys.exit(1)
finally:
    if 'conn' in locals() and conn.is_connected():
        cursor.close()
        conn.close()

# Initialize Flask app
app = Flask(__name__)

# Construct database URL
db_url = f'mysql+mysqlconnector://{db_user}:{db_password}@{db_host}/{db_name}'
app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
db = SQLAlchemy(app)

# Expense model
class Expense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    date = db.Column(db.Date, nullable=False)
    description = db.Column(db.String(200))

    def to_dict(self):
        return {
            'id': self.id,
            'amount': self.amount,
            'category': self.category,
            'date': self.date.strftime('%Y-%m-%d'),
            'description': self.description
        }

# Create tables
try:
    with app.app_context():
        db.create_all()
        logger.info("Database tables created successfully!")
except Exception as e:
    logger.error(f"Error creating tables: {str(e)}")
    sys.exit(1)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    try:
        logger.debug("Fetching all expenses")
        expenses = Expense.query.order_by(Expense.date.desc()).all()
        expense_list = [expense.to_dict() for expense in expenses]
        logger.debug(f"Found {len(expense_list)} expenses")
        return jsonify(expense_list)
    except Exception as e:
        logger.error(f"Database error in get_expenses: {str(e)}")
        return jsonify({'error': f"Database error: {str(e)}"}), 500

@app.route('/api/expenses', methods=['POST'])
def add_expense():
    try:
        data = request.json
        logger.debug(f"Received expense data: {data}")
        
        # Validate required fields
        required_fields = ['amount', 'category', 'date']
        for field in required_fields:
            if field not in data:
                error_msg = f"Missing required field: {field}"
                logger.error(error_msg)
                return jsonify({'error': error_msg}), 400
        
        # Create new expense
        expense = Expense(
            amount=float(data['amount']),
            category=data['category'],
            date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
            description=data.get('description', '')
        )
        
        # Add to database
        db.session.add(expense)
        db.session.commit()
        
        logger.info(f"Successfully added expense: {expense.to_dict()}")
        return jsonify(expense.to_dict()), 201
        
    except ValueError as e:
        error_msg = f"Invalid data format: {str(e)}"
        logger.error(error_msg)
        return jsonify({'error': error_msg}), 400
    except Exception as e:
        error_msg = f"Error adding expense: {str(e)}"
        logger.error(error_msg)
        db.session.rollback()
        return jsonify({'error': error_msg}), 500

@app.route('/api/expenses/<int:id>', methods=['DELETE'])
def delete_expense(id):
    try:
        logger.debug(f"Attempting to delete expense with ID: {id}")
        expense = Expense.query.get_or_404(id)
        db.session.delete(expense)
        db.session.commit()
        logger.info(f"Successfully deleted expense with ID: {id}")
        return '', 204
    except Exception as e:
        error_msg = f"Error deleting expense: {str(e)}"
        logger.error(error_msg)
        db.session.rollback()
        return jsonify({'error': error_msg}), 500

if __name__ == '__main__':
    app.run(debug=True) 