import React, { useState, useRef } from "react";
import mammoth from "mammoth";

const Model = () => {
  const [textInput, setTextInput] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleTextChange = (e) => {
    setTextInput(e.target.value);
    setAudioUrl("");
    setError("");
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      if (file.name.endsWith(".txt")) {
        const text = await file.text();
        setTextInput(text);
      } else if (file.name.endsWith(".docx")) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setTextInput(result.value);
      } else {
        setError("Chỉ hỗ trợ file .txt hoặc .docx");
      }
    } catch (err) {
      console.error("Lỗi đọc file:", err);
      setError("Không thể đọc file.");
    }
  };

  const synthesizeViaAPI = async () => {
    if (!textInput.trim()) {
      setError("Vui lòng nhập nội dung văn bản.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:8888/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textInput }),
      });

      if (!response.ok) throw new Error("API trả về lỗi.");

      const blob = await response.blob();
      const audioURL = URL.createObjectURL(blob);
      setAudioUrl(audioURL);
    } catch (err) {
      console.error("TTS API error:", err);
      setError("Lỗi khi gọi API.");
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div style={{ padding: 10, fontFamily: "Arial, sans-serif" }}>
      {/* Grid layout */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          justifyContent: "center",
          alignItems: "stretch",
          flexWrap: "wrap",
        }}
      >
        {/* Hình ảnh upload */}
        <div
          onClick={triggerFileInput}
          style={{
            flex: 0.6,
            minWidth: "300px",
            cursor: "pointer",
            textAlign: "center",
            padding: "10px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div>
            <img
              src="../../image/upload.png" // hoặc URL ảnh bạn vừa gửi
              alt="Upload file"
              style={{ width: "100%", maxWidth: "400px", marginBottom: 8 }}
            />
            
          </div>
          <input
            type="file"
            accept=".txt,.docx"
            onChange={handleFileUpload}
            ref={fileInputRef}
            style={{ display: "none" }}
          />
        </div>

        {/* Textarea */}
        <textarea
          value={textInput}
          onChange={handleTextChange}
          placeholder="Nhập văn bản tại đây..."
          rows={15}
          style={{
            flex: 1.4,
            minWidth: "300px",
            padding: 20,
            fontSize: "16px",
            borderRadius: 6,
            border: "2px solid #ccc",
          }}
        />
        
      </div>

      {/* Button và audio */}
      <div style={{ marginTop: 20, textAlign: "center" }}>
        <button
          onClick={synthesizeViaAPI}
          disabled={loading}
          style={{
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          {loading ? "Đang xử lý..." : "Tạo giọng nói"}
        </button>
      </div>

      {error && <p style={{ color: "red", marginTop: 12 }}>{error}</p>}

      {audioUrl && (
        <div style={{ marginTop: 20 }}>
          <h4>Kết quả âm thanh:</h4>
          <audio controls src={audioUrl} style={{ width: "100%" }} />
        </div>
      )}
    </div>
  );
};

export default Model;
