import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import plusIcon from './plus.png';
import defaultImage from './default.png';
import therapAIImage from './TherapAI.PNG';
import './App.css';

function App() {
  const [inputText, setInputText] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedImage, setSelectedImage] = useState(defaultImage);
  const fileInputRef = useRef(null);
  const [backgroundColor, setBackgroundColor] = useState("#95a5a6");
  const synth = window.speechSynthesis;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTextToSpeechEnabled, setIsTextToSpeechEnabled] = useState(true);
  const [voices, setVoices] = useState(null); // Initialize voices to null
  const [selectedVoice, setSelectedVoice] = useState(null);

  useEffect(() => {
    const populateVoices = () => {
      const voiceList = synth.getVoices();
      setVoices(voiceList);
      if (voiceList && voiceList.length > 0 && selectedVoice === null) {
        setSelectedVoice(voiceList[0]);
      }
    };

    populateVoices();
    synth.onvoiceschanged = populateVoices;

    return () => {
      synth.cancel();
      synth.onvoiceschanged = null;
    };
  }, [synth, selectedVoice]);

  const speak = (text) => {
    if (!isTextToSpeechEnabled || !selectedVoice) return;
    if (synth.speaking) {
      console.error("Already speaking...");
      return;
    }
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.onend = () => {
      console.log("Speech finished!");
      setIsSpeaking(false);
    };
    utterance.onerror = (event) => {
      console.error("Speech error:", event);
      setIsSpeaking(false);
    };
    synth.speak(utterance);
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    setChatHistory([...chatHistory, { sender: "user", text: inputText }]);

    try {
      const res = await axios.post(
        "http://127.0.0.1:5000/chat",
        { message: inputText },
        { headers: { "Content-Type": "application/json" } }
      );

      const { response, mental_state, color } = res.data;
      setChatHistory((prevChat) => [
        ...prevChat,
        { sender: "TherapAI", text: response, color: color },
      ]);
      setBackgroundColor(color);
      speak(response);
    } catch (error) {
      console.error("Error:", error);
      setChatHistory((prevChat) => [
        ...prevChat,
        { sender: "TherapAI", text: "Error processing request." },
      ]);
    }
    setInputText("");
  };

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImage(URL.createObjectURL(event.target.files[0]));
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const toggleTextToSpeech = () => {
    setIsTextToSpeechEnabled(!isTextToSpeechEnabled);
  };

  const handleVoiceChange = (event) => {
    setSelectedVoice(voices.find((voice) => voice.name === event.target.value));
  };
  const exportChat = () => {
    if (chatHistory.length === 0) {
      alert("No chat history to export!");
      return;
    }
  
    let chatText = chatHistory.map(msg => `${msg.sender}: ${msg.text}`).join("\n"); // Corrected line
  
    const blob = new Blob([chatText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "TherapAI_Chat_History.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



  return (
    <div
      style={{
        maxWidth: "1600px",
        margin: "0 auto",
        textAlign: "center",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "10px",
        backgroundColor: backgroundColor, transition: "background-color 0.5s ease",
        minHeight: "100vh",
        overflow: "hidden",
        position: "relative"
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={therapAIImage} alt="TherapAI" style={{ maxWidth: '300px', maxHeight: '150px' }}/> {/* Display the image */}
        <button
          onClick={handleButtonClick}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            marginLeft: '10px',
          }}
        >
          <img src={plusIcon} alt="Upload" style={{ width: "50px", height: "50px" }} />
        </button>
      </div>
      <button onClick={toggleTextToSpeech}>
        {isTextToSpeechEnabled ? "Turn Text-to-Speech Off" : "Turn Text-to-Speech On"}
      </button>

      <select value={selectedVoice ? selectedVoice.name : ""} onChange={handleVoiceChange}>
        {voices && voices.map((voice) => (
          <option key={voice.name} value={voice.name}>
            {voice.name} ({voice.lang})
          </option>
        ))}
      </select>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        <div style={{ position: "relative", display: "inline-flex", alignItems: 'center' }}>
          <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <img
              src={selectedImage}
              alt="Uploaded"
              className={isSpeaking ? "squish-animation" : ""}
              style={{ maxWidth: "700px", maxHeight: "300px", borderRadius: "10px" }}
            />
          </div>
        </div>
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        ref={fileInputRef}
        style={{ display: "none" }}
      />

      <div
        style={{
          height: "250px",
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: "10px",
          marginBottom: "20px",
          backgroundColor: "white",
          maxWidth: "480px",
          margin: "0 auto",
          borderRadius: "10px"
        }}
      >
        {chatHistory.map((msg, index) => (
          <div
            key={index}
            style={{
              textAlign: msg.sender === "user" ? "right" : "left",
              margin: "5px 0",
              color: msg.sender === "user" ? "blue" : msg.color || "green",
            }}
          >
            <strong>{msg.sender === "user" ? "You" : "TherapAI"}:</strong> {msg.text}
          </div>
        ))}
      </div>

      <textarea
        value={inputText}
        onChange={(e) => {
          setInputText(e.target.value);
          e.target.style.height = "50px";
          e.target.style.height = e.target.scrollHeight + "px";
        }}
        placeholder="Type your message..."
        style={{
          width: "90%",
          maxWidth: "700px",
          padding: "8px",
          borderRadius: "5px",
          minHeight: "50px",
          maxHeight: "200px",
          overflowY: "auto",
          resize: "none",
          marginBottom: "10px",
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
      />
      <div style={{display: "flex", justifyContent: "center"}}>
      <button
        onClick={exportChat}
        style={{
          marginTop: "10px", // Added marginTop for spacing
          padding: "5px 10px",
          borderRadius: "5px",
          background: "#3498db",
          color: "white",
          cursor: "pointer"
        }}
      >
        📥Download Chat
      </button>
    </div>
  </div>
);
}

export default App;