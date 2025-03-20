from flask import Blueprint, request, jsonify
from app.models import Comment, CommentCategoryEnum
from app.database import db

comment_bp = Blueprint('comments', __name__, url_prefix='/comments')

@comment_bp.route('/', methods=['GET'])
def get_comments():
    comments = Comment.query.all()
    return jsonify([{
        'comment_id': comment.comment_id,
        'category': comment.category.value,  # enum의 value 사용
        'author_id': comment.author_id,
        'post_id': comment.post_id,
        'content': comment.content,
        'parent_comment_id': comment.parent_comment_id
    } for comment in comments]), 200

@comment_bp.route('/<int:comment_id>', methods=['GET'])
def get_comment(comment_id):
    comment = Comment.query.get(comment_id)
    if not comment:
        return jsonify({'error': 'Comment not found'}), 404
    return jsonify({
        'comment_id': comment.comment_id,
        'category': comment.category.value,
        'author_id': comment.author_id,
        'post_id': comment.post_id,
        'content': comment.content,
        'parent_comment_id': comment.parent_comment_id
    }), 200

@comment_bp.route('/', methods=['POST'])
def create_comment():
    data = request.json
    try:
        # category를 문자열에서 enum으로 변환
        category_enum = CommentCategoryEnum(data.get('category'))
    except ValueError:
        return jsonify({'error': 'Invalid category'}), 400

    comment = Comment(
        category=category_enum,
        author_id=data.get('author_id'),
        post_id=data.get('post_id'),
        content=data.get('content'),
        parent_comment_id=data.get('parent_comment_id')
    )
    db.session.add(comment)
    db.session.commit()
    return jsonify({'message': 'Comment created', 'comment_id': comment.comment_id}), 201

@comment_bp.route('/<int:comment_id>', methods=['PUT'])
def update_comment(comment_id):
    comment = Comment.query.get(comment_id)
    if not comment:
        return jsonify({'error': 'Comment not found'}), 404
    data = request.json
    if 'category' in data:
        try:
            comment.category = CommentCategoryEnum(data.get('category'))
        except ValueError:
            return jsonify({'error': 'Invalid category'}), 400
    comment.content = data.get('content', comment.content)
    db.session.commit()
    return jsonify({'message': 'Comment updated'}), 200

@comment_bp.route('/<int:comment_id>', methods=['DELETE'])
def delete_comment(comment_id):
    comment = Comment.query.get(comment_id)
    if not comment:
        return jsonify({'error': 'Comment not found'}), 404
    db.session.delete(comment)
    db.session.commit()
    return jsonify({'message': 'Comment deleted'}), 200
