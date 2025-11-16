// Smooth Scroll Setup (Native)
function locomotive() {
  gsap.registerPlugin(ScrollTrigger);

  // Use native scrolling instead of Locomotive Scroll for continuous scroll
  // Remove locomotive scroll to enable free scrolling
  
  ScrollTrigger.refresh();
}
locomotive();

// Canvas Setup
const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");

// Set canvas size for fixed center layout
function setCanvasSize() {
  const container = document.querySelector('.center-image-fixed');
  const centerWidth = container.offsetWidth;
  const centerHeight = container.offsetHeight;
  canvas.width = centerWidth;
  canvas.height = centerHeight;
  canvas.style.width = centerWidth + 'px';
  canvas.style.height = centerHeight + 'px';
}

setCanvasSize();

window.addEventListener("resize", function () {
  setCanvasSize();
  fitCanvasToScreen();
  render();
});

// Frame Configuration
const FRAMES_PATH = './Images';
const FRAME_PREFIX = '';
const FRAME_COUNT = 187;

function files(index) {
  const n = String(index + 1).padStart(4, '0');
  const name = `${FRAME_PREFIX}${n}.png`;
  return `${FRAMES_PATH}/${name}`;
}

const frameCount = FRAME_COUNT;
const images = [];
const imageSeq = { frame: 0 };

let loadedCount = 0;
let erroredCount = 0;
const PRIORITY_FRAMES = 20;

// Image Loading
for (let i = 0; i < frameCount; i++) {
  const idx = i + 1;
  const padded = String(idx).padStart(4, '0');
  const name = `${FRAME_PREFIX}${padded}.png`;
  const primary = files(i);
  
  const shouldDeferLoading = i >= PRIORITY_FRAMES;
  const img = new Image();
  
  const loadImage = () => {
    img.onload = () => {
      loadedCount++;
      if (loadedCount % 50 === 0 || loadedCount === frameCount) {
        console.log(`Frames loaded: ${loadedCount}/${frameCount}`);
      }
      if (i === 0) render();
    };

    img.onerror = () => {
      erroredCount++;
      console.warn(`Primary load failed for frame ${i}: ${primary}`);
      
      const maleFile = `male${String(i+1).padStart(4, '0')}.png`;
      const unscreenFile = `unscreen-${String(i+1).padStart(3, '0')}.png`;
      const fallbacks = [
        `./${name}`,
        `./pv2-unscreen/${unscreenFile}`,
        `./frames/${maleFile}`,
        `./${maleFile}`
      ];

      const tryFallback = (srcs, onFinalFail) => {
        if (!srcs.length) {
          if (onFinalFail) onFinalFail();
          return;
        }
        const s = srcs.shift();
        const f = new Image();
        f.onload = () => {
          images[i] = f;
          loadedCount++;
          console.log(`Fallback loaded for frame ${i}: ${s}`);
          if (i === 0) render();
        };
        f.onerror = () => {
          tryFallback(srcs, onFinalFail);
        };
        f.src = s;
      };

      tryFallback(fallbacks, () => {
        console.error(`All fallbacks failed for frame ${i} (name=${name})`);
      });
    };

    img.src = primary;
  };
  
  if (shouldDeferLoading) {
    if (document.readyState === 'complete') {
      setTimeout(loadImage, i * 50);
    } else {
      window.addEventListener('load', () => {
        setTimeout(loadImage, (i - PRIORITY_FRAMES) * 50);
      });
    }
  } else {
    loadImage();
  }

  img.src = primary;
  images.push(img);
}

// GSAP Animations
gsap.to(imageSeq, {
  frame: frameCount - 1,
  snap: "frame",
  ease: `none`,
  scrollTrigger: {
    scrub: 0.9,
    trigger: `body`,
    start: `top top`,
    end: `100% top`,
  },
  onUpdate: render,
});

function fitCanvasToScreen() {
  const dpr = window.devicePixelRatio || 1;
  const container = document.querySelector('.center-image-fixed');
  const centerWidth = container.offsetWidth;
  const centerHeight = container.offsetHeight;
  canvas.style.width = centerWidth + 'px';
  canvas.style.height = centerHeight + 'px';
  canvas.width = Math.floor(centerWidth * dpr);
  canvas.height = Math.floor(centerHeight * dpr);
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  
  // Ensure canvas fills the container properly
  canvas.style.objectFit = 'cover';
}

fitCanvasToScreen();

function render() {
  const img = images[imageSeq.frame];
  if (!img || !img.complete) return;
  scaleImage(img, context);
}

