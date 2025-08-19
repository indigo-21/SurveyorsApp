import { checkDatabaseHealth, resetDatabase } from './database';

export const debugDatabaseInfo = async () => {
    try {
        console.log('=== Database Debug Info ===');
        
        const health = await checkDatabaseHealth();
        
        console.log('Database Health:', health);
        
        if (!health.accessible) {
            console.log('⚠️ Database is not accessible');
            return health;
        }
        
        if (!health.tempSyncLogsExists) {
            console.log('⚠️ temp_sync_logs table does not exist');
        } else {
            console.log('✅ temp_sync_logs table exists');
        }
        
        return health;
    } catch (error) {
        console.error('Debug failed:', error);
        return { error: error.message };
    }
};

export const emergencyDatabaseReset = async () => {
    try {
        console.log('🚨 Performing emergency database reset...');
        await resetDatabase();
        console.log('✅ Database reset complete');
        return { success: true };
    } catch (error) {
        console.error('❌ Emergency reset failed:', error);
        return { success: false, error: error.message };
    }
};

// Helper function to log database issues
export const logDatabaseError = (operation, error) => {
    console.error(`Database Error in ${operation}:`, {
        message: error.message,
        code: error.code,
        stack: error.stack
    });
    
    // Check for common database issues
    if (error.message) {
        if (error.message.includes('no such table')) {
            console.warn('💡 Suggestion: Table may not exist. Try reinitializing the database.');
        }
        
        if (error.message.includes('Could not open database')) {
            console.warn('💡 Suggestion: Database file may be corrupted. Try emergency reset.');
        }
        
        if (error.message.includes('database disk image is malformed')) {
            console.warn('💡 Suggestion: Database is corrupted. Emergency reset required.');
        }
    }
};
