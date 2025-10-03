import Dexie from "dexie";

export const db = new Dexie("TalentFlowDB");

db.version(1).stores({
  jobs: "++id, title, slug, status, order",
  candidates: "++id, name, email, stage, jobId",
  assessments: "jobId",
  responses: "++id, jobId, candidateId"
});
