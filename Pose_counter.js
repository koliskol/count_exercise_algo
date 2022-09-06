import Point from './Point.js';

export class Pose_counter{
    
    constructor(counter) {
      this.counter = counter;
      this.firstCount = false;
      this.firstJoint = [];
      this.firstJointCap = false;
      this.lay_status = "unknown"
      this.side_status = "unknown"
      this.start_excercise = false;
      
    }

    getAngle(p0, p1, p2)
    {
      var a = Math.pow(p1.x-p0.x,2) + Math.pow(p1.y-p0.y,2),
      b = Math.pow(p1.x-p2.x,2) + Math.pow(p1.y-p2.y,2),
      c = Math.pow(p2.x-p0.x,2) + Math.pow(p2.y-p0.y,2);
      var deg = Math.acos( (a+b-c) / Math.sqrt(4*a*b) )* 180 / Math.PI;
      if(deg < 0)
      {
        deg += 360;
      }
      return deg;
    }
    
    cosineSimilarity(key_array1, key_array2)
    {
      var dotProduct = 0.0;
      var normA = 0.0;
      var normB = 0.0;
      var cosSim = 0.0;
      if(key_array1.length == key_array2.length)
      {
        for (let i = 0; i < key_array1.length; i++) {
          dotProduct += (key_array1[i] * key_array2[i]);
          normA += Math.pow(key_array1[i], 2);
          normB += Math.pow(key_array2[i], 2);
        }
        cosSim = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
      }else
      {
        console.log("size of array is not the same");
      }
      
      return cosSim;
    }

    getAngleJointList(keypoints)
    {
        /*
         * possible angle
         * 0. nose, left shoulder, left elbow (0,5,7)
         * 1. nose, right shoulder, right elbow (0,6,8)
         * 2. nose, left shoulder, left hip (0,5,11)
         * 3. nose, right shoulder, right hip (0,6,12)
         * 4. left shoulder, left elbow, left wrist  (5,7,9)
         * 5. right shoulder, right elbow, right wrist (6,8,10)
         * 6. left elbow, left shoulder, left hip (7,5,11)
         * 7. right elbow, right shoulder, right hip (8,6,12)
         * 8. left shoulder, left hip, left knee (5,11,13)
         * 9.  right shoulder, right hip, right knee (6,12,14)
         * 10. left hip, left knee, left ankle (11,13,15)
         * 11. right hip, right knee, right ankle (12,14,16)
         * 12. left ankle, left hip, ,left wrist (15, 11, 9)
         * 13. right ankle, right hip, right wrist (16, 12, 10)
         */

        //const angle = getAngle(new Point(10,0),new Point(10,10), new Point(20,10)); //previous joint, cur joint, next joint
        //console.log(angle)
        var angle_array = [14];
        angle_array[0] = this.getAngle(keypoints[0].xy, keypoints[5].xy, keypoints[7].xy);
        angle_array[1]  = this.getAngle(keypoints[0].xy, keypoints[6].xy, keypoints[8].xy);
        angle_array[2]  = this.getAngle(keypoints[0].xy, keypoints[5].xy, keypoints[11].xy);
        angle_array[3]  = this.getAngle(keypoints[0].xy, keypoints[6].xy, keypoints[12].xy);
        angle_array[4]  = this.getAngle(keypoints[5].xy, keypoints[7].xy, keypoints[9].xy);
        angle_array[5]  = this.getAngle(keypoints[6].xy, keypoints[8].xy, keypoints[10].xy);

        angle_array[6]  = this.getAngle(keypoints[7].xy, keypoints[5].xy, keypoints[11].xy);
        angle_array[7]  = this.getAngle(keypoints[8].xy, keypoints[6].xy, keypoints[12].xy);
        angle_array[8]  = this.getAngle(keypoints[5].xy, keypoints[11].xy, keypoints[13].xy);
        angle_array[9]  = this.getAngle(keypoints[6].xy, keypoints[12].xy, keypoints[14].xy);
        angle_array[10]  = this.getAngle(keypoints[11].xy, keypoints[13].xy, keypoints[15].xy);
        angle_array[11]  = this.getAngle(keypoints[12].xy, keypoints[14].xy, keypoints[16].xy);

        angle_array[12]  = this.getAngle(keypoints[15].xy, keypoints[11].xy, keypoints[9].xy); //additional angle for superman
        angle_array[13]  = this.getAngle(keypoints[16].xy, keypoints[12].xy, keypoints[10].xy); //additional angle for superman

        return angle_array
    }

