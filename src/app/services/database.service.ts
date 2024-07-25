import { Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { CantizaService } from './cantiza.service';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  
  private sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);
  private db!: SQLiteDBConnection;

  constructor(
    private cantizaService: CantizaService
  ) {
  }

  async createDatabase() {
    try {
      console.log("Creating database");
      await this.deleteAllTables();
      await this.createTables();
      await this.populateTables();
    } catch (error) {
      console.error('Unable to initialize plugin', error);
    }
  }
  async createTables() {
    console.log("Creating tables");
    
    try {
      const createTableQuery = `
      CREATE TABLE can_area (
  can_are_id INTEGER NOT NULL,
  can_are_name TEXT NOT NULL,
  can_are_create TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE can_base (
  can_bas_id INTEGER NOT NULL,
  can_bas_super INTEGER NOT NULL,
  can_bas_worker INTEGER NOT NULL,
  can_bas_info TEXT NOT NULL,
  can_bas_numerodetallos INTEGER NOT NULL,
  can_bas_totalcosecha INTEGER NOT NULL,
  can_bas_date_asig TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  can_bas_estado INTEGER NOT NULL,
  can_bas_create TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE can_bloque (
  can_blo_id INTEGER NOT NULL,
  can_blo_name TEXT NOT NULL,
  can_blo_create TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE can_estimado (
  can_est_id INTEGER NOT NULL,
  can_est_date TEXT NOT NULL,        -- Store dates as ISO 8601 strings
  can_est_time TEXT NOT NULL,        -- Store time as TEXT
  can_est_base INTEGER NOT NULL,
  can_est_calculo INTEGER NOT NULL,
  can_est_resultado INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE can_finca (
  can_fin_id INTEGER NOT NULL,
  can_fin_name TEXT NOT NULL,
  can_fin_create TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE can_informacion (
  can_inf_id INTEGER NOT NULL,
  can_inf_super INTEGER NOT NULL,
  can_inf_finca INTEGER NOT NULL,
  can_inf_areas INTEGER NOT NULL,
  can_inf_bloque INTEGER NOT NULL,
  can_inf_rosa INTEGER NOT NULL,
  can_inf_identifier TEXT NOT NULL,
  can_inf_tallospormalla INTEGER NOT NULL,
  can_inf_create TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE can_ingresos (
  can_ing_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  can_ing_base INTEGER NOT NULL,
  can_ing_cochero INTEGER NOT NULL,
  can_ing_trabajador INTEGER NOT NULL,
  can_ing_mallas INTEGER NOT NULL,
  can_ing_tallos INTEGER NOT NULL,
  can_ing_subtotal INTEGER NOT NULL,
  can_ing_create TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  can_es_local INTEGER
);

CREATE TABLE can_registro (
  can_reg_id INTEGER NOT NULL,
  can_reg_usuario INTEGER NOT NULL,
  can_reg_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE can_rosas (
  can_ros_id INTEGER NOT NULL,
  can_ros_name TEXT NOT NULL,
  can_ros_create TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE can_tallos_malla (
  can_tal_mal_id INTEGER NOT NULL,
  can_tal_mal_number INTEGER NOT NULL,
  can_tal_mal_create TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE can_tipo (
  can_tip_id INTEGER NOT NULL,
  can_tip_name TEXT NOT NULL,
  can_tip_create TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE can_usuario (
  can_usu_id INTEGER NOT NULL,
  can_usu_name TEXT NOT NULL,
  can_usu_cedula TEXT NOT NULL,
  can_usu_email TEXT NOT NULL,
  can_usu_password TEXT NOT NULL,
  can_usu_phone TEXT NOT NULL,
  can_usu_tipo INTEGER NOT NULL,
  can_usu_create TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

`;
      this.executeSQL(createTableQuery);
    } catch (error) {
      console.error('Unable to create tables', error);
    }
  }

  async addItem(name: string, value: string) {
    try {
      const insertQuery = 'INSERT INTO items (name, value) VALUES (?, ?)';
      await this.db.run(insertQuery, [name, value]);
    } catch (error) {
      console.error('Unable to add item', error);
    }
  }

   async executeSQL(sql: string) {
    try {
      console.log("Executing SQL");
      const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
      for (const stmt of statements) {
        await this.db.execute(stmt);
      }
    } catch (error) {
      console.error('Failed to execute SQL', error);
    }
  }

  async getItems() {
    try {
      const selectQuery = 'SELECT * FROM can_ingresos where can_es_local = 1';
      const res:any = await this.db.query(selectQuery);
      if (res.values.length > 0) {
        return res.values;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Unable to get items', error);
      return [];
    }
 }

 populateTables() {
  this.cantizaService.getALlInfoTables().subscribe(
    {
      next: (data) => {
        let tables = [
          "can_usuario",
          "can_tipo",
          "can_tallos_malla",
          "can_rosas",
          "can_registro",
          "can_ingresos",
          "can_informacion",
          "can_finca",
          "can_estimado",
          "can_bloque",
          "can_base",
          "can_area"
      ];
      tables.forEach((table) => {
        this.insertData(table, data[table]);
      });
      },
      error: (error) => {
        console.error('Unable to get data', error);
      }
    }
  )
  }

  public async insertData(table: string, data: any[]): Promise<void> {
    for (const row of data) {
      const keys = Object.keys(row).join(', ');
      const values = Object.values(row).map(value => `'${value}'`).join(', ');
      const query = `INSERT INTO ${table} (${keys}) VALUES (${values})`;
      await this.db.execute(query);
    }
  }

  public async insertDataIngresos(data: any): Promise<void> {
    let tallosdb = 0;
    if (data['tallosextra'] === 0) {
      const sql = `SELECT can_bas_numerodetallos FROM can_base WHERE can_bas_id = ?`;
      const result:any = await this.db.query(sql, [data['identifier']]);
      
      if (result.values.length > 0) {
        const row_info = result.values[0];
        tallosdb = row_info.can_bas_numerodetallos;
      } else {
        throw new Error('No records found or error in the query');
      }
    } else {
      tallosdb = data['tallosextra'];
    }
    const subtotal = (tallosdb || 0) * data['malla'];
    let dataEnd = {
      can_ing_cochero:data['cochero'], 
      can_ing_base:data['identifier'], 
      can_ing_trabajador:data['trabajador'], 
      can_ing_mallas:data['malla'], 
      can_ing_tallos:data['tallosextra'],
      can_ing_subtotal:subtotal,
      can_es_local: 1,
      can_ing_create: this.getFormattedDate()
    }
    const keys = Object.keys(dataEnd).join(', ');
    const values = Object.values(dataEnd).map(value => `'${value}'`).join(', ');
    const query = `INSERT INTO can_ingresos (${keys}) VALUES (${values})`;
    await this.db.execute(query);

    const selectQuery = `SELECT can_bas_totalcosecha FROM can_base WHERE can_bas_id = ?`;
    const selectResult:any = await this.db.query(selectQuery, [data['identifier']]);
    
    if (selectResult.values.length > 0) {
      const currentTotal = selectResult.values[0].can_bas_totalcosecha || 0;
      const newTotal = (currentTotal || 0) + subtotal;
      
      // Update totalcosecha
      const updateQuery = `UPDATE can_base SET can_bas_totalcosecha = ? WHERE can_bas_id = ?`;
      await this.db.run(updateQuery, [newTotal, data['identifier']]);
    }
  }

  //LOGIN WITH TABLE CAN_USUARIO
  public async login(data: any): Promise<any> {
    console.log("LOGIN",data);
    
    const query = `SELECT can_usu_id as id FROM can_usuario WHERE can_usu_email = '${data.email}' AND can_usu_password = '${data.password}'`;
    const res = await this.db.query(query);
    return res.values;
  }

  // GET ALL USERS BY TYPE
  public async getUsuarios(type: number): Promise<any> {
    const query = `SELECT can_usu_id as id, can_usu_name as name FROM can_usuario WHERE can_usu_tipo = ${type}`;
    const res = await this.db.query(query);
    return res.values;
  }

  // GET ALL HISTORY BY USER
  public async getHistory(user: number): Promise<any> {
    const date = this.getFormattedDate();
    const query = `SELECT 
      can_bas_id as id,
      can_bas_worker as worker,
      can_bas_info as info,
      can_bas_date_asig as datea,
      can_bas_numerodetallos as tallos,
      can_bas_totalcosecha as totalc,
      can_bas_create as fcreate
    FROM can_base  WHERE can_bas_worker = ${user} AND can_bas_date_asig = '${date}'`;
    const res = await this.db.query(query);
    return res.values;
  }


  public async getListHistory(user: number): Promise<any> {
    const date = this.getFormattedDate();
      
      // Query for can_ingresos
      const ingresosQuery = `SELECT * FROM can_ingresos WHERE can_ing_cochero = ${user} AND can_ing_create >= ${date}`;
      console.log("ingresosQuery",ingresosQuery);
      
      const ingresosResult:any = await this.db.query(ingresosQuery);
      console.log("ingresosResult",ingresosResult.values);
      
      const data = [];
      for (const row of ingresosResult.values) {
        const baseId = row.can_ing_base;
        const trabajadorId = row.can_ing_trabajador;
        
        // Query for can_base
        const baseQuery = `SELECT * FROM can_base WHERE can_bas_id = ?`;
        const baseResult:any = await this.db.query(baseQuery, [baseId]);
         console.log("baseResult",baseResult.values);
         
        const info = baseResult.values.length > 0 ? baseResult.values[0].can_bas_info : '';
  
        // Query for can_usuario
        const userQuery = `SELECT * FROM can_usuario WHERE can_usu_id = ?`;
        const userResult:any = await this.db.query(userQuery, [trabajadorId]);
        console.log("userResult",userResult.values);
        const userName = userResult.values.length > 0 ? userResult.values[0].can_usu_name : '';
  
        data.push({
          id: row.can_ing_id,
          base: row.can_ing_base,
          mallas: row.can_ing_mallas,
          tallos: row.can_ing_tallos,
          trabajador: userName,
          subtotal: row.can_ing_subtotal,
          fecha: row.can_ing_create,
          info: info
        });
      }
      
      return data; 
  }

  async saveInformation() {
    console.log("Saving information");
    
    await this.openDB();
    this.getItems().then((res:any) => {
      console.log("RESPONSE",res);
      
      if (res.length > 0) {
        res.forEach((item:any) => {
          console.log("ITEM",item);    
          let data = {
            cochero: item.can_ing_cochero,
            identifier: item.can_ing_base,
            malla: item.can_ing_mallas,
            tallosextra: item.can_ing_tallos,
            trabajador: item.can_ing_trabajador
          }      
          this.cantizaService.registerWork(data).subscribe({
            next: (res) => {
              console.log(res);
              this.createDatabase();
            },
            error: (err) => {
              console.log(err);
            }
          });
        });
      }else{
        this.createDatabase();
      }
    }
    );
  }

  async openDB() {
    this.db = await this.sqlite.createConnection(
      'cantiza',
      false,
      'no-encryption',
      1,
      false
    );
    await this.db.open();
  }

  getFormattedDate(): string {
    const date = new Date();

    // Format the date for Ecuadorian locale
    const formatter = new Intl.DateTimeFormat('es-EC', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    
    // Format the date string and split into components
    const parts = formatter.format(date).split('/');

    // Return date in 'yyyy-mm-dd' format
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  async deleteAllTables() {
    try {
      const dropTableQuery = `
      DROP TABLE IF EXISTS can_area;
      DROP TABLE IF EXISTS can_base;
      DROP TABLE IF EXISTS can_bloque;
      DROP TABLE IF EXISTS can_estimado;
      DROP TABLE IF EXISTS can_finca;
      DROP TABLE IF EXISTS can_informacion;
      DROP TABLE IF EXISTS can_ingresos;
      DROP TABLE IF EXISTS can_registro;
      DROP TABLE IF EXISTS can_rosas;
      DROP TABLE IF EXISTS can_tallos_malla;
      DROP TABLE IF EXISTS can_tipo;
      DROP TABLE IF EXISTS can_usuario;
      `;
      await this.executeSQL(dropTableQuery);
    } catch (error) {
      console.error('Unable to delete tables', error);
    }
  }
}
