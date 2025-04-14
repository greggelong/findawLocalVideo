let bodyPose;
let video;
let poses = [];
let connections;
let started = false;
let startButton;
let cnv;

function preload() {
  // Load the pose model
  bodyPose = ml5.bodyPose();
}

function setup() {
  cnv = createCanvas(540, 960);
  let cx = (windowWidth - cnv.width) / 2;
  let cy = (windowHeight - cnv.height) / 2;
  cnv.position(cx, cy);
  // Load a video file (must be in same folder or hosted)
  video = createVideo("yuand.mp4", videoLoaded); // 🔁 Replace with your video file name
  video.size(540, 960);
  video.volume(0.8);
  video.hide(); // ✅ Hides the default HTML video element

  // Add a start button (required for browser autoplay policies)
  startButton = createButton("▶ Start");
  startButton.position(10, height + 10);
  startButton.mousePressed(startVideoAndPose);

  // Get skeleton connection info
  connections = bodyPose.getSkeleton();
}

function videoLoaded() {
  console.log("🎥 Video loaded.");
}

function startVideoAndPose() {
  if (started) return;
  started = true;

  startButton.hide(); // Hide button after start

  // Start playing video
  video.loop();
  video.play();

  // Start pose detection after a slight delay
  setTimeout(() => {
    bodyPose.detectStart(video, gotPoses);
  }, 300); // Gives video time to decode
}

function gotPoses(results) {
  poses = results;
}

function draw() {
  background(0);

  if (started) {
    image(video, 0, 0, width, height); // Draw video to canvas

    for (let i = 0; i < poses.length; i++) {
      let pose = poses[i];

      // Draw skeleton connections
      for (let j = 0; j < connections.length; j++) {
        let a = pose.keypoints[connections[j][0]];
        let b = pose.keypoints[connections[j][1]];
        if (a.confidence > 0.1 && b.confidence > 0.1) {
          stroke(0, 255, 0);
          strokeWeight(3);
          line(a.x, a.y, b.x, b.y);
        }
      }

      // Face label
      let nose = pose.keypoints.find((k) => k.name === "nose");
      let leftEye = pose.keypoints.find((k) => k.name === "left_eye");
      let rightEye = pose.keypoints.find((k) => k.name === "right_eye");

      if (nose && leftEye && rightEye) {
        let x = (leftEye.x + rightEye.x) / 2;
        let y = (leftEye.y + rightEye.y) / 2;
        let w = dist(leftEye.x, leftEye.y, rightEye.x, rightEye.y) * 3;
        let h = w * 1.2;

        fill(255, 0, 0);
        noStroke();
        textSize(36);
        textAlign(CENTER, CENTER);
        text("艺术工人", x, y - h / 2 - 15);

        noFill();
        stroke(0, 255, 0);
        strokeWeight(4);
        rect(x - w / 2, y - h / 2, w, h);
      }
    }
  }
}
