from flask import Blueprint, request, jsonify, session
from app.models import User
from app.database import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    user_id = data.get('user_id')
    password = data.get('password')

    if not user_id or not password:
        return jsonify({'error': '아이디와 비밀번호를 입력하세요.'}), 400

    user = User.query.filter_by(user_id=user_id).first()
    if not user:
        return jsonify({'error': '아이디 또는 비밀번호가 올바르지 않습니다.'}), 401

    # 비밀번호 평문 비교(현재 로직) - 필요시 해시 검증으로 교체 가능
    if user.user_password != password:
        return jsonify({'error': '아이디 또는 비밀번호가 올바르지 않습니다.'}), 401

    # 관리자 승인 여부 확인
    if not user.is_confirmed:
        return jsonify({'error': '관리자의 승인을 받기 전입니다.'}), 403

    # 로그인 성공 -> 세션에 저장
    session['user_id'] = user.user_id
    session['user_name'] = user.user_name
    session['is_admin'] = user.is_admin
    print("✅ [로그인 성공] :", session)

    return jsonify({
        'message': '로그인 성공',
        'user_id': user.user_id,
        'user_name': user.user_name,
        'is_admin': user.is_admin,
        'is_confirmed': user.is_confirmed
    }), 200

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': '로그아웃 성공'}), 200

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    if 'user_id' not in session:
        return jsonify({'error': '로그인하지 않음'}), 401

    user = User.query.filter_by(user_id=session['user_id']).first()
    if not user:
        return jsonify({'error': '유저 정보를 찾을 수 없음'}), 404

    return jsonify({
        'user_id': user.user_id,
        'user_name': user.user_name,
        'is_admin': user.is_admin,
        'is_confirmed': user.is_confirmed
    }), 200
