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
];

let dbInstance = null;

const getDB = async () => {
    if (!dbInstance) {
        dbInstance = await SQLite.openDatabaseAsync('agility_eco.db', {
            useNewConnection: true
        });
    }
    return dbInstance;
};

export const initializeDB = async () => {
    // await dropAllTables();
    const db = await getDB();

    try {
        await db.execAsync('PRAGMA foreign_keys = OFF;', []);

        const tableInit = async () => {
            try {
                for (const tableSQL of tableSchemas) {
                    emptyTable(db, tableSQL[0].table);

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
            await fetchDataAPI(db);
        }

        return db;
    } catch (err) {
        console.error('DB Initialization Error:', err);
    }
};

export const dropAllTables = async () => {
    const db = await getDB();

    try {

        await db.withTransactionAsync(async () => {
            for (const tableSQL of tableSchemas) {
                await db.execAsync(`DROP TABLE IF EXISTS ${tableSQL[0].table};`, []);
            }
        });
        console.log('All tables dropped');
    } catch (error) {
        console.error('Error dropping tables:', error);
    }
};

const emptyTable = async (db, table) => {
    try {
        await db.execAsync(`DELETE FROM ${table};`, []);
        console.log(`Table ${table} emptied`);
    }
    catch (error) {
        console.error(`Error emptying table ${table}:`, error);
    }
}

export const fetchDataAPI = async (db) => {

    try {
        for (const tableSQL of tableSchemas) {
            const tableName = tableSQL[0].table;

            // console.log(`Fetchinggggg: ${tableName} Fetching data from API...`);

            const response = await axiosInstance.post("/api/fetch-data", {
                table: tableName
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
        await db.withTransactionAsync(async () => {
            for (const item of data) {
                // if (!item || typeof item !== 'object') {
                //     console.warn(`Invalid item for table ${table}:`, item);
                //     continue; // Skip invalid entries
                // }

                const columns = Object.keys(item).join(', ');
                const placeholders = Object.keys(item).map(() => '?').join(', ');
                const values = Object.values(item);

                const sql = `INSERT OR REPLACE INTO ${table} (${columns}) VALUES (${placeholders})`;

                // console.log(`Executing SQL for table ${table}:`, sql, values);

                await db.runAsync(sql, values);
            }
        });

        return db;
    } catch (err) {
        console.error('DB Initialization Error:', err);
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