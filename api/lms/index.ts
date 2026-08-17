import { Api } from "../../core/utils/abstract.ts";
import { RouteError } from "../../core/utils/route-error.ts";
import { lmsTables } from "./tables.ts";
import { LmsQuery } from "./query.ts";

export class LmsApi extends Api {
  Queries = new LmsQuery(this.db);

  handlers = {
    postCourse: (req, res) => {
      const { slug, title, description, lessons, hours } = req.body;
      const writeResult = this.Queries.insertCourse({
        slug,
        title,
        description,
        lessons,
        hours,
      });
      if (writeResult.changes === 0) {
        throw new RouteError(400, "erro ao criar curso");
      }
      res.status(201).json({
        id: writeResult.lastInsertRowid,
        changes: writeResult.changes,
        title: "curso criado",
      });
    },
    postLesson: (req, res) => {
      const {
        courseSlug,
        slug,
        title,
        seconds,
        video,
        description,
        order,
        free,
      } = req.body;
      const writeResult = this.Queries.insertLessons({
        courseSlug,
        slug,
        title,
        seconds,
        video,
        description,
        order,
        free,
      });
      if (writeResult.changes === 0) {
        throw new RouteError(400, "erro ao criar aula");
      }
      res.status(201).json({
        id: writeResult.lastInsertRowid,
        changes: writeResult.changes,
        title: "aula criada",
      });
    },
    getCourses: (req, res) => {
      const courses = this.Queries.selectCourses();
      if (courses.length === 0) {
        throw new RouteError(404, "nenhum curso encontrado");
      }
      res.status(200).json(courses);
    },
    getCourse: (req, res) => {
      const { slug } = req.params;
      const course = this.Queries.selectCourse(slug);
      const lessons = this.Queries.selectLessons(slug);

      if (!course) {
        throw new RouteError(404, "curso não encontrado");
      }
      res.status(200).json({
        ...course,
        lessons,
      });
    },
    getLesson: (req, res) => {
      const { courseSlug, lessonSlug } = req.params;
      const lesson = this.Queries.selectLesson(courseSlug, lessonSlug);
      const nav = this.Queries.selectLessonNav(courseSlug, lessonSlug);
      const index = nav.findIndex((l) => l.slug == lesson?.slug);
      const next = nav[index + 1] ?? null;
      const prev = nav[index - 1] ?? null;
      if (!lesson) {
        throw new RouteError(404, "Aula não encontrado");
      }

      res.status(200).json({ lesson, next, prev });
    },
    completeLesson: (req, res) => {
      const userId = 1;
      const { courseId, lessonId } = req.body;
      const writeResult = this.Queries.insertLessonCompleted(
        userId,
        courseId,
        lessonId,
      );
      if (writeResult.changes === 0) {
        throw new RouteError(400, "erro ao completar aula");
      }
      res.status(201).json({
        title: "aula concluída",
      });
    },
  } satisfies Api["handlers"];
  tables(): void {
    this.db.exec(lmsTables);
  }
  routes(): void {
    this.router.get("/lms/courses", this.handlers.getCourses);
    this.router.get("/lms/course/:slug", this.handlers.getCourse);
    this.router.post("/lms/course", this.handlers.postCourse);
    this.router.post("/lms/lesson", this.handlers.postLesson);
    this.router.get(
      "/lms/lesson/:courseSlug/:lessonSlug",
      this.handlers.getLesson,
    );
    this.router.post("/lms/lesson", this.handlers.completeLesson);
  }
}
