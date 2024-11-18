document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("btn_login").addEventListener("click", async function (event) {
        event.preventDefault();

        const email = document.getElementById("txt_email").value;
        const password = document.getElementById("txt_pwd").value;
        const helperText = document.getElementById("p_helper_text");

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (response.ok) {
                window.location.href = '/dashboard';
            } else {
                helperText.textContent = result.message;
            }
        } catch (error) {
            console.error('로그인 요청 오류:', error);
            helperText.textContent = '로그인 중 오류가 발생했습니다.';
        }
    });
});