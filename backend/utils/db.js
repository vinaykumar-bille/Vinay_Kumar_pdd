import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { doctors, initialUsers, initialAppointments, initialPrescriptions, initialRecords } from './dummyData.js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("⚠️ Supabase credentials missing in backend environment variables!");
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder');

class SupabaseModel {
  constructor(tableName, data) {
    Object.defineProperty(this, '_tableName', {
      value: tableName,
      enumerable: false,
      writable: true,
      configurable: true
    });
    Object.assign(this, data);
  }

  async save() {
    const payload = {};
    for (const key of Object.keys(this)) {
      payload[key] = this[key];
    }
    const { data, error } = await supabase
      .from(this._tableName)
      .upsert(payload)
      .select()
      .single();
    if (error) throw error;
    Object.assign(this, data);
    return this;
  }

  static get tableName() {
    throw new Error("tableName not defined on model");
  }

  static async findOne(filter) {
    let query = supabase.from(this.tableName).select('*');
    for (const key of Object.keys(filter)) {
      const val = filter[key];
      if (val && typeof val === 'object') {
        if ('$ne' in val) {
          query = query.neq(key, val['$ne']);
        }
      } else {
        query = query.eq(key, val);
      }
    }
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data ? new this(data) : null;
  }

  static find(filter = {}) {
    return new SupabaseQuery(this.tableName, filter, this);
  }

  static async findOneAndUpdate(filter, update, options = {}) {
    let query = supabase.from(this.tableName).update(update);
    for (const key of Object.keys(filter)) {
      query = query.eq(key, filter[key]);
    }
    const { data, error } = await query.select().maybeSingle();
    if (error) throw error;
    return data ? new this(data) : null;
  }

  static async findOneAndDelete(filter) {
    let query = supabase.from(this.tableName).delete();
    for (const key of Object.keys(filter)) {
      query = query.eq(key, filter[key]);
    }
    const { data, error } = await query.select().maybeSingle();
    if (error) throw error;
    return data ? new this(data) : null;
  }

  static async countDocuments(filter = {}) {
    let query = supabase.from(this.tableName).select('*', { count: 'exact', head: true });
    for (const key of Object.keys(filter)) {
      query = query.eq(key, filter[key]);
    }
    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  }

  static async updateMany(filter, update) {
    let query = supabase.from(this.tableName).update(update);
    for (const key of Object.keys(filter)) {
      query = query.eq(key, filter[key]);
    }
    const { data, error } = await query;
    if (error) throw error;
    return { acknowledged: true, modifiedCount: data ? data.length : 0 };
  }
}

class SupabaseQuery {
  constructor(tableName, filter, modelClass) {
    this.tableName = tableName;
    this.filter = filter;
    this.modelClass = modelClass;
    this.sortField = null;
    this.sortAscending = true;
  }

  sort(sortObj) {
    const field = Object.keys(sortObj)[0];
    this.sortField = field;
    this.sortAscending = sortObj[field] === 1;
    return this;
  }

  async execute() {
    let query = supabase.from(this.tableName).select('*');
    for (const key of Object.keys(this.filter)) {
      const val = this.filter[key];
      if (val instanceof RegExp) {
        const pattern = val.source;
        query = query.ilike(key, pattern.replace('^', '').replace('$', ''));
      } else if (val && typeof val === 'object') {
        if ('$ne' in val) {
          query = query.neq(key, val['$ne']);
        }
      } else {
        query = query.eq(key, val);
      }
    }
    if (this.sortField) {
      query = query.order(this.sortField, { ascending: this.sortAscending });
    }
    const { data, error } = await query;
    if (error) throw error;
    return data.map(d => new this.modelClass(d));
  }

  then(onFulfilled, onRejected) {
    return this.execute().then(onFulfilled, onRejected);
  }
}

export class User extends SupabaseModel {
  static get tableName() { return 'users'; }
  constructor(data) { super('users', data); }
}

export class Doctor extends SupabaseModel {
  static get tableName() { return 'doctors'; }
  constructor(data) { super('doctors', data); }
}

export class Appointment extends SupabaseModel {
  static get tableName() { return 'appointments'; }
  constructor(data) { super('appointments', data); }
}

