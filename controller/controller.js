const db = require('../db');

class Controller {

	async getDoctors (req, res) {
		try {
			const doctors = await db.query('select * from doctors order by id');
			res.json(doctors.rows);
		} catch (err) {
			console.log(err);
			res.status(500).send('DB Error');
		}
	}

	async getTicket(req, res) {
		try {
			const polis = req.params.polis;
			const doctor = parseInt(req.params.doctor);
			const polisData = await db.query('select * from patients where polis = $1', [polis]);
			const doctorData = await db.query('select * from doctors where id = $1', [doctor])
			res.json({patient: polisData.rows[0], doctor: doctorData.rows[0]});
			console.log({patient: polisData.rows[0], doctor: doctorData.rows[0]});
		} catch (err) {
			console.error(err);
      res.status(500).send('DB Error');
		}
	}

	async putLifeTicket (req, res) {
		try {
			const { doctorId, room, patientId } = req.body;
			const queueData = await db.query('select * from life_queue where doctor_id = $1 order by get_time desc limit 3', [doctorId]);
			const newTicket = await db.query('insert into life_queue (patient_id, doctor_id, room) values ($1, $2, $3) returning *', [patientId, doctorId, room])
			console.log(queueData.rows);
			console.log(newTicket.rows[0]);
			res.json({ticket: newTicket.rows[0], queueBefore: queueData.rows});
		} catch (err) {
			console.log(err);
			res.status(500).send('DB Error');
		}
	}

	async putOnlineTicket (req, res) {
		try {
			const date = req.params.date;
			const { doctorId, room, patientId } = req.body;
			//const queueData = await db.query('select * from online_queue where doctor_id = $1 order by time_of_visit desc limit 3', [doctorId]);
			const newTicket = await db.query('insert into online_queue (patient_id, doctor_id, room, time_of_visit) values ($1, $2, $3, $4) returning *', [patientId, doctorId, room, date])
			//console.log(queueData.rows);
			console.log(newTicket.rows[0]);
			res.json({ticket: newTicket.rows[0]/*, queueBefore: queueData.rows*/});
		} catch (err) {
			console.log(err);
			res.status(500).send('DB Error');
		}
	}

}

module.exports = new Controller();