const path = require('path');
const bcrypt = require('bcryptjs');
const atob = require('atob');

const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const fs = require('fs').promises;

// NOTE : json 파일 조회
const getJsonData = async (filePath, key) => {
    let jsonData;

    try {
        // NOTE: 파일 읽기 시도
        const data = await fs.readFile(filePath, 'utf-8');
        jsonData = JSON.parse(data);
    } catch (error) {
        // NOTE: 파일이 없거나 JSON 파싱 오류 시 초기화
        console.error("파일을 읽거나 JSON을 파싱하는 중 오류가 발생했습니다:", error);
        jsonData = { [key]: [] }; // NOTE: 기본 구조 생성, key에 따른 빈 배열
    }

    if (!jsonData[key]) {
        jsonData[key] = [];
    }

    return jsonData;
};

// NOTE : json 파일 저장
const saveJsonData = async (filePath, data) => {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error saving JSON data:", error);
    }
};

const sendFile = (res, directory, filename) => {
    const filePath = path.join(__dirname, '..', 'images', directory, filename);

    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Error sending file:', err);
            return res.status(404).send('File not found');
        }
    });
};

const decodeBase64 = (value) => {
    try{
        const decodingValue = atob(value);
        return decodingValue;
    } catch(error){
        console.log(error);
        return "";
    }

} 

const validatePassword = async (password, checkPassword) => {
    try{
        const isMatch = await bcrypt.compare(password, checkPassword);
        if (isMatch) {
            return true;
        } else {
            return false;
        }
    } catch(error){
        console.log(error);
        return false;
    }

}

const encryptPassword = async (password) => {
    try{
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch(error){
        console.log(error);
        return "";
    }
};

module.exports = { formatDate, getJsonData,  saveJsonData, sendFile, decodeBase64, encryptPassword, validatePassword};