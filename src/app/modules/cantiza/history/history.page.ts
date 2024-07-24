import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, MenuController } from '@ionic/angular';
import { Router } from '@angular/router';
import { CantizaService } from 'src/app/services/cantiza.service';
import { NetworkService } from 'src/app/services/network.service';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class HistoryPage implements OnInit {
  
  isOnline!: boolean;
  history: any[] = [];
  userId = JSON.parse(localStorage.getItem('user') || '{}').id;
  constructor(
    private cantizaService: CantizaService,
    private router: Router,
    private menuCtrl:MenuController,
    private networkService: NetworkService,
    private dbService: DatabaseService
  ) { }

  ngOnInit() {
    this.menuCtrl.enable(true);
    this.getHistory();
  }

  getHistory() {
    if(!this.isOnline) {
      this.cantizaService.getHistoryRegister(this.userId).subscribe({
        next: (res) => {
          this.history = res;
        },
        error: (err) => {
          console.log(err);
        }
      });
    } else {
      this.dbService.getListHistory(this.userId).then((res) => {
        console.log("getListHistory",res);
        this.history = res;
      });
    }
  }

  

}
