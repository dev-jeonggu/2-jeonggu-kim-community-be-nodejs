# project
Jeonggu.kim community


# Description
This is a simple community web application where users can create, edit, view, and delete posts.<br>
-> 이 프로젝트는 사용자가 게시글을 작성, 수정, 조회, 삭제할 수 있는 간단한 커뮤니티 웹 애플리케이션입니다.


# Technologies Used
HTML, CSS, JavaScript, Express


# Versions Overview
ver1: vanilla express json.<br>
- Simple stack with vanilla JavaScript and Express.  
- Data stored in JSON files.  
ver2 : react express mySQL<br>
- MySQL used for database.  
🔗 [FE Github](https://github.com/100-hours-a-week/2-jeonggu-kim-community-fe)<br>
🔗 [BE Github](https://github.com/jeonggu0112/2-jeonggu-kim-community-be)


# Features
- User Authentication: Register and Login functionality<br>
사용자 인증: 회원가입 및 로그인
- Board Management: Create, Edit, View, and Delete posts<br>
게시글 관리: 작성, 수정, 조회, 삭제
- Search Functionality: Search for posts by keywords<br>
검색 기능: 키워드를 통해 게시글 검색
- Header and Footer Integration: Consistent navigation across pages<br>
헤더/푸터: 일관된 페이지 네비게이션 제공


# Project Structure
├─app<br>
│  └─views<br>
│      │  index.html<br>
│      │  login.html<br>
│      │  register.html<br>
│      │<br>
│      ├─board<br>
│      │      board.html<br>
│      │      boardAdd.html<br>
│      │      boardEdit.html<br>
│      │      boardInfo.html<br>
│      │<br>
│      └─user<br>
│              userEdit.html<br>
│<br>
└─resources<br>
    ├─css<br>
    │  │  login.css<br>
    │  │  register.css<br>
    │  │<br>
    │  ├─board<br>
    │  │      board.css<br>
    │  │      boardAdd.css<br>
    │  │      boardEdit.css<br>
    │  │      boardInfo.css<br>
    │  │<br>
    │  ├─common<br>
    │  │      common.css<br>
    │  │      footer.css<br>
    │  │      header.css<br>
    │  │<br>
    │  └─user<br>
    │          userEdit.css<br>
    │<br>
    ├─images<br>
    │<br>
    └─js<br>
        │  login.js<br>
        │  userEdit.js<br>
        │<br>
        ├─board<br>
        │      board.js<br>
        │      boardAdd.js<br>
        │      boardEdit.js<br>
        │      boardInfo.js<br>
        │<br>
        ├─common<br>
        │      auth.js<br>
        │      common.js<br>
        │      footer.js<br>
        │      header.js<br>
        │<br>
        └─user<br>
                register.js<br>
                userEdit.js<br>


# Setup
1. Clone the project<br>
   git clone https://github.com/your-repo/jeonggu-kim-community.git<br>
2. Navigate to the project folder<br>
  cd 2-jeonggu-kim-community-fe<br>
3. Start the application<br>
  node app.js<br>
4. Access the application<br>
  Open your browser and go to http://localhost:5555 to view the application.<br>


# Demo Video
### Jeonggu.kim's BOARD_v.2<br>
[![Jeonggu.kim's BOARD_v.2](https://img.youtube.com/vi/hMBgw9joVqM/0.jpg)](https://youtu.be/hMBgw9joVqM)<br>

### Jeonggu.kim's BOARD_v.3<br>
[![Jeonggu.kim's BOARD_v.2](https://img.youtube.com/vi/I2xf8ZXexOw/0.jpg)](https://youtu.be/I2xf8ZXexOw)<br>

 
# Logs and Notes
🔗 **Week 1~4 Notes**  
🔗[2024-10-30](https://typical-peach-2a6.notion.site/1-148b50da96b04c649b6725837294076a?pvs=74)<br>
🔗[2024-11-08](https://typical-peach-2a6.notion.site/2-137645850ce3806f9448d591dcd61c6e?pvs=74)<br>
🔗[2024-11-14](https://typical-peach-2a6.notion.site/3-13e645850ce38059afdbe026d2f9025a?pvs=74)<br>
🔗[2024-11-21](https://typical-peach-2a6.notion.site/4-145645850ce380c6b4d0f42f171fe936?pvs=4)
