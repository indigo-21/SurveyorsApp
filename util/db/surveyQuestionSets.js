import createTableSQL from "../createTable";

const surveyQuestionSetsProps = `
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_revision TEXT NOT NULL,
    question_set TEXT NOT NULL,
    question_set_file TEXT NOT NULL,
    created_at TEXT DEFAULT NULL,
    updated_at TEXT DEFAULT NULL,
    deleted_at TEXT DEFAULT NULL
`;

export const surveyQuestionSetsTable = createTableSQL('survey_question_sets', surveyQuestionSetsProps);

export const getSurveyQuestionSets = (table) => {
    return `SELECT * FROM ${table}`;
}