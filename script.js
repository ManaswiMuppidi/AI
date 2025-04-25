// Theme Toggle
        const themeToggle = document.getElementById('theme-toggle');
        const body = document.body;
        const icon = themeToggle.querySelector('i');

        // Check for saved theme preference or use preferred color scheme
        const savedTheme = localStorage.getItem('theme') || 
                          (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        body.setAttribute('data-theme', savedTheme);
        
        if (savedTheme === 'dark') {
            icon.classList.replace('fa-moon', 'fa-sun');
        }

        themeToggle.addEventListener('click', () => {
            const currentTheme = body.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            if (newTheme === 'dark') {
                icon.classList.replace('fa-moon', 'fa-sun');
            } else {
                icon.classList.replace('fa-sun', 'fa-moon');
            }
        });

        // Scroll animations
        const animateElements = document.querySelectorAll('.animate');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });

        animateElements.forEach(element => {
            observer.observe(element);
        });

        // Header hide/show on scroll
        let lastScroll = 0;
        const header = document.getElementById('main-header');
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll <= 100) {
                header.classList.remove('hidden');
                return;
            }
            
            if (currentScroll > lastScroll && !header.classList.contains('hidden')) {
                header.classList.add('hidden');
            } else if (currentScroll < lastScroll && header.classList.contains('hidden')) {
                header.classList.remove('hidden');
            }
            
            lastScroll = currentScroll;
        });

        // Chatbot Functionality
        const chatbotIcon = document.getElementById("chatbot-icon");
        const chatbotContainer = document.getElementById("chatbot-container");
        const closeChatbot = document.getElementById("close-chat");
        const chatbotInput = document.getElementById("chatbot-input");
        const sendChatbotMessage = document.getElementById("send-chatbot-message");
        const chatbotMessages = document.getElementById("chatbot-messages");
        const chatNowBtn = document.getElementById("chat-now");
        
        // Google Gemini API configuration
        const GOOGLE_API_KEY = 'AIzaSyDudnt6l_RVPTuwnnj0VqrtLq8WVDewrMY';
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`;

        // Toggle chatbot visibility
        function toggleChatbot() {
            if (chatbotContainer.classList.contains('active')) {
                chatbotContainer.classList.remove('active');
                setTimeout(() => {
                    chatbotContainer.style.display = 'none';
                }, 300);
            } else {
                chatbotContainer.style.display = 'flex';
                setTimeout(() => {
                    chatbotContainer.classList.add('active');
                }, 10);
            }
        }

        chatbotIcon.addEventListener('click', toggleChatbot);
        chatNowBtn.addEventListener('click', toggleChatbot);
        closeChatbot.addEventListener('click', toggleChatbot);

        // Add message to chat
        function addMessage(text, isUser) {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message');
            messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');
            messageDiv.textContent = text;
            chatbotMessages.appendChild(messageDiv);
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        }

        // Show typing indicator
        function showTypingIndicator() {
            const typingDiv = document.createElement('div');
            typingDiv.classList.add('typing-indicator');
            typingDiv.id = 'typing-indicator';
            
            for (let i = 0; i < 3; i++) {
                const dot = document.createElement('div');
                dot.classList.add('typing-dot');
                typingDiv.appendChild(dot);
            }
            
            chatbotMessages.appendChild(typingDiv);
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        }

        // Hide typing indicator
        function hideTypingIndicator() {
            const typing = document.getElementById('typing-indicator');
            if (typing) typing.remove();
        }

        // Send message to API
        async function sendMessage() {
            const userMessage = chatbotInput.value.trim();
            if (!userMessage) return;
            
            addMessage(userMessage, true);
            chatbotInput.value = '';
            
            try {
                showTypingIndicator();
                
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `You are StudyGenius, a friendly and patient AI homework helper for students of all ages. 
                                A student has asked: "${userMessage}". 
                                
                                Please respond with these guidelines:
                                
                                1. FIRST, show empathy and encouragement. Example: "Great question! Let's tackle this together. 💪"
                                
                                2. THEN, assess if you need clarification. If the question is unclear, ask ONE simple follow-up question.
                                
                                3. For homework help:
                                   - Break solutions into small, numbered steps
                                   - Explain concepts simply (grade-appropriate)
                                   - Use analogies or examples when helpful
                                   - Include relevant emojis to make it friendly 👩‍🏫📚
                                
                                4. End by:
                                   - Checking if the student understands
                                   - Offering to explain differently if needed
                                   - Encouraging them with positive feedback
                                
                                5. Special cases:
                                   - If it's test/exam related: "I can help explain concepts, but remember to do your own work for actual tests! 😊"
                                   - If stuck: "Let me think differently about this..."
                                   - If you don't know: "Hmm, I'm not 100% sure about this one. Let me suggest some resources that might help..."
                                
                                Tone should be:
                                - Supportive like a favorite teacher
                                - Patient (never "obvious" or condescending)
                                - Clear but not overly formal
                                - Occasionally use friendly emojis
                                
                                Now respond to: "${userMessage}"`
                            }]
                        }]
                    }),
                });
                
                const data = await response.json();
                hideTypingIndicator();
                
                if (data.candidates && data.candidates[0].content.parts[0].text) {
                    addMessage(data.candidates[0].content.parts[0].text, false);
                } else {
                    addMessage("I'm sorry, I couldn't process your request. Please try again later.", false);
                }
            } catch (error) {
                hideTypingIndicator();
                addMessage("Oops! Something went wrong. Please check your connection and try again.", false);
                console.error('Error:', error);
            }
        }

        // Event listeners for sending messages
        sendChatbotMessage.addEventListener('click', sendMessage);
        chatbotInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        // Sign up form submission
        document.getElementById('signup-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            alert(`Thank you for signing up with ${email}! We'll be in touch soon.`);
            e.target.reset();
        });

        // Add floating shapes to hero section
        function createFloatingShapes() {
            const hero = document.querySelector('.hero');
            const shapesContainer = document.querySelector('.floating-shapes');
            
            for (let i = 0; i < 8; i++) {
                const shape = document.createElement('div');
                shape.classList.add('shape');
                
                const size = Math.random() * 100 + 50;
                const opacity = Math.random() * 0.1 + 0.05;
                const top = Math.random() * 100;
                const left = Math.random() * 100;
                const animationDuration = Math.random() * 20 + 10;
                const animationDelay = Math.random() * 5;
                
                shape.style.width = `${size}px`;
                shape.style.height = `${size}px`;
                shape.style.background = `rgba(255,255,255,${opacity})`;
                shape.style.top = `${top}%`;
                shape.style.left = `${left}%`;
                shape.style.animationDuration = `${animationDuration}s`;
                shape.style.animationDelay = `${animationDelay}s`;
                
                shapesContainer.appendChild(shape);
            }
        }

        // Initialize floating shapes
        createFloatingShapes();
