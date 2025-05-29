import axiosInstance from '../../../util/axiosInstance';
import { deleteDataFromDB, fetchDataFromDB } from '../../../util/database';
import { deleteLogs, getLogs } from '../../../util/db/tempSyncLogs';
import eventbus from '../../../events/eventbus';

let isSyncing = false;

export const syncToServer = async () => {
    if (isSyncing) return;
    isSyncing = true;

    const logsQuery = getLogs();
    const deleteLogsQuery = deleteLogs();

    try {
        const result = await fetchDataFromDB(logsQuery);
        console.log('Syncing logs...');

        for (const log of result) {
            const { id, sql_query } = log;

            try {
                await axiosInstance.post("/api/store-query", { query: sql_query });
                await deleteDataFromDB(deleteLogsQuery, [id]);
                eventbus.emit('logsChanged');
                console.log(`Deleted log with ID: ${id}`);
            } catch (error) {
                console.error('Error processing log:', error.response?.data.message || error.message);
            }
        }

        console.log('Syncing completed');
    } catch (error) {
        console.error('Error syncing to server:', error);
    } finally {
        isSyncing = false;
    }
};
