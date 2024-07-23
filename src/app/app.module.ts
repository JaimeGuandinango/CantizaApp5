import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouteReuseStrategy } from '@angular/router';
import { IonicRouteStrategy, IonicModule } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { HomePage } from './home/home.page';
@NgModule({
  declarations: [
    AppComponent,
    HomePage
  ],
  imports: [
    IonicModule.forRoot({swipeBackEnabled: false}), 
    AppRoutingModule,
    HttpClientModule,
    BrowserModule
  ],
  providers: [
    { 
      provide: RouteReuseStrategy, 
      useClass: IonicRouteStrategy 
    },
    ],
  bootstrap: [AppComponent],
})
export class AppModule {}
