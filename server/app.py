from flask import Flask, jsonify, request, abort
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from flask_cors import CORS  # Import CORS


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
db = SQLAlchemy(app)
CORS(app) 

class Todo(db.Model):
  id = db.Column(db.Integer, primary_key=True)
  content = db.Column(db.String(200), nullable=False)
  date_created = db.Column(db.DateTime, default=datetime.utcnow)
  done = db.Column(db.Boolean, default=False)

  def __repr__(self) -> str:
    return '<Task %r' % self.id

@app.route('/', methods=['POST', 'GET'])
def index():
  tasks = Todo.query.order_by(Todo.date_created).all()
  tasks_list = [{'id': task.id, 'done': task.done, 'content': task.content, 'date_created': task.date_created} for task in tasks]
  return jsonify(tasks_list)

@app.route('/create-task', methods=['POST'])
def create():
  incoming_json = request.get_json()
  if incoming_json == '':
    return 'empty'
  content = incoming_json.get('content', 'no content available')
  new_task = Todo(content = content)
  try:
    db.session.add(new_task)
    db.session.commit()
    tasks_list = {'id': new_task.id, 'done': new_task.done, 'content': new_task.content, 'date_created': new_task.date_created}

    return jsonify(tasks_list)
  except:
    return "error"

@app.route('/update', methods=["PUT"])
def update():
  incoming_json = request.get_json()
  todo_id = incoming_json.get('id', 'id not available')
  content = incoming_json.get('content', 'not available')
  done = incoming_json.get('done', 'False')
  data = get_data_from_id(todo_id)

  if content != 'not available':
    data.content = content
  if done != 'False':
    data.done = done
  
  try:
    db.session.commit()
    return jsonify({
      'id': data.id,
      'content': data.content,
      'done': data.done,
      'date_created': data.date_created
    }), 200
  except:
    db.session.rollback()
    abort(500, description="An error occurred while updating the Todo")

@app.route('/delete/<int:id>', methods=['DELETE'])
def delete(id):
  task_to_delete = Todo.query.get_or_404(id)
  try:
    db.session.delete(task_to_delete)
    db.session.commit()
    return jsonify("deleted")
  except:
   return 'cannot delete'

def get_data_from_id(id):
  content = Todo.query.get(id)
  if not content:
        abort(404, description="Todo not found")
  return content

if __name__ == "__main__":
  app.run(debug=True)
