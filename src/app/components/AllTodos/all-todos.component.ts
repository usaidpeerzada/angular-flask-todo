import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface Todo {
  id: number;
  content: string;
  done: boolean;
  date_created: any;
  isEditing?: boolean;
  editContent?: string;
}

@Component({
  selector: 'all-todos',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './all-todos.component.html',
  styleUrls: ['./all-todos.component.css'],
})
export class AllTodosComponent implements OnInit {
  todos = signal<Todo[]>([]);
  private http = inject(HttpClient);
  newTodo = '';

  ngOnInit(): void {
    this.getTodos();
  }

  getTodos(): void {
    this.http.get<Todo[]>('http://127.0.0.1:5000/').subscribe((response) => {
      this.todos.set(response);
    });
  }

  todoDone(event: Event, id: number) {
    const isChecked = (event.target as HTMLInputElement).checked;
    const body = { id, done: isChecked };

    this.http
      .put<Todo>('http://127.0.0.1:5000/update', body)
      .subscribe((response) => {
        this.todos.set(
          this.todos().map((todo) => (todo.id === id ? response : todo))
        );
      });
  }

  handleEdit(todoId: number) {
    this.todos.update((todos) =>
      todos.map((todo) =>
        todo.id === todoId
          ? { ...todo, isEditing: true, editContent: todo.content }
          : todo
      )
    );
  }

  saveEdit(todoId: number) {
    const todo = this.todos().find((t) => t.id === todoId);
    if (todo && todo.editContent !== undefined) {
      const body = { id: todoId, content: todo.editContent };

      this.http
        .put<Todo>('http://127.0.0.1:5000/update', body)
        .subscribe((response) => {
          this.todos.set(
            this.todos().map((todo) =>
              todo.id === todoId ? { ...response, isEditing: false } : todo
            )
          );
        });
    }
  }

  cancelEdit(todoId: number) {
    this.todos.update((todos) =>
      todos.map((todo) =>
        todo.id === todoId
          ? { ...todo, isEditing: false, editContent: undefined }
          : todo
      )
    );
  }

  handleInputChange(event: Event) {
    const content = (event.target as HTMLInputElement).value;
    this.newTodo = content;
  }

  handleAdd() {
    if (!this.newTodo) {
      return;
    }
    const body = {
      content: this.newTodo,
    };
    this.newTodo = '';
    this.http
      .post<Todo>('http://127.0.0.1:5000/create-task', body)
      .subscribe((response) => {
        const currentTodos = this.todos();
        this.todos.set([...currentTodos, response]);
      });
  }

  deleteTodo(id: number) {
    this.http
      .delete<Todo>(`http://127.0.0.1:5000/delete/${id}`)
      .subscribe((response) =>
        this.todos.set(this.todos().filter((todo) => todo.id !== id))
      );
  }
}
