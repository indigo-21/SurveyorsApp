import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import axiosInstance from './axiosInstance';
import { format } from 'date-fns';

import { usersTable } from './db/users';
import { clientTypesTable } from './db/clientTypes';
import { chargingSchemesTable } from './db/chargingSchemes';
import { clientsTable } from './db/clients';
import { jobTypesTable } from './db/jobTypes';
import { clientJobTypesTable } from './db/clientJobTypes';
import { surveyQuestionSetsTable } from './db/surveyQuestionSets';
import { schemesTable } from './db/schemes';
import { installersTable } from './db/installers';
import { measuresTable } from './db/measures';
import { jobStatusesTable } from './db/jobStatuses';
import { surveyQuestionsTable } from './db/surveyQuestions';
import { outwardPostcodesTable } from './db/outwardPostcodes';
import { propertyInspectorsTable } from './db/propertyInspectors';
import { propertyInspectorPostcodesTable } from './db/propertyInspectorPostcodes';
import { propertyInspectorQualificationsTable } from './db/propertyInspectorQualifications';
import { propertyInspectorMeasuresTable } from './db/propertyInspectorMeasures';
import { jobsTable } from './db/jobs';
import { jobMeasuresTable } from './db/jobMeasures';
import { customersTable } from './db/customers';
import { propertiesTable } from './db/properties';
import { clientKeyDetailsTable } from './db/clientKeyDetails';
import { clientSlaMetricsTable } from './db/clientSlaMetrics';
import { clientMeasuresTable } from './db/clientMeasures';
import { clientInstallersTable } from './db/clientInstallers';
import { propertyInspectorJobTypesTable } from './db/propertyInspectorJobTypes';
import { bookingsTable } from './db/bookings';
import { accountLevelsTable } from './db/accountLevels';
import { userTypesTable } from './db/userTypes';
import { storeLogs, tempSyncLogsTable } from './db/tempSyncLogs';
import { completedJobsTable } from './db/completedJobs';
import { completedJobPhotosTable } from './db/completedJobPhotos';
import { queuedSmstable } from './db/queuedSms';

const tableSchemas = [
    accountLevelsTable,
    userTypesTable,
    usersTable,
    clientTypesTable,
    chargingSchemesTable,
    clientsTable,
    jobTypesTable,
    clientJobTypesTable,
    surveyQuestionSetsTable,
    schemesTable,
    installersTable,
    measuresTable,
    jobStatusesTable,
    surveyQuestionsTable,
    outwardPostcodesTable,
    propertyInspectorsTable,
    propertyInspectorPostcodesTable,
    propertyInspectorQualificationsTable,
    propertyInspectorMeasuresTable,
    jobsTable,
    jobMeasuresTable,
    customersTable,
    propertiesTable,
    clientKeyDetailsTable,
    clientSlaMetricsTable,
    clientMeasuresTable,
    clientInstallersTable,
    propertyInspectorJobTypesTable,
    bookingsTable,
    tempSyncLogsTable,
    completedJobsTable,
    completedJobPhotosTable,
    queuedSmstable,
];

let dbInstance = null;

export const closeDB = async () => {
    if (dbInstance) {
        try {
            // Try to close gracefully
            await dbInstance.closeAsync();
            console.log('Database connection closed gracefully');
        } catch (error) {
            console.warn('Error closing database gracefully, forcing close:', error.message);
        } finally {
            // Always reset the instance regardless of errors
            dbInstance = null;
        }
    }
};

export const resetDatabaseFile = async () => {
    try {
        // Close any existing connections
        await closeDB();
        
        // Get the database file path
        const dbPath = `${FileSystem.documentDirectory}SQLite/agility_eco.db`;
        
        // Check if database file exists and delete it
        const fileInfo = await FileSystem.getInfoAsync(dbPath);
        if (fileInfo.exists) {
            await FileSystem.deleteAsync(dbPath);
            console.log('Database file deleted successfully');
        }
        
        // Also delete WAL and SHM files if they exist
        const walPath = `${dbPath}-wal`;
        const shmPath = `${dbPath}-shm`;
        
        const walInfo = await FileSystem.getInfoAsync(walPath);
        if (walInfo.exists) {
            await FileSystem.deleteAsync(walPath);
            console.log('WAL file deleted');
        }
        
        const shmInfo = await FileSystem.getInfoAsync(shmPath);
        if (shmInfo.exists) {
            await FileSystem.deleteAsync(shmPath);
            console.log('SHM file deleted');
        }
        
        return true;
    } catch (error) {
        console.error('Error resetting database file:', error);
        return false;
    }
};

