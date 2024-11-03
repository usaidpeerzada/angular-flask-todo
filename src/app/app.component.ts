import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AllTodosComponent } from './components/AllTodos/all-todos.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AllTodosComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {}
