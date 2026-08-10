import mongoose from 'mongoose';
import { config } from '../config';
import { User } from '../models/user.model';

const promoteToSuperAdmin = async () => {
  try {
    console.log('[PROMOTE] Connecting to database...');
    await mongoose.connect(config.mongoUri);
    console.log('[PROMOTE] Connected. Searching for target user...');

    const email = 'nxshipon@gmail.com';
    const user = await User.findOne({ email });

    if (!user) {
      console.error(`[PROMOTE] User with email "${email}" not found.`);
      process.exit(1);
    }

    console.log(`[PROMOTE] Found user: ${user.name} (${user.email}) — current role: ${user.role}`);

    user.role = 'super_admin';
    await user.save();

    console.log(`[PROMOTE] ✅ Successfully promoted "${user.name}" to super_admin!`);
    process.exit(0);
  } catch (error) {
    console.error('[PROMOTE] Error:', error);
    process.exit(1);
  }
};

promoteToSuperAdmin();
