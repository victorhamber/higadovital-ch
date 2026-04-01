// --- COUNTDOWN TIMER ---
function startTimer(duration, display) {
    let timer = duration, minutes, seconds;
    const interval = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            timer = duration; // Reset for demo purposes
        }
    }, 1000);
}

// --- SMOOTH SCROLL ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 80;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = target.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// --- ENTRANCE ANIMATIONS (Observer) ---
const observerOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-visible');
            observer.unobserve(entry.target); // Only animate once
        }
    });
}, observerOptions);

// --- INIT ---
window.addEventListener('DOMContentLoaded', () => {
    // 1. Timer
    const fifteenMinutes = 60 * 15;
    const display = document.querySelector('#timer');
    if (display) {
        startTimer(fifteenMinutes, display);
    }
    
    // 2. Animations
    const animElements = document.querySelectorAll('.animate');
    animElements.forEach(el => observer.observe(el));
});

// --- TOAST NOTIFICATIONS ---
const names = ["María G.", "Carmen R.", "Lucía M.", "Ana F.", "Elena S.", "Rosa V.", "Marta C.", "Juana L.", "Patricia", "Sofía", "Teresa"];
const toast = document.getElementById('sales-toast');
const toastName = document.getElementById('toast-name');
const toastTime = document.getElementById('toast-time');
const toastImg = document.getElementById('toast-img');

function showRandomToast() {
    if (!toast) return;
    
    // Pick random data
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomTime = Math.floor(Math.random() * 59) + 1; // 1 to 59 mins
    
    // Update elements
    toastName.textContent = randomName;
    toastTime.textContent = randomTime;
    toastImg.src = `https://ui-avatars.com/api/?name=${randomName.replace(' ', '+')}&background=4a8c2d&color=fff&rounded=true`;

    // Show toast
    toast.classList.add('show');

    // Hide after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 5000);
}

// Initial delay then trigger randomly
setTimeout(() => {
    showRandomToast();
    // Schedule next toasts
    setInterval(() => {
        showRandomToast();
    }, Math.random() * 15000 + 15000); // Trigger every 15-30 seconds
}, 8000); // first shows after 8 seconds

// --- EXIT INTENT / BACK REDIRECT ---
const exitModal = document.getElementById('exitModal');
let popupTriggered = false;

function triggerExitPopup() {
    if (popupTriggered) return;
    popupTriggered = true;
    
    // Show modal
    exitModal.classList.add('active');

    // Fire confetti
    var duration = 3000;
    var animationEnd = Date.now() + duration;
    var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100001 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    var interval = setInterval(function() {
      var timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      var particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, { particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      }));
      confetti(Object.assign({}, defaults, { particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      }));
    }, 250);
}

function closeModal() {
    exitModal.classList.remove('active');
}

// 1. Mouse Leave Intent (Desktop)
document.addEventListener('mouseleave', (e) => {
    if (e.clientY <= 0) {
        triggerExitPopup();
    }
});

// 2. Back Redirect Logic (Maximum Compatibility with Android Chrome)
(function(window, location) {
    let historyPushed = false;

    const pushHistory = () => {
        if (historyPushed || location.hash.includes('back')) return;
        historyPushed = true;

        // Step 1: Replace current state with the 'back' trap (reduces total history events triggered)
        const backHash = "#!/back-" + Math.floor(Math.random() * 100000);
        history.replaceState(null, document.title, location.pathname + backHash);
        
        // Step 2: Push the pristine URL on top (the Trajettu will only see 1 event here now instead of 2)
        history.pushState(null, document.title, location.pathname);
        
        console.log("Back-Redirect: Trap primed via valid user interaction");
    };

    // VITAL FOR ANDROID: Only trigger history APIs after a *real* user interaction.
    // If you trigger it automatically via setTimeout on load, Android Chrome destroys the trap.
    const interactionEvents = ['touchstart', 'mousedown', 'scroll'];
    const interactHandler = () => {
        interactionEvents.forEach(evt => window.removeEventListener(evt, interactHandler));
        pushHistory();
    };

    interactionEvents.forEach(evt => {
        window.addEventListener(evt, interactHandler, { passive: true });
    });

    window.addEventListener("popstate", function(e) {
        if (location.hash.includes('back')) {
            // Clear hash
            history.replaceState(null, document.title, location.pathname);
            // Trigger visual popup
            setTimeout(triggerExitPopup, 0);
            
            // Re-arm the trap just in case they decide to press back again later after dismissing
            historyPushed = false;
        }
    }, false);
}(window, location));
