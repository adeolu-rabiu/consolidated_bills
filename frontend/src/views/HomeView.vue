<script setup>
import bodiskoImage from '@/assets/Bodisko.JPG'
</script>

<template>
  <div class="hero">
    <img :src="bodiskoImage" alt="Sales Rep" class="profile-img" />
    <div class="hero-content">
      <h1>Welcome to Consolidated Bills</h1>
      <p>One bill. Zero hassle. All your utilities in one place.</p>
      <router-link to="/register" class="cta-button">Get Started</router-link>
    </div>
  </div>

  <div class="benefits">
    <div class="benefit">
      <i class="fas fa-money-bill-wave"></i>
      <h3>No Hidden Fees</h3>
    </div>
    <div class="benefit">
      <i class="fas fa-exchange-alt"></i>
      <h3>Easy Switch</h3>
    </div>
    <div class="benefit">
      <i class="fas fa-tachometer-alt"></i>
      <h3>One Dashboard</h3>
    </div>
  </div>

  <div class="testimonials">
    <h2>What Our Users Say</h2>
    <div class="slider">
      <div class="slide">
        <p>"This made managing bills so much easier. Love it!" – Ayo, London</p>
      </div>
      <div class="slide">
        <p>"I no longer miss any utility payments. A lifesaver!" – Nneka, Lagos</p>
      </div>
      <div class="slide">
        <p>"Everything in one place, finally!" – Tolu, Manchester</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: #EAF5F9;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 0 20px rgba(0,0,0,0.1);
  flex-wrap: wrap;
}

.hero-content {
  max-width: 60%;
}

.profile-img {
  max-width: 200px;
  border-radius: 1rem;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  margin-bottom: 1rem;
}

.cta-button {
  display: inline-block;
  margin-top: 1rem;
  background-color: #00AEEF;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 2rem;
  text-decoration: none;
  font-weight: bold;
  transition: background 0.3s ease;
}

.cta-button:hover {
  background-color: #0077AA;
}

.benefits {
  display: flex;
  justify-content: space-around;
  margin: 2rem 0;
  text-align: center;
  flex-wrap: wrap;
}

.benefit {
  flex: 1 1 200px;
  margin: 1rem;
}

.benefit i {
  font-size: 2rem;
  color: #00AEEF;
}

.testimonials {
  background: #F7FBFC;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 0 10px rgba(0,0,0,0.05);
  margin: 2rem 0;
  text-align: center;
}

.slider {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  gap: 1rem;
  padding: 1rem;
}

.slide {
  min-width: 250px;
  background: white;
  padding: 1rem;
  border-radius: 1rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  scroll-snap-align: start;
}

@media (max-width: 768px) {
  .hero {
    flex-direction: column;
    text-align: center;
  }
  .hero-content {
    max-width: 100%;
  }
}
</style>

