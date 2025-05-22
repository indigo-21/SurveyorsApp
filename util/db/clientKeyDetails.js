import createTableSQL from "../createTable";

const clientKeyDetailsProps = `
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    is_active INTEGER DEFAULT 1,
    can_job_outcome_appealed INTEGER DEFAULT 1,
    charging_scheme_id INTEGER NOT NULL,
    payment_terms INTEGER DEFAULT NULL,
    charge_by_property_rate REAL DEFAULT NULL,
    currency TEXT DEFAULT 'GBP',
    created_at TEXT DEFAULT NULL,
    updated_at TEXT DEFAULT NULL,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (charging_scheme_id) REFERENCES charging_schemes(id) ON DELETE CASCADE
`;

const foreignKeys = [
    'client_id',
    'charging_scheme_id',
];

export const clientKeyDetailsTable = createTableSQL('client_key_details', clientKeyDetailsProps, foreignKeys);
