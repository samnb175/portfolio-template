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
console.log(typeof burgerMenu.ariaExpanded);

burgerMenu.addEventListener('click', function() {
    if (burgerMenu.ariaExpanded == 'true') {
        console.log(headerEle)
        headerEle.classList.add('menu-show');
    } else {
        headerEle.classList.remove('menu-show');
    }
})


document.addEventListener('DOMContentLoaded', function(){
    console.log('loaded')
    const btnEle = document.getElementsByClassName('pt-btn-menu-toggler')[0];
    if(btnEle) {
        const ptDiv = document.createElement('div');
        const ptSpan1 = document.createElement('span');
        const ptSpan2 = document.createElement('span');
        const ptSpan3 = document.createElement('span');
        const ptSpan4 = document.createElement('span');
        
        ptDiv.classList.add('pt-hamburger');
        ptSpan1.classList.add('bar');
        ptSpan2.classList.add('bar');
        ptSpan3.classList.add('bar');
        ptSpan4.classList.add('bar');
    
        ptDiv.appendChild(ptSpan1);
        ptDiv.appendChild(ptSpan2);
        ptDiv.appendChild(ptSpan3);
        ptDiv.appendChild(ptSpan4);
    
        btnEle.appendChild(ptDiv);
    
        btnEle.addEventListener('click', function(){
            btnEle.classList.toggle('active')
        })
    }
})

