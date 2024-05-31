import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coy } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './App.css'; // Import the CSS file

function App() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chat, setChat] = useState(null); // State for the chat session
  const [streamingMessage, setStreamingMessage] = useState(''); // State for the current streaming message

  useEffect(() => {
    const apiKey = "AIzaSyA8nr9Sxcfj3UQIdjd1t588Oil4OzWWcAA"; // Ensure to use environment variables for security
    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', systemInstruction: "What is a test case (Test Case Designing,Characteristics of good test case,example),sources of information for test case,testing activities,Test levels, Verification vs Validation VModel ,white-box and black box testing", });
      setChat(model.startChat({
        history: [],
      }));
    } else {
      console.error('Missing Generative AI API Key');
    }
  }, []);

  const sendMyMsg = () => {
    setMessages((messages) => [...messages, { text: newMessage, sender: 'You' }]);
    setNewMessage('');
  };

  const sendMessage = async () => {
    if (newMessage.trim() !== '') {
      sendMyMsg(); // Add your message first
      setStreamingMessage(''); // Reset the streaming message state
      if (chat) {
        const msg = newMessage;
        try {
          const result = await chat.sendMessageStream(msg);
          let text = '';
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            console.log(chunkText);
            text += chunkText;

            // Update the streaming message incrementally
            setStreamingMessage(text);
          }

          // Once streaming is complete, add the final message to the messages state
          setMessages((messages) => [...messages, { text, sender: 'Gemini' }]);
          setStreamingMessage(''); // Clear the streaming message state
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
      <div className="message-list-container">
        <ul className="message-list">
          {messages.map((message, index) => (
            <li key={index} className={message.sender === 'You' ? 'user-message' : 'gemini-message'}>
              {message.sender}: <ReactMarkdown
                children={message.text}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        children={String(children).replace(/\n$/, '')}
                        style={coy}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      />
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              />
            </li>
          ))}
          {streamingMessage && (
            <li className='gemini-message'>
              Gemini: <ReactMarkdown
                children={streamingMessage}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        children={String(children).replace(/\n$/, '')}
                        style={coy}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      />
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              />
            </li>
          )}
        </ul>
      </div>
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
