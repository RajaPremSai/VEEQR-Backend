require('dotenv').config();
const connectDB = require('../config/database');
const Manager = require('../models/Manager');

(async () => {
  try {
    await connectDB();

    // Prefer CLI args: node scripts/createManager.js email password empNumber firstName lastName contactNumber
    const [,, argEmail, argPassword, argEmp, argFirst, argLast, argContact] = process.argv;

    const email = argEmail || process.env.MANAGER_EMAIL || 'manager@example.edu';
    const password = argPassword || process.env.MANAGER_PASSWORD || 'StrongPass@123';
    const empNumber = argEmp || process.env.MANAGER_EMP_NUMBER || 'MGR0001';
    const firstName = argFirst || process.env.MANAGER_FIRST_NAME || 'Transport';
    const lastName = argLast || process.env.MANAGER_LAST_NAME || 'Manager';
    const contactNumber = argContact || process.env.MANAGER_CONTACT_NUMBER || '+910000000000';

    let manager = await Manager.findOne({ email }).select('+password');
    if (manager) {
      manager.firstName = firstName;
      manager.lastName = lastName;
      manager.empNumber = empNumber;
      manager.contactNumber = contactNumber;
      if (argPassword || process.env.MANAGER_PASSWORD) manager.password = password; // rehash on save
      await manager.save();
      console.log('Manager updated:', { id: manager._id.toString(), email: manager.email });
    } else {
      manager = await Manager.create({
        firstName,
        lastName,
        empNumber,
        email,
        password,
        contactNumber,
        role: 'MANAGER'
      });
      console.log('Manager created:', { id: manager._id.toString(), email: manager.email });
    }

    process.exit(0);
  } catch (err) {
    console.error('Failed to create/update Manager:', err.message);
    process.exit(1);
  }
})(); 