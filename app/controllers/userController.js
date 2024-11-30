const userModel = require('../models/userModel');
const { generateToken } = require('../utils/jwt');
const { decodeBase64, encryptPassword } = require('../utils/utils');

const path = require('path');
const fs = require('fs');

// NOTE : key value로 정보 가져오기
exports.check = async (req, res) => {
    const {key, value} = req.query;
    try {
        const result = await userModel.getUser(
            key, value
        );
        return res.status(200).json({ message: 'success', data: result });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'server error', data: null });
    }
};

// NOTE : 정보 가져오기
exports.getUserInfo = async (req, res) => {
    try {
        const result = await userModel.getUser("user_id", req.user?.user_id);

        if (!result) {
            return res.status(404).json({ message: 'User not found', data: null });
        }

        return res.status(200).json({
            message: 'success',
            data: result,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'server error', data: null });
    }
};

// NOTE: 회원 추가
exports.addUser = async (req, res) => {
    const { email, password, nickname, profile_url } = req.body;
    if (!email && !nickname && !password && !profile_url) {
        return res.status(400).json({ message: 'required' });
    }
    
    const decodingPassword = decodeBase64(password);
    const bcryptPassword = await encryptPassword(decodingPassword);

    try {
        // NOTE : 데이터베이스에 사용자 추가
        const result = await userModel.addUser(
            email || null
        ,   bcryptPassword || null
        ,   nickname || null
        ,   profile_url || null
        );
        return res.status(200).json({ message: 'success', data: result });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'server error', data: null });
    }
};

// NOTE: 회원 수정
exports.updateUser = async (req, res) => {
    const { nickname, password, profile_url } = req.body;
    const email = req.user?.email;

    // NOTE : 닉네임과 비밀번호가 모두 없는 경우 에러 반환
    if (!nickname && !password) {
        return res.status(400).json({ message: 'Nickname or password is required' });
    }

    const decodingPassword = decodeBase64(password);
    const bcryptPassword = await encryptPassword(decodingPassword);

    const user_id = req.user?.user_id;
    if (!user_id) {
        return res.status(401).json({ message: 'Unauthorized: User ID not found in session' });
    }

    try {
        const updateData = {};
        if (nickname) updateData.nickname = nickname;
        if (profile_url) updateData.profile_url = profile_url; 
        if (bcryptPassword) updateData.password = bcryptPassword; 

        const updatedUser = await userModel.updateUser(user_id, updateData);

        if(nickname){
            const token = generateToken({
                user_id: user_id,
                nickname: nickname,
                email: email,
                profile_url: profile_url
            });

            return res.status(200).json({
                message: 'success',
                data: { token: token },
            });
        }
        return res.status(200).json({ message: 'success' });
    } catch (error) {
        console.error('Error updating profile:', error);
        if (error.message === 'User not found') {
            return res.status(404).json({ message: 'User not found' });
        } else {
            return res.status(500).json({ message: 'server error' });
        }
    }
};

// NOTE: 회원 삭제
exports.deleteUser = async (req, res) => {
    const user_id = req.user?.user_id;
    let refreshTokens = []; // NOTE : 리프레시 토큰 저장소
    try {
        const refreshToken = req.body.refreshToken;
        const deleteUser = await userModel.deleteUser(user_id);
        if(deleteUser){
            refreshTokens = refreshTokens.filter(token => token !== refreshToken);
        }else{
            return res.status(500).json({ message: '회원 삭제 중 오류가 발생했습니다.' });
        }
        return res.status(200).json({ message: '회원이 성공적으로 삭제되었습니다.' });
    } catch (error) {
        console.error('회원 삭제 중 오류:', error);
        return res.status(500).json({ message: '회원 삭제 중 오류가 발생했습니다.' });
    }
};

// NOTE : 파일 업로드 처리 함수
exports.uploadImage = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: '파일이 업로드되지 않았습니다.' });
    }

    // NOTE : 파일이 저장된 경로를 응답으로 반환
    const filePath = `../images/profile/${req.file.filename}`;
    res.json({ message: '파일 업로드 성공', filePath: filePath });
};

// NOTE : 파일 제공 처리 함수
exports.loadImage = (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '..', 'images', 'profile', filename);
    const defaultFilePath = path.join(__dirname, '..', 'images', 'profile', 'default.png'); // NOTE : 기본 이미지 경로

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.warn('요청된 파일이 없으므로 기본 이미지를 반환합니다.');
            return res.sendFile(defaultFilePath);
        }
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'); 
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5555'); // NOTE : 클라이언트 도메인
        res.setHeader('Access-Control-Allow-Credentials', 'true');

        res.sendFile(filePath, (err) => {
            if (err) {
                console.error('파일 전송 중 오류 발생:', err);
                return res.status(500).json({ message: '파일 전송 중 오류 발생' });
            }
        });
    });
};