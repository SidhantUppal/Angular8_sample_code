import { Component, OnInit } from '@angular/core';
import { CustomAuthenticationService } from './../custom-authentication.service';
@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {

  constructor(private authService: CustomAuthenticationService) { }

  ngOnInit() {
    this.authService.logout();
  }

}
