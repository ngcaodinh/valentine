// ---- HÀM GIẢI MÃ DỮ LIỆU NÉN ----
function decodeData(encodedString) {
    try {
        let base64 = encodedString
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        while (base64.length % 4) {
            base64 += '=';
        }
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const decompressed = pako.inflate(bytes, { to: 'string' });
        const data = JSON.parse(decompressed);
        console.log("📦 Decoded data:", data);
        return data;
    } catch (e) {
        console.error("Lỗi khi giải mã dữ liệu:", e);
        return null;
    }
}

// ---- HÀM LẤY THAM SỐ TỪ URL ----
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);

    // Thử giải mã từ param "c" (compressed)
    const compressedContent = urlParams.get("c");
    if (compressedContent) {
        const content = decodeData(compressedContent);
        if (content) {
            // Card content
            if (name === "text" && content.text) return content.text;
            if (name === "text1" && content.text1) return content.text1;
            if (name === "text2" && content.text2) return content.text2;
            if (name === "name" && content.name) return content.name;
            if (name === "introduce" && content.introduce) return content.introduce;
            if (name === "loopText" && content.loopText) return content.loopText;
            if (name === "message" && content.message) return content.message;

            // Media
            if (name === "music" && content.music) return content.music;
            if (name === "image" && content.image) return content.image.split(",")[0].trim();
            if (name === "coverImage" && content.coverImage) return content.coverImage;

            // Modal content
            if (name === "modalTitle" && content.modalTitle) return content.modalTitle;
            if (name === "modalContent" && content.modalContent) return content.modalContent;

            // Other
            if (name === "title" && content.title) return content.title;
            if (name === "subtitle" && content.subtitle) return content.subtitle;
            if (name === "dateText" && content.dateText) return content.dateText;
            if (name === "welcomeText" && content.welcomeText) return content.welcomeText;
            if (name === "instructionText" && content.instructionText) return content.instructionText;
        }
    }

    // Tham số thông thường
    const regularParam = urlParams.get(name);
    if (regularParam) {
        return decodeURIComponent(regularParam);
    }

    // Giá trị mặc định
    if (name === "text1") return "Happy";
    if (name === "text") return "Valentine's";
    if (name === "text2") return "Day";
    if (name === "name") return "Gửi người yêu của anh,";
    if (name === "music")
        return "https://cdn.shopify.com/s/files/1/0757/9700/4572/files/tiktok-music-1767632061164-yrpxg.mp3?v=1767632064";
    if (name === "introduce")
        return "Chúc mừng valentine đầu tiên của chúng mình, dù là anh không có bên cạnh cd, nhưng lúc nào anh cũng nghĩ tới cd hết. Anh cảm ơn vì cd đã đến và tất cả những gì mà cd đã dành cho anh trong thời gian qua. Chúc cd 1 ngày thật nhiều tiếng cười bên người thân, gia đình.";
    if (name === "loopText") return "Yêu em!";

    return null;
}

// ---- ELEMENTS ----
const envelopeWrapper = document.getElementById("envelopeWrapper");
const envelope = document.getElementById("envelope");
const card = document.getElementById("card");
const clickInstruction = document.getElementById("clickInstruction");
let isEnvelopeOpen = false;

// ---- ENVELOPE CLICK ----
envelopeWrapper.addEventListener("click", function (e) {
    e.stopPropagation();

    if (!isEnvelopeOpen) {
        // Open envelope (add class to wrapper)
        envelopeWrapper.classList.add("open");
        isEnvelopeOpen = true;

        // Hide instruction
        if (clickInstruction) {
            clickInstruction.style.opacity = "0";
        }

        // Add animation-done class after animation completes (1.5s + 0.3s delay)
        setTimeout(() => {
            if (card) {
                card.classList.add("animation-done");
            }
        }, 1800);
    } else if (card && card.classList.contains("animation-done")) {
        // Card is visible and animation done → open modal
        openModal();
    }
});

// ---- TYPEWRITER EFFECT ----
let typewriterStarted = false;

