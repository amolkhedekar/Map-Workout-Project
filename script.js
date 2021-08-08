'use strict';

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  constructor(coords, distance, duration) {
    this.coords = coords; // [lat,long]
    this.distance = distance; // km
    this.duration = duration; // hr
  }
}

class Running extends Workout {
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }
  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }
  calcSpeed() {
    // km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

class App {
  #map;
  #mapEvent;
  #workouts = [];
  constructor() {
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        error => {
          console.log('Could not access your location.');
        }
      );
    }
  }

  _loadMap(position) {
    const coOrdinates = [position.coords.latitude, position.coords.longitude];

    this.#map = L.map('map').setView(coOrdinates, 12);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));

    L.marker(coOrdinates)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          maxHeight: 120,
          closeOnClick: false,
          className: 'running-popup',
        })
      )
      .setPopupContent(
        `<b>Latitude:</b> ${coOrdinates[0]}<br><b>Longitude:</b> ${coOrdinates[1]}`
      )
      .openPopup();
  }

  _showForm(event) {
    this.#mapEvent = event;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(event) {
    const validInuputs = (...inputs) =>
      inputs.every(input => Number.isFinite(input));

    const allPositives = (...inputs) => inputs.every(input => input > 0);

    event.preventDefault();

    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;

    const lat = this.#mapEvent.latlng.lat;
    const lng = this.#mapEvent.latlng.lng;

    let workout;
    if (type === 'running') {
      const cadence = +inputCadence.value;
      if (
        !validInuputs(distance, duration, cadence) ||
        !allPositives(distance, duration, cadence)
      ) {
        return alert('Inputs needs to be positive numbers.');
      }
      workout = new Running([lat, lng], distance, duration, cadence);
    }
    if (type === 'cycling') {
      const elevationGain = +inputElevation.value;
      if (
        !validInuputs(distance, duration, elevationGain) ||
        !allPositives(distance, duration)
      ) {
        return alert('Inputs needs to be positive numbers.');
      }
      workout = new Cycling([lat, lng], distance, duration, elevationGain);
    }
    this.#workouts.push(workout);
    console.log('this.#workouts :>> ', this.#workouts);
    // Clear form
    inputDistance.value = '';
    inputDuration.value = '';
    inputCadence.value = '';
    inputElevation.value = '';

    // Display marker
    this.renderWorkoutMarker(workout);
  }
  renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          maxHeight: 120,
          closeOnClick: false,
          className: `${type}-popup`,
        })
      )
      .setPopupContent(`<b>Latitude:</b> ${lat}<br><b>Longitude:</b> ${lng}`)
      .openPopup();
  }
}

const app = new App();
