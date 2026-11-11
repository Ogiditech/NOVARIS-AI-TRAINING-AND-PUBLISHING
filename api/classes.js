// /api/classes                 GET     upcoming live classes with real seats left
// /api/bookings                POST    { id }  book a seat   (→ /api/classes?op=book)
// /api/bookings?id=…           DELETE  cancel a booking
import { db, transaction } from './_lib/db.js';
import { route, readBody, parse, notFound, HttpError } from './_lib/http.js';
import { sessionUserId, requireUser } from './_lib/auth.js';
import { idSchema } from './_lib/schemas.js';

async function list(req) {
  const userId = await sessionUserId(req);
  const rows = await db()`
    SELECT c.id, c.title, c.instructor_name, c.topic, c.language, c.level, c.start_time, c.duration_minutes, c.capacity,
           c.capacity - (SELECT count(*)::int FROM class_bookings b WHERE b.class_id = c.id) AS seats_left,
           EXISTS (SELECT 1 FROM class_bookings b WHERE b.class_id = c.id AND b.user_id = ${userId}) AS booked
    FROM live_classes c
    WHERE c.start_time + make_interval(mins => c.duration_minutes) > now()
    ORDER BY c.start_time`;
  return { classes: rows.map((c) => ({ ...c, id: Number(c.id), seats_left: Math.max(0, c.seats_left) })) };
}

// Booking runs in a transaction that locks the class row, so two people can never take the last seat
// and the unique (user_id, class_id) constraint prevents double booking.
async function book(req) {
  const user = await requireUser(req);
  const { id } = parse(idSchema, readBody(req));
  return transaction(async (client) => {
    const { rows: [cls] } = await client.query('SELECT id, title, capacity, start_time FROM live_classes WHERE id = $1 FOR UPDATE', [id]);
    if (!cls) throw notFound('That class');
    if (new Date(cls.start_time) < new Date()) throw new HttpError(409, 'This class has already started.');
    const { rows: [mine] } = await client.query('SELECT id FROM class_bookings WHERE class_id = $1 AND user_id = $2', [id, user.id]);
    const { rows: [{ taken }] } = await client.query('SELECT count(*)::int AS taken FROM class_bookings WHERE class_id = $1', [id]);
    if (mine) return { booked: true, alreadyBooked: true, seatsLeft: Math.max(0, cls.capacity - taken) };
    if (taken >= cls.capacity) throw new HttpError(409, 'Sorry — this class is now full.', { code: 'class_full', seatsLeft: 0 });
    await client.query('INSERT INTO class_bookings (user_id, class_id) VALUES ($1, $2)', [user.id, id]);
    return { booked: true, alreadyBooked: false, seatsLeft: cls.capacity - taken - 1, title: cls.title };
  });
}

async function cancel(req) {
  const user = await requireUser(req);
  const { id } = parse(idSchema, { id: req.query.id });
  const sql = db();
  const removed = await sql`DELETE FROM class_bookings WHERE class_id = ${id} AND user_id = ${user.id} RETURNING id`;
  if (!removed.length) throw new HttpError(404, 'You do not have a booking for that class.');
  const [row] = await sql`SELECT c.capacity - (SELECT count(*)::int FROM class_bookings b WHERE b.class_id = c.id) AS seats_left FROM live_classes c WHERE c.id = ${id}`;
  return { booked: false, seatsLeft: row?.seats_left ?? null };
}

export default route({
  GET: list,
  POST: (req) => {
    if (req.query.op !== 'book') throw new HttpError(404, 'Unknown class action.');
    return book(req);
  },
  DELETE: (req) => {
    if (req.query.op !== 'book') throw new HttpError(404, 'Unknown class action.');
    return cancel(req);
  },
});