function startTypewriterEffect() {
    if (typewriterStarted) return;
    typewriterStarted = true;

    const cardGreeting = document.querySelector(".card-greeting");
    const cardMessage = document.querySelector(".card-message");
    const cardEnding = document.querySelector(".card-ending");

    const elements = [cardGreeting, cardMessage, cardEnding];
    let totalDelay = 0;

    elements.forEach((el) => {
        if (!el) return;
        const text = el.textContent;
        el.innerHTML = "";
        el.classList.add("typewriter");

        for (let i = 0; i < text.length; i++) {
            const span = document.createElement("span");
            span.textContent = text[i] === " " ? "\u00A0" : text[i];
            span.style.animationDelay = `${totalDelay + i * 50}ms`;
            el.appendChild(span);
        }
        totalDelay += text.length * 50 + 300;
    });
}

// Start typewriter when card is hovered (opened)
card.addEventListener("mouseenter", function () {
    if (card.classList.contains("animation-done")) {
        startTypewriterEffect();
    }
});

// ---- CLICK OUTSIDE TO CLOSE ----
document.addEventListener("click", function (e) {
    if (isEnvelopeOpen && !envelopeWrapper.contains(e.target)) {
        // Close envelope
        envelopeWrapper.classList.remove("open");
        isEnvelopeOpen = false;

        // Remove animation-done class
        if (card) {
            card.classList.remove("animation-done");
        }

        if (clickInstruction) {
            clickInstruction.style.opacity = "1";
        }
    }
});

// ---- INITIALIZE ON LOAD ----
window.onload = () => {
    initializeContent();
    playMusic();
    initializeFlyingHearts();
};

// ---- FLYING HEARTS ----
const flyingHeartsContainer = document.getElementById("flyingHearts");

function createFlyingHeart() {
    if (!flyingHeartsContainer) return;

    const heart = document.createElement("div");
    heart.className = "flying-heart";

    // Random horizontal position
    const startPositionX = Math.random() * window.innerWidth;

    // Random size (10-25px)
    const size = Math.random() * 15 + 10;

    // Random animation duration (4-7 seconds)
    const duration = Math.random() * 3 + 4;

    // Random colors for variety
    const colors = ["#ff526f", "#ff7a8a", "#ff9a9e", "#fecfef", "#ffb3ba", "#e91e63"];
    const color = colors[Math.floor(Math.random() * colors.length)];

    // Random delay (0-2 seconds)
    const delay = Math.random() * 2;

    // Set heart styles
    heart.style.width = `${size}px`;
    heart.style.height = `${size}px`;
    heart.style.left = `${startPositionX}px`;
    heart.style.backgroundColor = color;
    heart.style.animationDuration = `${duration}s`;
    heart.style.animationDelay = `${delay}s`;
    heart.style.bottom = "-50px";

    flyingHeartsContainer.appendChild(heart);

    // Remove heart after animation completes
    setTimeout(() => {
        if (heart.parentNode) {
            heart.remove();
        }
    }, (duration + delay + 2) * 1000);
}

function initializeFlyingHearts() {
    const isMobile = window.innerWidth <= 768;
    const initialHearts = isMobile ? 15 : 20;
    const heartInterval = isMobile ? 600 : 500;

    // Create initial hearts with staggered timing
    for (let i = 0; i < initialHearts; i++) {
        setTimeout(() => {
            createFlyingHeart();
        }, i * 200);
    }

    // Create hearts continuously
    setInterval(createFlyingHeart, heartInterval);
}

