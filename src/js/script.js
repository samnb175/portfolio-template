import App from './modules/app.js';
import './modules/navbar-custom.js';
import Glide from '@glidejs/glide';

const app = new App();

new Glide('#testimonials-glide',{
    type: 'carousel',
    startAt: 0,
    perView: 3,
    // gap: 15,
    focusAt: 'center',
    // wrapperWidth: 200
    // slideWidth: 240
}).mount();
