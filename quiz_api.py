#!/usr/bin/env python3
import json
import random
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://localhost:3001"])

# Load quiz questions
try:
    with open('FIRE2.json', 'r') as f:
        questions = json.load(f)
    print(f"Loaded {len(questions)} questions from FIRE2.json")
except FileNotFoundError:
    questions = []
    print("Warning: FIRE2.json not found, using empty questions list")
except Exception as e:
    questions = []
    print(f"Error loading FIRE2.json: {e}")

@app.route('/api/quiz/questions', methods=['GET'])
def api_get_quiz_questions():
    try:
        # Get the number of questions requested (default to 10)
        num_questions = request.args.get('count', 10, type=int)
        
        # Ensure we don't exceed available questions
        available_questions = len(questions)
        if num_questions > available_questions:
            num_questions = available_questions
        
        # Randomly select questions if count is specified
        if num_questions < available_questions:
            selected_questions = random.sample(questions, num_questions)
        else:
            selected_questions = questions
        
        # Add sequential IDs for this quiz session
        for i, question in enumerate(selected_questions):
            question['id'] = i
        
        return jsonify({
            'success': True, 
            'questions': selected_questions,
            'total_available': available_questions
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/quiz/submit', methods=['POST'])
def api_submit_quiz():
    try:
        data = request.get_json()
        answers = data.get('answers', {})
        quiz_questions = data.get('questions', [])
        
        score = 0
        total_questions = len(quiz_questions)
        
        # Compare user answers with correct answers from the submitted questions
        for question in quiz_questions:
            question_id = str(question.get('id'))
            user_answer = answers.get(question_id)
            correct_answer = question.get('correct_answer')
            if user_answer == correct_answer:
                score += 1
        
        percentage = round((score / total_questions * 100), 1) if total_questions > 0 else 0
        
        return jsonify({
            'success': True,
            'score': score,
            'total': total_questions,
            'percentage': percentage
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

if __name__ == '__main__':
    print(f"Starting quiz API server...")
    print(f"Questions available: {len(questions)}")
    app.run(debug=True, host='0.0.0.0', port=5001)
