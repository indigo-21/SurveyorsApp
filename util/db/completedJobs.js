import createTableSQL from "../createTable";

const completedJobsProps = `
    id TEXT PRIMARY KEY, 
    job_id INTEGER NOT NULL,
    time TEXT NOT NULL,
    geostamp TEXT NOT NULL,
    pass_fail TEXT NOT NULL,
    comments TEXT NOT NULL,
    remediation INTEGER DEFAULT 0,
    appeal INTEGER DEFAULT 0,
    survey_question_set_id INTEGER NOT NULL,
    survey_question_id INTEGER NOT NULL,
    installer_first_access TEXT DEFAULT NULL,
    installer_first_access_completed_job TEXT DEFAULT NULL,
    created_at TEXT DEFAULT NULL,
    updated_at TEXT DEFAULT NULL,
    FOREIGN KEY (job_id) REFERENCES jobs(id),
    FOREIGN KEY (survey_question_set_id) REFERENCES survey_question_sets(id)
    FOREIGN KEY (survey_question_id) REFERENCES survey_questions(id)
`;

const foreignKeys = [
    'job_id',
    'survey_question_set_id',
    'survey_question_id',
];

export const completedJobsTable = createTableSQL('completed_jobs', completedJobsProps, foreignKeys);

export const storeCompletedJob = () => {
    return `INSERT INTO
            completed_jobs ( 
            id, 
            job_id, 
            time, 
            geostamp, 
            pass_fail, 
            comments, 
            remediation, 
            appeal, 
            survey_question_set_id, 
            survey_question_id, 
            installer_first_access, 
            installer_first_access_completed_job, 
            created_at, 
            updated_at)
            VALUES
            ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
}

export const getCompletedJobSurveyResults = () => {
    return `SELECT j.job_number,
                sq.question_number,
                sq.question,
                cj.comments,
                cj.pass_fail,
                j.id as job_id,
                m.measure_cat,
                sq.id as survey_question_id,
                sq.score_monitoring 
            FROM jobs j
            LEFT JOIN job_measures jm
            ON jm.job_id = j.id
            LEFT JOIN measures m 
            ON m.id = jm.measure_id
            LEFT JOIN completed_jobs cj 
            ON cj.job_id = j.id
            LEFT JOIN survey_questions sq
            ON sq.id = cj.survey_question_id 
            WHERE j.id = ?`;
};