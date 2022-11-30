import App from './modules/app.js';
import './modules/navbar-custom.js';
import Glide from '@glidejs/glide';

const app = new App();

const testimonialsSlider = new Glide('#testimonials-glide',{
    type: 'carousel',
    // startAt: 0,
    perView: 3,
    // gap: 60,
    // focusAt: 'center',
});

testimonialsSlider.mount();

// console.log(testimonialsSlider);
