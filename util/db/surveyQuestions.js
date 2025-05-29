import createTableSQL from "../createTable";

const surveyQuestionsProps = `
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    survey_question_set_id INTEGER NOT NULL,
    measure_cat TEXT DEFAULT NULL,
    inspection_stage TEXT DEFAULT NULL,
    question_number TEXT DEFAULT NULL,
    question TEXT DEFAULT NULL,
    can_have_photo INTEGER DEFAULT NULL,
    na_allowed INTEGER DEFAULT NULL,
    unable_to_validate_allowed INTEGER DEFAULT NULL,
    remote_reinspection_allowed INTEGER DEFAULT NULL,
    score_monitoring INTEGER DEFAULT NULL,
    nc_severity TEXT DEFAULT NULL,
    uses_dropdown INTEGER DEFAULT NULL,
    dropdown_list TEXT DEFAULT NULL,
    innovation_measure TEXT DEFAULT NULL,
    innovation_question_list INTEGER DEFAULT NULL,
    measure_type TEXT DEFAULT NULL,
    innovation_product TEXT DEFAULT NULL,
    created_at TEXT DEFAULT NULL,
    updated_at TEXT DEFAULT NULL,
    deleted_at TEXT DEFAULT NULL,
    FOREIGN KEY (survey_question_set_id) REFERENCES survey_question_sets(id)
`;

const foreignKeys = [
    'survey_question_set_id',
];

export const surveyQuestionsTable = createTableSQL('survey_questions', surveyQuestionsProps, foreignKeys);

export const getSurveyQuestions = () => {
    return `SELECT
                *
            FROM
                survey_questions
            WHERE
                (measure_cat LIKE "All Measures" OR measure_cat = ?) 
                AND score_monitoring = ?
                AND survey_question_set_id = ?`;
};

export const getAllSurveyQuestions = () => {
    return `SELECT
                *
            FROM
                survey_questions
            WHERE
                (measure_cat LIKE "All Measures" OR measure_cat = ?) 
                AND survey_question_set_id = ?`;
};
