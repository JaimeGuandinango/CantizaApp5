import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ToastController, MenuController } from '@ionic/angular';
import { CantizaService } from 'src/app/services/cantiza.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NetworkService } from 'src/app/services/network.service';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.page.html',
  styleUrls: ['./sign-in.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    IonicModule,
    HttpClientModule,
  ],
  providers: [
    CantizaService
  ]
})
export class SignInPage implements OnInit {

  loginForm!: FormGroup;
  isOnline!: boolean;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private cantizaService: CantizaService,
    private toastController: ToastController,
    private menuCtrl:MenuController,
    private networkService: NetworkService,
    private dBService: DatabaseService
    ) {
      //code ...
  }
  async ngOnInit() {
    this.menuCtrl.enable(false);
    this.initForm();
    this.isOnline = await this.networkService.checkNetworkStatus();
  }

  initForm() {
    //formulario reactivo
    this.loginForm = this.fb.group({
      email: ['jm@gmail.com', [Validators.required, Validators.email]],
      password: ['123456', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      if (!this.isOnline) {
        this.cantizaService.login(this.loginForm.value).subscribe({
          next: (res) => {
            console.log(res);
            this.presentToast('top', 'Inicio de sesión exitoso');
            localStorage.setItem('user', JSON.stringify(res.data));
            this.router.navigate(['/list']);
          },
          error: (err) => {
            this.presentToast('top', 'Error al iniciar sesión');
            console.log(err);
          }
        });
      }else{
        this.dBService.login(this.loginForm.value).then((res) => {
          console.log(res);
          if (res.length > 0) {
            console.log(res);
            this.presentToast('top', 'Inicio de sesión exitoso');
            localStorage.setItem('user', JSON.stringify(res[0]));
            this.router.navigate(['/list']);
          } else {
            this.presentToast('top', 'Error al iniciar sesión');
            console.log('Error al iniciar sesión');
          }
        });
      }
    } else {
      console.log('Form Not Valid');
    }
  }

  async presentToast(position: 'top' | 'middle' | 'bottom', msg: string = 'Toast Message') {
    const toast = await this.toastController.create({
      message: msg,
      duration: 1500,
      position: position,
    });

    await toast.present();
  }

  ionViewDidEnter() {
    this.menuCtrl.enable(false);
  }
}
