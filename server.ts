import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { createServer as createViteServer } from 'vite';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Path to data store file
const DB_FILE = path.join(process.cwd(), 'db.json');

// Interface structures
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface Booking {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  serviceType: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:MM
  notes: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  createdAt: string;
}

interface Availability {
  id: string;
  date: string; // YYYY-MM-DD
  availableSlots: string[];
}

interface DB {
  users: User[];
  bookings: Booking[];
  availability: Availability[];
}

// Initial Mock / Default Data
const defaultServices = [
  {
    id: 's1',
    name: '1:1 Career & Tech Consultation',
    duration: 45,
    price: 4999,
    description: 'A deep dive into your product architecture, software career goals, or high-level scaling bottlenecks.'
  },
  {
    id: 's2',
    name: 'Full-Stack Architecture Audit',
    duration: 60,
    price: 14999,
    description: 'Comprehensive code review, cloud design analysis, and actionable optimization roadmap for your stack.'
  },
  {
    id: 's3',
    name: 'Startup Tech Advisory',
    duration: 90,
    price: 24999,
    description: 'Strategic technical guidance for founders on MVP scoping, hiring engineering teams, and vendor selection.'
  },
  {
    id: 's4',
    name: 'General Catch-up / Quick Intro',
    duration: 30,
    price: 0,
    description: 'Introduce yourself, pitch your open-source package, or briefly discuss potential collaboration opportunities.'
  }
];

const initialAvailability: Availability[] = [
  { id: 'a1', date: '2026-06-07', availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
  { id: 'a2', date: '2026-06-08', availableSlots: ['10:00', '11:00', '13:00', '14:00', '15:30', '16:00'] },
  { id: 'a3', date: '2026-06-09', availableSlots: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'] },
  { id: 'a4', date: '2026-06-10', availableSlots: ['09:00', '10:00', '13:00', '14:00'] },
  { id: 'a5', date: '2026-06-11', availableSlots: ['10:00', '11:00', '13:00', '14:00', '15:00', '16:00'] },
  { id: 'a6', date: '2026-06-12', availableSlots: ['09:00', '11:00', '14:00', '15:00'] },
  { id: 'a7', date: '2026-06-13', availableSlots: ['10:00', '13:00', '14:00'] },
  { id: 'a8', date: '2026-06-14', availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00'] }
];

const initialBookings: Booking[] = [
  {
    id: 'b1',
    customerName: 'Aarav Mehta',
    email: 'aarav@mehta-industries.in',
    phone: '+91 98450 12345',
    serviceType: 'Startup Tech Advisory',
    appointmentDate: '2026-06-08',
    appointmentTime: '13:00',
    notes: 'Discussing philosophy-driven product scaling and mental models for managing larger development teams in Bengaluru.',
    status: 'pending',
    createdAt: '2026-06-05T09:30:00.000Z'
  },
  {
    id: 'b2',
    customerName: 'Ananya Sharma',
    email: 'ananya.sharma@techpune.com',
    phone: '+91 99000 54321',
    serviceType: '1:1 Career & Tech Consultation',
    appointmentDate: '2026-06-07',
    appointmentTime: '10:00',
    notes: 'Transitioning from Senior Engineer to Architect role, wanting a feedback audit on my career portfolio.',
    status: 'approved',
    createdAt: '2026-06-06T14:15:00.000Z'
  },
  {
    id: 'b3',
    customerName: 'Vikram Rao',
    email: 'vikram@raoconsulting.co.in',
    phone: '+91 94480 99999',
    serviceType: 'Full-Stack Architecture Audit',
    appointmentDate: '2026-06-09',
    appointmentTime: '11:00',
    notes: 'Reviewing automated ERP and inventory distribution software design with real fail-safes and security guarantees.',
    status: 'approved',
    createdAt: '2026-06-05T18:00:00.000Z'
  },
  {
    id: 'b4',
    customerName: 'Sudeep Gowda',
    email: 'sudeep@bangarpetstartups.in',
    phone: '+91 91100 88888',
    serviceType: '1:1 Career & Tech Consultation',
    appointmentDate: '2026-06-07',
    appointmentTime: '14:00',
    notes: 'Looking for scaling advice on React state management for modular dashboards.',
    status: 'cancelled',
    createdAt: '2026-06-04T10:00:00.000Z'
  }
];

const initialUsers: User[] = [
  { id: 'u1', name: 'Aarav Mehta', email: 'aarav@mehta-industries.in', phone: '+91 98450 12345' },
  { id: 'u2', name: 'Ananya Sharma', email: 'ananya.sharma@techpune.com', phone: '+91 99000 54321' },
  { id: 'u3', name: 'Vikram Rao', email: 'vikram@raoconsulting.co.in', phone: '+91 94480 99999' },
  { id: 'u4', name: 'Sudeep Gowda', email: 'sudeep@bangarpetstartups.in', phone: '+91 91100 88888' }
];

// Load Database from disk or initialize it
function loadDB(): DB {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('Error reading database file, using defaults', error);
  }
  
  const initialDB: DB = {
    users: initialUsers,
    bookings: initialBookings,
    availability: initialAvailability
  };
  saveDB(initialDB);
  return initialDB;
}

function saveDB(data: DB) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving database file to disk', error);
  }
}

