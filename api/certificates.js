// /api/certificates/:code  GET  public verification (→ /api/certificates?code=…)
// /api/certificates        GET  the logged-in learner's certificates
import { db } from './_lib/db.js';
import { route } from './_lib/http.js';
import { requireUser } from './_lib/auth.js';

const FIELDS = `ce.certificate_code, ce.issued_at, u.full_name AS learner_name, c.title AS course_title, c.slug AS course_slug,
  c.category, c.level, c.instructor_name, c.duration_minutes, c.cover_gradient`;

export default route({
  GET: async (req) => {
    const sql = db();
    if (req.query.code) {
      const code = String(req.query.code).toUpperCase().slice(0, 32);
      // Public by design (verification page): only the learner's name, course and date are returned.
      const [cert] = await sql.query(`SELECT ${FIELDS} FROM certificates ce JOIN users u ON u.id = ce.user_id JOIN courses c ON c.id = ce.course_id WHERE ce.certificate_code = $1`, [code]);
      // Unknown codes are a normal answer for the verification page, not an error.
      return { certificate: cert || null };
    }
    const user = await requireUser(req);
    const rows = await sql.query(`SELECT ${FIELDS} FROM certificates ce JOIN users u ON u.id = ce.user_id JOIN courses c ON c.id = ce.course_id WHERE ce.user_id = $1 ORDER BY ce.issued_at DESC`, [user.id]);
    return { certificates: rows };
  },
});