const getDB = async () => {
    if (!dbInstance) {
        try {
            dbInstance = await SQLite.openDatabaseAsync('agility_eco.db', {
                useNewConnection: false // Use shared connection to avoid conflicts
            });
            console.log('Database connection opened');
        } catch (error) {
            console.error('Error opening database:', error);
            throw error;
        }
    }
    return dbInstance;
};

export const initializeDB = async () => {
    // await dropAllTables();
    const db = await getDB();

    try {
        // Set basic PRAGMA settings for better performance and reliability
        await db.execAsync('PRAGMA foreign_keys = OFF;');
        await db.execAsync('PRAGMA journal_mode = WAL;');
        await db.execAsync('PRAGMA synchronous = NORMAL;');

        const tableInit = async () => {
            try {
                for (const tableSQL of tableSchemas) {
                    // Create table first (with IF NOT EXISTS to avoid errors)
                    await db.execAsync(tableSQL[0].sql);
                    console.log(`Created table: ${tableSQL[0].table}`);

                    if (tableSQL[0].foreignSql.length > 0) {
                        for (const foreignSQL of tableSQL[0].foreignSql) {
                            await db.execAsync(foreignSQL);
                        }
                    }
                }
                return true;
            } catch (error) {
                console.error('Error creating tables:', error);
                return false;
            }
        };

        const tablesCreated = await tableInit();

        if (tablesCreated) {
            console.log('Tables created and verified!');
            
            // Fetch and store data with foreign keys disabled
            await withForeignKeysDisabled(db, async () => {
                await fetchDataAPI(db);
                return true;
            });
            
            console.log('Data insertion completed with foreign keys safely managed');
        }

        return db;
    } catch (err) {
        console.error('DB Initialization Error:', err);
        throw err; // Re-throw to let caller handle
    }
};

export const dropAllTables = async () => {
    try {
        // First, try to close any existing connections
        await closeDB();
        
        // Try the normal approach first
        try {
            // Open a fresh connection for dropping tables
            const db = await getDB();

            console.log('Starting to drop tables...');
            
            // Drop tables in reverse order to handle dependencies
            const reversedSchemas = [...tableSchemas].reverse();
            
            for (const tableSQL of reversedSchemas) {
                try {
                    await db.execAsync(`DROP TABLE IF EXISTS ${tableSQL[0].table};`);
                    console.log(`Dropped table: ${tableSQL[0].table}`);
                } catch (tableError) {
                    console.warn(`Failed to drop table ${tableSQL[0].table}:`, tableError.message);
                    // Continue with other tables even if one fails
                }
            }
            
            console.log('All tables dropped successfully');
            
            // Close the connection after dropping
            await closeDB();
            
        } catch (normalError) {
            console.warn('Normal table drop failed, trying database file reset:', normalError.message);
            
            // If normal approach fails due to locking, reset the entire database file
            const resetSuccess = await resetDatabaseFile();
            if (!resetSuccess) {
                throw new Error('Both normal drop and file reset failed');
            }
            
            console.log('Database file reset completed successfully');
        }
        
    } catch (error) {
        console.error('Error dropping tables:', error);
        
        // Force close the connection on error
        try {
            await closeDB();
        } catch (closeError) {
            console.error('Failed to close database after error:', closeError);
        }
        
        throw error; // Re-throw to let caller handle
    }
};

const emptyTable = async (db, table) => {
    try {
        // Check if table exists first
        const result = await db.getFirstAsync(
            "SELECT name FROM sqlite_master WHERE type='table' AND name=?;",
            [table]
        );
        
        if (result) {
            await db.execAsync(`DELETE FROM ${table};`, []);
            console.log(`Table ${table} emptied`);
        } else {
            console.log(`Table ${table} does not exist, skipping empty operation`);
        }
    }
    catch (error) {
        console.error(`Error emptying table ${table}:`, error);
    }
}

