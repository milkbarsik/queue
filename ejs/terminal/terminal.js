const recordingFrame = document.querySelector('.recording');
const sendButton = document.getElementById('send');
const resetFrame = document.querySelector('.not-found');
const reset = document.getElementsByClassName('reset');
const confirmButton = document.getElementById('confirm');
const doneButton = document.getElementById('done');

const polisPlace = document.getElementById('polisInput');
const doctorPlace = document.getElementById('doctorInput');

const recordingConfirm = document.querySelector('.recording-confirm');
const notFound = document.querySelector('.not-found');
const ticket = document.querySelector('.ticket-wrapper');
const namePatient = document.getElementById('recording-confirm');

sendButton.addEventListener('click', async () => {
	const polis = polisPlace.value;
	const doctor = doctorPlace.value;
	if(polis == '' || doctor == '') {
		polisPlace.value = '';
		doctorPlace.value = '';
		return;
	}
	const response = await fetch(`http://localhost:7777/api/ticket/${polis}/${doctor}`);
	const data = await response.json();
	console.log(data);
	if(data.patient && data.doctor) {
		sessionStorage.setItem(`ticketData`, `${JSON.stringify({doctorId: data.doctor.id, room: data.doctor.room, patientId: data.patient.id})}`);
		sessionStorage.setItem('doctor', `${JSON.stringify(data.doctor)}`);
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
		recordingConfirm.style.display = 'none';
		resetFrame.style.display = 'none';
	});
});

confirmButton.addEventListener('click', async () => {
	const Response = await fetch('http://localhost:7777/api/ticket', {
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

		ticketNumber.innerText = `${ticketData.ticket.id < 100 ? (ticketData.ticket.id < 10 ? `00${ticketData.ticket.id}`: `0${ticketData.ticket.id}`) : ticketData.ticket.id}`;
		for (let i = 1; i < 4; i++) {
			document.getElementById(`before-` + `${i}`).innerText = '';
		}
		for (let i = 0; i < ticketData.queueBefore.length; i++) {
			document.getElementById(`before-` + `${i + 1}`).innerText = `${ticketData.queueBefore[i].id < 100 ? (ticketData.queueBefore[i].id < 10 ? `00${ticketData.queueBefore[i].id}`: `0${ticketData.queueBefore[i].id}`) : ticketData.queueBefore[i].id}`;
		}
		doctor.innerText = `${doctorInfo.surname} ${doctorInfo.name_of_doctor} ${doctorInfo.last_name}`;
		room.innerText = `${ticketData.ticket.room}`;
		ticketTime.innerText = moment(ticketData.ticket.get_time).format('DD.MM.YYYY HH:mm:ss');

		ticket.style.display = 'flex';
		console.log(JSON.parse(sessionStorage.getItem('doctor')));
	}
	sessionStorage.clear();
});

doneButton.addEventListener('click', async () => {
	sessionStorage.clear();
	polisPlace.value = '';
	doctorPlace.value = '';
	ticket.style.display ='none';
	recordingConfirm.style.display = 'none';
	recordingFrame.style.display = 'flex';
});