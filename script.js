// Replace with your actual API key
const API_KEY = "AIzaSyAT1xnW3oNuvX4YWx0KXT1nxTAVA8lVM-Q";

document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userMessageInput = document.getElementById('user-message');
    const sendButton = document.getElementById('send-btn');

    // Function to add a message to the chat
    function addMessage(message, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        
        if (isUser) {
            messageDiv.classList.add('user-message');
        } else {
            messageDiv.classList.add('bot-message');
            // Format the bot's response with markdown-like formatting
            message = formatResponse(message);
        }

        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${message}</p>
            </div>
        `;

        chatMessages.appendChild(messageDiv);
        
        // Scroll to the bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Function to show typing indicator
    function showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.classList.add('message', 'bot-message');
        indicator.id = 'typing-indicator';
        indicator.innerHTML = `
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        chatMessages.appendChild(indicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Function to remove typing indicator
    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    // Function to send a message to Gemini API
    async function sendMessageToGemini(message) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
            const payload = {
                contents: [
                    {
                        parts: [
                            {
                                text: `You are a fashion history educator chatbot. Provide informative and engaging responses about fashion history, designers, trends, and clothing from different eras. Format important terms or concepts in bold by surrounding them with ** (like **this**). The user is asking: ${message}`
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1024
                }
            };
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
                return data.candidates[0].content.parts[0].text;
            } else if (data.error) {
                console.error('Gemini API error:', data.error);
                return "I'm sorry, I couldn't process that request. Please try again later.";
            } else {
                return "I'm having trouble generating a response right now. Please try again.";
            }
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            return "I'm having trouble connecting to my knowledge base. Please check your internet connection and try again.";
        }
    }
    
    // Function to handle user sending a message
    async function handleUserMessage() {
        const userMessage = userMessageInput.value.trim();
        
        if (!userMessage) return;
        
        // Clear input field
        userMessageInput.value = '';
        
        // Add user message to chat
        addMessage(userMessage, true);
        
        // Show typing indicator
        showTypingIndicator();
        
        // Get response from Gemini
        const botResponse = await sendMessageToGemini(userMessage);
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Add bot response to chat
        addMessage(botResponse);
    }
    
    // Event listeners
    sendButton.addEventListener('click', handleUserMessage);
    
    userMessageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleUserMessage();
        }
    });

    // Focus input on page load
    userMessageInput.focus();
});

// Helper function to format text with Markdown-like syntax
function formatResponse(text) {
    // Bold text between ** **
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic text between * *
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Convert line breaks to <br>
    text = text.replace(/\n/g, '<br>');
    
    return text;
} 