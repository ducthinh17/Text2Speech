import * as tf from "@tensorflow/tfjs";
import { useState } from "react";
import { db } from "../firebase/firebaseConfig"; // Import Firestore config
import { collection, addDoc } from "firebase/firestore"; // Import Firestore functions
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import Firebase Storage functions

const validLabels = {
  0: {
    label: "Age",
    description:
      "Age-related changes can affect vision. Regular eye exams can help detect age-related eye conditions early, allowing for timely treatment.",
    prevention:
      "Maintain a healthy lifestyle, including a balanced diet and regular exercise.",
    image: "../../image/diseases/age.png",
  },
  1: {
    label: "Cataract",
    description:
      "Cataracts cloud the eye's lens, leading to blurry vision. Cataract surgery is the most effective treatment.",
    prevention:
      "Wear sunglasses to block UV rays, quit smoking, and manage conditions like diabetes.",
    image: "../../image/diseases/cataract.png",
  },
  2: {
    label: "Diabetes",
    description:
      "Diabetic retinopathy is a complication of diabetes affecting the retina. Early detection can prevent vision loss.",
    prevention: "Control blood sugar levels, blood pressure, and cholesterol.",
    image: "../../image/diseases/diabetes.png",
  },
  3: {
    label: "Glaucoma",
    description:
      "Glaucoma damages the optic nerve and can lead to blindness. Early detection through regular eye exams is crucial.",
    prevention:
      "Regular eye checkups, especially if you are at higher risk, and maintaining normal eye pressure.",
    image: "../../image/diseases/glaucoma.png",
  },
  4: {
    label: "Hypertension",
    description:
      "High blood pressure can damage blood vessels in the retina, leading to hypertensive retinopathy.",
    prevention:
      "Manage blood pressure through a healthy diet, regular exercise, and medication if necessary.",
    image: "../../image/diseases/hypertension.png",
  },
  5: {
    label: "Myopia",
    description:
      "Myopia (nearsightedness) causes distant objects to appear blurry. It is typically corrected with glasses or contact lenses.",
    prevention:
      "Limit screen time, spend time outdoors, and have regular eye exams.",
    image: "../../image/diseases/myopia.png",
  },
  6: {
    label: "Normal",
    description:
      "No significant eye conditions detected. Regular eye exams are still recommended to maintain eye health.",
    prevention: "Maintain a healthy lifestyle and have periodic eye checkups.",
    image: "../../image/diseases/normal.png",
  },
  7: {
    label: "Other",
    description:
      "Other eye conditions not specifically classified. Consult an eye care professional for a thorough examination.",
    prevention: "Seek professional advice for diagnosis and treatment options.",
    image: "../../image/diseases/other.png",
  },
  8: {
    label: "Invalid Image",
    description:
      "The uploaded image is invalid or unclear. Please upload a valid image for analysis.",
    prevention: "Ensure the image is clear and properly uploaded.",
    image: "../../image/diseases/invalid_image.png",
  },
};

