import {createHtmlEle} from './functions'

const navbar = document.querySelector('.nav-custom');
window.onscroll = () => {
  
    if (window.scrollY > (navbar.offsetHeight / 2)) {
        navbar.classList.add('nav-custom-active');
    } else {
        navbar.classList.remove('nav-custom-active');
    }
};

const headerEle = document.querySelector('.main-menu');
const burgerMenu = document.getElementById('burgerMenu');

burgerMenu.addEventListener('click', function() {
    if (burgerMenu.ariaExpanded == 'true') {
        console.log(headerEle)
        headerEle.classList.add('menu-show');
    } else {
        headerEle.classList.remove('menu-show');
    }
})

document.addEventListener('DOMContentLoaded', function(){
    const btnEle = document.getElementsByClassName('pt-btn-menu-toggler')[0];
    if(btnEle) {
        const arrOfSpans = createHtmlEle('span', 4, 'bar');
        const arrOfDiv = createHtmlEle('div', 1, 'pt-hamburger');

        for(let span of arrOfSpans) {
            arrOfDiv[0].appendChild(span)
        } 

        btnEle.appendChild(arrOfDiv[0]);    
        btnEle.addEventListener('click', function(){
            btnEle.classList.toggle('active')
        })
    }
})

