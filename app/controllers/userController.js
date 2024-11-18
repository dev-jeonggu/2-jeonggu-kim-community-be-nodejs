const userModel = require('../models/userModel');

// NOTE : key value로 정보 가져오기
exports.check = async (req, res) => {
    const {key, value} = req.query;
    try {
        const result = await userModel.getUser(
            key, value
        );
        res.status(200).json({ message: 'success', data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'server error', data: null });
    }
};

// NOTE : 정보 가져오기
exports.getUserInfo = async (req, res) => {
    try {
        const result = await userModel.getUser(
            "id", req.session.user.id
        );
        res.status(200).json({ message: 'success', data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'server error', data: null });
    }
};

exports.addUser = async (req, res) => {
    const { email, password, nickname, profile_url } = req.body;
    
    if (!email && !nickname && !password && !profile_url) {
        return res.status(400).json({ message: 'required' });
    }

    try {
        // NOTE : 데이터베이스에 사용자 추가
        const result = await userModel.addUser(
            email || null,
            password || null,
            nickname || null,
            profile_url || null
        );
        res.status(200).json({ message: 'success', data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'server error', data: null });
    }
};

exports.updateUser = async (req, res) => {
    const { nickname, password, profile_url } = req.body;

    // NOTE : 닉네임과 비밀번호가 모두 없는 경우 에러 반환
    if (!nickname && !password) {
        return res.status(400).json({ message: 'Nickname or password is required' });
    }

    const userId = req.session.user.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized: User ID not found in session' });
    }

    try {
        const updateData = {};
        if (nickname) updateData.nickname = nickname;
        if (profile_url) updateData.profile_url = profile_url; 
        if (password) updateData.password = password; 

        const updatedUser = await userModel.updateUser(userId, updateData);

        if (nickname) req.session.user.nickname = updatedUser.nickname;

        res.status(200).json({ message: 'success', data: updatedUser });
    } catch (error) {
        console.error('Error updating profile:', error);
        if (error.message === 'User not found') {
            res.status(404).json({ message: 'User not found' });
        } else {
            res.status(500).json({ message: 'server error' });
        }
    }
};

exports.deleteUser = async (req, res) => {
    const userNo = req.session.user.id;
    const email = req.session.user.email; 
    try {
        const deleteUser = await userModel.deleteUser(userNo, email);
        req.session.destroy(); // NOTE : 세션 삭제
        res.status(200).json({ message: '회원이 성공적으로 삭제되었습니다.' });
    } catch (error) {
        console.error('회원 삭제 중 오류:', error);
        res.status(500).json({ message: '회원 삭제 중 오류가 발생했습니다.' });
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