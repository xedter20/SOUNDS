const firebase = require('../database/fireBase');

const mySqlCon = require('../database/mySql');

const {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where
} = require('firebase/firestore');

const db = getFirestore(firebase);
const {
  getStorage,
  ref,
  uploadString,
  uploadBytes,
  getDownloadURL
} = require('firebase/storage');
const storage = getStorage();

const path = require('path');

const fs = require('fs-extra');

const uuid = require('uuid');

const addImageToDB = async ({
  imageBase64,
  imageName,
  uri,
  isTakingAttendance,
  id
}) => {
  try {
    const storageRef = ref(storage, id);

    let downloadURL = await uploadString(
      storageRef,
      imageBase64,
      'data_url'
    ).then(snapshot => {
      return getDownloadURL(snapshot.ref).then(url => url);
    });

    return downloadURL;
  } catch (error) {
    throw error;
  }
};

const enrollStudent = async data => {
  try {
    // const result = await addDoc(collection(db, 'students'), data);
    // return result;

    const {
      first_name,
      last_name,
      email,
      image_data_description,
      image_path,
      admissionNumber,
      classId,
      classArmId
    } = data;

    const sqlQueryClass = `SELECT * FROM tblclass`;

    const classData = await new Promise((resolve, reject) => {
      return mySqlCon.query(sqlQueryClass, function (err, result, fields) {
        if (err) throw err;

        const data = JSON.parse(JSON.stringify((result && result[0]) || {}));
        resolve(data);
      });
    });
    const sqlQueryClassSection = `SELECT * FROM tblclassarms WHERE classId = '${classData.Id}'`;
    const classSectionData = await new Promise((resolve, reject) => {
      return mySqlCon.query(
        sqlQueryClassSection,
        function (err, result, fields) {
          if (err) throw err;

          const data = JSON.parse(JSON.stringify((result && result[0]) || {}));
          resolve(data);
        }
      );
    });

    const sqlQuery = `INSERT INTO tblstudents 
    (classId, classArmId, firstName, lastName, email,
     image_data_description, image_path , 
     admissionNumber , 
     dateCreated
     ) 
    VALUES 
    (   '${classId || classData.Id}','${
      classArmId || classSectionData.Id
    }', '${first_name}', '${last_name}','${email}', ${image_data_description}, ${image_path}, '${admissionNumber}' , NOW())`;

    mySqlCon.query(sqlQuery, function (err, result, fields) {
      if (err) throw err;
    });
  } catch (error) {
    throw error;
  }
};

const findStudent = async email => {
  try {
    const sqlQuery = `SELECT * FROM tblstudents 
    where email = '${email}'
    
    or admissionNumber = '${email}'
    `;

    return new Promise((resolve, reject) => {
      return mySqlCon.query(sqlQuery, function (err, result, fields) {
        if (err) throw err;

        const data = JSON.parse(JSON.stringify((result && result[0]) || {}));
        resolve(data);
      });
    });

    // const colRef = collection(db, 'students');

    // const querySnapshot = await getDocs(
    //   query(colRef, where('email', '==', email))
    // );
    // let result = [];
    // querySnapshot.forEach(doc => {
    //   if (doc.data()) {
    //     result.push(doc.data());
    //   }
    // });

    return result && result[0];
  } catch (error) {
    throw error;
  }
};

const listStudent = async email => {
  try {
    const sqlQuery = `SELECT * FROM tblstudents`;

    return new Promise((resolve, reject) => {
      return mySqlCon.query(sqlQuery, function (err, result, fields) {
        if (err) throw err;

        const data = JSON.parse(JSON.stringify((result && result) || []));
        resolve(data);
      });
    });
  } catch (error) {
    throw erro;
  }
};

const listEvents = async selectedDate => {
  try {
    const sqlQuery = ' SELECT * FROM events WHERE date(`date`) = CURRENT_DATE';

    return new Promise((resolve, reject) => {
      return mySqlCon.query(sqlQuery, function (err, result, fields) {
        if (err) throw err;

        const data = JSON.parse(JSON.stringify((result && result) || []));
        resolve(data);
      });
    });
  } catch (error) {
    throw error;
  }
};

