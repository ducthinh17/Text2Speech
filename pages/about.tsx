import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

import React, { Suspense } from "react";
const AboutPage: React.FC = () => {
  return (
    <div>
      <NavBar />
      <div className="container">
        <div className="banner">
          <img
            src="../../image/explore-2.png"
            alt="Online Consultation"
            className="banner-image"
          />
          <div className="content">
            <h1>About Us</h1>
            <p>
              Connect face to face with a doctor, psychiatrist or psychologist
              through video on your phone, tablet or computer.
              <br />
              <br />
              Doctor AI Included Health works with or without insurance and is
              available at reduced rates through many major health plans and
              large employers. You’ll always see your cost upfront and won’t
              receive a surprise bill after your visit.
            </p>
          </div>
        </div>
      </div>
      <div className="steps-content">
        <img
          src="../../image/app_demo.png"
          alt="Online Consultation"
          className="step-image"
          style={{ width: "300px", height: "600px" }} // Cài đặt kích thước cho ảnh
        />
        <div className="steps-content-column">
          <h1 className="title">Get started in three easy steps</h1>
          <ol>
            <li>
              <span className="step-number">1</span>
              <strong>Create your account.</strong>
              <br />
              Sign up on the website or within the app. It's free, with no
              obligations or membership required, and you won’t need to enter a
              credit card. Follow the prompts to provide your health insurance
              or employer details to check if your visit is covered. However,
              insurance is not mandatory.
            </li>
            <li>
              <span className="step-number">2</span>
              <strong>
                Schedule an appointment with a doctor or complete health
                assessments.
              </strong>
              <br />
              Select the reason for your eye exam and answer a few questions to
              provide the doctor with necessary context. You can either schedule
              an online consultation with an eye specialist or perform basic
              health assessments directly within the app.
            </li>
            <li>
              <span className="step-number">3</span>
              <strong>Start your online consultation.</strong>
              <br />
              Meet with one of our certified eye doctors, who will diagnose your
              symptoms and provide a tailored treatment plan. If necessary,
              prescriptions can be sent to your local pharmacy.
            </li>
          </ol>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AboutPage;
