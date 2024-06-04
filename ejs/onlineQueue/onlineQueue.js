const recordingFrame = document.querySelector('.recording');
const sendButton = document.getElementById('send');
const resetFrame = document.querySelector('.not-found');
const reset = document.getElementsByClassName('reset');
const confirmButton = document.getElementById('confirm');
const doneButton = document.getElementById('done');

const polisPlace = document.getElementById('polisInput');
const doctorPlace = document.getElementById('doctorInput');
const datePlace = document.getElementById('dateInput');

const recordingConfirm = document.querySelector('.recording-confirm');
const notFound = document.querySelector('.not-found');
const ticket = document.querySelector('.ticket-wrapper');
const namePatient = document.getElementById('recording-confirm');

datePlace.step = "1800";

const minDate = new Date();
minDate.setDate((new Date).getDate() + 1);
const minDateTime = minDate.toISOString().slice(0, 16);
datePlace.min = minDateTime;

const maxDate = new Date();
maxDate.setDate((new Date).getDate() + 31);
const maxDateTime = maxDate.toISOString().slice(0, 16);
datePlace.max = maxDateTime;

sendButton.addEventListener('click', async () => {
	const polis = polisPlace.value;
	const doctor = doctorPlace.value;
	const date = datePlace.value;

	const hours = (new Date(date)).getHours();
	const minutes = new Date(date).getMinutes();
	if (hours < 8 || hours >= 14 || minutes != 0 && minutes != 30) {
			alert('Выбранное время должно быть между 7:59 и 14:00 с интервалом 30 минут');
			datePlace.value = '';
			return;
	}

	if(polis == '' || doctor == '' || date == '') {
		polisPlace.value = '';
		doctorPlace.value = '';
		datePlace.value = '';
		return;
	}
	const response = await fetch(`http://localhost:7777/api/ticket/${polis}/${doctor}`);
	const data = await response.json();
	console.log(data);
	if(data.patient && data.doctor) {
		sessionStorage.setItem(`ticketData`, `${JSON.stringify({doctorId: data.doctor.id, room: data.doctor.room, patientId: data.patient.id})}`);
		sessionStorage.setItem('doctor', `${JSON.stringify(data.doctor)}`);
		sessionStorage.setItem('date', date);
		namePatient.innerText = `Your name: ${data.patient.name_of_patient} ${data.patient.surname}`;
		recordingConfirm.style.display = 'flex';
	} else {
		notFound.style.display = 'flex';
	}
});
Array.from(reset).forEach(resetButton => {
	resetButton.addEventListener('click', () => {
		sessionStorage.clear();
		polisPlace.value = '';
		doctorPlace.value = '';
		datePlace.value = '';
		recordingConfirm.style.display = 'none';
		resetFrame.style.display = 'none';
	});
});

confirmButton.addEventListener('click', async () => {
	const date = moment(sessionStorage.getItem('date')).format('YYYY-MM-DD HH:mm:ss');
	console.log(date);
	const Response = await fetch(`http://localhost:7777/api/ticket/${date}`, {
		method: 'PUT',
		headers: {'Content-Type': 'application/json'},
		body: sessionStorage.getItem('ticketData')
	});
	const ticketData = await Response.json();
	if(Response.status == 200) {
		recordingConfirm.style.display = 'none';
		recordingFrame.style.display = 'none';
		console.log(ticketData);
		const ticketNumber = document.getElementById('ticket-number');
		const doctor = document.getElementById('doctor');
		const room = document.getElementById('room');
		const ticketTime = document.getElementById('ticket-time');
		const doctorInfo = JSON.parse(sessionStorage.getItem('doctor'));

		ticketNumber.innerText = ticketData.ticket.id < 1000 ? (ticketData.ticket.id < 100 ? (ticketData.ticket.id < 10 ? `000${ticketData.ticket.id}`: `00${ticketData.ticket.id}`) : `0${ticketData.ticket.id}`) : ticketData.ticket.id;

		doctor.innerText = `${doctorInfo.surname} ${doctorInfo.name_of_doctor} ${doctorInfo.last_name}`;
		room.innerText = `${ticketData.ticket.room}`;
		ticketTime.innerText = moment(ticketData.ticket.time_of_visit).format('DD.MM.YYYY HH:mm:ss');

		ticket.style.display = 'flex';
		console.log(JSON.parse(sessionStorage.getItem('doctor')));
	}
	sessionStorage.clear();
});

doneButton.addEventListener('click', async () => {
	sessionStorage.clear();
	polisPlace.value = '';
	doctorPlace.value = '';
	datePlace.value = '';
	ticket.style.display ='none';
	recordingConfirm.style.display = 'none';
	recordingFrame.style.display = 'flex';
});