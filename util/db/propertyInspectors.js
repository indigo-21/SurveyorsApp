import createTableSQL from "../createTable";

const propertyInspectorsProps = `
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 0,
    deactivate_date TEXT DEFAULT NULL,
    can_book_jobs INTEGER NOT NULL DEFAULT 0,
    pi_employer TEXT DEFAULT NULL,
    photo_expiry TEXT DEFAULT NULL,
    id_badge TEXT DEFAULT NULL,
    id_issued TEXT DEFAULT NULL,
    id_expiry TEXT DEFAULT NULL,
    id_revision TEXT DEFAULT NULL,
    id_location TEXT DEFAULT NULL,
    id_return TEXT DEFAULT NULL,
    address1 TEXT DEFAULT NULL,
    address2 TEXT DEFAULT NULL,
    address3 TEXT DEFAULT NULL,
    city TEXT DEFAULT NULL,
    county TEXT DEFAULT NULL,
    postcode TEXT DEFAULT NULL,
    charging_scheme_id INTEGER NOT NULL,
    property_visit_fee REAL DEFAULT NULL,
    property_fee_currency TEXT DEFAULT NULL,
    payment_terms INTEGER DEFAULT NULL,
    vat INTEGER NOT NULL DEFAULT 0,
    vat_no TEXT DEFAULT NULL,
    registered_id_number TEXT DEFAULT NULL,
    audit_jobs INTEGER NOT NULL DEFAULT 0,
    hours_spent INTEGER DEFAULT NULL,
    work_sat INTEGER NOT NULL DEFAULT 0,
    work_sun INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT NULL,
    updated_at TEXT DEFAULT NULL,
    deleted_at TEXT DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (charging_scheme_id) REFERENCES charging_schemes(id)
`;

const foreignKeys = [
    'user_id',
    'charging_scheme_id',
];

export const getPropertyInspector = () => {
    return `SELECT * FROM property_inspectors WHERE id = ?`;
}

export const propertyInspectorsTable = createTableSQL('property_inspectors', propertyInspectorsProps, foreignKeys);
