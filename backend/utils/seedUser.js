const UserModel = require('../model/UserModel');

async function seedDemoUser() {
  try {
    const email = 'demo@niveshcapital.com';
    const existing = await UserModel.findOne({ email });
    if (!existing) {
      console.log('Seeding demo user...');
      await UserModel.create({
        email,
        password: 'Demo@1234',
        username: 'demo',
        isVerified: true
      });
      console.log('Demo user seeded successfully.');
    } else {
      console.log('Demo user already exists.');
    }
  } catch (err) {
    console.error('Error seeding demo user:', err.message);
  }
}

module.exports = { seedDemoUser };
