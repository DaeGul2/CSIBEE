import os
import uuid
from flask import Blueprint, request, jsonify, send_from_directory, current_app
from werkzeug.utils import secure_filename
from sqlalchemy import or_
from app.models import FoundItemPost, User
from app.database import db

found_item_bp = Blueprint('found_items', __name__, url_prefix='/found_items')

UPLOAD_FOLDER = os.path.join("app", "static", "uploads")
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# 습득물 게시글 등록 (이미지 포함)
@found_item_bp.route('/', methods=['POST'])
def create_found_item():
    data = request.form
    files = request.files.getlist("images")

    # 작성자(author_id) 유효성 체크
    author_id = data.get('author_id')
    user = User.query.get(author_id)
    if not user:
        return jsonify({"error": "유효한 사용자 ID가 아닙니다."}), 400

    image_urls = []
    if files:
        for file in files:
            if file and allowed_file(file.filename):
                # uuid로 고유 파일명 생성
                unique_filename = f"{uuid.uuid4().hex}_{secure_filename(file.filename)}"
                filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
                file.save(filepath)
                image_urls.append(f"/static/uploads/{unique_filename}")

    found_item = FoundItemPost(
        found_item_post_name=data.get('found_item_post_name'),
        author_id=author_id,
        found_item_name=data.get('found_item_name'),
        found_location=data.get('found_location'),
        found_time=data.get('found_time'),
        content=data.get('content'),
        image_urls=",".join(image_urls) if image_urls else None,
        status=False  # 기본값: 미해결
    )
    db.session.add(found_item)
    db.session.commit()

    return jsonify({"message": "습득물 게시글이 등록되었습니다.", "found_item_post_id": found_item.found_item_post_id}), 201

# 습득물 게시글 목록 조회 (키워드 검색 + 페이지네이션)
@found_item_bp.route('/', methods=['GET'])
def get_found_items():
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    keyword = request.args.get('keyword', '', type=str)

    query = FoundItemPost.query

    if keyword:
        query = query.filter(or_(
            FoundItemPost.found_item_post_name.ilike(f"%{keyword}%"),
            FoundItemPost.found_item_name.ilike(f"%{keyword}%"),
            FoundItemPost.content.ilike(f"%{keyword}%"),
            FoundItemPost.found_location.ilike(f"%{keyword}%"),
            FoundItemPost.found_time.ilike(f"%{keyword}%"),
        ))

    pagination = query.order_by(FoundItemPost.created_at.desc()).paginate(page=page, per_page=limit, error_out=False)
    found_items = pagination.items

    result = {
        "found_items": [
            {
                "found_item_post_id": post.found_item_post_id,
                "found_item_post_name": post.found_item_post_name,
                "author_id": post.author_id,
                "created_at": post.created_at,
                "found_item_name": post.found_item_name,
                "found_location": post.found_location,
                "found_time": post.found_time,
                "content": post.content,
                "image_urls": post.image_urls.split(",") if post.image_urls else [],
                "views": post.views,
                "status": post.status,
            }
            for post in found_items
        ],
        "total_pages": pagination.pages,
        "current_page": pagination.page,
        "total_items": pagination.total
    }
    return jsonify(result)

# 특정 습득물 게시글 조회 (조회수 증가)
@found_item_bp.route('/<int:post_id>', methods=['GET'])
def get_found_item(post_id):
    post = FoundItemPost.query.get(post_id)
    if not post:
        return jsonify({'error': '게시글을 찾을 수 없습니다.'}), 404

    post.views += 1
    db.session.commit()

    return jsonify({
        'found_item_post_id': post.found_item_post_id,
        'found_item_post_name': post.found_item_post_name,
        'author_id': post.author_id,
        'created_at': post.created_at,
        'found_item_name': post.found_item_name,
        'found_location': post.found_location,
        'found_time': post.found_time,
        'content': post.content,
        'image_urls': post.image_urls.split(",") if post.image_urls else [],
        'views': post.views,
        'status': post.status,
    }), 200

# 습득물 게시글 수정 (상태 업데이트 등)
@found_item_bp.route('/<int:post_id>', methods=['PUT'])
def update_found_item(post_id):
    post = FoundItemPost.query.get(post_id)
    if not post:
        return jsonify({'error': '게시글을 찾을 수 없습니다.'}), 404

    data = request.json
    if 'status' in data:
        post.status = data['status']
    db.session.commit()

    return jsonify({'message': '게시글이 수정되었습니다.'}), 200

# 습득물 게시글 삭제
@found_item_bp.route('/<int:post_id>', methods=['DELETE'])
def delete_found_item(post_id):
    post = FoundItemPost.query.get(post_id)
    if not post:
        return jsonify({'error': '게시글을 찾을 수 없습니다.'}), 404

    db.session.delete(post)
    db.session.commit()
    return jsonify({'message': '게시글이 삭제되었습니다.'}), 200

# 업로드된 이미지 서빙
@found_item_bp.route("/uploads/<filename>", methods=["GET"])
def serve_uploaded_file(filename):
    return send_from_directory(current_app.config["UPLOAD_FOLDER"], filename)
