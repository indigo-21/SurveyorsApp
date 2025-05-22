import createTableSQL from "../createTable";

const propertyInspectorQualificationsProps = `
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_inspector_id INTEGER NOT NULL,
    name TEXT DEFAULT NULL,
    issue_date TEXT DEFAULT NULL,
    expiry_date TEXT DEFAULT NULL,
    certificate TEXT DEFAULT NULL,
    qualification_issue TEXT DEFAULT NULL,
    created_at TEXT DEFAULT NULL,
    updated_at TEXT DEFAULT NULL,
    FOREIGN KEY (property_inspector_id) REFERENCES property_inspectors(id)
`;

const foreignKeys = [
    'property_inspector_id',
];

export const propertyInspectorQualificationsTable = createTableSQL('property_inspector_qualifications', propertyInspectorQualificationsProps, foreignKeys);
