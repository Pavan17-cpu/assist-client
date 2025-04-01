import React, { useState, useEffect } from "react";
import axios from "axios";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const App = () => {
  const [response, setResponse] = useState(""); // To display the response from the server
  const [isListening, setIsListening] = useState(false); // To check if the mic is listening

  const { transcript, resetTranscript, listening, finalTranscript } = useSpeechRecognition();

  // Function to handle the voice command and communicate with the backend
  const processCommand = async (command) => {
    if (command.trim() === "") return;

    try {
      // Send the voice command to the backend for processing
      const result = await axios.post("https://assist-server-ra3i.onrender.com/command", {
        command: command,
      });

      // Set the server's reply
      setResponse(result.data.reply);

      // Respond back to the user using speech synthesis
      const speech = new SpeechSynthesisUtterance(result.data.reply);
      window.speechSynthesis.speak(speech);

      // Reset the transcript after processing
      resetTranscript();
    } catch (error) {
      console.error("Error sending command:", error);
      setResponse("Something went wrong. Please try again.");
    }
  };

  // Function to start/stop listening to voice commands
  const toggleListening = () => {
    if (isListening) {
      SpeechRecognition.stopListening();
    } else {
      SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
    }
    setIsListening(!isListening);
  };

  // Automatically process the command when `finalTranscript` changes (i.e., the speech has finished)
  useEffect(() => {
    if (finalTranscript) {
      console.log("Final Transcript: ", finalTranscript);
      processCommand(finalTranscript); // Call backend once speech stops
    }
  }, [finalTranscript]);

  // Automatically start listening when the component mounts
  useEffect(() => {
    toggleListening(); // Start listening automatically when the component mounts
  }, []);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Voice Command with Friday Assistant</h1>

      {/* Button to Start/Stop Listening */}
      <button
        onClick={toggleListening}
        style={{
          padding: "10px 20px",
          backgroundColor: isListening ? "#f44336" : "#4CAF50",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        {isListening ? "Stop Listening" : "Start Listening"}
      </button>

      {/* Display the current command that is being processed */}
      <div style={{ marginTop: "20px", fontSize: "16px" }}>
        <p>{transcript ? `Listening: ${transcript}` : "Say something..."}</p>
      </div>

      {/* Display the server's response */}
      <div style={{ marginTop: "20px", fontSize: "18px", fontWeight: "bold" }}>
        <p>{response}</p>
      </div>
    </div>
  );
};

export default App;
