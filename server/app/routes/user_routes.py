from flask import Blueprint, request, jsonify
from app.models import User
from app.database import db

user_bp = Blueprint('users', __name__, url_prefix='/users')

@user_bp.route('/', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([{
        'user_id': user.user_id,
        'user_name': user.user_name,
        'phone_number': user.phone_number,
        'admission_year': user.admission_year,
        'grade': user.grade,
        'class_num': user.class_num,
        'student_num': user.student_num,
        'is_admin': user.is_admin,
    } for user in users]), 200

@user_bp.route('/<string:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({
        'user_id': user.user_id,
        'user_name': user.user_name,
        'phone_number': user.phone_number,
        'admission_year': user.admission_year,
        'grade': user.grade,
        'class_num': user.class_num,
        'student_num': user.student_num,
        'is_admin': user.is_admin,
    }), 200

@user_bp.route('/', methods=['POST'])
def create_user():
    data = request.json
    # user_id 값이 반드시 있어야 함
    if not data.get('user_id'):
        return jsonify({'error': 'user_id is required.'}), 400
    print("넘어온 데이터 : ",data)

    user = User(
        user_id=data.get('user_id'),
        user_password=data.get('user_password'),
        user_name=data.get('user_name'),
        admission_year=data.get('admission_year'),
        grade=data.get('grade'),
        class_num=data.get('class_num'),
        student_num=data.get('student_num'),
        phone_number=data.get('phone_number'),
        is_admin=data.get('is_admin', False)
    )
    db.session.add(user)
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

    return jsonify({'message': 'User created', 'user_id': user.user_id}), 201

@user_bp.route('/<string:user_id>', methods=['PUT'])
def update_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    data = request.json
    user.user_password = data.get('user_password', user.user_password)
    user.user_name = data.get('user_name', user.user_name)
    user.admission_year = data.get('admission_year', user.admission_year)
    user.grade = data.get('grade', user.grade)
    user.class_num = data.get('class_num', user.class_num)
    user.student_num = data.get('student_num', user.student_num)
    user.phone_number = data.get('phone_number', user.phone_number)
    user.is_admin = data.get('is_admin', user.is_admin)
    db.session.commit()
    return jsonify({'message': 'User updated'}), 200

@user_bp.route('/<string:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted'}), 200
