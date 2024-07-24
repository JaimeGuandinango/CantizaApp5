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
      
      this.db = await this.sqlite.createConnection(
        'cantiza',
        false,
        'no-encryption',
        1,
        false
      );
      await this.db.open();
      await this.saveInformation();
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
  can_ing_id INTEGER NOT NULL,
  can_ing_base INTEGER NOT NULL,
  can_ing_cochero INTEGER NOT NULL,
  can_ing_trabajador INTEGER NOT NULL,
  can_ing_mallas INTEGER NOT NULL,
  can_ing_tallos INTEGER NOT NULL,
  can_ing_subtotal INTEGER NOT NULL,
  can_ing_create TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE can_registro (
  can_reg_id INTEGER NOT NULL,
  can_reg_usuario INTEGER NOT NULL,
  can_reg_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  can_es_local INTEGER NOT NULL
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
      console.log("Getting items");
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
    data['can_es_local'] = 1;
    const keys = Object.keys(data).join(', ');
    const values = Object.values(data).map(value => `'${value}'`).join(', ');
    const query = `INSERT INTO can_ingresos (${keys}) VALUES (${values})`;
    await this.db.execute(query);
  }

  //LOGIN WITH TABLE CAN_USUARIO
  public async login(data: any): Promise<any> {
    const query = `SELECT * FROM can_usuario WHERE can_usu_email = '${data.email}' AND can_usu_password = '${data.password}'`;
    const res = await this.db.query(query);
    return res.values;
  }

  // GET ALL USERS BY TYPE
  public async getUsuarios(type: number): Promise<any> {
    const query = `SELECT * FROM can_usuario WHERE can_usu_tipo = ${type}`;
    const res = await this.db.query(query);
    return res.values;
  }

  // GET ALL HISTORY BY USER
  public async getHistory(user: number): Promise<any> {
    const query = `SELECT * FROM can_registro WHERE can_reg_usuario = ${user}`;
    const res = await this.db.query(query);
    return res.values;
  }

  async saveInformation() {
    console.log("Saving information");
    
    await this.openDB();
    this.getItems().then((res:any) => {
      console.log("RESPONSE",res);
      
      if (res.length > 0) {
        res.forEach((item:any) => {
          this.cantizaService.registerWork(item).subscribe({
            next: (res) => {
              console.log(res);
            },
            error: (err) => {
              console.log(err);
            }
          });
        });
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
}
