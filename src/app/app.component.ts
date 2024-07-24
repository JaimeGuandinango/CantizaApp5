import { Component } from '@angular/core';
import { Platform,ToastController } from '@ionic/angular';
import { DatabaseService } from './services/database.service';
import { NetworkService } from './services/network.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  providers: [DatabaseService, NetworkService]
})
export class AppComponent {



  isOnline!: boolean;
  appPages = [
    { title: 'Home', url: '/list', icon: 'home' },
    { title: 'Settings', url: '/settings', icon: 'settings' }
  ];

  constructor(
    private platform: Platform,
    private dbService: DatabaseService,
    private networkService: NetworkService,
    private router: Router,
    private toastController: ToastController,
  ) {
    this.initializeApp();
    this.checkNetwork();
  }

  initializeApp() {
    this.platform.ready().then(() => {
    });
  }

  async checkNetwork() {
    this.presentToast('bottom', 'Check Status');
    this.isOnline = await this.networkService.checkNetworkStatus();
    this.loadItems();
  }

  async loadItems() {
    if (this.isOnline) {
      console.log('Fetching items from the online API');
      this.presentToast('bottom', 'Sincronizando las información');
      localStorage.setItem('isOnline', 'ON');
      await this.dbService.saveInformation();
    } else {
      console.log('Fetching items from the local SQLite database');
      this.presentToast('bottom', 'Offline: Fetching items from the local SQLite database');
      localStorage.setItem('isOnline', 'OFF');
    }
  }

  logOut() {
    localStorage.clear();
    this.router.navigate(['/sign-in']);    
  }

  async presentToast(position: 'top' | 'middle' | 'bottom', msg: string = 'Toast Message') {
    const toast = await this.toastController.create({
      message: msg,
      duration: 1500,
      position: position,
    });

    await toast.present();
  }
}
