from flask import Blueprint, request, jsonify
from app.models import ShareItemPost
from app.database import db

share_item_bp = Blueprint('share_items', __name__, url_prefix='/share_items')

@share_item_bp.route('/', methods=['GET'])
def get_share_items():
    posts = ShareItemPost.query.all()
    return jsonify([{
        'share_item_post_id': post.share_item_post_id,
        'share_item_post_name': post.share_item_post_name,
        'author_id': post.author_id,
        'content': post.content,
        'image_urls': post.image_urls,
        'status': post.status,
        'views': post.views,
    } for post in posts]), 200

@share_item_bp.route('/<int:post_id>', methods=['GET'])
def get_share_item(post_id):
    post = ShareItemPost.query.get(post_id)
    if not post:
        return jsonify({'error': 'Post not found'}), 404
    return jsonify({
        'share_item_post_id': post.share_item_post_id,
        'share_item_post_name': post.share_item_post_name,
        'author_id': post.author_id,
        'content': post.content,
        'image_urls': post.image_urls,
        'status': post.status,
        'views': post.views,
    }), 200

@share_item_bp.route('/', methods=['POST'])
def create_share_item():
    data = request.json
    post = ShareItemPost(
        share_item_post_name=data.get('share_item_post_name'),
        author_id=data.get('author_id'),
        content=data.get('content'),
        image_urls=data.get('image_urls'),
        status=data.get('status', True)
    )
    db.session.add(post)
    db.session.commit()
    return jsonify({'message': 'Share item post created', 'share_item_post_id': post.share_item_post_id}), 201

@share_item_bp.route('/<int:post_id>', methods=['PUT'])
def update_share_item(post_id):
    post = ShareItemPost.query.get(post_id)
    if not post:
        return jsonify({'error': 'Post not found'}), 404
    data = request.json
    post.share_item_post_name = data.get('share_item_post_name', post.share_item_post_name)
    post.content = data.get('content', post.content)
    post.image_urls = data.get('image_urls', post.image_urls)
    post.status = data.get('status', post.status)
    db.session.commit()
    return jsonify({'message': 'Share item post updated'}), 200

@share_item_bp.route('/<int:post_id>', methods=['DELETE'])
def delete_share_item(post_id):
    post = ShareItemPost.query.get(post_id)
    if not post:
        return jsonify({'error': 'Post not found'}), 404
    db.session.delete(post)
    db.session.commit()
    return jsonify({'message': 'Share item post deleted'}), 200