export class Prescription extends SupabaseModel {
  static get tableName() { return 'prescriptions'; }
  constructor(data) { super('prescriptions', data); }
}

export class MedicalRecord extends SupabaseModel {
  static get tableName() { return 'medical_records'; }
  constructor(data) { super('medical_records', data); }
}

export class Notification extends SupabaseModel {
  static get tableName() { return 'notifications'; }
  constructor(data) { super('notifications', data); }
}

const seedDatabase = async () => {
  console.log("🌱 Checking database seeding status...");
  
  // Seed Doctors
  try {
    const { count, error } = await supabase.from('doctors').select('*', { count: 'exact', head: true });
    if (!error && count === 0) {
      await supabase.from('doctors').insert(doctors);
      console.log('💚 Seeded Doctors to Supabase successfully.');
    }
  } catch (err) {
    console.warn('⚠️ Seeding Doctors skipped:', err.message);
  }

  // Seed Users
  try {
    const { count, error } = await supabase.from('users').select('*', { count: 'exact', head: true });
    if (!error && count === 0) {
      await supabase.from('users').insert(initialUsers);
      console.log('💚 Seeded Users to Supabase successfully.');
    }
  } catch (err) {
    console.warn('⚠️ Seeding Users skipped:', err.message);
  }

  // Seed Appointments
  try {
    const { count, error } = await supabase.from('appointments').select('*', { count: 'exact', head: true });
    if (!error && count === 0) {
      await supabase.from('appointments').insert(initialAppointments);
      console.log('💚 Seeded Appointments to Supabase successfully.');
    }
  } catch (err) {
    console.warn('⚠️ Seeding Appointments skipped:', err.message);
  }

  // Seed Prescriptions
  try {
    const { count, error } = await supabase.from('prescriptions').select('*', { count: 'exact', head: true });
    if (!error && count === 0) {
      await supabase.from('prescriptions').insert(initialPrescriptions);
      console.log('💚 Seeded Prescriptions to Supabase successfully.');
    }
  } catch (err) {
    console.warn('⚠️ Seeding Prescriptions skipped:', err.message);
  }

  // Seed Medical Records
  try {
    const { count, error } = await supabase.from('medical_records').select('*', { count: 'exact', head: true });
    if (!error && count === 0) {
      await supabase.from('medical_records').insert(initialRecords);
      console.log('💚 Seeded Medical Records to Supabase successfully.');
    }
  } catch (err) {
    console.warn('⚠️ Seeding Medical Records skipped:', err.message);
  }

  // Seed Notifications
  try {
    const { count, error } = await supabase.from('notifications').select('*', { count: 'exact', head: true });
    if (!error && count === 0) {
      const initialNotifications = [
        { id: "n_1", userId: "usr_1", title: "Appointment Confirmed", message: "Your appointment with Dr. Amit Verma is scheduled for 2026-06-05 at 10:00 AM.", read: false, createdAt: new Date() },
        { id: "n_2", userId: "usr_2", title: "Status Update", message: "Your booking with Dr. Sandeep Gupta was rejected due to schedule issues. Please choose another slot.", read: false, createdAt: new Date() }
      ];
      await supabase.from('notifications').insert(initialNotifications);
      console.log('💚 Seeded Notifications to Supabase successfully.');
    }
  } catch (err) {
    console.warn('⚠️ Seeding Notifications skipped:', err.message);
  }
};

export const connectDB = async () => {
  try {
    console.log(`🔌 Attempting connection to Supabase Database at: ${supabaseUrl}`);
    const { data, error } = await supabase.from('doctors').select('id').limit(1);
    if (error) {
      if (error.message?.includes("relation") || error.message?.includes("does not exist") || error.message?.includes("schema cache")) {
        console.log(`📡 Supabase connection successful! Warning: Database tables do not exist yet. Please execute the SQL script in schema.sql in the Supabase SQL editor to create the tables.`);
      } else {
        throw error;
      }
    } else {
      console.log(`📡 Supabase Database connected successfully.`);
    }
    await seedDatabase();
  } catch (error) {
    console.error(`🚨 Supabase Connection/Seeding Error: ${error.message}`);
  }
};
