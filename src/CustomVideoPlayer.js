import React, { useRef, useState, useEffect } from "react";
import "./CustomVideoPlayer.css"; // Import CSS

const CustomVideoPlayer = () => {
  const videoRef = useRef(null);
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");

  // Add any Youtube Video Id
  const videoId = "Th2qSOGPXFo"; // video id
  const apiKey = "AIzaSyAnLR_7wy64Gh30rPOQ5ouulQFs2M3j-vU"; // Youtube API key

  useEffect(() => {
    // Load notes from local storage
    const savedNotes = localStorage.getItem(`notes-${videoId}`);
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, [videoId]);

  useEffect(() => {
    // Load the YouTube IFrame Player API
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      videoRef.current = new window.YT.Player("player", {
        videoId,
      });
    };

    // Fetch video title and description using YouTube Data API
    fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.items.length > 0) {
          setVideoTitle(data.items[0].snippet.title);
          const description = data.items[0].snippet.description
            .split(" ")
            .slice(0, 30)
            .join(" ");
          setVideoDescription(description);
        }
      });
  }, [videoId]);

  const handleAddNote = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.getCurrentTime();
      const newNote = {
        text: noteText,
        time: currentTime,
        date: formatDate(new Date()),
      };

      const updatedNotes = isEditing
        ? notes.map((note, index) =>
            index === currentNoteIndex ? newNote : note
          )
        : [...notes, newNote];

      setNotes(updatedNotes);
      setNoteText("");
      setIsEditing(false);
      setCurrentNoteIndex(null);

      // Save notes to local storage
      localStorage.setItem(`notes-${videoId}`, JSON.stringify(updatedNotes));
    }
  };

  const handleEditNote = (index) => {
    const note = notes[index];
    setNoteText(note.text);
    setIsEditing(true);
    setCurrentNoteIndex(index);
  };

  const handleDeleteNote = (index) => {
    const updatedNotes = notes.filter((_, i) => i !== index);
    setNotes(updatedNotes);
    localStorage.setItem(`notes-${videoId}`, JSON.stringify(updatedNotes));
  };

  const handleNoteClick = (time) => {
    if (videoRef.current) {
      videoRef.current.seekTo(time, true);
      videoRef.current.playVideo();
    }
  };

  // Format the date
  const formatDate = (date) => {
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear() % 100; // Get last two digits of the year
    return `${day} ${month} '${year.toString().padStart(2, "0")}`;
  };

  return (
    <div className="video-container">
      <div>
        <h1>Video Player with Notes</h1>
      </div>

      <div id="player"></div>

      <h2 className="video-title">{videoTitle}</h2>
      <p className="video-description">{videoDescription}...</p>

      {/* Notes container */}
      <div className="notes-container">
        <p className="notes-heading">My Notes</p>
        <p>
          All your notes in one place. Click on any note to go to the specific
          timestamp in the video.
        </p>
        <p className="bottom-line"></p>
        <div className="note-input">
          <input
            type="text"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add a note"
          />
          <button className="note-button" onClick={handleAddNote}>
            {isEditing ? "Update Note" : "Add Note"}
          </button>
        </div>
        <ul className="note-list">
          {notes.map((note, index) => (
            <li key={index} className="note-item">
              <span
                className="note-text"
                onClick={() => handleNoteClick(note.time)}
              >
                <div className="date-time-notes">
                  <p className="note-date">{note.date}</p>
                  <p className="note-time">
                    Timestamp:{" "}
                    <span className="timestamp-color">
                      {Math.floor(note.time / 60)
                        .toString()
                        .padStart(2, "0")}{" "}
                      min :{" "}
                      {Math.floor(note.time % 60)
                        .toString()
                        .padStart(2, "0")}{" "}
                      sec
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-note">{note.text}</p>
                </div>
                <div className="notes-update-section">
                  <button
                    className="edit-button"
                    onClick={() => handleEditNote(index)}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteNote(index)}
                  >
                    Delete
                  </button>
                </div>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CustomVideoPlayer;
