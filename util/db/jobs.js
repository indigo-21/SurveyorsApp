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
    invoice_status_id TEXT,
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
    sent_reminder INTEGER DEFAULT 0,
    completed_survey_date INTEGER DEFAULT NULL,
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

export const getPropertyInspectorJobs = () => {
    return `SELECT j.id, 
                SUBSTR(job_number, 1, INSTR(job_number, '-') - 1) AS group_id,
                p.address1,
                p.postcode,
                j.cert_no,
                c.client_abbrevation,
                j.job_status_id
            FROM jobs j
			LEFT JOIN properties p
			ON j.id = p.job_id
			LEFT JOIN clients c
			ON c.id = j.client_id
            WHERE property_inspector_id = ?
            AND job_status_id IN (?, ?)
            GROUP BY group_id`;

};

export const getFilteredPropertyInspectorJobs = (value = {}) => {
    let baseQuery = `
                SELECT j.id, 
                    SUBSTR(job_number, 1, INSTR(job_number, '-') - 1) AS group_id,
                    p.address1,
                    p.postcode,
                    j.cert_no,
                    c.client_abbrevation,
                    j.job_status_id,
                    m.measure_cat,
                    js.description
                FROM jobs j
                LEFT JOIN properties p ON j.id = p.job_id
                LEFT JOIN clients c ON c.id = j.client_id
                LEFT JOIN job_measures jm ON jm.job_id = j.id
                LEFT JOIN measures m ON m.id = jm.measure_id
                LEFT JOIN job_statuses js ON js.id = j.job_status_id
                WHERE property_inspector_id = ?
                AND job_status_id IN (?, ?)
                `;

    let params = [value.propertyInspectorID, 1, 2];

    if (value.measureCat) {
        baseQuery += ` AND m.measure_cat = ?`;
        params.push(value.measureCat);
    }

    if (value.postcode) {
        baseQuery += ` AND p.postcode LIKE ?`;
        params.push(`%${value.postcode}%`);
    }

    if (value.jobStatus) {
        baseQuery += ` AND js.description LIKE ?`;
        params.push(`%${value.jobStatus}%`);
    }

    baseQuery += ` GROUP BY group_id`;

    const returnValues = {
        baseQuery,
        params
    };

    return returnValues;

};

export const getPropertyInspectorUnbookedJobs = () => {
    return `SELECT SUBSTR(job_number, 1, INSTR(job_number, '-') - 1) AS group_id
            FROM jobs
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

export const updateBookingJob = () => {
    return `UPDATE jobs
            SET job_status_id = ?,
                last_update = ?,
                schedule_date = ?
            WHERE job_number LIKE ? 
            AND job_status_id IN (1, 2, 25)`;
}

export const updateBookedJob = () => {
    return `UPDATE jobs
            SET job_status_id = ?,
            last_update = ?
            WHERE job_number LIKE ?
            AND job_status_id IN (1, 2, 25)`;
}

export const closeJob = () => {
    return `UPDATE jobs
            SET job_status_id = ?,
                last_update = ?,
                close_date = ?
            WHERE job_number LIKE ?
            AND job_status_id IN (1, 2, 25)`;
};

export const updateJobForCustomerNoShow = () => {
    return `UPDATE jobs
            SET job_status_id = ?,
                last_update = ?,
                max_noshow = max_noshow + 1
            WHERE job_number LIKE ?
            AND job_status_id IN (1, 2, 25)`;
};

export const getClientMaxNoShow = () => {
    return `SELECT csm.maximum_no_show FROM jobs j
            LEFT JOIN clients c
            ON c.id = j.client_id
            LEFT JOIN client_sla_metrics csm
            ON csm.client_id = c.id
            WHERE job_number LIKE ?`;
};

export const getJobDetailsByJobNumber = () => {
    return `SELECT * FROM jobs
            WHERE job_number LIKE ?`;
};

export const getJobSummary = () => {
    return `SELECT j.id, j.job_number, m.id as measure_id, m.measure_cat, jm.umr, s.short_name, s.survey_question_set_id FROM jobs j 
            LEFT JOIN job_measures jm 
            ON jm.job_id = j.id
            LEFT JOIN measures m 
            ON m.id = jm.measure_id
            LEFT JOIN schemes s
            ON s.id = j.scheme_id
            WHERE j.job_number LIKE ?
            AND job_status_id IN (1)`;
};

export const updateCompletedJobs = () => {
    return `UPDATE jobs
            SET job_status_id = ?,
                invoice_status_id = ?,
                last_update = ?,
                close_date = ?,
                job_remediation_type = ?,
                rework_deadline = ?,
                completed_survey_date = ?
            WHERE id LIKE ?`;
};

export const getScheduleJobs = () => {
    return `SELECT SUBSTR(job_number, 1, INSTR(job_number, '-') - 1) AS group_id, j.schedule_date, j.first_visit_by, j.deadline, cus.customer_name, cli.client_abbrevation, p.house_flat_prefix, p.address1, js.description FROM jobs j 
            LEFT JOIN job_statuses js 
            ON js.id = j.job_status_id
            LEFT JOIN customers cus
            ON cus.job_id = j.id
            LEFT JOIN clients cli 
            ON cli.id = j.client_id
            LEFT JOIN properties p
            ON p.job_id = j.id
            WHERE j.property_inspector_id = ? 
            AND job_status_id IN (1, 2, 23, 24)
            GROUP BY group_id`;
};