export const fetchDataAPI = async (db) => {
    try {
        // Ensure foreign keys are disabled during data insertion
        await db.execAsync('PRAGMA foreign_keys = OFF;');
        console.log('Foreign keys disabled for data insertion');
        
        // Insert data in order of tableSchemas to respect dependencies
        // The tableSchemas array should be ordered to handle foreign key dependencies
        for (const tableSQL of tableSchemas) {
            const tableName = tableSQL[0].table;

            console.log(`Fetching data for table: ${tableName}...`);

            try {
                const response = await axiosInstance.post("/api/fetch-data", {
                    table: tableName
                });

                await storeDataToDB(db, tableName, response.data);
                console.log(`Successfully stored data for table: ${tableName}`);
                
            } catch (tableError) {
                console.error(`Error fetching/storing data for table ${tableName}:`, tableError.message);
                // Continue with other tables even if one fails
                continue;
            }
        }

        console.log('All data fetching completed');
        
    } catch (error) {
        console.error('Error in fetchDataAPI:', error.message || error);
        throw error; // Re-throw to let caller handle
    }
};

export const withForeignKeysDisabled = async (db, operation) => {
    try {
        // Disable foreign keys
        await db.execAsync('PRAGMA foreign_keys = OFF;');
        
        // Execute the operation
        const result = await operation();
        
        // Re-enable foreign keys
        await db.execAsync('PRAGMA foreign_keys = ON;');
        
        return result;
    } catch (error) {
        // Try to re-enable foreign keys even on error
        try {
            await db.execAsync('PRAGMA foreign_keys = ON;');
        } catch (pragmaError) {
            console.error('Failed to re-enable foreign keys:', pragmaError);
        }
        throw error;
    }
};

const storeDataToDB = async (db, table, data) => {
    if (!data || data.length === 0) {
        console.log(`No data to store in DB for table: ${table}`);
        return;
    }
    console.log(`Storing ${data.length} records to DB for table: ${table}...`);

    try {
        await db.withTransactionAsync(async () => {
            for (const item of data) {
                if (!item || typeof item !== 'object') {
                    console.warn(`Invalid item for table ${table}:`, item);
                    continue; // Skip invalid entries
                }

                const columns = Object.keys(item).join(', ');
                const placeholders = Object.keys(item).map(() => '?').join(', ');
                const values = Object.values(item);

                // Handle null values properly
                const sanitizedValues = values.map(value => 
                    value === null || value === undefined ? null : value
                );

                const sql = `INSERT OR REPLACE INTO ${table} (${columns}) VALUES (${placeholders})`;

                try {
                    await db.runAsync(sql, sanitizedValues);
                } catch (itemError) {
                    console.error(`Error inserting item into ${table}:`, itemError.message);
                    console.error(`SQL: ${sql}`);
                    console.error(`Values:`, sanitizedValues);
                    // Continue with other items
                }
            }
        });

        console.log(`Successfully stored data for table: ${table}`);
        return db;
    } catch (err) {
        console.error(`DB Storage Error for table ${table}:`, err.message);
        throw err; // Re-throw to let caller handle
    }
};

export const fetchDataFromDB = async (fetchedQuery, params = null) => {
    const db = await getDB();
    const result = await db.getAllAsync(fetchedQuery, params ?? []);
    return result;
}

export const fetchFirstDataFromDB = async (fetchedQuery, params = null) => {
    const db = await getDB();
    const result = await db.getFirstAsync(fetchedQuery, params ?? []);
    return result;
};

export const insertOrUpdateData = async (fetchedQuery, params) => {
    const db = await getDB();

    try {
        await storeTempSyncLog(db, fetchedQuery, params);
    } catch (error) {
        console.error('Error storing logs:', error);
    }

    const result = await db.runAsync(fetchedQuery, params);
    return result?.lastInsertRowId ?? null;
}

const storeTempSyncLog = async (db, query, params) => {
    const storeLogsQuery = storeLogs();

    const formattedDate = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

    const fullQuery = formatSqlQueryWithParams(query, params);

    await db.runAsync(
        storeLogsQuery,
        [fullQuery, formattedDate, formattedDate] // Assuming your logging table takes (query, date)
    );
};

const formatSqlQueryWithParams = (query, params) => {
    let index = 0;
    return query.replace(/\?/g, () => {
        const value = params[index++];
        if (value === null || value === undefined) return 'NULL';
        if (typeof value === 'number') return value;
        return `'${value.toString().replace(/'/g, "''")}'`;
    });
};

export const deleteDataFromDB = async (fetchedQuery, params) => {
    const db = await getDB();
    const result = await db.runAsync(fetchedQuery, params);
    return result;
}