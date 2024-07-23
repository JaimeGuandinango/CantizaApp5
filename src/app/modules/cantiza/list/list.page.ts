import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, MenuController } from '@ionic/angular';
import { ProductService } from 'src/app/services/product.service';
import { Router } from '@angular/router';
import { CantizaService } from 'src/app/services/cantiza.service';
import { HttpClientModule } from '@angular/common/http';
import { DatabaseService } from 'src/app/services/database.service';
import { NetworkService } from 'src/app/services/network.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, HttpClientModule],
  providers: [CantizaService]
})
export class ListPage implements OnInit {

  isOnline!: boolean;
  users!: any[];
  history: any[] = [];
  userId = JSON.parse(localStorage.getItem('user') || '{}').id;
  constructor(
    private cantizaService: CantizaService,
    private router: Router,
    private menuCtrl:MenuController,
    private dbService: DatabaseService,
    private networkService: NetworkService
    ) {
      this.menuCtrl.enable(true);
    }

  async ngOnInit() {
    this.isOnline = await this.networkService.checkNetworkStatus();
    this.menuCtrl.enable(true);
    this.getHistory();
  }

  registerWork(item:any) {
    this.router.navigate(['/register', item.id]);
  }

  getHistory() {
    if (this.isOnline) {
      this.cantizaService.getHistory(this.userId).subscribe({
        next: (res) => {
          this.history = res;
        },
        error: (err) => {
          console.log(err);
        }
      }); 
    }else{
      this.dbService.getHistory(this.userId).then((res) => {
        this.history = res;
      });
    }
  }
  
  ionViewDidEnter() {
    this.menuCtrl.enable(true);
  }
}
