-- HealthNet Database Schema for Supabase PostgreSQL
-- Copy and run this script in the SQL Editor of your Supabase dashboard to create the tables.

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'admin')),
    gender TEXT,
    age INTEGER,
    phone TEXT,
    "docId" TEXT
);

-- 2. Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    department TEXT NOT NULL,
    specialization TEXT,
    experience INTEGER,
    fees INTEGER,
    rating NUMERIC DEFAULT 4.8,
    "availableDays" TEXT[],
    "availableTimeSlots" TEXT[],
    "imageUrl" TEXT,
    about TEXT
);

-- 3. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "doctorName" TEXT NOT NULL,
    department TEXT NOT NULL,
    date TEXT NOT NULL,
    "timeSlot" TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Completed', 'Rejected')),
    symptoms TEXT DEFAULT 'No symptoms described.',
    notes TEXT DEFAULT '',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 4. Prescriptions Table
CREATE TABLE IF NOT EXISTS prescriptions (
    id TEXT PRIMARY KEY,
    "appointmentId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "doctorName" TEXT NOT NULL,
    date TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    symptoms TEXT,
    medicines JSONB NOT NULL,
    advice TEXT
);

-- 5. Medical Records Table
CREATE TABLE IF NOT EXISTS medical_records (
    id TEXT PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" TEXT NOT NULL,
    "uploadedAt" TEXT NOT NULL,
    description TEXT,
    "fileUrl" TEXT
);

-- 6. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
