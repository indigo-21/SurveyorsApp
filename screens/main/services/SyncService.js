import axiosInstance from '../../../util/axiosInstance';
import { deleteDataFromDB, fetchDataFromDB, insertOrUpdateData } from '../../../util/database';
import { deleteLogs, getLogs } from '../../../util/db/tempSyncLogs';
import eventbus from '../../../events/eventbus';
import { getUnsyncedCompletedJobPhotos, updateCompletedJobPhotoStatus } from '../../../util/db/completedJobPhotos';

let isSyncing = false;

export const syncToServer = async () => {
    if (isSyncing) return;
    isSyncing = true;

    const logsQuery = getLogs();
    const deleteLogsQuery = deleteLogs();
    const getUnsyncedCompletedJobPhotosQuery = getUnsyncedCompletedJobPhotos();
    const updateCompletedJobPhotoStatusQuery = updateCompletedJobPhotoStatus();

    try {
        const result = await fetchDataFromDB(logsQuery);
        const unsyncPhotos = await fetchDataFromDB(getUnsyncedCompletedJobPhotosQuery);
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

        for (const photo of unsyncPhotos) {
            const { id, file_path, filename } = photo;

            console.log(id);

            try {
                const formData = new FormData();
                formData.append('photo', {
                    uri: file_path,
                    name: filename,
                    type: 'image/jpeg',
                });

                await axiosInstance.post("/api/upload-completed-job-photo", formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                await insertOrUpdateData(updateCompletedJobPhotoStatusQuery, [1, id]);
                console.log(`Updated completed job photo with ID: ${id}`);
            } catch (error) {
                console.error('Error processing completed job photo:', error.response?.data.message || error.message);
            }
        }

        console.log('Syncing completed');
    } catch (error) {
        console.error('Error syncing to server:', error);
    } finally {
        isSyncing = false;
    }
};
