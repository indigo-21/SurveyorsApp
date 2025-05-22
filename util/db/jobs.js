import createTableSQL from "../createTable";

const jobParams = `
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_number TEXT NOT NULL UNIQUE,
    cert_no TEXT NOT NULL,
    job_type_id INTEGER NOT NULL,
    job_status_id INTEGER NOT NULL,
    last_update TEXT NOT NULL,
    client_id INTEGER NOT NULL,
    max_attempts INTEGER NOT NULL DEFAULT 0,
    max_noshow INTEGER NOT NULL DEFAULT 0,
    max_remediation INTEGER NOT NULL DEFAULT 0,
    max_appeal INTEGER NOT NULL DEFAULT 0,
    job_remediation_type TEXT,
    deadline TEXT NOT NULL,
    first_visit_by TEXT NOT NULL,
    rework_deadline TEXT,
    invoice_status TEXT,
    property_inspector_id INTEGER,
    schedule_date TEXT,
    close_date TEXT,
    duration INTEGER,
    notes TEXT,
    lodged_by_tmln TEXT,
    lodged_by_name TEXT,
    installer_id INTEGER,
    sub_installer_tmln TEXT,
    scheme_id INTEGER,
    csv_filename TEXT,
    created_at TEXT,
    updated_at TEXT,
    deleted_at TEXT,
    FOREIGN KEY (job_type_id) REFERENCES job_types(id),
    FOREIGN KEY (job_status_id) REFERENCES job_statuses(id),
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (property_inspector_id) REFERENCES property_inspectors(id),
    FOREIGN KEY (installer_id) REFERENCES installers(id),
    FOREIGN KEY (scheme_id) REFERENCES schemes(id)
`;


const foreignKeys = [
    'job_type_id',
    'job_status_id',
    'client_id',
    'property_inspector_id',
    'installer_id',
    'scheme_id',

];

export const jobsTable = createTableSQL('jobs', jobParams, foreignKeys);

export const getPropertyInspectorJobs = (table) => {
    return `SELECT j.id, SUBSTR(job_number, 1, INSTR(job_number, '-') - 1) AS group_id, p.address1, p.postcode, j.cert_no, c.client_abbrevation
            FROM ${table} j
			LEFT JOIN properties p
			ON j.id = p.job_id
			LEFT JOIN clients c
			ON c.id = j.client_id
            WHERE property_inspector_id = ?
            AND job_status_id = ?
            GROUP BY group_id`;

};

export const getPropertyInspectorUnbookedJobs = (table) => {
    return `SELECT SUBSTR(job_number, 1, INSTR(job_number, '-') - 1) AS group_id
            FROM ${table} 
            WHERE property_inspector_id = ? 
            AND job_status_id = ?
            GROUP BY group_id`;
}

export const getJobDetails = () => {
    return `SELECT * FROM jobs j
            LEFT JOIN customers c
            ON c.job_id = j.id
            LEFT JOIN properties p
            ON p.job_id = j.id
            LEFT JOIN installers i
            ON i.id = j.installer_id
			LEFT JOIN users u
			ON u.id = i.user_id
			LEFT JOIN schemes s
			ON s.id = j.scheme_id
            WHERE j.id = ?`;
}
