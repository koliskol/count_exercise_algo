import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-converter';
import '@tensorflow/tfjs-backend-webgl';
import * as poseDetection from '@tensorflow-models/pose-detection';
import Point from './Point.js';
import Joint from './Joint.js';
import Pose_counter from './Pose_counter.js';

//console.log('Using TensorFlow backend: ', tf.getBackend());
console.log("start counter");
// Create a detector for pose
const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER});
//console.log(detector);
//let p;
/* Index of the joint for each model
         ==== TF lite ====       ==== Mediapie =====
        'nose': 0,                0 : nose  
        'left_eye': 1,            5 : left eye
        'right_eye': 2,           2 : right eye
        'left_ear': 3,            8 : left ear
        'right_ear': 4,           7 : right ear
        'left_shoulder': 5,       12 : left shoulder
        'right_shoulder': 6,      11 : right shoulder
        'left_elbow': 7,          14 : left elbow
        'right_elbow': 8,         13 : right elbow
        'left_wrist': 9,          16 : left wrist
        'right_wrist': 10,        15 : right wrist
        'left_hip': 11,           24 : left hip
        'right_hip': 12,          23 : right hip
        'left_knee': 13,          26 : left knee 
        'right_knee': 14,         25 : right knee
        'left_ankle': 15,         28 : left angle
        'right_ankle': 16         27 : right angkle
       */
       /*
         type of excercise
         0 = birdog //two leg and hand motion
         1 = fullplank //counting time
         2 = kneesideplank //counting time
         3 = kneepushup //only hand motion
         4 = reversefly //only hand motion
         5 = squat //can be only feet motion
         6 = sumosquat //can be only feet motion
         7 = reverseLunge //two leg motion
         8 = superman //counting time
         9 = pushup //only hand motion
    */


const joint_name = ["nose", "left_eye", "right_eye", "left_ear", "right_ear","left_shoulder", "right_shoulder", "left_elbow", "right_elbow", "left_wrist", "right_wrist", 
"left_hip", "right_hip", "left_knee", "right_knee", "left_ankle", "right_ankle"];

const excercise_name = ["birddog", "fullplank", "kneesideplank", "kneepushup", "reversefly", "squat", "sumosquat", "reverseLunge", "superman", "pushup"];

export const keypoint = []; //should always 17
//x, y, id, name -> from tensorflow late??
//'left_shoulder': 5, 

//keypoint[0] = new Joint(new Point(10, 10), 0, "nose")
//keypoint[1] = new Joint(new Point(10, 10), 1, "left_eye")
//keypoint[2] = new Joint(new Point(10, 10), 2, "right_eye")
//keypoint[3] = new Joint(new Point(10, 10), 3, "left_ear")
//keypoint[4] = new Joint(new Point(10, 10), 4, "right_ear")
//keypoint[5] = new Joint(new Point(0, 0), 5, "left_shoulder") //example of missing joints

//or
//keypoint.push(new Joint(new Point(x, y), id, name));


for (let i = 0; i < joint_name.length; i++) {
    keypoint.push(new Joint(new Point(i+1, i*10), i, joint_name[i]));
  }

//how to call the counter 
//initial the class Pose_counter
var init_counter = 0;
const counter = new Pose_counter(init_counter);

//1. get the side and laydown
counter.getLaydownDetection(keypoint);
var side = counter.side_status; //"right" or "left"
var laydown = counter.lay_status; //"standup" or "laydown"

//2 get the angle given the joint list
var angle_list = counter.getAngleJointList(keypoint);
console.log(angle_list);
//3. set the type of excercise "birddog", "fullplank", "kneesideplank", "kneepushup", "reversefly", "squat", "sumosquat", "reverseLunge", "superman", "pushup"
var typeOfExcercise = 3; //this case is kneepushup
//4. set the threshold
var thUp = 45;
var thDn = 45;
//5. start the counter
counter.counterByAngle(angle_list, typeOfExcercise, thUp, thDn, side)

var pos_list = counter.getPositionJointList(keypoint);
console.log(pos_list);

var cosSim = counter.cosineSimilarity(pos_list, pos_list);
console.log(cosSim);

