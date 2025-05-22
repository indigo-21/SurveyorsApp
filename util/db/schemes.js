import createTableSQL from "../createTable";

const schemesProps = `
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    short_name TEXT NOT NULL,
    long_name TEXT NOT NULL,
    survey_question_set_id INTEGER NOT NULL,
    description TEXT NOT NULL,
    created_at TEXT DEFAULT NULL,
    updated_at TEXT DEFAULT NULL,
    deleted_at TEXT DEFAULT NULL,
    FOREIGN KEY (survey_question_set_id) REFERENCES survey_question_sets(id)
`;

const foreignKeys = [
    'survey_question_set_id',
];

export const schemesTable = createTableSQL('schemes', schemesProps, foreignKeys);
