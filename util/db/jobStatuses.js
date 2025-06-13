import createTableSQL from "../createTable";

const jobStatusesProps = `
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    status TEXT NOT NULL,
    description TEXT NOT NULL,
    generic_state TEXT NOT NULL,
    color_scheme TEXT NOT NULL,
    created_at TEXT DEFAULT NULL,
    updated_at TEXT DEFAULT NULL,
    deleted_at TEXT DEFAULT NULL
`;

export const jobStatusesTable = createTableSQL('job_statuses', jobStatusesProps);

export const getAllJobStatuses = () => {
    return `SELECT * FROM job_statuses`;
}
