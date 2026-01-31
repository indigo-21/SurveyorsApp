import * as SQLite from 'expo-sqlite';
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

// Generic retry helper for transient DB locking errors
const retryAsync = async (fn, { retries = 8, delay = 300 } = {}) => {
    let attempt = 0;
    while (attempt < retries) {
        try {
            return await fn();
        } catch (err) {
            const msg = (err && (err.message || err.toString())) || '';
            const isLocked = msg.includes('database is locked') || msg.includes('Error code 5');
            attempt++;
            if (!isLocked || attempt >= retries) {
                throw err;
            }
            // exponential backoff
            const backoff = delay * Math.pow(2, attempt - 1);
            console.warn(`DB locked, retrying in ${backoff}ms (attempt ${attempt}/${retries})`);
            await new Promise((res) => setTimeout(res, backoff));
        }
    }
};

// Simple exclusive queue to serialize DB write operations and DDL
let _lastDBOp = Promise.resolve();
let _queueCount = 0;
const runExclusive = (fn) => {
    _queueCount++;
    console.log(`DB queue length after enqueue: ${_queueCount}`);

    _lastDBOp = _lastDBOp
        .then(async () => {
            console.log('DB operation starting, remaining queue (approx):', _queueCount - 1);
            try {
                return await fn();
            } finally {
                _queueCount = Math.max(0, _queueCount - 1);
                console.log('DB operation finished, queue length now:', _queueCount);
            }
        })
        .catch((e) => {
            // log and rethrow so callers can handle, but keep chain alive
            console.error('runExclusive inner error:', e);
            throw e;
        });

    return _lastDBOp;
};

let dbInstance = null;

const getDB = async () => {
    if (!dbInstance) {
        dbInstance = await SQLite.openDatabaseAsync('agility_eco.db', {
            useNewConnection: true
        });

        // Ensure we set pragmas to reduce locking and allow WAL mode
        try {
            // Use retryAsync around PRAGMA calls in case DB is busy on open
            await retryAsync(async () => {
                // Set write-ahead logging and a busy timeout to help with transient locks
                await dbInstance.execAsync('PRAGMA journal_mode = WAL;');
                await dbInstance.execAsync('PRAGMA synchronous = NORMAL;');
                // busy_timeout in milliseconds (e.g., 5000ms)
                await dbInstance.execAsync('PRAGMA busy_timeout = 15000;');
            }, { retries: 6, delay: 200 });
        } catch (pragmaErr) {
            console.warn('Could not set PRAGMA on DB:', pragmaErr);
        }
    }
    return dbInstance;
};

export const initializeDB = async (propertyInspectorID) => {
    // await dropAllTables();
    const db = await getDB();

    try {
        await db.execAsync('PRAGMA foreign_keys = OFF;', []);

        const tableInit = async () => {
            try {
                for (const tableSQL of tableSchemas) {
                    await db.execAsync(tableSQL[0].sql, []);
                    console.log(`Creatinggggg: ${tableSQL[0].table} created`);

                    if (tableSQL[0].foreignSql.length > 0) {
                        for (const foreignSQL of tableSQL[0].foreignSql) {
                            await db.execAsync(foreignSQL, []);
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
            await fetchDataAPI(db, propertyInspectorID);
        }

        return db;
    } catch (err) {
        console.error('DB Initialization Error:', err);
    }
};

export const dropAllTables = async () => {
    const db = await getDB();

    try {
        // Add PRAGMA to ensure database is not locked
        await db.execAsync('PRAGMA foreign_keys = OFF;');

        await runExclusive(async () => {
            await retryAsync(async () => {
                await db.withTransactionAsync(async () => {
                    for (const tableSQL of tableSchemas) {
                        await db.execAsync(`DROP TABLE IF EXISTS ${tableSQL[0].table};`, []);
                    }
                });
            });
        });
        console.log('All tables dropped');
    } catch (error) {
        console.error('Error dropping tables:', error);
        throw error; // Re-throw to handle in calling function
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

export const fetchDataAPI = async (db, propertyInspectorID) => {

    try {
        for (const tableSQL of tableSchemas) {
            const tableName = tableSQL[0].table;

            // console.log(`Fetchinggggg: ${tableName} Fetching data from API...`);

            const response = await axiosInstance.post("/api/fetch-data", {
                table: tableName,
                property_inspector_id: propertyInspectorID,
            });

            await storeDataToDB(db, tableName, response.data);
        }

    } catch (error) {
        console.error('Error fetchingggg data:', error.message || error);
        return null;
    }
}

const storeDataToDB = async (db, table, data) => {
    if (!data || data.length === 0) {
        // console.log(`No data to store in DB for table: ${table}`);
        return;
    }
    console.log(`Storing data to DB for table: ${table}...`);

    try {
        await runExclusive(async () => {
            await retryAsync(async () => {
                await db.withTransactionAsync(async () => {
                    // Use multi-row INSERTs in batches to reduce number of DB calls
                    const batchSize = 200; // adjust as needed

                    // Determine column order from the first item (assumes API returns consistent shape)
                    const firstItem = data[0];
                    const columns = Object.keys(firstItem);
                    const columnList = columns.join(', ');

                    for (let i = 0; i < data.length; i += batchSize) {
                        const batch = data.slice(i, i + batchSize);

                        // Build placeholders and flattened values
                        const placeholders = batch
                            .map(() => `(${columns.map(() => '?').join(',')})`)
                            .join(',');

                        const values = [];
                        for (const item of batch) {
                            for (const col of columns) {
                                values.push(item[col] === undefined ? null : item[col]);
                            }
                        }

                        const sql = `INSERT OR REPLACE INTO ${table} (${columnList}) VALUES ${placeholders}`;
                        await db.runAsync(sql, values);
                    }
                });
        }, { retries: 6, delay: 300 });
        });

        return db;
    } catch (err) {
        console.error('DB Initialization Error:', err);
    }
};

export const fetchDataFromDB = async (fetchedQuery, params = null) => {
    const db = await getDB();
    const result = await retryAsync(async () => {
        return await db.getAllAsync(fetchedQuery, params ?? []);
    });
    return result;
}

export const fetchFirstDataFromDB = async (fetchedQuery, params = null) => {
    const db = await getDB();
    const result = await retryAsync(async () => {
        return await db.getFirstAsync(fetchedQuery, params ?? []);
    });
    return result;
};

export const insertOrUpdateData = async (fetchedQuery, params) => {
    const db = await getDB();

    try {
        await runExclusive(async () => {
            await storeTempSyncLog(db, fetchedQuery, params);
        });
    } catch (error) {
        console.error('Error storing logs:', error);
    }

    // execute the actual insert/update in exclusive mode
    const result = await runExclusive(async () => {
        return await db.runAsync(fetchedQuery, params);
    });

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
    const result = await runExclusive(async () => {
        return await db.runAsync(fetchedQuery, params);
    });
    return result;
}