const deleteAttendanceOnce = ({ admissionNumber, date, eventId }) => {
  try {
    const sqlQuery = `
    Delete  FROM tblattendance WHERE eventId = '${eventId}'
    and 
    admissionNo = '${admissionNumber}'
    
    and date(dateTimeTaken) between  current_date AND  current_date
    
    `;

    return new Promise((resolve, reject) => {
      return mySqlCon.query(sqlQuery, function (err, result, fields) {
        if (err) throw err;

        const data = JSON.parse(JSON.stringify((result && result) || []));
        resolve(data);
      });
    });
  } catch (error) {
    throw error;
  }
};

const checkIfAlreadyHaveAttendance = ({ admissionNumber, date, eventId }) => {
  try {
    const sqlQuery = `
    SELECT *  FROM tblattendance WHERE eventId = '${eventId}'
    and 
    admissionNo = '${admissionNumber}'
    

    
    `;

    return new Promise((resolve, reject) => {
      return mySqlCon.query(sqlQuery, function (err, result, fields) {
        if (err) throw err;

        const data = JSON.parse(JSON.stringify((result && result) || []));
        resolve(data);
      });
    });
  } catch (error) {
    throw error;
  }
};

const addAttendance = async data => {
  try {
    const {
      admissionNumber,
      eventId,
      user,
      dateTimeTaken,
      status,
      image_path,
      checkCurrentStatus
    } = data;

    const { classId, classArmId } = user;

    if (checkCurrentStatus === '3') {
      const deleteAttendance = await deleteAttendanceOnce({
        eventId,
        date: dateTimeTaken,
        admissionNumber
      });
      const sqlQuery = `
    INSERT INTO tblattendance (admissionNo,eventId, classId, classArmId , dateTimeTaken , status , sessionTermId ,image_path) VALUES
    ('${admissionNumber}', '${eventId}','${classId}','${classArmId}' , '${dateTimeTaken}' , '${status}' , 1 , '${image_path}')
    
    `;

      return new Promise((resolve, reject) => {
        return mySqlCon.query(sqlQuery, function (err, result, fields) {
          if (err) throw err;

          const data = JSON.parse(JSON.stringify((result && result) || []));
          resolve(data);
        });
      });
    } else {
      // attendance already recorded
      const check = await checkIfAlreadyHaveAttendance({
        eventId,
        date: dateTimeTaken,
        admissionNumber
      });

      return check[0];
    }
  } catch (error) {
    throw error;
  }
};
const addTimeOutAttendance = async data => {
  try {
    const {
      admissionNumber,
      eventId,
      user,
      dateTimeTaken,
      status,
      image_path
    } = data;

    const { classId, classArmId } = user;

    const sqlQuery = `
    UPDATE tblattendance 
    set time_out = '${dateTimeTaken}'
    ${status >= 0 ? `, status = '${status}'` : ''}

    where eventId = '${eventId}' 
    and admissionNo = '${admissionNumber}'

    `;

    return new Promise((resolve, reject) => {
      return mySqlCon.query(sqlQuery, function (err, result, fields) {
        if (err) throw err;

        const data = JSON.parse(JSON.stringify((result && result) || []));
        resolve(data);
      });
    });
  } catch (error) {
    throw error;
  }
};

const getAllCourse = () => {
  try {
    const sqlQuery = `
   SELECT * FROM tblclass   
    `;

    return new Promise((resolve, reject) => {
      return mySqlCon.query(sqlQuery, function (err, result, fields) {
        if (err) throw err;

        const data = JSON.parse(JSON.stringify((result && result) || []));
        resolve(data);
      });
    });
  } catch (error) {
    throw error;
  }
};

const getAllLevel = classId => {
  try {
    const sqlQuery = `
   SELECT * FROM tblclassarms where classId = '${classId}'   
    `;

    return new Promise((resolve, reject) => {
      return mySqlCon.query(sqlQuery, function (err, result, fields) {
        if (err) throw err;

        const data = JSON.parse(JSON.stringify((result && result) || []));
        resolve(data);
      });
    });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  enrollStudent,
  listStudent,
  findStudent,
  addImageToDB,
  listEvents,
  addAttendance,
  getAllCourse,
  getAllLevel,
  addTimeOutAttendance,
  checkIfAlreadyHaveAttendance
};