setTimeout(() => {
  if (loadedCount === 0) {
    console.warn('No frames loaded yet. Check that files are inside ./Images/ or that filenames match script.js list.');
    context.clearRect(0, 0, canvas.width, canvas.height);
    const dpr = window.devicePixelRatio || 1;
    context.setTransform(1,0,0,1,0,0);
    context.fillStyle = '#111';
    context.fillRect(0,0,canvas.width,canvas.height);
    context.fillStyle = '#fff';
    context.font = `${24 * dpr}px sans-serif`;
    context.textAlign = 'center';
    context.fillText('No frames found in the configured source.', canvas.width / 2, canvas.height / 2 - 20);
    context.fillText(`Expected files like 0001.png in ${FRAMES_PATH}`, canvas.width / 2, canvas.height / 2 + 20);
    context.setTransform(dpr,0,0,dpr,0,0);
  }
}, 1200);

function scaleImage(img, ctx) {
  var canvas = ctx.canvas;
  var cssWidth = canvas.clientWidth;
  var cssHeight = canvas.clientHeight;
  
  // Use contain instead of cover to show full image
  var hRatio = cssWidth / img.width;
  var vRatio = cssHeight / img.height;
  var ratio = Math.min(hRatio, vRatio);
  
  // On mobile, increase the scale for larger display
  if (window.innerWidth <= 768) {
    ratio = ratio * 1.2; // 20% larger on mobile
  }
  
  var centerShift_x = Math.round((cssWidth - img.width * ratio) / 2);
  var centerShift_y = Math.round((cssHeight - img.height * ratio) / 2);
  
  ctx.clearRect(0, 0, cssWidth, cssHeight);
  
  // Add subtle shadow for depth
  ctx.shadowColor = 'rgba(0, 212, 255, 0.3)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  
  ctx.drawImage(
    img,
    0,
    0,
    img.width,
    img.height,
    centerShift_x,
    centerShift_y,
    Math.round(img.width * ratio),
    Math.round(img.height * ratio)
  );
  
  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
}

// ScrollTrigger Pins - Disabled since canvas is fixed via CSS
// ScrollTrigger.create({
//   trigger: "#home>canvas",
//   pin: true,
//   start: `top top`,
//   end: `bottom bottom`,
// });

// Remove section pinning for continuous scroll
// Sections will now flow naturally without sticking

// Keep canvas animation working with scroll
// Canvas will remain fixed while content scrolls normally

// Enhanced Portfolio Functionality with Modern Features

