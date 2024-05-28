import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './App.css'; // Import the CSS file

function App() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chat, setChat] = useState(null); // State for the chat session

  useEffect(() => {
    const apiKey = "AIzaSyA8nr9Sxcfj3UQIdjd1t588Oil4OzWWcAA"; // Replace with your actual retrieval method
    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      setChat(model.startChat({
        history: [],
      }));
    } else {
      console.error('Missing Generative AI API Key');
    }
  }, []);

  const sendMyMsg = () => {
    setMessages(messages => [...messages, { text: newMessage, sender: 'You' }]);
    setNewMessage('');
  };

  const sendMessage = async () => {
    if (newMessage.trim() !== '') {
      sendMyMsg(); // Add your message first
      if (chat) {
        const msg = newMessage;
        try {
          const result = await chat.sendMessage(msg);
          
          const response = await result.response;
          const res = response.text();
          setMessages(messages => [...messages, { text: res, sender: 'Gemini' }]);
        } catch (error) {
          console.error('Error generating content from Gemini:', error);
        }
      }
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]); // Set messages state to an empty array to clear chat history
  };

  return (
    <div className="chat-container">
      <h2 className='header'>Chat with Gemini</h2>
      <ul className="message-list">
        {messages.map((message, index) => (
          <li key={index} className={message.sender === 'You' ? 'user-message' : 'gemini-message'}>
            {message.sender}: {message.text}
          </li>
        ))}
      </ul>
      <div className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={(event) => setNewMessage(event.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={sendMessage}>Send</button>
        <button onClick={clearChat} className="clear-button">Clear Chat</button>
      </div>
    </div>
  );
}

export default App;