// Initialize content from URL parameters
function initializeContent() {
    // Card cover title
    const cardTitleMain = document.querySelector(".card-title-main");
    const cardTitleSecondary = document.querySelectorAll(".card-title-secondary");

    const text1 = getUrlParameter("text1") || "Happy";
    const text2 = getUrlParameter("text") || "Valentine's";
    const text3 = getUrlParameter("text2") || "Day";

    if (cardTitleSecondary[0]) cardTitleSecondary[0].textContent = text1;
    if (cardTitleMain) cardTitleMain.textContent = text2;
    if (cardTitleSecondary[1]) cardTitleSecondary[1].textContent = text3;

    // Card body content
    const cardGreeting = document.querySelector(".card-greeting");
    const cardMessage = document.querySelector(".card-message");
    const cardEnding = document.querySelector(".card-ending");

    const greeting = getUrlParameter("name") || "To my love,";
    const message =
        getUrlParameter("introduce") ||
        "From the moment we met, my life has been filled with joy and happiness.";
    const ending = getUrlParameter("loopText") || "Happy Valentine's Day!";

    if (cardGreeting) cardGreeting.textContent = greeting;
    if (cardMessage) cardMessage.innerHTML = message;
    if (cardEnding) cardEnding.textContent = ending;

    // Modal content
    const modalTitle = document.querySelector(".polaroid-text h2");
    const modalMessage = document.querySelector(".polaroid-text p:first-of-type");
    const modalIntro = document.querySelector(".polaroid-text p:nth-of-type(2)");
    const modalSignature = document.querySelector(".polaroid-text .signature");

    const title = getUrlParameter("name") || "Gửi cd,";
    const introduce =
        getUrlParameter("introduce") ||
        "Chúc mừng valentine đầu tiên của chúng mình, dù là anh không có bên cạnh cd, nhưng lúc nào anh cũng nghĩ tới cd hết á. Anh cảm ơn vì cd đã đến và tất cả những gì mà cd đã dành cho anh trong thời gian qua. Chúc cd 1 ngày thật nhiều tiếng cười bên người thân, gia đình. ";
    const modalMsg =
        getUrlParameter("message") || "";
    const loopText =
        getUrlParameter("loopText") || "Yêu cd nhiều lắm!";

    if (modalTitle) modalTitle.innerHTML = title;
    if (modalMessage) modalMessage.innerHTML = introduce;
    if (modalIntro) modalIntro.innerHTML = modalMsg;
    if (modalSignature) modalSignature.innerHTML = loopText;

    // Image - mặc định dùng anhthiep.jpeg, nếu có param image thì dùng param
    const imageUrl = getUrlParameter("image") || "https://love-gift-valentine.netlify.app/anhthiep.jpeg";
    const cardBack = document.querySelector(".card-back");
    const modalImageContainer = document.querySelector(".polaroid-image");

    if (cardBack) {
        cardBack.style.backgroundImage = `url('${imageUrl}')`;
        cardBack.classList.add("has-image");
    }
    if (modalImageContainer) {
        const modalImage = document.querySelector(".polaroid-image img");
        if (modalImage) modalImage.src = imageUrl;
    }

    // Music
    const musicUrl = getUrlParameter("music");
    if (musicUrl) {
        const bgMusic = document.getElementById("bgMusic");
        if (bgMusic) bgMusic.src = musicUrl;
    }
}

// ---- MUSIC CONTROL ----
let isPlaying = false;
const bgMusic = document.getElementById("bgMusic");
const musicToggle = document.getElementById("musicToggle");
const musicIcon = document.getElementById("musicIcon");

function playMusic() {
    if (!bgMusic) return;

    function setPlayingState() {
        isPlaying = true;
        if (musicToggle) musicToggle.classList.add("playing");
        if (musicIcon) {
            musicIcon.classList.add("playing");
            musicIcon.classList.remove("muted");
        }
    }

    function setMutedState() {
        isPlaying = false;
        if (musicToggle) musicToggle.classList.remove("playing");
        if (musicIcon) {
            musicIcon.classList.remove("playing");
            musicIcon.classList.add("muted");
        }
    }

    const playPromise = bgMusic.play();

    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                setPlayingState();
            })
            .catch(() => {
                setMutedState();

                // Listen for any user interaction to start music
                const interactionEvents = ["click", "touchstart", "keydown", "scroll"];

                function playOnInteraction() {
                    bgMusic.play().then(() => {
                        setPlayingState();
                    }).catch(() => { });
                    // Remove all listeners after first successful interaction
                    interactionEvents.forEach((evt) => {
                        document.removeEventListener(evt, playOnInteraction);
                    });
                }

                interactionEvents.forEach((evt) => {
                    document.addEventListener(evt, playOnInteraction, { once: true });
                });
            });
    }
}

function toggleMusic() {
    if (!bgMusic) return;

    if (isPlaying) {
        bgMusic.pause();
        isPlaying = false;
        if (musicToggle) musicToggle.classList.remove("playing");
        if (musicIcon) {
            musicIcon.classList.remove("playing");
            musicIcon.classList.add("muted");
        }
    } else {
        bgMusic.play();
        isPlaying = true;
        if (musicToggle) musicToggle.classList.add("playing");
        if (musicIcon) {
            musicIcon.classList.add("playing");
            musicIcon.classList.remove("muted");
        }
    }
}

// ---- MODAL FUNCTIONS ----
// Lưu nội dung gốc của modal để reset
let modalOriginalContent = {};