document.addEventListener('DOMContentLoaded', function() {
    
    // Enhanced Smooth Navigation
    const navLinks = document.querySelectorAll('.nav-links a, #mobile-menu a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href');
            const targetSection = document.querySelector(target);
            if (targetSection) {
                // Calculate offset for fixed navigation
                const navHeight = document.querySelector('nav').offsetHeight;
                const elementPosition = targetSection.offsetTop;
                const offsetPosition = elementPosition - navHeight - 20; // Extra 20px for breathing room
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                const mobileMenu = document.getElementById('mobile-menu');
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                }
            }
        });
    });

    // Enhanced Navigation Scroll Effect
    const nav = document.getElementById('nav');
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
        
        // Hide nav when scrolling down, show when scrolling up
        if (currentScrollY > lastScrollY && currentScrollY > 200) {
            nav.style.transform = 'translateY(-100%)';
        } else {
            nav.style.transform = 'translateY(0)';
        }
        
        lastScrollY = currentScrollY;
    });

    // Enhanced Download Resume Buttons
    const downloadBtns = document.querySelectorAll('#download-resume, #download-resume-mobile, #download-resume-contact');
    downloadBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Add loading state
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Preparing...</span>';
            this.disabled = true;
            
            // Simulate download preparation
            setTimeout(() => {
                // Reset button
                this.innerHTML = originalText;
                this.disabled = false;
                
                // Show download notification
                showNotification('Resume download will be available soon! Please contact via email for now.', 'info');
                
                // In real implementation, you would link to an actual PDF file:
                // const link = document.createElement('a');
                // link.href = 'assets/T_Mohamed_Yaser_Resume.pdf';
                // link.download = 'T_Mohamed_Yaser_Resume.pdf';
                // document.body.appendChild(link);
                // link.click();
                // document.body.removeChild(link);
            }, 1500);
        });
    });

    // Enhanced Contact Form with Validation
    const contactForm = document.getElementById('portfolio-contact-form');
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            subject: document.getElementById('subject').value.trim(),
            message: document.getElementById('message').value.trim()
        };

        // Enhanced form validation
        if (!formData.name || formData.name.length < 2) {
            showNotification('Please enter a valid name (at least 2 characters).', 'error');
            document.getElementById('name').focus();
            return;
        }

        if (!isValidEmail(formData.email)) {
            showNotification('Please enter a valid email address.', 'error');
            document.getElementById('email').focus();
            return;
        }

        if (!formData.message || formData.message.length < 10) {
            showNotification('Please enter a message (at least 10 characters).', 'error');
            document.getElementById('message').focus();
            return;
        }

        // Add loading state to form
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Sending...</span>';
        submitBtn.disabled = true;

        // Simulate form submission
        setTimeout(() => {
            // Reset form and button
            contactForm.reset();
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            showNotification('Thank you for your message! I will get back to you within 24 hours.', 'success');
            
            // In real implementation, you would send this data to your backend:
            // fetch('/api/contact', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify(formData)
            // });
        }, 2000);
    });

    // Enhanced Chatbot Functionality
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatbotInput = document.getElementById('chatbot-message-input');
    const sendMessageBtn = document.getElementById('send-message');
    const chatbotBody = document.querySelector('.chatbot-body');

    chatbotToggle.addEventListener('click', function() {
        const isVisible = chatbotWindow.style.display === 'flex';
        chatbotWindow.style.display = isVisible ? 'none' : 'flex';
        
        if (!isVisible) {
            chatbotInput.focus();
        }
    });

    chatbotClose.addEventListener('click', function() {
        chatbotWindow.style.display = 'none';
    });

    function addMessage(message, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isUser ? 'user-message' : 'bot-message'} flex gap-3 mb-4`;
        
        const avatarClass = isUser ? 
            'w-8 h-8 bg-neon-blue/20 rounded-full flex items-center justify-center flex-shrink-0 ml-auto' :
            'w-8 h-8 bg-neon-blue/20 rounded-full flex items-center justify-center flex-shrink-0';
        
        const contentClass = isUser ?
            'bg-gradient-to-r from-neon-blue to-blue-600 rounded-2xl rounded-br-sm px-4 py-3 max-w-[250px] ml-auto' :
            'bg-white/10 backdrop-blur-lg rounded-2xl rounded-bl-sm px-4 py-3 max-w-[250px]';
        
        messageDiv.innerHTML = `
            <div class="${avatarClass}">
                <i class="fas ${isUser ? 'fa-user' : 'fa-robot'} text-neon-blue text-sm"></i>
            </div>
            <div class="${contentClass}">
                <p class="text-white text-sm leading-relaxed">${message}</p>
            </div>
        `;
        
        chatbotBody.appendChild(messageDiv);
        chatbotBody.scrollTop = chatbotBody.scrollHeight;
        
        // Add animation
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = `translateX(${isUser ? '30px' : '-30px'})`;
        
        requestAnimationFrame(() => {
            messageDiv.style.transition = 'all 0.3s ease-out';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateX(0)';
        });
    }

    function sendMessage() {
        const message = chatbotInput.value.trim();
        if (!message) return;

        addMessage(message, true);
        chatbotInput.value = '';

        // Show typing indicator
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message flex gap-3 mb-4 typing-indicator';
        typingDiv.innerHTML = `
            <div class="w-8 h-8 bg-neon-blue/20 rounded-full flex items-center justify-center flex-shrink-0">
                <i class="fas fa-robot text-neon-blue text-sm"></i>
            </div>
            <div class="bg-white/10 backdrop-blur-lg rounded-2xl rounded-bl-sm px-4 py-3">
                <div class="flex gap-1">
                    <div class="w-2 h-2 bg-neon-blue rounded-full animate-bounce"></div>
                    <div class="w-2 h-2 bg-neon-blue rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                    <div class="w-2 h-2 bg-neon-blue rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                </div>
            </div>
        `;
        chatbotBody.appendChild(typingDiv);
        chatbotBody.scrollTop = chatbotBody.scrollHeight;

        // Enhanced bot responses with context awareness
        setTimeout(() => {
            chatbotBody.removeChild(typingDiv);
            
            const responses = getContextualResponse(message);
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            addMessage(randomResponse);
        }, 1000 + Math.random() * 2000);
    }

    function getContextualResponse(message) {
        const msg = message.toLowerCase();
        
        if (msg.includes('project') || msg.includes('work') || msg.includes('portfolio')) {
            return [
                "I'd love to tell you about Yaser's projects! He's built some amazing things like PredictaStock (AI stock predictor), AceInterview (AI interview coach), and Tymo (video platform). Which one interests you most?",
                "Yaser has worked on 7+ major projects including AI-powered applications, web platforms, and data analysis tools. Check out the 'Work' section for live demos!",
                "His portfolio showcases full-stack development, AI integration, and modern web technologies. Each project solves real-world problems!"
            ];
        } else if (msg.includes('skill') || msg.includes('tech') || msg.includes('technology')) {
            return [
                "Yaser is skilled in React, Next.js, JavaScript, Python, Node.js, and AI/ML technologies. He's particularly strong in full-stack development with 2+ years of experience.",
                "His tech stack includes modern frameworks like React & Next.js, backend technologies like Node.js & Python, plus AI tools like TensorFlow and LSTM networks.",
                "He specializes in frontend development, backend APIs, AI integration, and has experience with cloud deployment on Vercel and Netlify."
            ];
        } else if (msg.includes('contact') || msg.includes('hire') || msg.includes('work together')) {
            return [
                "Great! You can reach Yaser at 1ammar.yaser@gmail.com or +91 93901 76961 (WhatsApp). He's open to remote work worldwide!",
                "Yaser is available for freelance projects and full-time opportunities. Use the contact form below or reach out directly via email or social media.",
                "He's very flexible with time zones and locations. Feel free to discuss your project requirements - he loves solving challenging problems!"
            ];
        } else if (msg.includes('experience') || msg.includes('background')) {
            return [
                "Yaser has professional experience with MMCartons as a Web Developer, plus internships with Microsoft and Edunet Foundation in AI/ML projects.",
                "He has a CSE background and 2+ years of development experience, with recent internships focusing on AI and data analysis projects.",
                "His journey includes full-stack web development, AI project development, and experience with modern deployment practices."
            ];
        } else if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
            return [
                "Hello! 👋 I'm here to help you learn about Yaser's work and experience. What would you like to know?",
                "Hi there! Feel free to ask me anything about Yaser's projects, skills, or experience. I'm here to help!",
                "Hey! 😊 Thanks for your interest in Yaser's portfolio. What brings you here today?"
            ];
        } else if (msg.includes('thank') || msg.includes('thanks')) {
            return [
                "You're very welcome! If you have any other questions about Yaser's work, feel free to ask anytime.",
                "Happy to help! Don't hesitate to reach out if you need more information about his projects or experience.",
                "My pleasure! Feel free to explore the portfolio and contact Yaser directly for any opportunities."
            ];
        } else {
            return [
                "That's a great question! For detailed information, I'd recommend reaching out to Yaser directly at 1ammar.yaser@gmail.com or using the contact form below.",
                "I'd love to help with that! For the most accurate information, please contact Yaser directly. He's very responsive and loves discussing his work.",
                "Interesting! While I can share general information about Yaser's work, he'd be the best person to give you specific details. Feel free to reach out!",
                "Thanks for asking! For personalized answers about projects or collaboration, Yaser would love to chat with you directly."
            ];
        }
    }

    sendMessageBtn.addEventListener('click', sendMessage);
    chatbotInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Enhanced Project Card Animations
    const projectCards = document.querySelectorAll('.project-item');
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    projectCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        card.style.transition = `all 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });

    // Enhanced Tech Cards with Hover Sound Effect (optional)
    const techCards = document.querySelectorAll('.tech-card');
    techCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.05)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Utility function for email validation
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Enhanced notification system
    function showNotification(message, type = 'info') {
        // Remove existing notification if any
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification fixed top-4 right-4 z-50 p-4 rounded-2xl backdrop-blur-lg border max-w-sm transition-all duration-300 transform translate-x-full`;
        
        const colors = {
            success: 'bg-green-500/20 border-green-400/30 text-green-300',
            error: 'bg-red-500/20 border-red-400/30 text-red-300',
            info: 'bg-neon-blue/20 border-neon-blue/30 text-neon-blue'
        };
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle'
        };

        notification.className += ` ${colors[type]}`;
        notification.innerHTML = `
            <div class="flex items-start gap-3">
                <i class="${icons[type]} text-lg flex-shrink-0 mt-1"></i>
                <p class="text-sm leading-relaxed">${message}</p>
                <button class="ml-auto flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity duration-200" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        // Animate in
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    }

    // Enhanced CTA Button
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector('#page5').scrollIntoView({ behavior: 'smooth' });
            
            // Add ripple effect
            const ripple = document.createElement('span');
            ripple.className = 'absolute w-0 h-0 bg-white/30 rounded-full transition-all duration-500';
            ripple.style.left = e.offsetX + 'px';
            ripple.style.top = e.offsetY + 'px';
            
            this.style.position = 'relative';
            this.appendChild(ripple);
            
            requestAnimationFrame(() => {
                ripple.style.width = '100px';
                ripple.style.height = '100px';
                ripple.style.marginLeft = '-50px';
                ripple.style.marginTop = '-50px';
                ripple.style.opacity = '0';
            });
            
            setTimeout(() => {
                ripple.remove();
            }, 500);
        });
    }

    // Enhanced scroll progress indicator
    function updateScrollProgress() {
        const scrollProgress = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        
        let progressBar = document.querySelector('.scroll-progress');
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.className = 'scroll-progress fixed top-0 left-0 h-1 bg-gradient-to-r from-neon-blue to-neon-cyan z-50 transition-all duration-200';
            document.body.appendChild(progressBar);
        }
        
        progressBar.style.width = scrollProgress + '%';
    }

    window.addEventListener('scroll', updateScrollProgress);
    updateScrollProgress();

    // Performance optimization: Debounce resize events
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    window.addEventListener('resize', debounce(() => {
        // Handle resize optimizations if needed
        updateScrollProgress();
    }, 250));

    console.log('🚀 Modern portfolio loaded successfully!');
});

