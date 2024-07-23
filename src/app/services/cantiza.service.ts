import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CantizaService {

  URL_API = environment.URL_API;

  constructor(
    private http: HttpClient
  ) { }

  login(data: any):Observable<any> {
    return this.http.post(`${this.URL_API}login.php`, data);
  }

  getUsuarios(type:number):Observable<any> {
    return this.http.get(`${this.URL_API}userByType.php?type=${type}`);
  }

  getHistory(user:number):Observable<any> {
    return this.http.get(`${this.URL_API}history.php?session_id=${user}`);
  }
  
  registerWork(data: any):Observable<any> {
    return this.http.post(`${this.URL_API}registerWork.php`, data);
  }

  getALlInfoTables():Observable<any> {
    return this.http.get(`${this.URL_API}infoSqlite.php`);
  }

  getHistoryRegister(user:number):Observable<any> {
    return this.http.get(`${this.URL_API}listHistory.php?session_id=${user}`);
  }
}