function saveModalOriginalContent() {
    const modal = document.getElementById("wishModal");
    if (!modal) return;
    const elements = modal.querySelectorAll('.polaroid-text h2, .polaroid-text p, .polaroid-text .signature');
    elements.forEach((el, index) => {
        modalOriginalContent[index] = el.innerHTML;
    });
}

function applyTypewriterToElement(el, text, startDelay) {
    el.innerHTML = '';
    el.classList.add('typewriter-modal');

    // Tách thành từng từ (giữ khoảng trắng giữa các từ)
    // Xử lý HTML tags riêng
    const tokens = [];
    let i = 0;
    let currentWord = '';

    while (i < text.length) {
        if (text[i] === '<') {
            if (currentWord) { tokens.push({ type: 'word', value: currentWord }); currentWord = ''; }
            const end = text.indexOf('>', i);
            if (end !== -1) {
                tokens.push({ type: 'tag', value: text.substring(i, end + 1) });
                i = end + 1;
                continue;
            }
        }
        if (text[i] === '&') {
            const end = text.indexOf(';', i);
            if (end !== -1) {
                currentWord += text.substring(i, end + 1);
                i = end + 1;
                continue;
            }
        }
        if (text[i] === ' ') {
            if (currentWord) { tokens.push({ type: 'word', value: currentWord }); currentWord = ''; }
            tokens.push({ type: 'space' });
            i++;
            continue;
        }
        currentWord += text[i];
        i++;
    }
    if (currentWord) tokens.push({ type: 'word', value: currentWord });

    let charIndex = 0;
    tokens.forEach((token) => {
        if (token.type === 'tag') {
            const node = document.createRange().createContextualFragment(token.value);
            el.appendChild(node);
        } else if (token.type === 'space') {
            // Dùng text node bình thường để trình duyệt tự xuống dòng
            el.appendChild(document.createTextNode(' '));
        } else {
            // Từng ký tự trong từ
            for (let j = 0; j < token.value.length; j++) {
                const span = document.createElement('span');
                span.textContent = token.value[j];
                span.style.animationDelay = `${startDelay + charIndex * 40}ms`;
                el.appendChild(span);
                charIndex++;
            }
        }
    });

    return charIndex;
}

function openModal() {
    const modal = document.getElementById("wishModal");
    if (modal) {
        modal.classList.add("show");
        document.body.style.overflow = "hidden";

        // Hiện ảnh trước
        const polaroidImage = modal.querySelector('.polaroid-image');
        if (polaroidImage) {
            polaroidImage.classList.remove('fade-in');
            setTimeout(() => {
                polaroidImage.classList.add('fade-in');
            }, 200);
        }

        // Lưu nội dung gốc nếu chưa lưu
        if (Object.keys(modalOriginalContent).length === 0) {
            saveModalOriginalContent();
        }

        // Typewriter cho từng phần text
        const elements = modal.querySelectorAll('.polaroid-text h2, .polaroid-text p, .polaroid-text .signature');
        let totalDelay = 500; // Bắt đầu sau khi ảnh hiện

        elements.forEach((el, index) => {
            const text = modalOriginalContent[index] || el.innerHTML;
            const charCount = applyTypewriterToElement(el, text, totalDelay);
            totalDelay += charCount * 40 + 300; // Cộng thêm khoảng nghỉ giữa các đoạn
        });
    }
}

function closeModal() {
    const modal = document.getElementById("wishModal");
    if (modal) {
        modal.classList.remove("show");
        document.body.style.overflow = "auto";

        // Reset ảnh
        const polaroidImage = modal.querySelector('.polaroid-image');
        if (polaroidImage) polaroidImage.classList.remove('fade-in');

        // Reset text về nội dung gốc
        const elements = modal.querySelectorAll('.polaroid-text h2, .polaroid-text p, .polaroid-text .signature');
        elements.forEach((el, index) => {
            if (modalOriginalContent[index] !== undefined) {
                el.innerHTML = modalOriginalContent[index];
                el.classList.remove('typewriter-modal');
            }
        });
    }
}

window.addEventListener("click", function (event) {
    const modal = document.getElementById("wishModal");
    if (event.target === modal) {
        closeModal();
    }
});

window.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeModal();
        envelopeWrapper.classList.remove("open");
        isEnvelopeOpen = false;
        if (card) {
            card.classList.remove("animation-done");
        }
        if (clickInstruction) {
            clickInstruction.style.opacity = "1";
        }
    }
});
