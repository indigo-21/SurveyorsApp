import createTableSQL from "../createTable";

const completedJobPhotosProps = `
    id TEXT PRIMARY KEY,
    completed_job_id TEXT NOT NULL,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    status INTEGER DEFAULT 0,
    created_at TEXT DEFAULT NULL,
    updated_at TEXT DEFAULT NULL,
    deleted_at TEXT DEFAULT NULL,
    FOREIGN KEY (completed_job_id) REFERENCES completed_jobs(id) ON DELETE CASCADE
`;

const foreignKeys = [
    'completed_job_id',
];

export const completedJobPhotosTable = createTableSQL('completed_job_photos', completedJobPhotosProps, foreignKeys);

export const storeCompletedJobPhoto = () => {
    return `INSERT INTO
            completed_job_photos (id, completed_job_id, filename, file_path, status, created_at, updated_at, deleted_at)
            VALUES
            (?, ?, ?, ?, ?, ?, ?, ?)`;
};

export const getUnsyncedCompletedJobPhotos = () => {
    return `SELECT * FROM completed_job_photos WHERE status = 0`;
};

export const updateCompletedJobPhotoStatus = () => {
    return `UPDATE completed_job_photos SET status = ? WHERE id = ?`;
};