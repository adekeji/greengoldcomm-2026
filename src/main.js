import './style.css'

document.addEventListener('DOMContentLoaded', () => {
  // Intersection Observer for scroll animations
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.animate-on-scroll').forEach(element => {
    observer.observe(element);
  });

  // Fetch freelancers from backend
  const fetchFreelancers = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/freelancers');
      const result = await response.json();

      // If we got data and there's content, we could dynamically populate the DOM here
      if (result.data && result.data.length > 0) {
        console.log("Freelancers loaded from DB:", result.data);
      }
    } catch (err) {
      console.error('Error fetching freelancers:', err);
    }
  };

  fetchFreelancers();

  // Contact Form Logic
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btn = contactForm.querySelector('button');
      const statusDiv = document.getElementById('contactStatus');

      const payload = {
        name: document.getElementById('contactName').value,
        email: document.getElementById('contactEmail').value,
        message: document.getElementById('contactMessage').value
      };

      btn.disabled = true;
      btn.innerText = "Sending...";

      try {
        const response = await fetch('http://localhost:3000/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          statusDiv.style.display = 'block';
          contactForm.reset();
        } else {
          alert('Failed to send message.');
        }
      } catch (err) {
        console.error(err);
        alert('Server connection error.');
      } finally {
        btn.disabled = false;
        btn.innerText = "Send Message";
        setTimeout(() => statusDiv.style.display = 'none', 5000);
      }
    });
  }
});
