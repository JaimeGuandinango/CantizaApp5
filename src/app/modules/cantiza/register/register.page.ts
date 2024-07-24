import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { CantizaService } from 'src/app/services/cantiza.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NetworkService } from 'src/app/services/network.service';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule   ],
  providers: [CantizaService]
})
export class RegisterPage implements OnInit {
  registrationForm!: FormGroup;
  users: any;
  idWork: any;
  userId = JSON.parse(localStorage.getItem('user') || '{}').id;
  isOnline!: boolean;

  constructor(
    private fb: FormBuilder,
    private cantizaService: CantizaService,
    private router: Router,
    private toastController: ToastController,
    private activatedRoute: ActivatedRoute,
    private networkService: NetworkService,
    private dbService: DatabaseService

  ) { 
    this.initForm();
  }

  async ngOnInit() {
    this.idWork = this.activatedRoute.snapshot.params['id']; 
    this.isOnline = await this.networkService.checkNetworkStatus();   
    this.getUsers();
  }

  initForm() {
    this.registrationForm = this.fb.group({
      cochero: [this.userId, Validators.required],
      identifier: [this.idWork, Validators.required],
      trabajador: ['', Validators.required],
      malla: ['', Validators.required],
      tallosextra: [0, Validators.required]
    });
  }

  onSubmit() {
    if (this.registrationForm.valid) {
      if(!this.isOnline) {
        this.cantizaService.registerWork(this.registrationForm.value).subscribe({
          next: (res) => {
            this.presentToast('top', 'Registro exitoso');
            this.router.navigate(['/history']);
          },
          error: (err) => {
            this.presentToast('top', 'Error al registrar');
            console.log(err);
          }
        });
      } else {
        this.dbService.insertDataIngresos(this.registrationForm.value).then((res) => {
          this.presentToast('top', 'Registro exitoso');
          this.router.navigate(['/history']);
        });
      }
    } else {
      console.log('Form Not Valid');
    }
  }

  getUsers() {
    if (this.isOnline) {
      this.cantizaService.getUsuarios(this.userId).subscribe({
        next: (res) => {
          this.users = res;
        },
        error: (err) => {
          console.log(err);
        }
      });
    }else{
      this.dbService.getUsuarios(this.userId).then((res) => {
        this.users = res;
      });
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

  backList() {
    this.router.navigate(['/list']);
  }
}