const ModelPredictor = () => {
  const [imagePath, setImagePath] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageDisplay, setImageDisplay] = useState(null);
  const [keyID, setKeyID] = useState(null); // Lưu keyID trong state

  const loadImageFromPublic = async (imagePath) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imagePath;
      img.onload = () => resolve(img);
      img.onerror = (err) => {
        console.error("Error loading image:", err);
        reject(new Error("Image loading failed"));
      };
    });
  };

  const preprocessImage = (img) => {
    return tf.browser
      .fromPixels(img)
      .resizeBilinear([224, 224])
      .toFloat()
      .expandDims(0);
  };

  const savePrediction = async (predictionData) => {
    try {
      const docRef = await addDoc(collection(db, "user_image"), predictionData);
      console.log("Document written with ID: ", docRef.id);
    } catch (error) {
      console.error("Error adding document: ", error);
      setError("Failed to save prediction data.");
    }
  };

  const uploadImageToFirebase = async (file) => {
    const storage = getStorage();
    const storageRef = ref(storage, `images/${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const predictImage = async () => {
    if (!imagePath || !keyID) {
      setError("No image selected for prediction.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const modelUrl = "/tfjs_model/model_after.json"; // Đường dẫn tới mô hình TensorFlow.js
      const loadedModel = await tf.loadLayersModel(modelUrl);
      const img = await loadImageFromPublic(imagePath);
      const preprocessedImage = preprocessImage(img);
      const prediction = loadedModel.predict(preprocessedImage);
      const predictedClassIdx = tf.argMax(prediction, 1).dataSync()[0];
      const predictedLabel = validLabels[predictedClassIdx];
      setPredictionResult(predictedLabel);

      const predictionData = {
        label: predictedLabel.label,
        description: predictedLabel.description,
        timestamp: new Date(),
        keyID: keyID, // Sử dụng keyID đã tạo
      };

      await savePrediction(predictionData); // Lưu kết quả dự đoán
    } catch (error) {
      console.error("Prediction error:", error.message);
      setError("Prediction error: " + error.message);
    } finally {
      setLoading(false); // Đảm bảo trạng thái loading được tắt
    }
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Tạo keyID mới khi người dùng chọn ảnh
      const newKeyID = Math.random().toString(36).substr(2, 9);
      setKeyID(newKeyID); // Cập nhật state với keyID mới

      try {
        const imageUrl = URL.createObjectURL(file);
        setImagePath(imageUrl);
        setImageDisplay(imageUrl);
        setPredictionResult(null);
        setError("");

        const imageUrl2 = await uploadImageToFirebase(file);
        // Ghi lại thông tin ảnh và keyID
        const predictionData = {
          imagePath: imageUrl2, // Lưu chỉ URL ảnh đã tải lên
          keyID: newKeyID, // Sử dụng keyID đã tạo
        };

        await savePrediction(predictionData); // Lưu thông tin ảnh
      } catch (error) {
        console.error("Upload error: ", error);
        setError(
          "An error occurred during the upload process: " + error.message
        );
      }
    }
  };

  return (
    <div
      className="model-predictor-container"
      style={{
        display: "flex",
        padding: "20px",
        fontFamily: "'Roboto', sans-serif",
      }}
    >
      <div
        className="left-section"
        style={{ flexBasis: "35%", textAlign: "center" }}
      >
        <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>
          Image Prediction Model
        </h1>
        <label
          htmlFor="upload-image"
          style={{
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={imageDisplay || "../../image/upload.png"}
            alt="Upload"
            className="banner-image"
            style={{
              width: "80%",
              height: "auto",
              cursor: "pointer",
              border: "2px solid #ddd",
              borderRadius: "8px",
              padding: "0px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          />
        </label>

        <input
          id="upload-image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: "none" }} // Hide input button
        />

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "20px",
          }}
        >
          <button
            onClick={predictImage}
            disabled={loading}
            style={{
              padding: "10px 20px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "16px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              transition: "background-color 0.3s",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#45a049";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "#4CAF50";
            }}
          >
            {loading ? "Loading..." : "Predict"}
          </button>
        </div>
        {loading && (
          <p style={{ marginTop: "10px", color: "#999" }}>Loading...</p>
        )}
        {error && <p style={{ marginTop: "10px", color: "red" }}>{error}</p>}
      </div>

      <div
        className="divider"
        style={{
          width: "2px",
          backgroundColor: "#ddd",
          margin: "0 20px",
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        }}
      />

      <div
        className="right-section"
        style={{ flexBasis: "65%", paddingLeft: "20px" }}
      >
        <h2 style={{ fontSize: "22px", marginBottom: "20px" }}>
          Prediction Result
        </h2>
        {predictionResult ? (
          <div
            className="prediction-result"
            style={{
              padding: "20px",
              border: "2px solid #4CAF50",
              borderRadius: "8px",
              backgroundColor: "#f9f9f9",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              color: "black",
            }}
          >
            <h3
              style={{
                marginBottom: "10px",
                fontWeight: "bold",
                fontSize: "24px",
                color: "#4CAF50",
              }}
            >
              {predictionResult.label}
            </h3>
            <p style={{ fontSize: "18px", color: "#0f0f0f" }}>
              <strong>Description:</strong>{" "}
              <span
                style={{
                  backgroundColor: "#e0ffe0",
                  padding: "2px 4px",
                  borderRadius: "4px",
                }}
              >
                {predictionResult.description}
              </span>
            </p>
            <p style={{ fontSize: "18px", color: "#0f0f0f" }}>
              <strong>Prevention:</strong>{" "}
              <span
                style={{
                  backgroundColor: "#e0ffe0",
                  padding: "2px 4px",
                  borderRadius: "4px",
                }}
              >
                {predictionResult.prevention}
              </span>
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "15px",
              }}
            >
              <img
                src={predictionResult.image}
                alt={predictionResult.label}
                style={{
                  width: "60%",
                  height: "auto",
                  borderRadius: "8px",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                }}
              />
            </div>
          </div>
        ) : (
          <p style={{ fontSize: "18px", color: "#999" }}>
            No prediction made yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default ModelPredictor;