    getPositionJointList(keypoints)
    {
      var joint_array = [keypoints.length*2];
      var ctr = 0;
        for (let i = 0; i < keypoints.length; i++) {
            joint_array[ctr] = keypoints[i].xy.x;
            joint_array[ctr+1] = keypoints[i].xy.y;
            
            ctr = ctr + 2;
        }
        return joint_array;
      
    }

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
     //================= check the two counter ===================================================================================
    //1st one using the angle of specific joints for specific excercise =========================================================
    counterByAngle(angle_list, typeOfExcercise, thUp, thDn, side)//should be array of angle
    {
      var j_angle = 0.0;
      var max_angle = 0.0;
      var oneMovement = true;

      if(typeOfExcercise == 3 || typeOfExcercise == 9)//kneepushup and pushup
      {
        max_angle = 90;
        oneMovement = true;
        if(side == "right")
        {
          j_angle = angle_list[7];
        }else{
          j_angle = angle_list[6];
        }
      }else if(typeOfExcercise == 5 || typeOfExcercise == 6) //squat and sumosquat
      {
        max_angle = 180;
        oneMovement = true;
        if(side == "right")
        {
          j_angle = angle_list[11];
        }else{
          j_angle = angle_list[10];
        }
      }

      if(oneMovement == true)
      {
        if(j_angle <= thUp && this.firstCount == false)
        {
          this.counter = this.counter + 1;
          this.firstCount = true;
        }else if(j_angle > thDn && this.firstCount == true)
        {
          this.firstCount = false;
        }
      }
      //special movement
      if(typeOfExcercise == 7) //reverse Lunge
      {
        max_angle = 180;
        oneMovement = false;
        var angle1 = angle_list[10] //left leg * 10. left hip, left knee, left ankle (11,13,15)
        var angle2 = angle_list[11] //right leg * 11. right hip, right knee, right ankle (12,14,16)

        if(angle1 <= thUp && angle2 <=thUp && this.firstCount == false)
        {
          this.counter = this.counter + 1;
          this.firstCount = true;
        }else if(angle1 > thDn && angle2 > thDn && this.firstCount == true)
        {
          this.firstCount = false;
        }

      }
      //updated code
      if(typeOfExcercise == 8) //superman
      {
       oneMovement = false;
       var angle1 = angle_list[12]
       var angle2 = angle_list[13]

       if(angle1 >= thUp && angle2 >=thUp && this.firstCount == false)
        {
          this.counter = this.counter + 1;
          this.firstCount = true;
        }else if(angle1 > thDn && angle2 > thDn && this.firstCount == true)
        {
          this.firstCount = false;
        }


      }
      if(typeOfExcercise == 4)// reverse fly
      {
        max_angle = 90;
        oneMovement = false;
        var angle1 = angle_list[6] //* 6. left elbow, left shoulder, left hip (7,5,11)
        var angle2 = angle_list[7] //* 7. right elbow, right shoulder, right hip (8,6,12)
        
        if(angle1 >= thUp && angle2 >=thUp && this.firstCount == false)
        {
          this.counter = this.counter + 1;
          this.firstCount = true;
        }else if(angle1 < thDn && angle2 < thDn && this.firstCount == true)
        {
          this.firstCount = false;
        }
      }
      if(typeOfExcercise == 0) //birddog, need arm and leg
      {
        max_angle = 180;
        oneMovement = false;
        var angleArm1 = angle_list[6] //left arm
        var angleArm2 = angle_list[7] //right arm
        var angleLeg1 = angle_list[8] //left leg
        var angleLeg2 = angle_list[9] //right leg

        if(side == "right")
        {
            if(((angleArm1 >= thUp && angleLeg2 >=thUp) && this.firstCount == false)
            {
              this.counter = this.counter + 1;
              this.firstCount = true;
            }else if((angleArm1 < thDn && angleLeg2 < thDn) && this.firstCount == true)
            {
              this.firstCount = false;
            }

        }else if(side == "left")
        {
            if(((angleArm2 >= thUp && angleLeg1 >=thUp) && this.firstCount == false)
            {
              this.counter = this.counter + 1;
              this.firstCount = true;
            }else if((angleArm2 < thDn && angleLeg1 < thDn) && this.firstCount == true)
            {
              this.firstCount = false;
            }
        }

      }
    }

    //2nd one using error comparing the joints of first frame when start to whole frame of excercise =============================
    counterByErrorPos(pos_list, thUp, thDn) //pos_list can be array of angle or array of position or combination of it
    {
      var err = -1; //similar = 1, far = 0
      if(this.firstJointCap == true) // first time, record the starting position of the excercise
      {
        this.firstJoint = pos_list;
      }else//then, comparing the first joint with the next joint in the next frame
      {
        var curJoint = pos_list;
        err = this.cosineSimilarity(this.firstJoint, curJoint);
        if(err >= 0)
        {
          if(err < thUp && this.firstCounting == false)
          {
              this.counter = this.counter + 1;
              this.firstCounting = true;
          }else if(err > thDn && this.firstCounting == true)
          {
              this.firstCounting = false;
          }
        }

      }
    }

    getLaydownDetection(keypoints)//input is the joints
    {
      //this algorithm is to check if the user is in laydown position or not, some excercise need the user to laydown, others need user to stand
      //this algorithm is to check if the user is in which side, to determine the left and right joints to use

      var ns_lm = keypoints[0].xy; //nose
      var ls_lm = keypoints[5].xy; //left shoulder
      var rs_lm = keypoints[6].xy; //right shoulder

      var lfoot_lm = keypoints[15].xy; //left ankle
      var rfoot_lm = keypoints[16].xy; //right ankle

      var angle_ls = this.getAngle(ns_lm,ls_lm,rs_lm);
      console.log("angle ls:", angle_ls);
      var angle_rs = this.getAngle(ns_lm,rs_lm,ls_lm);
      console.log("angle rs:", angle_rs);

      //check the distance
      var dist_body_l = abs(ns_lm.y - lfoot_lm.y); //check the distance in y axis
      console.log("distance body:", dist_body_l);
      
      //check the angle
      var xy_ns = new Point(ns_lm.x, ns_lm.y);
      var xy_foot = new Point(lfoot_lm.x, lfoot_lm.y);
      var xy_ori = new Point(0, lfoot_lm.y);
      var angle_body_l = this.getAngle(xy_ori, xy_foot, xy_ns);
      console.log("angle body:", angle_body_l);

      //check distance of nose to the shoulder
      var dist_ls_ns = abs(ns_lm.x - ls_lm.x) //shoulder left
      var dist_rs_ns = abs(ns_lm.x - rs_lm.x) //shoulder right

      if(angle_body_l < 130 && angle_body_l > 70 && dist_body_l > 0.4){
        this.lay_status = "standup";
        console.log("standup");
        if(dist_ls_ns >= 0.095 && dist_rs_ns >= 0.095)
        {
          this.side_status = "front"
        }
        else if(dist_ls_ns >= 0.095 && dist_rs_ns <= 0.075)
        {
          this.side_status = "left"
        }
        else if(dist_ls_ns <= 0.075 && dist_rs_ns >= 0.095)
        {
          this.side_status = "right"
        }
      }
      else if(angle_body_l > 140 && angle_body_l < 220 && dist_body_l < 0.3){
          console.log("laydown");
          this.lay_status = "laydown";

          if(ns_lm.x < ls_lm.x && ns_lm.x < rs_lm.x){
            this.side_status = "left"
          }else if (ns_lm.x > ls_lm.x && ns_lm.x > rs_lm.x){
            this.side_status = "right"
          }
      }
      else{
        this.lay_status = "unknown";
      }
          
    }

    printCounter(){
      console.log("Counter: "+ this.counter);
    }

    //this algorithm is to compare the current joint position with the template joint position from the trainer, and calculate the error
    checkStartingEndingExcercise(cur_pos_list, sample_pos_list, th)
    {
      var err = -1;
      //var minIdx = -1;
      var minErr = -1;

      for(var i=0;i<sample_pos_list.length; i++)
      {
        temp_pos_list = sample_pos_list[i];
        err = this.cosineSimilarity(cur_pos_list, temp_pos_list);
        if(err >= 0 && minErr > err)
        {
          minErr = err; //find max error from the list, cosine similarity return close to 1 if simlar, and close to 0 if different
        }

      }
      if(minErr > th)
      {
        this.start_excercise = true;
      }else{
        this.start_excercise = false;
      }
    }

  }

  export default Pose_counter;