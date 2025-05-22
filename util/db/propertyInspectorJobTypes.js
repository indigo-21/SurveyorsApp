import createTableSQL from "../createTable";

const propertyInspectorJobTypesProps = `
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_inspector_id INTEGER NOT NULL,
    job_type_id INTEGER NOT NULL,
    rating INTEGER DEFAULT 0,
    created_at TEXT DEFAULT NULL,
    updated_at TEXT DEFAULT NULL,
    FOREIGN KEY (property_inspector_id) REFERENCES property_inspectors(id),
    FOREIGN KEY (job_type_id) REFERENCES job_types(id)
`;

const foreignKeys = [
    'property_inspector_id',
    'job_type_id',
];

export const propertyInspectorJobTypesTable = createTableSQL('property_inspector_job_types', propertyInspectorJobTypesProps, foreignKeys);
