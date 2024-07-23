import { Component, OnInit } from '@angular/core';
import { IonicModule, IonIcon } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
  providers: [IonIcon]
})
export class MenuComponent implements OnInit{
  appPages:any[] = [];
  ngOnInit(): void {
    this.appPages = [
      { title: 'Home', url: '/list', icon: 'home' },
      { title: 'Settings', url: '/settings', icon: 'settings' }
    ];  
  }
  
}
