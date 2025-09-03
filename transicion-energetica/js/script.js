
const toggleBtn = document.querySelector('.mobile-nav-toggle');
const navMenu = document.getElementById('navmenu');


toggleBtn.addEventListener('click', () => {
  
  navMenu.classList.toggle('mobile-nav-active');
  document.body.classList.toggle('mobile-nav-active');

  
  if(navMenu.classList.contains('mobile-nav-active')){
    toggleBtn.classList.remove('bi-list');
    toggleBtn.classList.add('bi-x');
  } else {
    toggleBtn.classList.remove('bi-x');
    toggleBtn.classList.add('bi-list');
  }
});



// Inicializar Swiper
const techSwiper = new Swiper('.tech-slider', {

  loop: true, 
  speed: 800,
  spaceBetween: 30, 
  slidesPerView: 1, 


  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },


  pagination: {
    el: '.swiper-pagination',
    clickable: true,
  },

 
  breakpoints: {
    768: {
      slidesPerView: 1,
    },
    992: {
      slidesPerView: 1,
    },
    1200: {
      slidesPerView: 1,
    },
  },
});

