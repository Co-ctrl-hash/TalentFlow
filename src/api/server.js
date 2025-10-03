import { createServer, Model, Factory } from "miragejs";

export function makeServer({ environment = "development" } = {}) {
  return createServer({
    environment,

    models: {
      job: Model,
      candidate: Model,
      assessment: Model,
      assessmentResponse: Model,
    },

    factories: {
      candidate: Factory.extend({
        name(i) {
          return `Candidate ${i}`;
        },
        email(i) {
          return `candidate${i}@mail.com`;
        },
        stage() {
          const stages = ["applied", "screen", "tech", "offer", "hired", "rejected"];
          return stages[Math.floor(Math.random() * stages.length)];
        },
      }),
    },

    seeds(server) {
      for (let i = 1; i <= 10; i++) {
        server.create("job", {
          id: String(i),
          title: `Job ${i}`,
          slug: `job-${i}`,
          status: i % 3 === 0 ? "archived" : "active",
          tags: ["remote", "full-time"],
          order: i,
        });
      }

      server.createList("candidate", 1000);

      server.create("assessment", {
        jobId: "1",
        sections: [
          {
            title: "General Questions",
            questions: [
              {
                id: "q1",
                type: "single-choice",
                text: "Do you have 3+ years of experience?",
                options: ["Yes", "No"],
                required: true,
              },
              {
                id: "q2",
                type: "short-text",
                text: "What is your strongest skill?",
                maxLength: 100,
              },
              {
                id: "q3",
                type: "numeric",
                text: "Expected Salary",
                min: 20000,
                max: 100000,
              },
            ],
          },
        ],
      });

      server.create("assessment", {
        jobId: "2",
        sections: [
          {
            title: "Technical Quiz",
            questions: [
              {
                id: "q1",
                type: "multi-choice",
                text: "Which frameworks do you know?",
                options: ["React", "Angular", "Vue"],
                required: true,
              },
              { id: "q2", type: "file", text: "Upload your resume" },
            ],
          },
        ],
      });
    },

    routes() {
      this.namespace = "api"; 

      this.timing = 400;

      this.pretender.handledRequest = function (verb, path, request) {
        if (["POST", "PATCH", "PUT"].includes(verb)) {
          if (Math.random() < 0.08) {
            request.passthrough = false;
            request.respond(500, {}, JSON.stringify({ error: "Random server error" }));
          }
        }
      };

      // ===================== JOBS =====================
      this.get("/jobs", (schema, request) => {
        return schema.jobs.all();
      });

      this.post("/jobs", (schema, request) => {
        let attrs = JSON.parse(request.requestBody);
        return schema.jobs.create(attrs);
      });

      this.patch("/jobs/:id", (schema, request) => {
        let id = request.params.id;
        let attrs = JSON.parse(request.requestBody);
        let job = schema.jobs.find(id);
        return job.update(attrs);
      });

      this.patch("/jobs/:id/reorder", (schema, request) => {
        let { fromOrder, toOrder } = JSON.parse(request.requestBody);
        let job = schema.jobs.find(request.params.id);

        if (!job) return new Response(404, {}, { error: "Job not found" });

        job.update({ order: toOrder });
        return { success: true };
      });

      // ===================== CANDIDATES =====================
      this.get("/candidates", (schema, request) => {
        let { search, stage, page = 1, pageSize = 10 } = request.queryParams;
        let candidates = schema.candidates.all().models;

        if (search) {
          candidates = candidates.filter(
            (c) =>
              c.name.toLowerCase().includes(search.toLowerCase()) ||
              c.email.toLowerCase().includes(search.toLowerCase())
          );
        }

        if (stage) {
          candidates = candidates.filter((c) => c.stage === stage);
        }

        let start = (page - 1) * pageSize;
        let end = start + Number(pageSize);
        let paginated = candidates.slice(start, end);

        return {
          data: paginated,
          total: candidates.length,
          page: Number(page),
        };
      });

      this.post("/candidates", (schema, request) => {
        let attrs = JSON.parse(request.requestBody);
        return schema.candidates.create(attrs);
      });

      this.patch("/candidates/:id", (schema, request) => {
        let id = request.params.id;
        let attrs = JSON.parse(request.requestBody);
        let candidate = schema.candidates.find(id);
        return candidate.update(attrs);
      });

      this.get("/candidates/:id/timeline", (schema, request) => {
        let id = request.params.id;
        return {
          id,
          timeline: [
            { stage: "applied", date: "2024-01-01" },
            { stage: "screen", date: "2024-01-05" },
          ],
        };
      });

      // ===================== ASSESSMENTS =====================
      this.get("/assessments/:jobId", (schema, request) => {
        let jobId = request.params.jobId;
        let assessment = schema.assessments.findBy({ jobId });

        if (!assessment) {
          return { jobId, sections: [] };
        }
        return assessment.attrs;
      });

      this.put("/assessments/:jobId", (schema, request) => {
        let jobId = request.params.jobId;
        let attrs = JSON.parse(request.requestBody);

        let assessment = schema.assessments.findBy({ jobId });
        if (assessment) {
          return assessment.update(attrs);
        } else {
          return schema.assessments.create({ jobId, ...attrs });
        }
      });

      this.post("/assessments/:jobId/submit", (schema, request) => {
        let jobId = request.params.jobId;
        let body = JSON.parse(request.requestBody);

        return schema.db.assessmentResponses.insert({
          jobId,
          candidateId: body.candidateId,
          responses: body.responses,
          submittedAt: new Date().toISOString(),
        });
      });
    },
  });
}