// Download Resume Button Functionality
document.getElementById('download-resume-nav').addEventListener('click', function(e) {
    e.preventDefault();
    const link = document.createElement('a');
    link.href = 'T_Mohamed_Yaser_Resume.pdf';
    link.download = 'T_Mohamed_Yaser_Resume.pdf';
    link.click();
});

// Chatbot Functionality
const chatbotToggle = document.getElementById('chatbot-toggle');
const chatbotWindow = document.getElementById('chatbot-window');
const chatbotClose = document.getElementById('chatbot-close');
const chatbotInput = document.getElementById('chatbot-input-field');
const chatbotSend = document.getElementById('chatbot-send');
const chatbotMessages = document.getElementById('chatbot-messages');

// Toggle chatbot window
chatbotToggle.addEventListener('click', function() {
    chatbotWindow.classList.toggle('active');
    if (chatbotWindow.classList.contains('active')) {
        chatbotInput.focus();
    }
});

chatbotClose.addEventListener('click', function() {
    chatbotWindow.classList.remove('active');
});

// Send message function
async function sendChatMessage() {
    const message = chatbotInput.value.trim();
    if (!message) return;
    
    // Add user message
    addMessage(message, 'user');
    chatbotInput.value = '';
    
    // Add typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'bot-message typing-indicator';
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <span>.</span><span>.</span><span>.</span>
        </div>
    `;
    chatbotMessages.appendChild(typingDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    
    try {
        const botResponse = await getBotResponse(message);
        // Remove typing indicator
        typingDiv.remove();
        addMessage(botResponse, 'bot');
    } catch (error) {
        typingDiv.remove();
        addMessage('Sorry, I encountered an error. Please try again or contact directly at 1ammar.yaser@gmail.com', 'bot');
    }
}

// Add message to chat
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = sender === 'user' ? 'user-message' : 'bot-message';
    
    const avatarIcon = sender === 'user' ? 'fa-user' : 'fa-robot';
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas ${avatarIcon}"></i>
        </div>
        <div class="message-content">
            ${text}
        </div>
    `;
    
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

// Get bot response from Lyzr API
async function getBotResponse(message) {
    const response = await fetch('https://agent-prod.studio.lyzr.ai/v3/inference/chat/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'sk-default-mpA4zDHQ88wREItifLuzFJIm0bMff3np'
        },
        body: JSON.stringify({
            user_id: '1ammar.yaser@gmail.com',
            agent_id: '69196e915848af7d875ae71d',
            session_id: '69196e915848af7d875ae71d-5jpnrcqlzjj',
            message: message
        })
    });
    
    if (!response.ok) {
        throw new Error('Failed to get response from AI assistant');
    }
    
    const data = await response.json();
    return data.response || data.message || 'Sorry, I could not process that. Please try again.';
}

// Send message on button click
chatbotSend.addEventListener('click', sendChatMessage);

// Send message on Enter key
chatbotInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendChatMessage();
    }
});

// Contact Form Toast Notification
const contactForm = document.getElementById('contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Show success toast
        showToast('Message sent successfully! I\'ll get back to you soon. 🎉');
        
        // Reset form
        contactForm.reset();
    });
}

function showToast(message) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    // Add to body
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 4000);
}