// Generate rich styled HTML email string for notifications
function createEmailTemplate(booking: Booking, recipientName: string, isAdmin: boolean) {
  const subject = isAdmin 
    ? `🔔 Booking Alert: ${booking.customerName} - ${booking.serviceType}`
    : `📅 Booking Confirmed - ${booking.serviceType}`;

  const statusLabel = booking.status.toUpperCase();
  const statusColor = booking.status === 'approved' ? '#10b981' : booking.status === 'pending' ? '#f59e0b' : '#ef4444';

  const dashboardUrl = `${process.env.APP_URL || 'http://localhost:3000'}/admin`;

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
      <div style="text-align: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 20px;">
        <span style="font-weight: 800; font-size: 24px; color: #0f172a; letter-spacing: -0.025em;">Book<span style="color: #2563eb;">Vikas</span></span>
        <p style="margin: 4px 0 0 0; font-size: 14px; color: #64748b;">Professional Appointment Scheduling</p>
      </div>

      <p style="font-size: 16px; line-height: 1.5; color: #334155;">
        Hi <strong>${recipientName}</strong>,
      </p>
      
      <p style="font-size: 15px; line-height: 1.5; color: #475569;">
        ${isAdmin 
          ? `A new appointment has been scheduled with you. Below are the booking details:`
          : `Your appointment with Vikas has been successfully booked! Here are your scheduling details:`}
      </p>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 24px 0; border-left: 4px solid #2563eb;">
        <h4 style="margin: 0 0 16px 0; color: #0f172a; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Session Summary</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.5;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 120px; font-weight: 500;">Service:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${booking.serviceType}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Date:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${booking.appointmentDate}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Time Slot:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${booking.appointmentTime}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Customer:</td>
            <td style="padding: 6px 0; color: #0f172a;">${booking.customerName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Email:</td>
            <td style="padding: 6px 0; color: #0f172a;">${booking.email}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Phone:</td>
            <td style="padding: 6px 0; color: #0f172a;">${booking.phone}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500; vertical-align: top;">Notes:</td>
            <td style="padding: 6px 0; color: #334155; font-style: italic;">${booking.notes || 'None provided'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Status:</td>
            <td style="padding: 6px 0; color: ${statusColor}; font-weight: 700;">${statusLabel}</td>
          </tr>
        </table>
      </div>

      ${isAdmin ? `
      <div style="text-align: center; margin: 28px 0 16px 0;">
        <a href="${dashboardUrl}" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.1), 0 2px 4px -1px rgba(37, 99, 235, 0.06);">
          Review Booking in Admin Panel
        </a>
      </div>
      ` : `
      <div style="background-color: #eff6ff; border-radius: 8px; padding: 14px; font-size: 13px; color: #1e40af; margin-bottom: 24px; line-height: 1.4;">
        💡 <strong>Google Calendar integration</strong>: You can find a quick link inside the browser interface once the page redirects to instantly save this event to your real Google Calendar account in one click!
      </div>
      `}

      <p style="font-size: 14px; color: #64748b; line-height: 1.5; margin-top: 24px;">
        Best regards,<br />
        <strong>The Book Vikas Team</strong>
      </p>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 18px; margin-top: 30px; font-size: 11px; color: #94a3b8; text-align: center;">
        <p style="margin: 0 0 6px 0;">This notification email was automatically compiled for scheduled appointments.</p>
        <p style="margin: 0;">© 2026 Book Vikas. Built for high-performance scheduling, Singapore & Global.</p>
      </div>
    </div>
  `;
}

// Function to trigger email sending
async function sendNotification(booking: Booking, isNewBooking: boolean) {
  const smtpHost = process.env.SMTP_HOST || '';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587');
  const smtpUser = process.env.SMTP_USER || '';
  const smtpPass = process.env.SMTP_PASS || '';

  let transporter;
  let useActualSmtp = false;

  if (smtpHost && smtpUser && smtpPass) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });
    useActualSmtp = true;
  } else {
    // Default transport returning the rendered mail configuration for safe sandboxed logs
    transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true
    });
  }

  // Recipients
  const customerEmail = booking.email;
  const customerName = booking.customerName;
  const adminEmail = process.env.ADMIN_EMAIL || 'vikasgowdas@gmai.com';
  const adminName = 'Vikas (Admin)';

  const customerHtml = createEmailTemplate(booking, customerName, false);
  const adminHtml = createEmailTemplate(booking, adminName, true);

  const mailDetails = {
    customerEmailStatus: 'unknown',
    adminEmailStatus: 'unknown',
    customerPreview: customerHtml,
    adminPreview: adminHtml,
    usingRealSMTP: useActualSmtp
  };

  try {
    // Send to Customer
    const infoCustomer = await transporter.sendMail({
      from: '"Book Vikas" <no-reply@bookvikas.com>',
      to: customerEmail,
      subject: `📅 Scheduling Confirmed: Room with Vikas`,
      html: customerHtml
    });
    mailDetails.customerEmailStatus = useActualSmtp ? 'sent_success' : 'simulated_success';
    console.log(`[SMTP Alert] Customer Email triggers: ${customerEmail} | Status:`, mailDetails.customerEmailStatus);

    // Send to Admin (Vikas)
    const infoAdmin = await transporter.sendMail({
      from: '"Book Vikas Scheduler" <scheduler@bookvikas.com>',
      to: adminEmail,
      subject: `🔔 Booking Alert: ${customerName} Scheduled`,
      html: adminHtml
    });
    mailDetails.adminEmailStatus = useActualSmtp ? 'sent_success' : 'simulated_success';
    console.log(`[SMTP Alert] Admin (Vikas) Email triggers: ${adminEmail} | Status:`, mailDetails.adminEmailStatus);

  } catch (error) {
    console.error('SMTP Mail Transmission Error:', error);
    mailDetails.customerEmailStatus = 'failed';
    mailDetails.adminEmailStatus = 'failed';
  }

  return mailDetails;
}

// REST APIs

// 1. Get List of Services
app.get('/api/services', (req, res) => {
  res.json(defaultServices);
});

// 2. Get available dates/slots
app.get('/api/availability', (req, res) => {
  const { date } = req.query;
  const db = loadDB();

  if (!date) {
    return res.json(db.availability);
  }

  const dateStr = String(date);
  // Find custom configured availability for that date
  const dayAvail = db.availability.find(a => a.date === dateStr);
  
  if (!dayAvail) {
    // Return empty list if no slots explicitly declared or a set of standard default slots
    const standardSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
    // Filter standard slots out if there are already approved/pending bookings for this date and time
    const BookedSlotsOnThisDay = db.bookings
      .filter(b => b.appointmentDate === dateStr && b.status !== 'cancelled' && b.status !== 'rejected')
      .map(b => b.appointmentTime);

    const availableSlots = standardSlots.filter(slot => !BookedSlotsOnThisDay.includes(slot));
    return res.json({
      date: dateStr,
      availableSlots
    });
  }

  // Filter out slots that are already booked
  const BookedSlots = db.bookings
    .filter(b => b.appointmentDate === dateStr && b.status !== 'cancelled' && b.status !== 'rejected')
    .map(b => b.appointmentTime);

  const filteredSlots = dayAvail.availableSlots.filter(slot => !BookedSlots.includes(slot));

  res.json({
    date: dateStr,
    availableSlots: filteredSlots
  });
});

// 3. Create a Booking (Appointment booking form)
app.post('/api/bookings', async (req, res) => {
  const { name, email, phone, serviceType, date, time, notes } = req.body;

  if (!name || !email || !phone || !serviceType || !date || !time) {
    return res.status(400).json({ error: 'Missing mandatory scheduling parameters' });
  }

  const db = loadDB();

  // 1. Double Booking Check (Prevent double booking)
  const isTimeBooked = db.bookings.some(b => 
    b.appointmentDate === date && 
    b.appointmentTime === time && 
    b.status !== 'cancelled' && 
    b.status !== 'rejected'
  );

  if (isTimeBooked) {
    return res.status(409).json({ error: 'This time slot is already fully scheduled. Please select an alternate slot.' });
  }

  // 2. Register/Update User
  let existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!existingUser) {
    existingUser = {
      id: 'u_' + Math.random().toString(36).substr(2, 9),
      name,
      email,
      phone
    };
    db.users.push(existingUser);
  } else {
    // update phone and name if changed
    existingUser.name = name;
    existingUser.phone = phone;
  }

  // 3. Create Booking
  const newBooking: Booking = {
    id: 'b_' + Math.random().toString(36).substr(2, 9),
    customerName: name,
    email,
    phone,
    serviceType,
    appointmentDate: date,
    appointmentTime: time,
    notes: notes || '',
    status: 'pending', // Default starts as pending
    createdAt: new Date().toISOString()
  };

  db.bookings.push(newBooking);
  saveDB(db);

  // 4. Send Confirmation Emails to Vikas & Customer
  const mailSummary = await sendNotification(newBooking, true);

  res.status(201).json({
    message: 'Booking request sent successfully!',
    booking: newBooking,
    emailAlerts: mailSummary
  });
});

// Admin endpoints (simplistic secure administration using key headers)
const ADMIN_PASSWORD_HASH = 'password123'; // Simple default password

// 4. Admin Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'vikas' && password === ADMIN_PASSWORD_HASH) {
    return res.json({
      success: true,
      token: 'secure_session_vikas_' + Math.random().toString(36).substr(2, 9),
      adminName: 'Vikas'
    });
  }

  res.status(401).json({ error: 'Invalid username or passphrase.' });
});

// Middleware to secure admin endpoints
const adminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer secure_session_vikas_')) {
    next();
  } else {
    res.status(403).json({ error: 'Unauthorized credentials block. Please login as Vikas.' });
  }
};

// 5. GET All Bookings (With search and date filters)
app.get('/api/admin/bookings', adminAuth, (req, res) => {
  const { search, date } = req.query;
  const db = loadDB();

  let results = [...db.bookings];

  // Apply Date Filter
  if (date) {
    results = results.filter(b => b.appointmentDate === String(date));
  }

  // Apply Search (customerName, email, serviceType, phone)
  if (search) {
    const query = String(search).toLowerCase();
    results = results.filter(b => 
      b.customerName.toLowerCase().includes(query) ||
      b.email.toLowerCase().includes(query) ||
      b.serviceType.toLowerCase().includes(query) ||
      b.phone.includes(query)
    );
  }

  // Sort by created date descending
  results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(results);
});

// 6. Approve / Reject / Cancel Booking
app.post('/api/admin/bookings/:id/status', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['approved', 'rejected', 'cancelled', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status update command' });
  }

  const db = loadDB();
  const bookingIndex = db.bookings.findIndex(b => b.id === id);

  if (bookingIndex === -1) {
    return res.status(404).json({ error: 'Booking item not resolved' });
  }

  db.bookings[bookingIndex].status = status;
  const updatedBooking = db.bookings[bookingIndex];
  saveDB(db);

  // Trigger updated booking state email to customer/Vikas
  const mailSummary = await sendNotification(updatedBooking, false);

  res.json({
    message: `Booking successfully marked as ${status}.`,
    booking: updatedBooking,
    emailAlerts: mailSummary
  });
});

// 7. Reschedule Booking (Change Date & Time)
app.post('/api/admin/bookings/:id/reschedule', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { appointmentDate, appointmentTime } = req.body;

  if (!appointmentDate || !appointmentTime) {
    return res.status(400).json({ error: 'New appointment date and slot are required.' });
  }

  const db = loadDB();

  // Double booking check for the new rescheduled slot
  const isSlotBooked = db.bookings.some(b => 
    b.id !== id && 
    b.appointmentDate === appointmentDate && 
    b.appointmentTime === appointmentTime && 
    b.status !== 'cancelled' && 
    b.status !== 'rejected'
  );

  if (isSlotBooked) {
    return res.status(409).json({ error: 'The requested rescheduled slot is already booked.' });
  }

  const bookingIndex = db.bookings.findIndex(b => b.id === id);
  if (bookingIndex === -1) {
    return res.status(404).json({ error: 'Booking item not resolved' });
  }

  db.bookings[bookingIndex].appointmentDate = appointmentDate;
  db.bookings[bookingIndex].appointmentTime = appointmentTime;
  // Automatically make pending bookings approved on rescheduling
  if (db.bookings[bookingIndex].status === 'pending') {
    db.bookings[bookingIndex].status = 'approved';
  }
  
  const updatedBooking = db.bookings[bookingIndex];
  saveDB(db);

  // Trigger rescheduled alert emails to customer & Vikas
  const mailSummary = await sendNotification(updatedBooking, false);

  res.json({
    message: 'Booking rescheduled successfully!',
    booking: updatedBooking,
    emailAlerts: mailSummary
  });
});

// 8. View / Set Availability Schedule (Vikas can set active slot calendars)
app.get('/api/admin/availability', adminAuth, (req, res) => {
  const db = loadDB();
  res.json(db.availability);
});

app.post('/api/admin/availability', adminAuth, (req, res) => {
  const { date, availableSlots } = req.body;

  if (!date || !Array.isArray(availableSlots)) {
    return res.status(400).json({ error: 'Invalid payload structure. Provide custom date and availableSlots array.' });
  }

  const db = loadDB();
  const existingIndex = db.availability.findIndex(a => a.date === date);

  if (existingIndex !== -1) {
    db.availability[existingIndex].availableSlots = availableSlots;
  } else {
    db.availability.push({
      id: 'a_' + Math.random().toString(36).substr(2, 9),
      date,
      availableSlots
    });
  }

  saveDB(db);
  res.json({ message: 'Custom availability scheduled successfully!', data: db.availability });
});

// 9. Admin Statistics Dashboard
app.get('/api/admin/stats', adminAuth, (req, res) => {
  const db = loadDB();
  const bookings = db.bookings;

  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const approvedBookings = bookings.filter(b => b.status === 'approved').length;
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled' || b.status === 'rejected').length;

  // Let's compute estimated revenue based on service prices
  let totalRevenue = 0;
  const bookingsByService: { [service: string]: number } = {};

  bookings.forEach(b => {
    // count by service
    bookingsByService[b.serviceType] = (bookingsByService[b.serviceType] || 0) + 1;

    if (b.status === 'approved') {
      const matchSvc = defaultServices.find(s => s.name === b.serviceType);
      const rate = matchSvc ? matchSvc.price : 0;
      totalRevenue += rate;
    }
  });

  // bookings by date (last 7 days containing dates)
  const bookingsByDate: { [date: string]: number } = {};
  bookings.forEach(b => {
    bookingsByDate[b.appointmentDate] = (bookingsByDate[b.appointmentDate] || 0) + 1;
  });

  res.json({
    totalBookings,
    pendingBookings,
    approvedBookings,
    cancelledBookings,
    totalRevenue,
    bookingsByService,
    bookingsByDate
  });
});

// Vite Middleware & Static Serving setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running securely on http://localhost:${PORT}`);
  });
}

startServer();
