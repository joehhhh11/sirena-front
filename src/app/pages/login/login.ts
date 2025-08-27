import { Component } from '@angular/core';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  standalone:true,
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email= '';
  password='';

  constructor(private auth: AuthService, private router: Router){}

  login(){
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(["/dashboard/turnos"]),
      error:(err) => alert("login fallido")
    })
  }

}
