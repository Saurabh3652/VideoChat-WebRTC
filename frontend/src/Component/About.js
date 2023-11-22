// About.js

import React from 'react';
import './About.css'; // Import the CSS file

const About = () => {
  return (
    <div className="about-container pt-5 align-item-center">
      <h2 className='m-2 pd-4 bg-dark text-white border rounded'>How to Run This App</h2>
      <p className='text-primary'>This is Video calling Implemented through WebRTC Using React for Frontend and NodeJs for Backend..</p>
      <ul>
        <li><p>1. Download Code From Github : <a href=""className='text-primary'>Link</a></p></li><br/>
        <li>2. Run <span className='text-danger rounded-right'> npm install </span> inside root folder and also Inside frontend folder</li><br/>
        <li>3. Run <span className='text-danger rounded-left'> nodemon server.js </span> for Backend </li><br/>
        <li>4. now move to fronend folder using : <span className='text-danger rounded-right'>cd frontend</span></li><br/>
        <li>5. <span className='text-danger rounded-left'>npm start</span>and open <span className='text-danger rounded-left'>localhost:3000</span> on another window also</li><br/>
        <li>
          <p className='p-2 m-2 text-success '>For calling </p>
          <p>1. Enter name : </p>
          <p>2. Get id : for getting your id to share with other just like One Time Mobile Number</p>
        </li><br/>
        <li>3. User2 can follow the same and Click On call Button for Calling  </li><br/>
        <li>4. Click On <span className='text-primary'>Answer button for answering </span></li><br/>
        <li>5. Audio Video Mute Unmute functinality also also there </li>
      </ul>
    </div>
  );
};

export default About;
