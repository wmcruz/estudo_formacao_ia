<critical>
Esta é uma REFERENCE da skill Angular. Você DEVE carregá-la e processá-la obrigatoriamente sempre que a skill for ativada.
</critical>

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: number;
  name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/users';

  public getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }

  public getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  public createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(this.baseUrl, user);
  }
}

@Component({
  selector: 'app-user-list',
  standalone: true,
  template: `
    <ul>
      <li *ngFor="let user of users()">
        {{ user.name }} - {{ user.email }}
      </li>
    </ul>
  `
})
export class UserListComponent implements OnInit {
  private readonly userService = inject(UserService);
  public users = signal<User[]>([]);

  ngOnInit() {
    this.userService.getUsers().subscribe(data => this.users.set(data));
  }
}
