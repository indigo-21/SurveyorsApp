import createTableSQL from "../createTable";

const clientSlaMetricsProps = `
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    client_maximum_retries INTEGER DEFAULT NULL,
    maximum_booking_attempts TEXT DEFAULT NULL,
    maximum_remediation_attempts TEXT DEFAULT NULL,
    maximum_no_show TEXT DEFAULT NULL,
    maximum_number_appeals TEXT DEFAULT NULL,
    job_deadline TEXT DEFAULT NULL,
    cat1_remediate_notify TEXT DEFAULT NULL,
    cat1_remediate_notify_duration_unit INTEGER DEFAULT 1, -- 1 = Hours, 2 = Days
    cat1_remediate_complete TEXT DEFAULT NULL,
    cat1_remediate_complete_duration_unit INTEGER DEFAULT 1,
    cat1_reinspect_remediation TEXT DEFAULT NULL,
    cat1_reinspect_remediation_duration_unit INTEGER DEFAULT 1,
    cat1_challenge TEXT DEFAULT NULL,
    cat1_challenge_duration_unit INTEGER DEFAULT 1,
    cat1_remediate_no_access TEXT DEFAULT NULL,
    cat1_remediate_no_access_duration_unit INTEGER DEFAULT 1,
    cat1_unremediated TEXT DEFAULT NULL,
    cat1_unremediated_duration_unit INTEGER DEFAULT 1,
    nc_remediate_notify TEXT DEFAULT NULL,
    nc_remediate_notify_duration_unit INTEGER DEFAULT 1,
    nc_remediate_complete TEXT DEFAULT NULL,
    nc_remediate_complete_duration_unit INTEGER DEFAULT 1,
    nc_reinspect_remediation TEXT DEFAULT NULL,
    nc_reinspect_remediation_duration_unit INTEGER DEFAULT 1,
    nc_challenge TEXT DEFAULT NULL,
    nc_challenge_duration_unit INTEGER DEFAULT 1,
    nc_remediate_no_access TEXT DEFAULT NULL,
    nc_remediate_no_access_duration_unit INTEGER DEFAULT 1,
    nc_unremediated TEXT DEFAULT NULL,
    nc_unremediated_duration_unit INTEGER DEFAULT 1,
    created_at TEXT DEFAULT NULL,
    updated_at TEXT DEFAULT NULL,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
`;

const foreignKeys = [
    'client_id',
];

export const clientSlaMetricsTable = createTableSQL('client_sla_metrics', clientSlaMetricsProps, foreignKeys);
