import { Injectable } from '@angular/core';
import { Network } from '@capacitor/network';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  public isConnected: boolean = true;

  constructor() {
    this.initializeNetworkEvents();
  }

  private async initializeNetworkEvents() {
    const status = await Network.getStatus();
    this.isConnected = status.connected;

    Network.addListener('networkStatusChange', (status) => {
      this.isConnected = status.connected;
      console.log('Network status changed', status);
    });
  }

  public async checkNetworkStatus(): Promise<boolean> {
    const status = await Network.getStatus();
    this.isConnected = status.connected;
    return this.isConnected;
  }
}
