import { useEffect, useState } from "react";
import { db } from "./firebaseConfig";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  // Reference to Firestore collection
  const messagesRef = collection(db, "messages");

  useEffect(() => {
    // Fetch messages in real-time from Firestore
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setChat(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (message.trim() === "") return;

    try {
      await addDoc(messagesRef, {
        text: message,
        createdAt: serverTimestamp(), // Firestore will handle the timestamp
      });
      setMessage(""); // Clear input field after sending
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-xl font-bold mb-4">Chat</h1>
      <div className="border p-3 bg-white mb-3 h-64 overflow-y-auto">
        {chat.map((msg) => (
          <p key={msg.id} className="bg-blue-200 p-2 rounded my-1">{msg.text}</p>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          className="flex-grow p-2 border rounded-l"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-2 rounded-r">
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
